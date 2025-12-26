import Link from "next/link"
import { ArrowRight, MessageSquare, Twitter, Layers, BarChart } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-background to-secondary/20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600" suppressHydrationWarning>
          Intelligent Content Engine
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10" suppressHydrationWarning>
          Scale your personal brand on Reddit and X without the burnout.
          Generate, Plan, and Post from a single command center.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/ideas" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2">
            Start Creating <ArrowRight size={20} />
          </Link>
          <Link href="/x" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-lg transition-all flex items-center gap-2 border border-zinc-700">
            X / Twitter Tools
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12" suppressHydrationWarning>Production-Ready Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Reddit Card */}
          <div className="p-8 rounded-2xl bg-card border hover:border-orange-500/50 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6 text-orange-600">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-500 transition-colors">Reddit Planner</h3>
            <p className="text-muted-foreground mb-6" suppressHydrationWarning>
              Community-aware drafting. Select specific subreddits, customize tones, and manage your posting schedule manually.
            </p>
            <Link href="/ideas" className="text-sm font-bold text-orange-600 hover:underline">
              Go to Planner &rarr;
            </Link>
          </div>

          {/* X Card */}
          <div className="p-8 rounded-2xl bg-card border hover:border-blue-500/50 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6 text-blue-600">
              <Twitter size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors">X / Twitter Viral</h3>
            <p className="text-muted-foreground mb-6" suppressHydrationWarning>
              Turn news, random thoughts, or trends into viral threads. Optimized for engagement and growth.
            </p>
            <Link href="/x" className="text-sm font-bold text-blue-600 hover:underline">
              Open Generator &rarr;
            </Link>
          </div>

          {/* Analytics Card */}
          <div className="p-8 rounded-2xl bg-card border hover:border-purple-500/50 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6 text-purple-600">
              <BarChart size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-500 transition-colors">History & Drafts</h3>
            <p className="text-muted-foreground mb-6" suppressHydrationWarning>
              Track your approved drafts, view history, and keep a clear timeline of your content distribution.
            </p>
            <Link href="/history" className="text-sm font-bold text-purple-600 hover:underline">
              View History &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t">
        <p suppressHydrationWarning>&copy; 2024 Reddit Poster SaaS. Built for scale.</p>
      </footer>
    </div>
  )
}
