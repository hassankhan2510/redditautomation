"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Download, BarChart3, Loader2 } from "lucide-react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
)

export default function ChartPage() {
    const [prompt, setPrompt] = useState("")
    const [chartData, setChartData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const chartRef = useRef<any>(null)

    const handleGenerate = async () => {
        if (!prompt) return
        setLoading(true)
        setChartData(null)

        try {
            const res = await fetch('/api/chart-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt })
            })

            const data = await res.json()
            if (data.chartData) {
                // Add styling to datasets
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                data.chartData.data.datasets = data.chartData.data.datasets.map((ds: any, i: number) => ({
                    ...ds,
                    backgroundColor: data.chartData.type === 'doughnut' ? colors : colors[i % colors.length],
                    borderColor: data.chartData.type === 'line' ? colors[i % colors.length] : undefined,
                    borderWidth: 1
                }))
                setChartData(data.chartData)
            }
        } catch (e) {
            alert("Failed to generate chart")
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (!chartRef.current) return
        const link = document.createElement('a')
        link.download = 'chart.png'
        link.href = chartRef.current.toBase64Image()
        link.click()
    }

    // Chart Components Mapping
    const renderChart = () => {
        if (!chartData) return null

        const options = {
            responsive: true,
            plugins: {
                legend: { position: 'top' as const },
                title: { display: true, text: chartData.title },
            },
        }

        if (chartData.type === 'bar') return <Bar ref={chartRef} data={chartData.data} options={options} />
        if (chartData.type === 'line') return <Line ref={chartRef} data={chartData.data} options={options} />
        if (chartData.type === 'doughnut') return <Doughnut ref={chartRef} data={chartData.data} options={options} />
        return <Bar ref={chartRef} data={chartData.data} options={options} />
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl" suppressHydrationWarning>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="text-blue-500" />
                    AI Chart Studio
                </h1>
                <p className="text-muted-foreground">Describe data &rarr; Get a professional chart.</p>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm mb-6">
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-background border rounded-lg px-4 py-3"
                        placeholder="e.g. 'YouTube growth 2020 to 2024: 1m, 2.5m, 5m, 12m'"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold flex items-center gap-2 transition"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                        Generate
                    </button>
                </div>
            </div>

            {chartData && (
                <div className="bg-white p-8 rounded-xl shadow-lg border relative">
                    <button
                        onClick={handleDownload}
                        className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                        title="Download PNG"
                    >
                        <Download size={20} />
                    </button>
                    <div className="h-[400px] flex items-center justify-center">
                        {renderChart()}
                    </div>
                </div>
            )}
        </div>
    )
}
