import { NextResponse } from 'next/server';
import { generateCompletion } from '@/lib/llm';
import { TOPIC_PROMPT, PAPER_PROMPT } from '@/lib/prompts';
import { extractTextFromHtml } from '@/lib/research';

export async function POST(request: Request) {
    try {
        const { input } = await request.json();

        if (!input || typeof input !== 'string') {
            return NextResponse.json({ error: "Input is required (URL or Topic)" }, { status: 400 });
        }

        const isUrl = input.startsWith('http://') || input.startsWith('https://');

        let textToAnalyze = input;
        let systemPrompt = TOPIC_PROMPT; // Default to Topic for pure text

        if (isUrl) {
            systemPrompt = PAPER_PROMPT; // Assume URL is an article/paper that needs paper-style breakdown
            try {
                const res = await fetch(input, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(15000)
                });
                if (res.ok) {
                    const html = await res.text();
                    textToAnalyze = extractTextFromHtml(html);
                } else {
                    return NextResponse.json({ error: "Failed to fetch content from URL." }, { status: 400 });
                }
            } catch (error) {
                return NextResponse.json({ error: "Could not reach the provided URL." }, { status: 400 });
            }
        }

        const userPrompt = isUrl
            ? `Please analyze this article/paper using first principles. Content:\n\n${textToAnalyze}`
            : `Please explain this complex topic from first principles:\n\n${textToAnalyze}`;

        const explanation = await generateCompletion(systemPrompt, userPrompt);

        return NextResponse.json({ explanation });

    } catch (e: any) {
        console.error("Explain API Error:", e);
        return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
    }
}
