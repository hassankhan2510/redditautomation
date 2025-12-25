"use client"

import { useEffect, useState } from "react"

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/history')
            if (res.ok) {
                const data = await res.json()
                setHistory(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const handleCleanup = async () => {
        if (!confirm('This will delete posting history older than 90 days and rejected drafts older than 30 days. Continue?')) return
        setLoading(true)
        try {
            const res = await fetch('/api/cleanup', { method: 'POST' })
            if (res.ok) {
                alert('Cleanup successful')
                fetchHistory()
            } else {
                alert('Cleanup failed')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Posting History</h1>
                <button onClick={handleCleanup} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                    Cleanup Old Data
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : history.length === 0 ? (
                <p>No history yet.</p>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subreddit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post ID</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map((h: any) => (
                                <tr key={h.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(h.posted_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {h.subreddit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {h.reddit_post_id}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
