import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('briefings')
            .select('content, created_at')
            .eq('type', 'daily_learning')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !data) {
            console.log("No briefings found or error:", error)
            return NextResponse.json({
                error: "No daily learning package available yet. The morning cron job might not have run."
            }, { status: 404 })
        }

        return NextResponse.json(data.content)
    } catch (e: any) {
        console.error("Briefing API Error:", e)
        return NextResponse.json({ error: "Failed to fetch briefing" }, { status: 500 })
    }
}
