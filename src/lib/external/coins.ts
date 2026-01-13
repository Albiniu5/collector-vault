export interface CoinItem {
    name: string
    country: string
    year: number
    denomination: string
    composition?: string
    weight?: number
    diameter?: number
    image_url: string | null
    numista_id?: number
}

// Search returns a list of candidates
export async function searchCoins(query: string): Promise<CoinItem[]> {
    const apiKey = process.env.NUMISTA_API_KEY
    if (!apiKey) return [getMockCoin(query)!].filter(Boolean)

    try {
        console.log(`Searching Numista for: ${query}`)
        const searchUrl = `https://api.numista.com/api/v2/coins?q=${encodeURIComponent(query)}&lang=en`
        const response = await fetch(searchUrl, {
            headers: { 'Numista-API-Key': apiKey, 'Accept': 'application/json' }
        })

        if (!response.ok) return [getMockCoin(query)!].filter(Boolean)

        const data = await response.json()

        if (data.coins && data.coins.length > 0) {
            // DEBUG: Log the first coin structure to find the image path
            console.log('Numista Search Result Sample:', JSON.stringify(data.coins[0], null, 2))

            // Map the search results (summary info)
            return data.coins.slice(0, 20).map((c: any) => ({
                name: c.title,
                country: c.issuer?.name || 'Unknown',
                year: parseInt(c.min_year) || 0,
                denomination: c.value?.text || '',
                // Correct path based on debug output (obverse_thumbnail / reverse_thumbnail on root)
                image_url: c.obverse_thumbnail || c.reverse_thumbnail || null,
                numista_id: c.id
            }))
        }
    } catch (error) {
        console.error('Numista Search Failed:', error)
    }
    return []
}

// Fetch full details for a chosen coin
export async function getCoinDetails(numistaId: number): Promise<CoinItem | null> {
    const apiKey = process.env.NUMISTA_API_KEY
    if (!apiKey) return null

    try {
        const url = `https://api.numista.com/api/v2/coins/${numistaId}?lang=en`
        const res = await fetch(url, { headers: { 'Numista-API-Key': apiKey } })

        if (!res.ok) return null
        const fullCoin = await res.json()

        return {
            name: fullCoin.title,
            country: fullCoin.issuer?.name || 'Unknown',
            year: parseInt(fullCoin.min_year) || new Date().getFullYear(),
            denomination: fullCoin.value?.text || 'Unknown',
            composition: fullCoin.composition?.text,
            weight: fullCoin.weight,
            diameter: fullCoin.diameter,
            image_url: fullCoin.obverse?.picture || fullCoin.reverse?.picture || null,
            numista_id: fullCoin.id
        }
    } catch (e) {
        console.error('Numista Detail Failed', e)
        return null
    }
}

// Kept for backward compat / mock fallback
export async function getCoin(query: string): Promise<CoinItem | null> {
    const results = await searchCoins(query)
    if (results.length > 0) {
        // If we have a result, we should fetch details for the first one to match old behavior
        // OR just return the summary if detail fetch isn't strictly required for this legacy call
        if (results[0].numista_id) {
            return await getCoinDetails(results[0].numista_id)
        }
        return results[0]
    }
    return null
}

function getMockCoin(query: string): CoinItem | null {
    const q = query.toLowerCase()
    if (q.includes('usa') && q.includes('quarter')) {
        return {
            name: 'Washington Quarter (1965-1998)',
            country: 'United States',
            year: 1965,
            denomination: '25 Cents',
            composition: 'Copper-Nickel Clad Copper',
            weight: 5.67,
            diameter: 24.26,
            image_url: 'https://en.numista.com/catalogue/photos/etats-unis/g572.jpg',
            numista_id: 1
        }
    }
    return { name: query, country: 'Unknown', year: 2024, denomination: 'Unknown', image_url: null, composition: 'Unknown' }
}
