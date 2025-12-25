import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { PostIdea } from '@/types'

export async function GET() {
    const { data, error } = await supabase
        .from('post_ideas')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    try {
        const body: Partial<PostIdea> = await request.json()

        if (!body.title || !body.core_idea) {
            return NextResponse.json({ error: 'Title and Core Idea are required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('post_ideas')
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
