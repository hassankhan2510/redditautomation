"use client"

import { useEffect, useState } from "react"
import { Subreddit } from "@/types"
import { SubredditForm } from "@/components/subreddit-form"
import { Upload } from "lucide-react"

export default function SubredditsPage() {
    const [subreddits, setSubreddits] = useState<Subreddit[]>([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)

    const fetchSubreddits = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/subreddits')
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

    const runImport = async () => {
        setImporting(true)
        try {
            const res = await fetch('/api/import')
            if (res.ok) {
                const data = await res.json()
                if (data.failed > 0) {
                    console.error('Import failures:', data.results.filter((r: any) => r.status === 'error'))
                    alert(`Imported ${data.imported} successfully. Failed: ${data.failed}. Check console for details.\n\nLikely cause: Missing UNIQUE constraint on 'name'. Run this SQL:\nALTER TABLE subreddits ADD CONSTRAINT subreddits_name_key UNIQUE (name);`)
                } else {
                    alert(`Success! Imported ${data.imported} subreddits.`)
                }
                fetchSubreddits()
            } else {
                alert("Import failed")
            }
        } catch (e) {
            alert("Error importing")
        } finally {
            setImporting(false)
        }
    }

    useEffect(() => {
        fetchSubreddits()
    }, [])

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Subreddit Profiles</h1>
                <div className="flex gap-2">
                    <button
                        onClick={runImport}
                        disabled={importing}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 flex items-center gap-2"
                    >
                        <Upload size={16} />
                        {importing ? "Importing..." : "Import Defaults"}
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'Add New Profile'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="mb-8 p-4 border rounded-lg bg-card">
                    <SubredditForm onSuccess={() => {
                        setShowForm(false)
                        fetchSubreddits()
                    }} />
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : subreddits.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground mb-4">No profiles found. Import defaults or add one manually.</p>
                    <button
                        onClick={runImport}
                        disabled={importing}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                        Import Default Subreddits Now
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subreddits.map(sub => (
                        <div key={sub.id} className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <a
                                    href={`https://www.reddit.com/r/${sub.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-lg hover:underline decoration-blue-500 hover:text-blue-600 flex items-center gap-1"
                                >
                                    r/{sub.name} <span className="text-xs text-muted-foreground font-normal">↗</span>
                                </a>
                                <span className={`text-xs px-2 py-1 rounded bg-zinc-100 ${sub.links_allowed ? 'text-green-600' : 'text-red-500'}`}>
                                    {sub.links_allowed ? 'Links OK' : 'No Links'}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><span className="font-semibold">Audience:</span> {sub.audience_type}</p>
                                <p><span className="font-semibold">Tone:</span> {sub.tone}</p>
                                <p><span className="font-semibold">Links:</span> {sub.links_allowed ? '✅ Allowed' : '❌ No Links'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
