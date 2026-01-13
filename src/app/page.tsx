import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SearchIcon from '@mui/icons-material/Search'
// import { DashboardStats } from '@/components/dashboard-stats' 
// We are replacing the old stats widget with individual card stats for now
import { CollectionCard } from '@/components/collection-card'
import { OverviewStrip } from '@/components/dashboard/overview-strip'
import { ActivityFeed } from '@/components/dashboard/activity-feed'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Process data for displaylections with their items to calculate stats
  // Note: RLS policies ensure we only see our own data
  const { data: collections } = await supabase
    .from('collections')
    .select(`
      *,
      items(
        current_value
      )
    `)
    .order('created_at', { ascending: false })

  // Calculate Global Stats
  let globalTotalValue = 0
  let globalTotalItems = 0

  // Process data for display
  const processedCollections = collections?.map((c: any) => {
    const itemCount = c.items?.length || 0;
    const totalValue = c.items?.reduce((sum: number, item: any) => sum + (item.current_value || 0), 0) || 0;

    globalTotalValue += totalValue
    globalTotalItems += itemCount

    return {
      ...c,
      itemCount,
      totalValue
    }
  }) || []

  // Fetch recent activity (last 5 items across all collections)
  const { data: recentItems } = await supabase
    .from('items')
    .select(`
      id,
      name,
      current_value,
      created_at,
      collections (
        name,
        type
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const activityData = recentItems?.map((item: any) => ({
    id: item.id,
    name: item.name,
    collectionName: item.collections?.name || 'Unknown Collection',
    type: item.collections?.type || 'misc',
    timestamp: item.created_at,
    value: item.current_value
  })) || []

  const { data: profile } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
  const currency = profile?.currency || 'USD'

  return (
    <div className="container animate-fade-in" style={{
      paddingTop: 'var(--space-8)',
      paddingBottom: 'var(--space-16)',
      maxWidth: '1600px', // Wider container for the grid
      paddingLeft: 'var(--space-12)',
      paddingRight: 'var(--space-12)'
    }}>
      {/* Global Stats Strip */}
      <OverviewStrip
        totalItems={globalTotalItems}
        totalValue={globalTotalValue}
        currency={currency}
      />

      {/* Header Row */}
      <header style={{
        marginBottom: 'var(--space-12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)'
        }}>
          Collection Vault
        </h1>

        {/* Search Bar - Visual Match */}
        <div style={{
          position: 'relative',
          width: '320px'
        }}>
          <input
            placeholder="Search"
            style={{
              width: '100%',
              background: 'var(--surface-secondary)',
              border: 'none',
              padding: '12px 20px',
              paddingLeft: '44px',
              borderRadius: '99px', // Pill shape
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <SearchIcon style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            fontSize: '20px'
          }} />
        </div>
      </header>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--space-6)',
        width: '100%',
        maxWidth: '1600px',
      }}>
        {/* Render Real Collections */}
        {processedCollections.map((collection: any) => (
          <CollectionCard
            key={collection.id}
            data={collection}
            currency={currency}
          />
        ))}

        {/* Render Ghost Cards for Missing Types */}
        {['lego', 'coins', 'antiques', 'books'].map(type => {
          // If user already has a collection of this type, don't show ghost
          if (processedCollections.some((c: any) => c.type === type)) return null

          return (
            <CollectionCard
              key={`ghost-${type}`}
              variant="ghost"
              ghostType={type}
            />
          )
        })}
      </div>

      {/* Activity Feed Section */}
      <div style={{ marginTop: 'var(--space-12)' }}>
        <ActivityFeed items={activityData} />
      </div>

    </div>
  )
}
