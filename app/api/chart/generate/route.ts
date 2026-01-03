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
Your task is to generate MERMAID.JS syntax that "Proves a Point".
CONTEXT:
- If Political: Show "Cause & Effect" of a policy.
- If Technical: Show "Old Way vs New Way".
RULES:
1. Return ONLY the mermaid code.
2. Use 'graph TD'.
3. Labels must be punchy.`
            userPrompt = `Generate a flowchart explaining: "${topic}"`
        } else if (chartType === 'bar' || chartType === 'pie') {
            systemPrompt = `You are a Data Visualization Expert.
Your task is to generate JSON data that tells a shocking story.
CONTEXT:
- If Political: Show "The Decline of X" or "The Rise of Y".
- If Business: Show "Revenue vs Time".
RULES:
1. Return ONLY valid JSON.
2. Structure: { "data": [ { "name": "Label", "value": 10 }, ... ], "xLabel": "Category", "yLabel": "Value" }
3. Data should be realistic but "Spiky" (high contrast) to look viral.`
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
