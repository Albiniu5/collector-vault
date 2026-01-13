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

    const searchParams = {
        setNumber: setNum,
        pageSize: 1,
        pageNumber: 1
    }

    const queryParams = new URLSearchParams({
        apiKey: apiKey,
        userHash: '',
        params: JSON.stringify(searchParams)
    })

    try {
        const url = `https://brickset.com/api/v3.asmx/getSets?${queryParams.toString()}`
        console.log('[Brickset] Requesting:', url)

        const response = await fetch(url)

        if (!response.ok) {
            console.error('[Brickset] API Error Status:', response.status)
            return null
        }

        const data = await response.json()

        if (data.status !== 'success') {
            console.error('[Brickset] API Error:', data.message)
            return null
        }

        if (!data.sets || data.sets.length === 0) {
            console.warn('[Brickset] No sets found for', setNum)
            return null
        }

        const set = data.sets[0]
        console.log('[Brickset] Found Set:', set.name, set.pieces)

        // Parse piece count safely
        const pieces = set.pieces ? parseInt(set.pieces) : 0
        const year = set.year ? parseInt(set.year) : 0

        return {
            name: set.name,
            year: year,
            num_parts: pieces,
            image_url: set.image?.imageURL || set.image?.thumbnailURL || null,
            set_url: set.bricksetURL
        }
    } catch (e) {
        console.error('Error fetching details from BrickSet:', e)
        return null
    }
}
