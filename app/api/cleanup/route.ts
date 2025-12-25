import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST() {
    try {
        // Delete history older than 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        const { error: historyError } = await supabase
            .from('post_history')
            .delete()
            .lt('posted_at', ninetyDaysAgo)

        if (historyError) throw historyError

        // Delete rejected drafts older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { error: draftsError } = await supabase
            .from('post_drafts')
            .delete()
            .eq('status', 'rejected')
            .lt('created_at', thirtyDaysAgo)

        if (draftsError) throw draftsError

        return NextResponse.json({ success: true, message: "Cleanup complete" })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
