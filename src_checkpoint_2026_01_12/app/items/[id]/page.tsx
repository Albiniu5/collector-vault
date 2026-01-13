import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ItemDetailView } from '@/components/item-detail-view'

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single()

    if (!item) {
        return notFound()
    }

    // Fetch profile for currency preference
    const { data: { user } } = await supabase.auth.getUser()
    let currency = 'USD'

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user.id)
            .single()
        if (profile?.currency) currency = profile.currency
    }

    return <ItemDetailView item={item} currencyCode={currency} />
}
