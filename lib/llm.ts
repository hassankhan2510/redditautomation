import OpenAI from 'openai'
import { Groq } from 'groq-sdk'

const openRouterApiKey = process.env.OPENROUTER_API_KEY
const groqApiKey = process.env.GROQ_API_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteName = 'Reddit Poster'

// Initialize Clients
const openRouter = new OpenAI({
    apiKey: openRouterApiKey || 'dummy',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
    },
})

let groq: Groq | null = null
if (groqApiKey) {
    groq = new Groq({
        apiKey: groqApiKey,
        dangerouslyAllowBrowser: true
    })
}

// Priority List: Groq (Fast/Free) -> OpenRouter (Fallback)
const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
]

const OPENROUTER_MODELS = [
    'mistralai/mistral-7b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.1-8b-instruct:free',
]

export const llm = openRouter

export async function generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    model?: string
): Promise<string> {

    // 1. Try Groq Models First (if Key exists)
    if (groq) {
        for (const groqModel of GROQ_MODELS) {
            try {
                // console.log(`Attempting Groq model: ${groqModel}...`)
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    model: groqModel,
                    temperature: 0.7,
                })

                const content = completion.choices[0]?.message?.content
                if (content) return content

            } catch (error) {
                console.warn(`Groq ${groqModel} failed.`, error)
                // Continue to next Groq model
            }
        }
    }

    // 2. Fallback to OpenRouter (using provided model or defaults)
    const fallbackModels = model ? [model, ...OPENROUTER_MODELS] : OPENROUTER_MODELS
    const uniqueFallbacks = Array.from(new Set(fallbackModels))

    for (const orModel of uniqueFallbacks) {
        try {
            // console.log(`Attempting OpenRouter model: ${orModel}...`)
            const completion = await openRouter.chat.completions.create({
                model: orModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
            })

            const content = completion.choices[0]?.message?.content
            if (content) return content

        } catch (error) {
            console.warn(`OpenRouter ${orModel} failed.`, error)
            // Continue to next OpenRouter model
        }
    }

    throw new Error('All AI providers (Groq & OpenRouter) failed. Please check your API keys.')
}
