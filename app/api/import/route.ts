import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(request: Request) {
    try {
        // Fetch from the public URL relative to the request logic or just hardcoded for simplicity in Vercel
        // In Vercel, we can read process.cwd() or just fetch the file if it's in public
        // Simplest: use URL constructor with req.url to get base
        const { protocol, host } = new URL(request.url)
        const jsonUrl = `${protocol}//${host}/subreddits.json`

        const res = await fetch(jsonUrl)
        if (!res.ok) throw new Error('Failed to fetch subreddits.json ' + res.statusText)

        const subreddits = await res.json()
        const results = []

        for (const sub of subreddits) {
            const dbEntry = {
                name: sub.name,
                audience_type: sub.audience,
                tone: `${sub.theme}. Style: ${sub.post_style}`,
                links_allowed: sub.links_allowed,
                self_promo_level: sub.self_promo_level,
                banned_phrases: sub.banned_phrases,
                preferred_length: 'medium',
                required_flair: 'none',
                ending_style: 'open'
            }

            const { error } = await supabase
                .from('subreddits')
                .upsert(dbEntry, { onConflict: 'name' })

            if (error) {
                console.error(`Error inserting ${sub.name}:`, error)
                results.push({ name: sub.name, status: 'error', error: error.message })
            } else {
                results.push({ name: sub.name, status: 'success' })
            }
        }

        return NextResponse.json({
            success: true,
            total: subreddits.length,
            results
        })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
