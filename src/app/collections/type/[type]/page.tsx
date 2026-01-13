import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FilterListIcon from '@mui/icons-material/FilterList'

interface PageProps {
    params: Promise<{
        type: string
    }>
}

export default async function CollectionTypePage({ params }: PageProps) {
    const { type } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Capitalize for display
    const displayType = type.charAt(0).toUpperCase() + type.slice(1)

    // Fetch collections matching the type (looking in both type and subdivision just in case)
    // Using ilike for case-insensitive matching
    const { data: collections } = await supabase
        .from('collections')
        .select('*')
        .or(`type.ilike.%${type}%,subdivision.ilike.%${type}%`)
        .order('created_at', { ascending: false })

    return (
        <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
            {/* Header */}
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}>
                    <ArrowBackIcon style={{ fontSize: '16px' }} /> Return Home
                </Link>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', color: 'white'
                            }}>
                                {type === 'lego' ? '🧱' : type === 'coins' ? '🪙' : '📂'}
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
                                {displayType} Vaults
                            </h1>
                        </div>
                        <p className="text-secondary">
                            {collections?.length || 0} collection{collections?.length !== 1 ? 's' : ''} in this category
                        </p>
                    </div>
                    <Link href={`/?new=choose&type=${type}`} className="btn btn-primary">
                        <AddIcon style={{ fontSize: '18px' }} />
                        <span>Quick Add</span>
                    </Link>
                </div>
            </header>

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
                            <span className="text-xs font-bold uppercase text-tertiary tracking-wider" style={{ background: 'var(--surface-secondary)', padding: '4px 8px', borderRadius: '4px' }}>
                                {collection.subdivision || collection.type}
                            </span>
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

                {/* Empty State */}
                {(!collections || collections.length === 0) && (
                    <div style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-lg)' }}>
                        <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>No {displayType} collections found.</p>
                        <Link href={`/?new=collection&type=${type}`} className="btn btn-primary">
                            Start your first {displayType} Vault
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
