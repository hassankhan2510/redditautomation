"use client"

import { useEffect, useState } from "react"
import { Subreddit } from "@/types"
import { SubredditForm } from "@/components/subreddit-form"

export default function SubredditsPage() {
    const [subreddits, setSubreddits] = useState<Subreddit[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const fetchSubreddits = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/subreddits")
            if (res.ok) {
                const data = await res.json()
                setSubreddits(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubreddits()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Subreddit Profiles</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showForm ? "Cancel" : "Add New Profile"}
                </button>
            </div>

            {showForm && (
                <div className="mb-8">
                    <SubredditForm onSuccess={() => {
                        setShowForm(false)
                        fetchSubreddits()
                    }} />
                </div>
            )}

            {loading ? (
                <p>Loading profiles...</p>
            ) : subreddits.length === 0 ? (
                <p className="text-muted-foreground">No profiles found. Add one to get started.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subreddits.map(sub => (
                        <div key={sub.id} className="border p-4 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{sub.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded bg-zinc-100 ${sub.links_allowed ? 'text-green-600' : 'text-red-500'}`}>
                                    {sub.links_allowed ? 'Links OK' : 'No Links'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{sub.audience_type} • {sub.tone}</p>

                            <div className="text-xs text-gray-500 space-y-1">
                                <p><strong>Effect:</strong> {sub.self_promo_level} tolerance</p>
                                <p><strong>Flair:</strong> {sub.required_flair || "None"}</p>
                                {sub.banned_phrases && sub.banned_phrases.length > 0 && (
                                    <p className="truncate"><strong>Ban:</strong> {sub.banned_phrases.join(", ")}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
