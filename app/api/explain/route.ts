
import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import * as cheerio from 'cheerio'

const FEYNMAN_PROMPT = `You are a Senior Research Analyst.
Your job is to deconstruct complex technical papers / articles into actionable intelligence.

    Goal: Infinite Clarity + Technical Depth.

        Process:

## 1. EXECUTIVE SUMMARY(The "What" & "Why")
    - 3 clear paragraphs.
- Paragraph 1: What specific problem is this solving ?
    - Paragraph 2: What is the core innovation / solution ?
        - Paragraph 3: Why does this matter right now ?

## 2. THE MECHANISM(How it works - Step - by - Step)
    - ** CRITICAL SECTION **: Explain the * technical procedure * or * algorithm *.
- Don't just say "it uses AI". Say "It uses a transformer architecture to..."
    - Use a Numbered List(1, 2, 3...) to show the flow of data or logic.
- Capture the "Secret Sauce".

## 3. TECHNICAL CONCEPTS(Dictionary)
    - Define 3 - 5 key technical terms used in the text.
- Format: ** Term **: Definition.

## 4. INTEGRITY GRID
    - ** Questions Answered:** What is proven ?
- ** Unanswered Questions:** What is vague or missing ?
- ** Implementation Difficulty:** Easy, Medium, or Hard ?

## 5. FINAL VERDICT
    - Is this actionable ?
        - One sentence summary.

            Rules:
- Be technical but clear.
- Output clean Markdown.
- Use ** Bold ** for emphasis.
`

export async function POST(request: Request) {
    try {
        const { url, content } = await request.json()

        let textToAnalyze = content || ""

        // If URL provided, scrape it
        if (url && !content) {
            try {
                const res = await fetch(url)
                const html = await res.text()
                const $ = cheerio.load(html)
                // Remove junk
                $('script, style, nav, footer, header').remove()
                textToAnalyze = $('body').text().substring(0, 10000) // Limit context
            } catch (e) {
                return NextResponse.json({ error: "Failed to scrape URL" }, { status: 400 })
            }
        }

        if (textToAnalyze.length < 50) return NextResponse.json({ error: "Content too short" }, { status: 400 })

        const explanation = await generateCompletion(FEYNMAN_PROMPT, `Analyze this text: \n\n${textToAnalyze} `)

        return NextResponse.json({ explanation })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
