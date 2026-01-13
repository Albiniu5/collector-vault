import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CollectionView } from '@/components/collection-view'

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: collection } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single()

    if (!collection) {
        return (
            <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
                <h1>Collection Not Found</h1>
                <p>The collection you are looking for does not exist or you do not have permission to view it.</p>
            </div>
        )
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .single()

    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('collection_id', id)
        .order('created_at', { ascending: false })

    return <CollectionView collection={collection} items={items || []} currencyCode={profile?.currency || 'USD'} />
}
