'use server'

import { createClient } from '@/lib/supabase/server'
import { getLegoSet } from '@/lib/external/lego'
import { getCoin } from '@/lib/external/coins'
import { revalidatePath } from 'next/cache'

export async function lookupItem(formData: FormData) {
    const type = formData.get('type')
    const query = formData.get('query') as string

    if (!query) return { error: 'Query is required' }

    if (type === 'lego') {
        const data = await getLegoSet(query)
        if (!data) return { error: 'Set not found' }
        return { data }
    }

    if (type === 'coins') {
        const data = await getCoin(query)
        if (!data) return { error: 'Coin not found (Try "USA Quarter 1965")' }
        return { data }
    }

    return { error: 'Unsupported type' }
}

export async function addItem(collectionId: string, itemData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Prepare Record based on source
    // Fetch user currency for the record
    const { data: profile } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
    const currency = profile?.currency || 'USD'

    let record: any = {
        user_id: user.id,
        collection_id: collectionId,
        name: itemData.name || 'Untitled Item',
        description: itemData.description || itemData.name || '',
        image_url: itemData.image_url || itemData.set_img_url || null,
        purchase_price: itemData.purchase_price || null,
        current_value: itemData.current_value !== undefined ? itemData.current_value : (itemData.purchase_price || null),
        currency: currency,
        source: 'manual',
        metadata: {}
    }

    if (itemData.set_num) { // LEGO
        record.external_id = itemData.set_num
        record.source = 'auto:lego'
        record.metadata = {
            year: itemData.year,
            theme_id: itemData.theme_id,
            num_parts: itemData.num_parts,
            set_url: itemData.set_url
        }
    } else if (itemData.country) { // COIN
        record.source = 'auto:coin'
        record.metadata = {
            country: itemData.country,
            year: itemData.year,
            denomination: itemData.denomination,
            composition: itemData.composition,
            weight: itemData.weight
        }
    } else if (itemData.year) {
        // Generic item with year
        record.metadata = { year: itemData.year }
    }

    const { error } = await supabase.from('items').insert(record)

    if (error) {
        console.error('Insert error:', error)
        return { error: error.message }
    }

    revalidatePath(`/collections/${collectionId}`)
    return { success: true }
}

