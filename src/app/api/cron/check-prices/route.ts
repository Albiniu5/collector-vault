import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLegoSet } from '@/lib/external/lego'
// import { getCoin } from '@/lib/external/coins' // optimize imports later

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        // 1. Get items with alerts enabled
        const { data: items } = await supabase
            .from('items')
            .select('*')
            .not('price_alert_threshold', 'is', null)

        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'No items to check' })
        }

        const results = []

        for (const item of items) {
            // Only check items with external_id (sets/coins)
            if (!item.external_id) continue

            let currentPrice = 0

            // Logic to fetch price based on source/type
            // For now, assuming LEGO is the main one we have a solid API for
            if (item.source?.includes('lego') || item.external_id.includes('-')) {
                const legoData = await getLegoSet(item.external_id)
                if (legoData && legoData.price_new) {
                    currentPrice = legoData.price_new
                }
            }

            // If we found a price, compare it
            if (currentPrice > 0) {
                // Calculate comparison base (purchase price or previous value)
                const basePrice = item.purchase_price || item.current_value || 0

                if (basePrice > 0) {
                    const diff = basePrice - currentPrice
                    const percentDrop = (diff / basePrice) * 100

                    if (percentDrop >= item.price_alert_threshold) {
                        // ALERT TRIGGERED
                        const alertMsg = `Price Alert for ${item.name}: Dropped by ${percentDrop.toFixed(1)}% to $${currentPrice}`
                        console.log(alertMsg)
                        results.push({ item: item.name, status: 'ALERT', drop: percentDrop })

                        // TODO: Send Email or Push Notification here
                        // await sendEmail(...)
                    } else {
                        results.push({ item: item.name, status: 'OK', price: currentPrice })
                    }
                }

                // Update current value in DB
                await supabase.from('items').update({
                    current_value: currentPrice,
                    last_price_check: new Date().toISOString()
                }).eq('id', item.id)
            }
        }

        return NextResponse.json({ success: true, results })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
