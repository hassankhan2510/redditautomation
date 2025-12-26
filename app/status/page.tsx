"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function StatusPage() {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/status')
            .then(res => res.json())
            .then(data => setStatus(data))
            .catch(err => setStatus({ status: 'error', message: 'Failed to fetch status API' }))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">System Status</h1>
                <p className="text-muted-foreground">Checking connection to Supabase Database</p>
            </div>

            <div className="p-8 border rounded-xl bg-card shadow-lg min-w-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                        <p>Running diagnostics...</p>
                    </div>
                ) : status?.status === 'healthy' ? (
                    <div className="flex flex-col items-center gap-4 text-green-500">
                        <CheckCircle2 className="h-16 w-16" />
                        <div className="text-center text-foreground">
                            <h2 className="text-xl font-bold mb-2">System Healthy</h2>
                            <p className="text-green-600 font-mono text-sm bg-green-500/10 px-3 py-1 rounded">
                                {status.message}
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Database accessible. Found {status.rowCount} subreddits.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-red-500">
                        <XCircle className="h-16 w-16" />
                        <div className="text-center text-foreground">
                            <h2 className="text-xl font-bold mb-2">Connection Failed</h2>
                            <div className="text-left bg-red-500/10 p-4 rounded-lg overflow-auto max-w-sm">
                                <p className="font-mono text-xs text-red-600 break-all">
                                    Error: {status?.message || 'Unknown error'}
                                </p>
                                {status?.details && (
                                    <pre className="mt-2 text-[10px] text-red-800">
                                        {JSON.stringify(status.details, null, 2)}
                                    </pre>
                                )}
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Check your .env.local keys and RLS policies.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center text-sm text-muted-foreground max-w-md">
                <p>If you see an error about <strong>RLS (Row Level Security)</strong>, run this SQL in your Supabase SQL Editor:</p>
                <pre className="bg-muted p-2 rounded mt-2 text-xs select-all text-left">
                    alter table subreddits enable row level security;
                    create policy "Enable read access for all users" on subreddits for select using (true);
                    create policy "Enable insert for all users" on subreddits for insert with check (true);
                    create policy "Enable update for all users" on subreddits for update using (true);
                </pre>
            </div>
        </div>
    )
}
