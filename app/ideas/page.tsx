"use client"

import { useEffect, useState } from "react"
import { IdeaForm } from "@/components/idea-form"
import { PostIdea } from "@/types"

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<PostIdea[]>([])
    const [loading, setLoading] = useState(true)
    // Generation state
    const [generatingId, setGeneratingId] = useState<string | null>(null)
    const [genProgress, setGenProgress] = useState<string>("")
    const [genStats, setGenStats] = useState<{ current: number, total: number } | null>(null)

    const fetchIdeas = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ideas')
            if (res.ok) {
                const data = await res.json()
                setIdeas(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIdeas()
    }, [])

    const handleCreate = async (data: Partial<PostIdea>) => {
        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                fetchIdeas()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleSmartGenerate = async (ideaId: string) => {
        setGeneratingId(ideaId)
        setGenProgress("Initializing smart generation...")

        try {
            // 1. Get all subreddits first
            const subRes = await fetch('/api/subreddits')
            if (!subRes.ok) throw new Error("Failed to fetch subreddits")
            const subreddits = await subRes.json()

            if (subreddits.length === 0) {
                alert("No subreddits configured!")
                setGeneratingId(null)
                return
            }

            setGenStats({ current: 0, total: subreddits.length })

            // 2. Loop and generate sequentially with delay
            let successCount = 0

            for (let i = 0; i < subreddits.length; i++) {
                const sub = subreddits[i]
                setGenStats({ current: i + 1, total: subreddits.length })
                setGenProgress(`Generating draft for r/${sub.name}...`)

                try {
                    const genRes = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ideaId,
                            subredditId: sub.id
                        })
                    })

                    if (genRes.ok) {
                        successCount++
                    } else {
                        // If rate limited (429), wait longer?
                        if (genRes.status === 429) {
                            setGenProgress(`Rate limit hit on r/${sub.name}. Pausing for 10s...`)
                            await new Promise(r => setTimeout(r, 10000))
                            // Retry once? simple logic for now: skip and log
                            console.warn(`Rate limited for r/${sub.name}`)
                        }
                    }
                } catch (e) {
                    console.error(`Error generating for ${sub.name}`, e)
                }

                // 3. Intelligent Delay (Interval)
                // Wait 5 seconds between calls to be safe with free tier LLMs
                if (i < subreddits.length - 1) {
                    setGenProgress(`Waiting 5s before next subreddit...`)
                    await new Promise(r => setTimeout(r, 5000))
                }
            }

            alert(`Generation complete! Drafts created for ${successCount}/${subreddits.length} subreddits.`)

        } catch (e: any) {
            alert("Generation failed: " + e.message)
        } finally {
            setGeneratingId(null)
            setGenProgress("")
            setGenStats(null)
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Post Ideas</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">New Idea</h2>
                        <IdeaForm onSubmit={handleCreate} />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : ideas.length === 0 ? (
                        <p className="text-muted-foreground">No ideas yet.</p>
                    ) : (
                        ideas.map(idea => (
                            <div key={idea.id} className="bg-card border rounded-lg p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{idea.title}</h3>
                                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                                        Depth: {idea.technical_depth}/5
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{idea.core_idea}</p>

                                {generatingId === idea.id ? (
                                    <div className="space-y-2 bg-secondary/50 p-3 rounded">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>{genProgress}</span>
                                            {genStats && <span>{genStats.current}/{genStats.total}</span>}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: genStats ? `${(genStats.current / genStats.total) * 100}%` : '0%' }}>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSmartGenerate(idea.id)}
                                        disabled={generatingId !== null}
                                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        Smart Generate Drafts
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
