'use server'

import { createClient } from '@/lib/supabase/server'
import { getLegoSet } from '@/lib/external/lego'
import { getCoin, searchCoins, getCoinDetails } from '@/lib/external/coins'
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
        // Return a list of results for the user to pick from
        const results = await searchCoins(query)
        if (!results || results.length === 0) return { error: 'No coins found' }
        return { results }
    }

    // Generic fallback for Books/Antiques (just return the query as a manual item)
    return {
        data: {
            name: query,
            description: 'Custom Item',
            image_url: null,
            source: 'manual'
        }
    }
}

export async function lookupCoinDetails(numistaId: number) {
    const data = await getCoinDetails(numistaId)
    if (!data) return { error: 'Failed to fetch coin details' }
    return { data }
}

import { searchLens } from '@/lib/external/google-lens'

export async function scanImage(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Upload to 'scans' bucket
    const path = `lens/${user.id}/${Date.now()}_${file.name}`

    // Auto-create bucket attempt
    const { error: bucketError } = await supabase.storage.createBucket('scans', { public: true })
    if (bucketError && !bucketError.message.includes('already exists')) {
        // Log but continue, maybe it exists but we don't have create permissions
        console.log('Bucket creation check:', bucketError.message)
    }

    // We attempt upload.
    let bucketName = 'scans'
    let { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, file)

    // Fallback to 'avatars' if 'scans' fails (common public bucket)
    if (uploadError) {
        console.log('Scans bucket failed, trying avatars...')
        bucketName = 'avatars'
        const res = await supabase.storage
            .from(bucketName)
            .upload(path, file)

        if (res.error) {
            console.error('Avatars upload failed:', res.error)
            return { error: 'Upload failed. Please create a public bucket named "scans" in Supabase.' }
        }
    }

    // Get Public URL (or Signed URL if private)
    // First try public
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(path)

    // Check if public URL is accessible? (Skip complexity, send to Lens)

    // Analyze with Lens
    const matches = await searchLens(publicUrl)

    // Map to generic results
    if (matches.length > 0) {
        return {
            results: matches.map(m => ({
                name: m.title,
                country: m.source, // Misusing field slightly for display
                year: null, // Lens doesn't reliably extract year
                image_url: m.thumbnail,
                source: 'lens', // Marker to handle differently in UI if needed
                link: m.link
            }))
        }
    }

    return { error: 'No visual matches found' }
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
            set_url: itemData.set_url,
            // Rich Metadata (Brickset)
            rrp: itemData.rrp,
            theme: itemData.theme,
            subtheme: itemData.subtheme,
            theme_group: itemData.themeGroup,
            category: itemData.category
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


export async function updateItem(itemId: string, data: Partial<any>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const updates: any = {
        name: data.name,
        current_value: data.current_value,
        purchase_price: data.purchase_price,
        description: data.description,
        price_alert_threshold: data.price_alert_threshold,
        updated_at: new Date().toISOString()
    }

    // Preserve existing metadata but mark as manually modified
    const { data: current } = await supabase.from('items').select('metadata').eq('id', itemId).single()
    const newMetadata = {
        ...(current?.metadata || {}),
        ...data.metadata,
        is_manually_modified: true,
        last_edited: new Date().toISOString()
    }
    updates.metadata = newMetadata

    const { error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', itemId)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/items/${itemId}`)
    return { success: true }
}

export async function refreshItemMetadata(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Get current item to find external_id (set num)
    const { data: item } = await supabase.from('items').select('*').eq('id', itemId).single()
    if (!item || !item.external_id) return { error: 'Item not found or has no Set Number' }

    // 2. Fetch fresh data
    // Debug: Check if user has API keys or global key
    const { data: profile } = await supabase.from('profiles').select('brickset_api_key').eq('id', user.id).single()

    // Check for key in Profile OR Environment
    const hasKey = profile?.brickset_api_key || process.env.BRICKSET_API_KEY

    if (!hasKey) {
        return { error: 'Brickset API Key is missing. Please contact admin to configure GLOBAL key.' }
    }

    const newData = await getLegoSet(item.external_id)
    if (!newData) return { error: 'Could not fetch data from LEGO APIs' }

    // 3. Update Database
    // We only want to update the "rich" metadata fields, avoiding overwrites of user-customized things if possible,
    // but usually a refresh implies "reset to source". 
    // For now, let's merge the new rich fields into the existing metadata.

    const newMetadata = {
        ...item.metadata,
        // Update rich fields
        year: newData.year,
        num_parts: newData.num_parts,
        set_url: newData.set_url,
        theme: newData.theme,
        subtheme: newData.subtheme,
        theme_group: newData.themeGroup,
        category: newData.category,
        rrp: newData.rrp,
        // Update timestamps
        last_refreshed: new Date().toISOString()
    }

    const { error } = await supabase
        .from('items')
        .update({
            metadata: newMetadata,
            current_value: newData.price_estimate || item.current_value // Optional: Update price too? Let's do it if it's an estimate.
        })
        .eq('id', itemId)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/items/${itemId}`)
    return { success: true }
}
