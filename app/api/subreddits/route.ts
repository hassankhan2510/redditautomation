import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { Subreddit } from '@/types'

export async function GET() {
    const { data, error } = await supabase
        .from('subreddits')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    try {
        const body: Partial<Subreddit> = await request.json()

        // Basic validation
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('subreddits')
            .insert([body])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
