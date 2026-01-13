'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const updates = {
        id: user.id,
        brickset_api_key: formData.get('brickset_api_key') as string,
        bricklink_consumer_key: formData.get('bricklink_consumer_key') as string,
        bricklink_consumer_secret: formData.get('bricklink_consumer_secret') as string,
        bricklink_token_value: formData.get('bricklink_token_value') as string,
        bricklink_token_secret: formData.get('bricklink_token_secret') as string,
        currency: formData.get('currency') as string,
        updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: `Failed to update settings: ${error.message} (${error.code})` }
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    return data
}
