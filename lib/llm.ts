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

const FALLBACK_MODELS = [
    'mistralai/devstral-2512:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'qwen/qwen3-4b:free',
    'xiaomi/mimo-v2-flash:free',
]

export async function generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    model: string = FALLBACK_MODELS[0]
): Promise<string> {
    // Create a unique list of models to try, starting with the requested one
    const modelsToTry = Array.from(new Set([model, ...FALLBACK_MODELS]))

    for (const modelName of modelsToTry) {
        try {
            console.log(`Generating with model: ${modelName}...`)
            const completion = await llm.chat.completions.create({
                model: modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
            })

            const content = completion.choices[0]?.message?.content
            if (content) return content

        } catch (error) {
            console.warn(`Model ${modelName} failed, trying next...`, error)
            // Continue to next model
        }
    }

    throw new Error('All available AI models failed to generate content. Please try again later.')
}
