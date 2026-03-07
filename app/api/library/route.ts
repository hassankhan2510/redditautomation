import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('saved_research')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ items: data || [] });

    } catch (e: any) {
        console.error("Library API Error:", e);
        return NextResponse.json({ error: e.message || "Failed to fetch" }, { status: 500 });
    }
}
