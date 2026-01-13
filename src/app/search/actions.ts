'use server'

import { createClient } from '@/lib/supabase/server'

export async function globalSearch(query: string) {
    if (!query || query.length < 2) return { results: [] }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { results: [] }

    // Search Items
    const { data: items } = await supabase
        .from('items')
        .select('id, name, description, collection_id, image_url, items(collections(name, type))')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5)

    // Search Collections
    const { data: collections } = await supabase
        .from('collections')
        .select('id, name, type')
        .ilike('name', `%${query}%`)
        .limit(3)

    return {
        results: {
            items: items || [],
            collections: collections || []
        }
    }
}
