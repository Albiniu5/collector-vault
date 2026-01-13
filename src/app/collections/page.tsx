import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'

export default async function CollectionsPage() {
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
        <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
            {/* Header */}
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}>
                    <ArrowBackIcon style={{ fontSize: '16px' }} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 'var(--space-2)' }}>
                            Your Vaults
                        </h1>
                        <p className="text-secondary">
                            Browse and manage all your tracked collections
                        </p>
                    </div>
                    <Link href="/?new=choose" className="btn btn-primary">
                        <AddIcon style={{ fontSize: '18px' }} />
                        <span>Quick Add</span>
                    </Link>
                </div>
            </header>

            {/* Filter Bar (Visual Only for now) */}
            <div style={{
                marginBottom: 'var(--space-8)',
                padding: 'var(--space-4)',
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <SearchIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '20px' }} />
                    <input
                        type="text"
                        placeholder="Search collections..."
                        className="input"
                        style={{ padStart: '40px', paddingLeft: '40px' }}
                    />
                </div>
                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>All</button>
                    <button className="btn btn-ghost btn-sm">Archived</button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-3">
                {collections?.map((collection) => (
                    <Link
                        key={collection.id}
                        href={`/collections/${collection.id}`}
                        className="card card-interactive"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '200px',
                            textDecoration: 'none',
                            position: 'relative',
                            background: 'var(--surface-primary)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'var(--surface-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                {collection.type === 'lego' ? '🧱' : collection.type === 'coins' ? '🪙' : '📦'}
                            </div>
                            {collection.subdivision && (
                                <span className="text-xs font-bold uppercase text-secondary tracking-wider" style={{ background: 'var(--surface-secondary)', padding: '4px 8px', borderRadius: '4px' }}>
                                    {collection.subdivision}
                                </span>
                            )}
                        </div>

                        <div style={{ marginTop: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                                {collection.name}
                            </h3>
                            <p className="text-tertiary text-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {collection.description || 'No description provided.'}
                            </p>
                        </div>
                    </Link>
                ))}

                {/* Empty State if no collections */}
                {(!collections || collections.length === 0) && (
                    <div style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>No collections found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
