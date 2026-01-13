'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateItemDescription(itemName: string, context: string) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
        return { error: 'No AI API Key found.' }
    }

    const modelsToTry = [
        'gemini-3-flash-preview',
        'gemini-3-pro-preview',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ]

    let errors: string[] = []

    for (const modelName of modelsToTry) {
        try {
            console.log(`[AI] Trying model: ${modelName}`)
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: modelName })

            const prompt = `Write a short, fascinating "fun fact" or mini-insight about this LEGO set or collectible: "${itemName}".
            Context: ${context}
            Keep it under 40 words. Be enthusiastic but concise. Do not use hashtags.`

            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            return { text }
        } catch (error: any) {
            const msg = `[${modelName}]: ${error.message || error.toString()}`
            console.warn(`[AI] Failed:`, msg)
            errors.push(msg)
        }
    }

    console.error('All AI models failed.')
    const uniqueErrors = Array.from(new Set(errors)).join(' | ')
    return { error: `AI Suggestions Failed. Details: ${uniqueErrors}` }
}
