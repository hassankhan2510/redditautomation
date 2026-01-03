import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text || text.length === 0) {
            return NextResponse.json({ error: 'Text required' }, { status: 400 });
        }

        // Limit text to 200 chars (Google TTS limitation for single request)
        // For video scenes, text is usually short. 
        // If longer, we might need to truncate or split, but let's assume short chunks for now.
        const safeText = text.substring(0, 200);

        const url = googleTTS.getAudioUrl(safeText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        return NextResponse.json({ url });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
