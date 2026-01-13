import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard-stats'
import { CreateCollectionModal } from '@/components/create-collection-modal'
import Link from 'next/link'
import FolderIcon from '@mui/icons-material/Folder'
import UploadFileIcon from '@mui/icons-material/UploadFile'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Dashboard</h1>
        <p className="text-secondary">
          Manage your collections and track your items
        </p>
      </header>

      <DashboardStats />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        marginTop: 'var(--space-12)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>Collections</h2>
          <p className="text-secondary text-sm">
            {collections?.length || 0} collection{collections?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-3">
        {/* Import Card */}
        <Link href="/import" className="card card-interactive" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <UploadFileIcon style={{ color: 'white', fontSize: '28px' }} />
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
            Import CSV
          </h3>
          <p className="text-secondary text-sm" style={{ textAlign: 'center' }}>
            Bulk add items from spreadsheets
          </p>
        </Link>

        {/* Create Collection Card */}
        <CreateCollectionModal />

        {/* Collections */}
        {collections?.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="card card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '200px',
              textDecoration: 'none',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              fontSize: '48px',
              opacity: 0.1
            }}>
              {collection.type === 'lego' ? '🧱' : collection.type === 'coins' ? '🪙' : '📦'}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-3)',
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              alignSelf: 'flex-start',
              marginBottom: 'var(--space-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {collection.type}
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: 'var(--space-2)',
              color: 'var(--text-primary)'
            }}>
              {collection.name}
            </h3>

            {collection.subdivision && (
              <p className="text-tertiary text-xs" style={{ marginBottom: 'var(--space-2)' }}>
                {collection.subdivision}
              </p>
            )}

            <p className="text-secondary text-sm" style={{
              marginTop: 'auto',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {collection.description || 'No description'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
