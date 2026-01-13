import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FilterListIcon from '@mui/icons-material/FilterList'
import { CollectionCard } from '@/components/collection-card'

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

            {/* Grid - Replaced with Strict Block Layout */}
            <div style={{
                display: 'block',
                width: '100%',
                maxWidth: '1600px',
            }}>
                {collections?.map((collection) => (
                    <div key={collection.id} style={{
                        display: 'inline-block',
                        width: '350px',
                        height: '262px',
                        margin: '0 24px 24px 0',
                        verticalAlign: 'top',
                        maxWidth: '100%',
                    }}>
                        <CollectionCard
                            data={{
                                ...collection,
                                totalValue: collection.items?.reduce((sum: number, item: any) => sum + (item.current_value || 0), 0) || 0,
                                itemCount: collection.items?.length || 0
                            }}
                            currency="USD"
                        />
                    </div>
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
