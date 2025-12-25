import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        // Hardcoded path based on user environment
        const filePath = 'd:\\gen ai\\reddit\\subreddits.md'

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found at ' + filePath }, { status: 404 })
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8')
        let data
        try {
            data = JSON.parse(fileContent)
        } catch (e) {
            // If it's wrapped in markdown blocks, try to strip them
            const jsonMatch = fileContent.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('Could not parse JSON')
            }
        }

        const subreddits = data.subreddits
        const results = []

        for (const sub of subreddits) {
            // Map JSON fields to DB Schema
            // JSON: name, audience, theme, links_allowed, self_promo_level, post_style, banned_phrases
            // DB: name, audience_type, tone, links_allowed, self_promo_level, preferred_length, required_flair, banned_phrases, ending_style

            const dbEntry = {
                name: sub.name,
                audience_type: sub.audience,
                // Combine theme and post_style into tone for rich context
                tone: `${sub.theme}. Style: ${sub.post_style}`,
                links_allowed: sub.links_allowed,
                self_promo_level: sub.self_promo_level,
                banned_phrases: sub.banned_phrases,
                // Defaults for missing fields
                preferred_length: 'medium',
                required_flair: 'none',
                ending_style: 'open'
            }

            // Upsert based on name
            const { data: inserted, error } = await supabase
                .from('subreddits')
                .upsert(dbEntry, { onConflict: 'name' })
                .select()

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
