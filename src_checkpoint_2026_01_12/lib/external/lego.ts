import { createClient } from '@/lib/supabase/server'
import { getBrickLinkPrice, getBrickLinkCatalogItem } from './bricklink'
import { getBricksetSetDetails } from './brickset'

const REBRICKABLE_API_KEY = process.env.REBRICKABLE_API_KEY
const BASE_URL = 'https://rebrickable.com/api/v3'

export interface LegoSet {
    set_num: string
    name: string
    year: number
    theme_id: number
    num_parts: number
    set_img_url: string
    set_url: string
    last_modified_dt: string
    image_url: string
    price_estimate: number
    price_source: 'estimate' | 'bricklink' | 'brickset'
    price_new?: number
    price_used?: number
}

// Heuristic to estimate price if API doesn't provide it
function estimatePrice(numParts: number, year: number, name: string) {
    // Base is USD for heuristics
    let basePrice = numParts * 0.11

    const lowerName = name.toLowerCase()

    if (lowerName.includes('star wars')) {
        basePrice *= 1.4
    } else if (lowerName.includes('technic')) {
        basePrice *= 1.2
    } else if (lowerName.includes('city')) {
        basePrice *= 1.1
    } else if (lowerName.includes('creator') || lowerName.includes('ideas')) {
        basePrice *= 1.15
    } else if (lowerName.includes('harry potter')) {
        basePrice *= 1.3
    }

    const currentYear = new Date().getFullYear()
    const age = currentYear - year

    if (age > 10) basePrice *= 1.3
    if (age > 20) basePrice *= 1.8
    if (age > 30) basePrice *= 2.5

    return Math.round(basePrice * 100) / 100
}

// Helper: Fetch BrickLink price if user has keys
async function fetchUserBrickLinkPrices(setNum: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('bricklink_consumer_key, bricklink_consumer_secret, bricklink_token_value, bricklink_token_secret, currency, brickset_api_key')
                .eq('id', user.id)
                .single()

            if (profile?.bricklink_consumer_key && profile?.bricklink_token_value) {
                const keys = {
                    consumer_key: profile.bricklink_consumer_key,
                    consumer_secret: profile.bricklink_consumer_secret,
                    token_value: profile.bricklink_token_value,
                    token_secret: profile.bricklink_token_secret
                }

                const userCurrency = profile.currency || 'USD'

                // Fetch both New and Used
                const [priceNew, priceUsed] = await Promise.all([
                    getBrickLinkPrice(keys, setNum, 'N', userCurrency),
                    getBrickLinkPrice(keys, setNum, 'U', userCurrency)
                ])

                return {
                    priceNew: priceNew || 0,
                    priceUsed: priceUsed || 0,
                    source: 'bricklink' as const,
                    keys: keys,
                    bricksetKey: profile.brickset_api_key
                }
            }
        }
    } catch (err) {
        console.error('Error fetching BrickLink price:', err)
    }
    return null
}

export async function getLegoSet(query: string) {
    const apiKey = process.env.REBRICKABLE_API_KEY
    const supabase = await createClient()

    // 1. Sanitize Input
    let setNum = query.trim()
    if (!setNum.includes('-')) {
        setNum += '-1'
    }

    // Helper to decode HTML entities (e.g. &amp; -> &, &#40; -> () )
    const decodeName = (str: string) => {
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#40;/g, '(')
            .replace(/&#41;/g, ')')
    }

    // Checking if we are in fallback mode
    if (!apiKey || apiKey === 'OPTIONAL_LEGO_KEY') {
        const parts = 250 // default fallback

        // Always try to Validate via BrickLink directly
        const blResult = await fetchUserBrickLinkPrices(setNum)

        if (blResult) {
            // Found on BrickLink!
            let name = `Set ${setNum}`
            let year = 0
            let partsNum = 0
            let imageUrl = `https://cdn.rebrickable.com/media/sets/${setNum}.jpg`
            let setUrl = `https://www.bricklink.com/v2/catalog/catalogitem.page?S=${setNum}`

            // 1. Try Brickset for rich metadata (Parts, Year, better Image)
            if (blResult.bricksetKey) {
                console.log(`[LEGO] Fetching Brickset details for ${setNum}...`)
                const bsDetails = await getBricksetSetDetails(blResult.bricksetKey, setNum)
                if (bsDetails && bsDetails.name) {
                    console.log(`[LEGO] Brickset Found:`, bsDetails)
                    name = bsDetails.name
                    year = bsDetails.year || 0
                    partsNum = bsDetails.num_parts || 0
                    if (bsDetails.image_url) imageUrl = bsDetails.image_url
                    if (bsDetails.set_url) setUrl = bsDetails.set_url
                } else {
                    console.log(`[LEGO] Brickset returned nothing for ${setNum}`)
                }
            } else {
                console.log(`[LEGO] No Brickset key available`)
            }

            // 2. Fallback to BrickLink Catalog if Brickset didn't give us everything (e.g. name/year)
            if ((name === `Set ${setNum}` || year === 0) && blResult.keys) {
                const blDetails = await getBrickLinkCatalogItem(blResult.keys, setNum)
                if (blDetails) {
                    if (name === `Set ${setNum}`) name = blDetails.name
                    if (year === 0) year = blDetails.year
                }
            }

            return {
                set_num: setNum,
                name: decodeName(name),
                year: year,
                theme_id: 0,
                num_parts: partsNum,
                set_img_url: imageUrl,
                set_url: setUrl,
                image_url: imageUrl,
                price_estimate: blResult.priceNew,
                price_source: 'bricklink',
                price_new: blResult.priceNew,
                price_used: blResult.priceUsed
            }
        }

        // Truly Not Found (Neither on BrickLink nor Rebrickable)
        return null
    }

    try {
        const response = await fetch(
            `https://rebrickable.com/api/v3/lego/sets/${setNum}/`,
            {
                headers: {
                    Authorization: `key ${apiKey}`,
                },
            }
        )

        if (!response.ok) {
            console.error('Rebrickable API error:', response.status)
            return null
        }

        const data = await response.json()

        // 2. Try to get Real Price from BrickLink
        let price = 0
        let priceSource: 'estimate' | 'bricklink' | 'brickset' = 'estimate'
        let priceNew, priceUsed

        const blResult = await fetchUserBrickLinkPrices(setNum)
        if (blResult) {
            price = blResult.priceNew // Default to New price for main estimate
            priceSource = blResult.source
            priceNew = blResult.priceNew
            priceUsed = blResult.priceUsed
        }

        // Fallback to estimate if no real price found
        if (!price) {
            price = estimatePrice(data.num_parts, data.year, data.name)
        }

        console.log(`[LEGO] Fetched set ${setNum}: ${data.name}. Price: ${price} (${priceSource}) New: ${priceNew}, Used: ${priceUsed}`)

        return {
            ...data,
            name: decodeName(data.name),
            image_url: data.set_img_url,
            price_estimate: price,
            price_source: priceSource,
            price_new: priceNew,
            price_used: priceUsed
        }
    } catch (error) {
        console.error('Error fetching LEGO set:', error)
        return null
    }
}
