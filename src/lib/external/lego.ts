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
    // Rich Data (Brickset)
    theme?: string
    subtheme?: string
    themeGroup?: string
    category?: string
    rrp?: { US?: number, UK?: number, EU?: number, CA?: number }
}

// Heuristic to estimate price if API doesn't provide it
function estimatePrice(numParts: number, year: number, name: string) {
    // Base is USD for heuristics
    let basePrice = numParts * 0.11
    const lowerName = name.toLowerCase()
    if (lowerName.includes('star wars')) basePrice *= 1.4
    else if (lowerName.includes('technic')) basePrice *= 1.2
    else if (lowerName.includes('city')) basePrice *= 1.1
    else if (lowerName.includes('creator') || lowerName.includes('ideas')) basePrice *= 1.15
    else if (lowerName.includes('harry potter')) basePrice *= 1.3
    const currentYear = new Date().getFullYear()
    const age = currentYear - year
    if (age > 10) basePrice *= 1.3
    if (age > 20) basePrice *= 1.8
    if (age > 30) basePrice *= 2.5
    return Math.round(basePrice * 100) / 100
}

// Helper: Fetch BrickLink price if user has keys (UPDATED to return full profile for Brickset)
async function fetchUserProfile() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            return profile
        }
    } catch (err) {
        console.error('Error fetching profile:', err)
    }
    return null
}

export async function getLegoSet(query: string) {
    const apiKey = process.env.REBRICKABLE_API_KEY

    // 1. Sanitize Input
    let setNum = query.trim()
    if (!setNum.includes('-0') && !setNum.includes('-')) {
        setNum += '-1'
    }

    // Helper to decode HTML entities
    const decodeName = (str: string) => {
        if (!str) return 'Unknown'
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#40;/g, '(')
            .replace(/&#41;/g, ')')
    }

    const profile = await fetchUserProfile()
    let legoData: any = null
    let source = 'rebrickable'
    let extraData: any = {}

    // TRY REBRICKABLE FIRST
    if (apiKey && apiKey !== 'OPTIONAL_LEGO_KEY') {
        try {
            const response = await fetch(
                `https://rebrickable.com/api/v3/lego/sets/${setNum}/`,
                { headers: { Authorization: `key ${apiKey}` } }
            )
            if (response.ok) {
                legoData = await response.json()
            }
        } catch (e) { console.error('Rebrickable Error', e) }
    }

    // IF REBRICKABLE FAILED, TRY BRICKLINK/BRICKSET FALLBACK
    if (!legoData) {
        // Use User's key OR Global Environment Key
        const bricksetKey = profile?.brickset_api_key || process.env.BRICKSET_API_KEY

        if (bricksetKey) {
            const bsDetails = await getBricksetSetDetails(bricksetKey, setNum)
            if (bsDetails) {
                legoData = {
                    set_num: setNum,
                    name: bsDetails.name,
                    year: bsDetails.year,
                    num_parts: bsDetails.num_parts,
                    set_img_url: bsDetails.image_url,
                    set_url: bsDetails.set_url,
                    // Fake Rebrickable fields
                    theme_id: 0,
                    last_modified_dt: new Date().toISOString()
                }
                source = 'brickset'
                extraData = bsDetails // CAPTURE RICH DATA
            }
        }
    }

    if (!legoData) return null

    // ENRICH WITH BRICKSET (for RRP, Themes) — Only if not already captured
    const bricksetKey = profile?.brickset_api_key || process.env.BRICKSET_API_KEY
    if (bricksetKey && source !== 'brickset') {
        const bsDetails = await getBricksetSetDetails(bricksetKey, setNum)
        if (bsDetails) extraData = bsDetails
    }

    // ENRICH WITH BRICKLINK PRICES
    let price = 0
    let priceSource: 'estimate' | 'bricklink' | 'brickset' = 'estimate'
    let priceNew, priceUsed

    if (profile?.bricklink_consumer_key || process.env.BRICKLINK_CONSUMER_KEY) {
        try {
            const keys = {
                consumer_key: profile?.bricklink_consumer_key || process.env.BRICKLINK_CONSUMER_KEY!,
                consumer_secret: profile?.bricklink_consumer_secret || process.env.BRICKLINK_CONSUMER_SECRET!,
                token_value: profile?.bricklink_token_value || process.env.BRICKLINK_TOKEN_VALUE!,
                token_secret: profile?.bricklink_token_secret || process.env.BRICKLINK_TOKEN_SECRET!
            }
            const userCurrency = profile.currency || 'USD'
            const [pN, pU] = await Promise.all([
                getBrickLinkPrice(keys, setNum, 'N', userCurrency),
                getBrickLinkPrice(keys, setNum, 'U', userCurrency)
            ])
            if (pN || pU) {
                priceNew = pN || 0
                priceUsed = pU || 0
                price = priceNew || priceUsed || 0
                priceSource = 'bricklink'
            }
        } catch (e) { console.error('BL Price Error', e) }
    }

    // Fallback Price
    if (!price) {
        price = estimatePrice(legoData.num_parts, legoData.year, legoData.name)
    }

    // Merge Everything
    return {
        set_num: legoData.set_num,
        name: decodeName(legoData.name),
        year: legoData.year,
        theme_id: legoData.theme_id,
        num_parts: legoData.num_parts,
        set_img_url: legoData.set_img_url || legoData.image_url,
        set_url: legoData.set_url,
        last_modified_dt: legoData.last_modified_dt,
        image_url: legoData.set_img_url || legoData.image_url, // unification

        price_estimate: price,
        price_source: priceSource,
        price_new: priceNew,
        price_used: priceUsed,

        // Rich Data
        theme: extraData.theme || undefined,
        subtheme: extraData.subtheme || undefined,
        themeGroup: extraData.themeGroup || undefined,
        category: extraData.category || undefined,
        rrp: extraData.retailPrice || undefined
    }
}
