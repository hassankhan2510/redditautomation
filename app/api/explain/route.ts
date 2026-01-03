import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import * as cheerio from 'cheerio'

const FEYNMAN_PROMPT = `You are an expert teacher, researcher, and curriculum designer.

Your task is to extract 110% understanding from the provided text.
Do NOT summarize lightly. Do NOT skip hard parts.

Audience profile:
- Intelligent but non-academic reader
- Weak with jargon, strong with logic and real-world examples
- Goal: deep understanding, not memorization

Instructions (follow strictly):

1. PURPOSE & CONTEXT
- Explain WHY this text exists
- What problem it is trying to solve
- What question the author is answering
- Historical, scientific, or technical background required BEFORE reading this

2. CONCEPT DECOMPOSITION (ZERO → ADVANCED)
- Break every major idea into atomic concepts
- Define all terminology in plain language
- Explain assumptions the author expects the reader to know
- If math/formulas exist:
    - Explain intuition first
    - Then mechanics
    - Then purpose

3. STEP-BY-STEP LOGIC FLOW
- Walk through the text in order
- For each section:
    - What is being claimed
    - Why it matters
    - How it connects to previous ideas
- Explicitly state hidden reasoning steps

4. ANALOGIES & MENTAL MODELS
- Create real-world analogies for abstract ideas
- Provide at least 2 mental models per major concept
- Use simple metaphors, no academic language

5. EXAMPLES & COUNTER-EXAMPLES
- Give concrete examples
- Show where the idea works
- Show where it breaks or fails
- Explain limitations honestly

6. AUTHOR’S INTENT & BIAS
- What assumptions or worldview does the author have
- What is NOT being said
- What the author takes for granted

7. CONNECTIONS
- Connect this text to:
    - Modern technology / AI / real systems (if applicable)
    - Other theories, disciplines, or historical events
- Explain why this text matters TODAY

8. DEPTH UPGRADE (ADVANCED LAYER)
- Re-explain the same ideas as if teaching a graduate student
- Introduce formal terminology only after intuition
- Explain implications, edge cases, and deeper insights

9. CRITIQUE & REALITY CHECK
- Strengths of the ideas
- Weaknesses or gaps
- What experts debate or disagree on
- Where the work could be wrong, incomplete, or outdated

10. OPEN QUESTIONS & FUTURE WORK (CRITICAL)
- List unanswered questions left by the text
- Identify gaps in data, reasoning, or scope
- What assumptions should be tested next
- What experiments, studies, or extensions logically follow
- What a modern researcher or engineer should work on next
- How this could evolve in the next 5–10 years

11. ACTIONABLE OUTPUT
- What I should now be able to:
    - Understand clearly
    - Explain to others confidently
    - Apply, extend, or critique
- Provide a checklist of concepts I have fully mastered
- Suggest 3–5 next readings or topics to deepen mastery

Rules:
- No fluff
- No motivational talk
- No vague phrases
- If something is unclear in the text, say so explicitly
- If something is complex, slow down instead of skipping

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
