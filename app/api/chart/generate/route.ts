import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic, type } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const chartType = type || 'flowchart' // 'flowchart', 'bar', 'pie'

        let systemPrompt = ""
        let userPrompt = ""

        if (chartType === 'flowchart') {
            systemPrompt = `You are a Technical Diagram Expert.
Your task is to generate valid MERMAID.JS syntax for a flowchart based on the user's topic.
RULES:
1. Return ONLY the mermaid code. No markdown code blocks.
2. Use 'graph TD' (Top Down) or 'graph LR' (Left Right).
3. Keep labels concise.
4. Use standard shapes: [Rect], (Round), {Rhombus}.
`
            userPrompt = `Generate a flowchart explaining: "${topic}"`
        } else if (chartType === 'bar' || chartType === 'pie') {
            systemPrompt = `You are a Data Visualization Expert.
Your task is to generate JSON data for a Recharts ${chartType} chart.
RULES:
1. Return ONLY valid JSON. No markdown.
2. Structure: { "data": [ { "name": "Label", "value": 10 }, ... ], "xLabel": "Category", "yLabel": "Value" }
3. Make up realistic, educational data if exact data is unknown.
`
            userPrompt = `Generate data for a ${chartType} chart comparing: "${topic}"`
        }

        const completion = await generateCompletion(systemPrompt, userPrompt)

        // Clean up markdown if LLM adds it
        let cleanOutput = completion.replace(/```mermaid/g, '').replace(/```json/g, '').replace(/```/g, '').trim()

        return NextResponse.json({ output: cleanOutput, type: chartType })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
