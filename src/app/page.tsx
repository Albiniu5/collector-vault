import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard-stats'
import { WishlistWidget } from '@/components/wishlist-widget'
import Link from 'next/link'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { ensureDefaultCollections } from './items/actions'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Ensure 4 default collections exist
  await ensureDefaultCollections()

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-12)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="text-secondary text-xs uppercase font-bold" style={{ marginBottom: 'var(--space-2)', letterSpacing: '0.05em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
            Command Center
          </h1>
        </div>
        <Link href="/import" className="btn btn-primary">
          <UploadFileIcon style={{ fontSize: '18px' }} />
          <span>Import Data</span>
        </Link>
      </header>

      {/* Stats Row */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>

        {/* Left Column: Collections */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Collections</h2>
            <Link href="/collections" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
              View All <ArrowForwardIcon style={{ fontSize: '14px' }} />
            </Link>
          </div>

          <div className="grid grid-2">
            {collections?.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px',
                  textDecoration: 'none',
                  position: 'relative',
                  background: 'var(--surface-primary)', // Ensure contrast
                  padding: '24px'
                }}
              >
                {/* Icon/Type Indicator */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--surface-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: 'var(--space-4)'
                }}>
                  {collection.type === 'lego' ? '🧱' : collection.type === 'coins' ? '🪙' : '📦'}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {collection.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                    {collection.subdivision || 'General Collection'}
                  </p>
                </div>

                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs font-bold uppercase text-secondary tracking-wider">Open Vault</span>
                  <ArrowForwardIcon style={{ fontSize: '16px', color: 'var(--text-tertiary)' }} />
                </div>
              </Link>
            ))}

            {/* Add New Collection / Quick Action Card */}
            <Link
              href="/?new=choose"
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '220px',
                textDecoration: 'none',
                background: 'transparent',
                borderStyle: 'dashed',
                opacity: 0.8
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <AddIcon />
              </div>
              <span className="font-semibold">Quick Add</span>
              <span className="text-secondary text-xs mt-2">Item or Vault</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Wishlist */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', fontWeight: 700 }}>Wishlist</h3>
            <WishlistWidget />
          </div>

          {/* Quick Actions / Tips */}
          <div className="card" style={{ background: 'linear-gradient(180deg, var(--surface-primary) 0%, var(--surface-secondary) 100%)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)', fontWeight: 700 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/import" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <UploadFileIcon style={{ fontSize: '18px' }} /> Import CSV
              </Link>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                Update Pricing
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
