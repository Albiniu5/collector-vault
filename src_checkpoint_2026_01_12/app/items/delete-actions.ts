'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteItems(itemIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('items')
        .delete()
        .in('id', itemIds)
        .eq('user_id', user.id)

    if (error) {
        console.error('Delete error:', error)
        return { error: error.message }
    }

    return { success: true, count: itemIds.length }
}

export async function deleteLastAdded(collectionId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Get the most recent item
    const { data: items } = await supabase
        .from('items')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

    if (!items || items.length === 0) {
        return { error: 'No items to delete' }
    }

    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', items[0].id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/collections/${collectionId}`)
    return { success: true }
}
