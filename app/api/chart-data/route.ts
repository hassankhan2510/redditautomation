import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { text } = await request.json()

        if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 })

        const systemPrompt = `You are a Data Visualization Expert.
Your goal is to convert Natural Language into a JSON structure for a Chart.js graph.

RULES:
- Extract labels and values.
- Determine the best chart type (bar, line, or doughnut).
- Return ONLY valid JSON.

JSON STRUCTURE:
{
  "type": "bar" | "line" | "doughnut",
  "data": {
    "labels": ["Label 1", "Label 2"],
    "datasets": [
        {
            "label": "Metric Name",
            "data": [10, 20]
        }
    ]
  },
  "title": "Chart Title"
}
`

        const userPrompt = `
INPUT: "${text}"

ACTION: Generate the JSON for this chart.
`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        // Extract JSON from potential markdown code blocks
        const jsonMatch = completion.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : completion

        const chartData = JSON.parse(jsonStr)

        return NextResponse.json({ chartData })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
