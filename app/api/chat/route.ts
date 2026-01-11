import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import { CHAT_FOLLOWUP_PROMPT } from '@/lib/prompts'

export async function POST(request: Request) {
    try {
        const { articleContent, previousExplanation, question, chatHistory } = await request.json()

        if (!question) {
            return NextResponse.json({ error: "Question is required" }, { status: 400 })
        }

        // Build context for the AI
        let context = `ARTICLE CONTEXT:\n${articleContent?.substring(0, 5000) || 'Not available'}\n\n`
        context += `YOUR PREVIOUS ANALYSIS:\n${previousExplanation || 'Not available'}\n\n`

        // Add chat history for continuity
        if (chatHistory && chatHistory.length > 0) {
            context += `CONVERSATION HISTORY:\n`
            chatHistory.slice(-6).forEach((msg: any) => {  // Last 6 messages for context window
                context += `${msg.role.toUpperCase()}: ${msg.content}\n`
            })
            context += `\n`
        }

        context += `USER'S NEW QUESTION: ${question}`

        const response = await generateCompletion(CHAT_FOLLOWUP_PROMPT, context)

        return NextResponse.json({
            response,
            timestamp: new Date().toISOString()
        })

    } catch (e: any) {
        console.error("Chat API Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
