import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const { title, explanation, sourceUrl = "User Custom Topic" } = await request.json();

        if (!explanation || !title) {
            return NextResponse.json({ error: "Title and Explanation required" }, { status: 400 });
        }

        const { error } = await supabase.from('saved_research').insert({
            title: title,
            snippet: explanation,
            link: sourceUrl,
            category: 'library'
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: "Saved to Library" });

    } catch (e: any) {
        console.error("Save API Error:", e);
        return NextResponse.json({ error: e.message || "Failed to save" }, { status: 500 });
    }
}
