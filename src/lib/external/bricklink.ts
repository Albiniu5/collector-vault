import crypto from 'crypto'

interface BrickLinkKeys {
    consumer_key: string
    consumer_secret: string
    token_value: string
    token_secret: string
}

function generateSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    consumerSecret: string,
    tokenSecret: string
): string {
    // 1. Sort params
    const sortedKeys = Object.keys(params).sort()
    const paramString = sortedKeys
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')

    // 2. Base String
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`

    // 3. Signing Key
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`

    // 4. HMAC-SHA1
    return crypto
        .createHmac('sha1', signingKey)
        .update(baseString)
        .digest('base64')
}

export async function getBrickLinkPrice(keys: BrickLinkKeys, setNum: string, condition: 'N' | 'U' = 'N', currencyCode: string = 'USD') {
    // Sanitize setNum: BrickLink acts weird with suffixes sometimes, but usually SetNo is "75192-1"
    // Endpoint: GET /items/SET/{no}/price
    // Doc: https://www.bricklink.com/v3/api.page?page=get-price-guide

    // Note: BrickLink API is v1, base URL: https://api.bricklink.com/api/store/v1
    const baseUrl = `https://api.bricklink.com/api/store/v1/items/SET/${setNum}/price`

    const nonce = crypto.randomBytes(16).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000).toString()

    const params: Record<string, string> = {
        oauth_consumer_key: keys.consumer_key,
        oauth_token: keys.token_value,
        oauth_nonce: nonce,
        oauth_timestamp: timestamp,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        new_or_used: condition,
        country_code: 'US', // Keep US for now or match country if possible, but US usually has most volume
        currency_code: currencyCode,
        vat: 'N'
    }

    // Generate Signature
    // For the signature, we need all params that will be in the request (URL query params + Auth header params)

    const queryParams = `?guide_type=sold&new_or_used=${condition}&currency_code=${currencyCode}&vat=N`

    // Parameters that go into the signature must include the ones in the URL
    const functionalParams = {
        guide_type: 'sold',
        new_or_used: condition,
        currency_code: currencyCode,
        vat: 'N'
    }

    const oauthParams = {
        oauth_consumer_key: keys.consumer_key,
        oauth_token: keys.token_value,
        oauth_nonce: nonce,
        oauth_timestamp: timestamp,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0'
    }

    const allParams = { ...oauthParams, ...functionalParams }
    const sig = generateSignature('GET', baseUrl, allParams, keys.consumer_secret, keys.token_secret)

    // Build Authorization Header
    const authHeader = `OAuth realm="",oauth_consumer_key="${keys.consumer_key}",oauth_token="${keys.token_value}",oauth_signature_method="HMAC-SHA1",oauth_signature="${encodeURIComponent(sig)}",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0"`

    try {
        const response = await fetch(`${baseUrl}${queryParams}`, {
            headers: {
                'Authorization': authHeader
            }
        })

        if (!response.ok) {
            const txt = await response.text()
            console.error('BrickLink API Error:', response.status, txt)
            return null
        }

        const data = await response.json()

        if (data.meta.code !== 200) {
            console.error('BrickLink Meta Error:', data.meta)
            return null
        }

        // Return quantity average price (more accurate for market value)
        return parseFloat(data.data.qty_avg_price)

    } catch (e) {
        console.error('Error fetching from BrickLink:', e)
        return null
    }
}

export async function getBrickLinkCatalogItem(keys: BrickLinkKeys, setNum: string) {
    const baseUrl = `https://api.bricklink.com/api/store/v1/items/SET/${setNum}`

    const nonce = crypto.randomBytes(16).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000).toString()

    const params: Record<string, string> = {
        oauth_consumer_key: keys.consumer_key,
        oauth_token: keys.token_value,
        oauth_nonce: nonce,
        oauth_timestamp: timestamp,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0'
    }

    const sig = generateSignature('GET', baseUrl, params, keys.consumer_secret, keys.token_secret)
    const authHeader = `OAuth realm="",oauth_consumer_key="${keys.consumer_key}",oauth_token="${keys.token_value}",oauth_signature_method="HMAC-SHA1",oauth_signature="${encodeURIComponent(sig)}",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0"`

    try {
        const response = await fetch(baseUrl, {
            headers: { 'Authorization': authHeader }
        })

        if (!response.ok) return null
        const data = await response.json()

        if (data.meta.code !== 200) return null

        return {
            name: data.data.name,
            year: parseInt(data.data.year_released) || 0
        }

    } catch (e) {
        console.error('Error fetching catalog info from BrickLink:', e)
        return null
    }
}
