import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import * as cheerio from 'cheerio'
import { generateCompletion } from '@/lib/llm'

const parser = new Parser()

export async function POST(request: Request) {
    try {
        const { skill, minBudget = 0 } = await request.json()

        if (!skill) return NextResponse.json({ error: 'Skill required' }, { status: 400 })

        // 1. Search Reddit RSS for specific hiring keywords
        // We look in r/forhire, r/hiring, r/jobbit
        const subreddits = ['forhire', 'hiring']
        const rssUrl = `https://www.reddit.com/r/${subreddits.join('+')}/search.rss?q=hiring "${skill}"&sort=new&restrict_sr=1`

        const feed = await parser.parseURL(rssUrl)

        // 2. Parse & Filter Leads
        const candidates = feed.items.slice(0, 10).map(item => {
            const $ = cheerio.load(item.content || item.contentSnippet || "")
            const text = $.text().replace(/\s+/g, ' ').trim()
            return {
                title: item.title || "",
                link: item.link,
                content: text.substring(0, 1000), // Limit for LLM
                date: item.pubDate
            }
        })

        // 3. AI Analysis (Filter & Draft)
        // We process in batch to save time, or just the top 5
        const leads = []

        for (const candidate of candidates) {
            // Skip "Hiring" posts that are actually self-promotion "For Hire" (Reddit is messy)
            if (candidate.title.toLowerCase().includes('[for hire]')) continue;

            const systemPrompt = `You are an Expert Lead Qualifier.
Your Job: Analyze this job post and extract structured data.

Output JSON only:
{
  "isRelevant": boolean, // Is this ACTUALLY a job offer for "${skill}"?
  "budget": string, // Extract budget if present, else "Unknown"
  "qualityScore": number, // 0-100. Based on clarity, budget, and seriousness.
  "reason": "Short explanation",
  "proposal": "Draft a short, professional 2-sentence intro pitch."
}`
            const userPrompt = `Job Title: ${candidate.title}\nContent: ${candidate.content}`

            try {
                const text = await generateCompletion(systemPrompt, userPrompt)
                const analysis = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim())

                if (analysis.isRelevant && analysis.qualityScore > 40) {
                    leads.push({
                        ...candidate,
                        analysis
                    })
                }
            } catch (e) {
                console.error("Failed to analyze lead", e)
            }
        }

        return NextResponse.json({ leads })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
