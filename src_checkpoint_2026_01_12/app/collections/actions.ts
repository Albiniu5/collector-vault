'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCollection(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Not authenticated' }
    }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string

    // Validate
    if (!name || !type) {
        return { message: 'Name and Type are required' }
    }

    try {
        const { error } = await supabase.from('collections').insert({
            user_id: user.id,
            name,
            type,
            description: description || null,
        })

        if (error) throw error

        revalidatePath('/')
        return { message: 'success' }
    } catch (error: any) {
        return { message: error.message }
    }
}
