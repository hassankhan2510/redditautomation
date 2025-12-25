import OpenAI from 'openai'

const openRouterApiKey = process.env.OPENROUTER_API_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteName = 'Reddit Poster'

if (!openRouterApiKey) {
    console.warn('OPENROUTER_API_KEY is not set')
}

export const llm = new OpenAI({
    apiKey: openRouterApiKey || 'dummy',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
    },
})

export async function generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    model: string = 'meta-llama/llama-3-8b-instruct:free'
): Promise<string> {
    try {
        const completion = await llm.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
        })

        return completion.choices[0]?.message?.content || ''
    } catch (error) {
        console.error('LLM Error:', error)
        throw error
    }
}
