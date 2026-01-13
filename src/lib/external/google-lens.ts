import fs from 'fs'
import path from 'path'

// Simple file-based cache
const CACHE_FILE = path.join(process.cwd(), '.cache', 'lens_cache.json')

// Ensure cache directory exists
try {
    const dir = path.dirname(CACHE_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
} catch (e) {
    // Ignore error if we can't write (e.g. read-only env), cache will just be skipped
}

function getCache(): Record<string, any> {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
        }
    } catch (e) { console.error('Cache read error', e) }
    return {}
}

function setCache(key: string, data: any) {
    try {
        const cache = getCache()
        cache[key] = data
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
    } catch (e) { console.error('Cache write error', e) }
}

export interface LensResult {
    title: string
    source: string
    thumbnail: string
    link: string
}

export async function searchLens(imageUrl: string): Promise<LensResult[]> {
    const apiKey = process.env.SERPAPI_API_KEY

    // Mock if no key (for demo purposes if user hasn't added it yet)
    if (!apiKey) {
        console.warn('No SERPAPI_API_KEY, using mock')
        // return mock matches
        return [
            {
                title: 'Mock Result: Ancient Coin',
                source: 'eBay',
                thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-X7F5_x7_y7_X7_y7_x7_y7_x7_y7_x7&s',
                link: '#'
            },
            {
                title: 'Mock Result: Roman Denarius',
                source: 'VCoins',
                thumbnail: imageUrl, // reflect back
                link: '#'
            }
        ]
    }

    // Check Cache
    const cache = getCache()
    if (cache[imageUrl]) {
        console.log('Lens Cache Hit')
        return cache[imageUrl]
    }

    try {
        const query = new URLSearchParams({
            engine: 'google_lens',
            url: imageUrl,
            api_key: apiKey
        })

        const res = await fetch(`https://serpapi.com/search.json?${query.toString()}`)
        if (!res.ok) throw new Error('SerpApi failed')

        const data = await res.json()

        let results: LensResult[] = []

        // Parse Visual Matches
        if (data.visual_matches) {
            results = data.visual_matches.map((m: any) => ({
                title: m.title,
                source: m.source,
                thumbnail: m.thumbnail,
                link: m.link
            }))
        }

        // Cache It
        setCache(imageUrl, results)
        return results

    } catch (e) {
        console.error('Lens Search Error', e)
        return []
    }
}
