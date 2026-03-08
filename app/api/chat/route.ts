import { NextResponse } from 'next/server';
import { generateCompletion } from '@/lib/llm';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { articleContent, previousExplanation, question, chatHistory = [] } = await request.json();

        if (!question) {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }

        let conversation = "";
        for (const msg of chatHistory.slice(-4)) { // keep last 4 for context window
            conversation += `\n${msg.role}: ${msg.content}`;
        }

        const systemPrompt = `You are the ultimate Polymath and Professor. The user is reading an analysis of a deep topic or book. 
        Answer their follow-up questions from First Principles. Be exceptionally clear, concise, and intellectually rigorous. Focus on mental models. If you don't know, say so.`;

        const userPrompt = `
        Context Material/Concept:
        ${articleContent || "A previously explained topic. See context below."}
        
        Previous Explanation Context:
        ${previousExplanation}
        
        Recent Conversation:
        ${conversation}
        
        New Question:
        ${question}
        `;

        const answer = await generateCompletion(systemPrompt, userPrompt);

        return NextResponse.json({ answer });

    } catch (e: any) {
        console.error("Chat API Error:", e);
        return NextResponse.json({ error: "Failed to chat" }, { status: 500 });
    }
}
