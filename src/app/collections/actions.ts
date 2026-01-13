'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCollection(input: { name: string, type: string, description?: string }) {
    console.log('Server Action: createCollection called', input)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('Server Action: No user found')
        return { error: 'Not authenticated' }
    }
    console.log('Server Action: User authenticated', user.id)

    const { name, type, description } = input

    // Validate
    if (!name || !type) {
        return { error: 'Name and Type are required' }
    }

    try {
        const { data, error } = await supabase.from('collections').insert({
            user_id: user.id,
            name,
            type,
            description: description || null,
        })
            .select()
            .single()

        if (error) {
            console.error('Server Action: DB Error', error)
            throw error
        }

        console.log('Server Action: Success', data)
        revalidatePath('/')
        return { data }
    } catch (error: any) {
        console.error('Server Action: Catch Error', error)
        return { error: error.message }
    }
}

export async function updateCollection(id: string, data: { name?: string, description?: string, image_url?: string }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: 'Not authenticated' }
    }

    try {
        const { error } = await supabase
            .from('collections')
            .update({
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.image_url !== undefined && { image_url: data.image_url }),
            })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        revalidatePath(`/collections/${id}`)
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating collection:', error)
        return { success: false, message: error.message }
    }
}

export async function deleteCollection(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Not authenticated' }
    }

    try {
        // Items should cascade delete if set up in DB, but let's be safe or assume cascade works
        // We will just delete the collection and let postgres handle cascade if configured,
        // or we might need to delete items first.
        // Assuming ON DELETE CASCADE is NOT set for safety, we delete items first.

        // 1. Delete items
        const { error: itemsError } = await supabase
            .from('items')
            .delete()
            .eq('collection_id', id)

        if (itemsError) throw itemsError

        // 2. Delete collection
        const { error: collectionError } = await supabase
            .from('collections')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Security check

        if (collectionError) throw collectionError

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting collection:', error)
        return { success: false, message: error.message }
    }
}
