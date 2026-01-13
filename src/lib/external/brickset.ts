export async function getBricksetPrice(apiKey: string, setNum: string) {
    // Legacy function, can be refactored to use getBricksetSetDetails if needed
    // But keeping for now just in case
    return 0
}

export async function getBricksetSetDetails(apiKey: string, setNum: string) {
    // Brickset API v3 'getSets' expects:
    // apiKey: string
    // userHash: string
    // params: JSON string of query parameters

    // Brickset formats sets often as "75192-1" but their search might prefer "75192"
    // Let's try passing exactly what we have first.

    // Helper to fetch from Brickset
    const fetchFromBrickset = async (sNum: string) => {
        const searchParams = {
            setNumber: sNum,
            pageSize: 1,
            pageNumber: 1
        }
        const queryParams = new URLSearchParams({
            apiKey: apiKey,
            userHash: '',
            params: JSON.stringify(searchParams)
        })
        const url = `https://brickset.com/api/v3.asmx/getSets?${queryParams.toString()}`
        console.log('[Brickset] Requesting:', url)
        
        try {
            const response = await fetch(url)
            if (!response.ok) return null
            const data = await response.json()
            if (data.status !== 'success' || !data.sets || data.sets.length === 0) return null
            return data.sets[0]
        } catch (e) {
            console.error('Error fetching details from BrickSet:', e)
            return null
        }
    }

    try {
        // 1. Try exact match (e.g. "8880-1")
        let set = await fetchFromBrickset(setNum)

        // 2. If not found and has suffix, try base number (e.g. "8880")
        if (!set && setNum.includes('-1')) {
            console.log('[Brickset] Retry with base number...')
            set = await fetchFromBrickset(setNum.replace('-1', ''))
        }

        if (!set) {
            console.warn('[Brickset] No sets found for', setNum)
            return null
        }

        console.log('[Brickset] Found Set:', set.name, set.pieces)

        // Parse piece count safely
        const pieces = set.pieces ? parseInt(set.pieces) : 0
        const year = set.year ? parseInt(set.year) : 0

        return {
            name: set.name,
            year: year,
            num_parts: pieces,
            image_url: set.image?.imageURL || set.image?.thumbnailURL || null,
            set_url: set.bricksetURL,
            theme: set.theme,
            subtheme: set.subtheme,
            themeGroup: set.themeGroup,
            category: set.category,
            retailPrice: {
                US: set.USRetailPrice,
                UK: set.UKRetailPrice,
                EU: set.EURetailPrice,
                CA: set.CARetailPrice
            }
        }
    } catch (e) {
        console.error('Error in getBricksetSetDetails logic:', e)
        return null
    }
}
