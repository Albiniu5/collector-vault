import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import SearchIcon from '@mui/icons-material/Search'
import { CollectionCard } from '@/components/collection-card'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>All</button>
                    <button className="btn btn-ghost btn-sm">Archived</button>
                </div>
            </div>

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
                            currency={'USD'} // Fallback for now or fetch properly higher up
                        />
                    </div>
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
