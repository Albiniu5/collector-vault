export interface CoinItem {
    name: string
    country: string
    year: number
    denomination: string
    composition?: string
    weight?: number
    diameter?: number
    image_url: string
}

export async function getCoin(query: string) {
    // Mock implementation simulates a search
    // In production, this would hit Numista API or similar

    const q = query.toLowerCase()

    if (q.includes('usa') && q.includes('quarter') && q.includes('1965')) {
        return {
            name: 'Washington Quarter (1965-1998)',
            country: 'United States',
            year: 1965,
            denomination: '25 Cents',
            composition: 'Copper-Nickel Clad Copper',
            weight: 5.67,
            diameter: 24.26,
            image_url: 'https://en.numista.com/catalogue/photos/etats-unis/g572.jpg'
        } as CoinItem
    }

    if (q.includes('freedom') || (q.includes('usa') && q.includes('dollar'))) {
        return {
            name: 'American Silver Eagle',
            country: 'United States',
            year: 2023,
            denomination: '1 Dollar',
            composition: 'Silver (.999)',
            weight: 31.103, // 1 oz
            diameter: 40.6,
            image_url: 'https://en.numista.com/catalogue/photos/etats-unis/63f910408542c5.96868285-original.jpg'
        } as CoinItem
    }

    return null
}
