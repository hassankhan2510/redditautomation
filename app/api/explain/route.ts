import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import * as cheerio from 'cheerio'

const FEYNMAN_PROMPT = `You are a neutral explainer whose only job is understanding, not persuasion.

Assume:
- I struggle with dense language and jargon
- I want maximum clarity, not style
- I want facts, logic, and limits clearly separated
- I do not want opinions mixed with explanations

Your task:
Turn the provided text into complete, simple, and honest understanding.

Follow these steps strictly:

1. PLAIN MEANING FIRST
- Rewrite the entire text in very simple language
- Short sentences
- No fancy words
- Preserve the original meaning
- Do not add opinions

2. WORD & PHRASE DECODE
- List every difficult or loaded word/phrase
- Explain each in the simplest possible way
- If a word is persuasive or emotional, say so

3. SENTENCE-BY-SENTENCE TRUTH
For each sentence:
- What it literally says
- What it really means
- Whether it is a fact, opinion, assumption, or speculation

4. CORE IDEAS
- List the main ideas
- Separate:
  - Facts
  - Claims
  - Interpretations

5. LOGIC CHECK
- Show how the ideas connect
- Point out missing steps or weak reasoning
- Say clearly if something does not logically follow

6. CONTEXT & ASSUMPTIONS
- What background knowledge is assumed
- What viewpoints or biases are present (if any)
- What is not being said

7. REAL-WORLD TRANSLATION
- Explain the ideas using real-life examples
- If technical, explain how it works in practice
- If abstract, relate to human behavior or systems

8. LIMITS, GAPS & QUESTIONS
- What is unclear or unsupported
- What questions remain unanswered
- What future work, research, or clarification is needed
- What could change this conclusion

9. FINAL OUTPUT
- One-sentence takeaway
- Three key points
- One critical question I should now be able to ask

Rules:
- No academic tone
- No persuasion
- No simplification that removes meaning
- If something is uncertain, say “uncertain”
- If something is biased, say “biased”
- If something is unknown, say “unknown”

Output format: Markdown. Use Bold/Italic heavily for readability.
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
