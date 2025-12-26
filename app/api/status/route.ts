import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            status: 'error',
            message: 'Missing Environment Variables'
        }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const { count, error } = await supabase
            .from('subreddits')
            .select('*', { count: 'exact', head: true })

        if (error) {
            return NextResponse.json({
                status: 'error',
                message: error.message,
                details: error
            }, { status: 500 })
        }

        return NextResponse.json({
            status: 'healthy',
            rowCount: count,
            message: 'Connected to Supabase successfully'
        })
    } catch (e: any) {
        return NextResponse.json({
            status: 'error',
            message: e.message
        }, { status: 500 })
    }
}
