import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import * as cheerio from 'cheerio'

const FEYNMAN_PROMPT = `You are "The Bridge".
Your job is to translate complex texts into simple English, then connect them to the technical terms.

Goal: Infinite Clarity. Zero Jargon (at first).

Process:

## 1. THE SIMPLE EXPLANATION (ELI5)
- Summarize the *entire* text in 3 paragraphs using 5th-grade English.
- Use NO technical words here.
- Focus on the "Story": What problem are they solving? How? Why?

## 2. THE TECHNICAL BRIDGE (Dictionary)
- Now, introduce the technical words you avoided in Step 1.
- Format:
  - **Simple Concept:** "The computer guesses the next word."
  - **Technical Term:** "Autoregressive LLM."
  - **Why it matters:** Explain the nuance.

## 3. REAL WORLD LOGIC & EXAMPLES
- Give 2 concrete, real-life analogies.
- "This is exactly like when..."
- Explain how this applies to a real business or system existing today.

## 4. THE INTEGRITY GRID (The Truth)
Answer these 3 specific lists:
- **Questions Answered:** What specific problems did this text solve?
- **Unanswered Questions:** What did they ignore or fail to prove?
- **Future Questions:** What should we ask next? (The 5-Year horizon).

## 5. FINAL VERDICT
- One sentence summary of the value.
- Is this a Breakthrough, an Incremental Step, or Hype?

Rules:
- If use a fancy word, you MUST define it immediately.
- Be brutally honest in section 4.
- Output Markdown.
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

        const explanation = await generateCompletion(FEYNMAN_PROMPT, `Analyze this text:\n\n${textToAnalyze}`)

        return NextResponse.json({ explanation })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
