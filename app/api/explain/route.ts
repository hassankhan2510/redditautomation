
import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import * as cheerio from 'cheerio'

// === SYSTEM PROMPTS ===

const SCIENCE_PROMPT = `You are a Senior Research Analyst.
Goal: Infinite Clarity + Technical Depth.
Process:
## 1. EXECUTIVE SUMMARY (The "What" & "Why")
- Paragraph 1: What specific problem is this solving?
- Paragraph 2: What is the core innovation/solution?
- Paragraph 3: Why does this matter right now?

## 2. THE MECHANISM (How it works - Step-by-Step)
- **CRITICAL SECTION**: Explain the *technical procedure* or *algorithm*.
- Use a Numbered List (1, 2, 3...) to show the flow of data or logic.
- Capture the "Secret Sauce".

## 3. TECHNICAL CONCEPTS (Dictionary)
- Define 3-5 key technical terms used in the text.
- Format: **Term**: Definition.

## 4. INTEGRITY GRID
- **Questions Answered**: What is proven?
- **Unanswered Questions**: What is vague or missing?
- **Implementation Difficulty**: Easy, Medium, or Hard?

## 5. FINAL VERDICT
- Is this actionable? One sentence summary.
`

const NEWS_PROMPT = `You are an Investigative Journalist & Fact Checker.
Goal: Extract Truth, Identify Bias, and Provide Context.
Process:
## 1. THE LEAD (TLDR)
- Summary: Who, What, When, Where, Why.
- Impact: Why is this headline news?

## 2. REALITY CHECK
- **Bias Detector**: Is the tone neutral, sensationalist, or biased?
- **Fact vs Opinion**: Separation of reported facts and author's opinion.
- **Context**: What happened *before* this to cause it?

## 3. KEY PLAYERS
- Who are the main entities involved?
- What are their motives?

## 4. THE MESSAGE
- What is the underlying narrative being pushed?

## 5. VERDICT
- **Credibility Score**: High/Medium/Low.
`

const PHILOSOPHY_PROMPT = `You are a Dialectic Philosopher.
Goal: Analyze arguments, challenge assumptions, and explore implications.
Process:
## 1. THE THESIS
- What is the central claim or argument?
- What are the core premises?

## 2. THE ANTITHESIS (Counter-Argument)
- What are the strongest valid criticisms of this view?
- Historical Context: Has this been debated before? (e.g., Stoicism vs Epicureanism).

## 3. SYNTHESIS (The Insight)
- Is there a middle ground or a higher truth?
- Practical Application: How does this apply to modern life/business?

## 4. KEY TERMS
- Define philosophical jargon used.

## 5. REFLECTION
- A thought-provoking question for the reader.
`

const BUSINESS_PROMPT = `You are a Wall Street Analyst.
Goal: Assess Value, Risk, and Opportunity.
Process:
## 1. MARKET SIGNAL
- Bullish or Bearish?
- What is the immediate impact on the market/industry?

## 2. THE NUMBERS
- Extract any financial data, revenue, growth rates, etc.
- If no numbers, flag it as "Speculative".

## 3. COMPETITIVE LANDSCAPE
- Who wins? Who loses? (Competitors).
- Moat Analysis: Is this a sustainable advantage?

## 4. ACTION PLAN
- **Opportunity**: How can an entrepreneur/investor capitalize on this?
- **Risk factor**: What could go wrong?

## 5. BOTTOM LINE
- Buy, Sell, or Hold? (Metaphorically).
`

function getPrompt(category: string) {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('scien') || cat.includes('tech') || cat.includes('eng') || cat.includes('ai') || cat.includes('code')) return SCIENCE_PROMPT
    if (cat.includes('news') || cat.includes('poli') || cat.includes('pk')) return NEWS_PROMPT
    if (cat.includes('phil') || cat.includes('hist')) return PHILOSOPHY_PROMPT
    if (cat.includes('bus') || cat.includes('grow') || cat.includes('stock') || cat.includes('launch') || cat.includes('cryp')) return BUSINESS_PROMPT
    return SCIENCE_PROMPT // Default
}

export async function POST(request: Request) {
    try {
        const { url, content, category } = await request.json()

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

        const systemPrompt = getPrompt(category)
        const explanation = await generateCompletion(systemPrompt, `Analyze this text: \n\n${textToAnalyze} `)

        return NextResponse.json({ explanation })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
