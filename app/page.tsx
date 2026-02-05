"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Search, Sparkles, Zap, Brain, Clock, MessageSquare, Star, Coffee } from "lucide-react"

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen gradient-bg">

      {/* HERO SECTION */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/20 rounded-full blur-[100px] float" />
        <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />

        <div className="container px-4 md:px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/30 px-4 py-2 text-sm mb-8 glass-panel glow-border">
            <span className="relative flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-muted-foreground">AI-Powered Research Assistant</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            <span className="gradient-text-animated">Research</span>
            <br />
            <span className="text-foreground">Reimagined</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-[700px] mx-auto mb-12 leading-relaxed">
            Turn complex papers, news, and articles into
            <span className="text-foreground font-semibold"> crystal-clear insights</span> with
            <span className="text-primary font-semibold"> one click</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/feed"
              className="glow-button inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-base font-bold text-primary-foreground transition-all"
            >
              Start Researching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/briefing"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-background/50 backdrop-blur-sm border border-border hover:border-blue-500/50 hover:bg-blue-500/10 px-8 text-base font-medium transition-all gap-2 group"
            >
              <Coffee className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
              Smart Briefing
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 text-sm">
            <div className="text-center">
              <div className="text-3xl font-black text-foreground">50+</div>
              <div className="text-muted-foreground">News Sources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-foreground">9</div>
              <div className="text-muted-foreground">AI Experts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-foreground">∞</div>
              <div className="text-muted-foreground">Knowledge</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              How <span className="gradient-text">DeepResearch</span> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Three steps to transform information overload into actionable knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* CARD 1 - Curated Feeds */}
            <div className="glass-card card-3d p-8 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors" />

              <div className="relative">
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 w-fit border border-amber-500/20">
                  <Search size={32} className="text-amber-500" />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3">Step 1</div>
                <h3 className="text-2xl font-bold mb-4">Curated Feeds</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access news, papers, and insights from 50+ trusted sources. Tech, science, business, crypto, and more — all in one place.
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  <span className="px-2 py-1 text-[10px] rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">ArXiv</span>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">TechCrunch</span>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">HN</span>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">+47</span>
                </div>
              </div>
            </div>

            {/* CARD 2 - Deep Explain */}
            <div className="glass-card card-3d p-8 group md:-mt-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />

              <div className="relative">
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/10 w-fit border border-primary/20">
                  <Brain size={32} className="text-primary" />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Step 2</div>
                <h3 className="text-2xl font-bold mb-4">Deep Explain</h3>
                <p className="text-muted-foreground leading-relaxed">
                  One-click AI analysis with domain-specific experts. Science, business, history, philosophy — each with a specialized AI persona.
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  <span className="px-2 py-1 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20">🧬 Science</span>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20">📈 Stocks</span>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20">🏛️ History</span>
                </div>
              </div>
            </div>

            {/* CARD 3 - Chat & Save */}
            <div className="glass-card card-3d p-8 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />

              <div className="relative">
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 w-fit border border-emerald-500/20">
                  <MessageSquare size={32} className="text-emerald-500" />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3">Step 3</div>
                <h3 className="text-2xl font-bold mb-4">Chat & Save</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ask follow-up questions. Dig deeper. Save insights to your personal knowledge library for later reference.
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  <span className="px-2 py-1 text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">💬 Chat</span>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">📚 Library</span>
                  <span className="px-2 py-1 text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">📥 Queue</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="container px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              9 Expert <span className="gradient-text">AI Personas</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Each category has a specialized AI with domain expertise.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              { emoji: "🧬", name: "Science", desc: "Feynman meets Sagan" },
              { emoji: "📰", name: "News", desc: "Geopolitical analyst" },
              { emoji: "💼", name: "Business", desc: "Buffett + Paul Graham" },
              { emoji: "🏛️", name: "History", desc: "Time-traveling historian" },
              { emoji: "⚙️", name: "Engineering", desc: "Principal engineer" },
              { emoji: "📈", name: "Stocks", desc: "Hedge fund manager" },
              { emoji: "🪙", name: "Crypto", desc: "Cycle survivor" },
              { emoji: "⚖️", name: "Politics", desc: "Non-partisan analyst" },
              { emoji: "🦉", name: "Philosophy", desc: "Modern Socrates" },
            ].map((cat, i) => (
              <div
                key={i}
                className="glass-card p-4 text-center group hover:border-primary/30 cursor-pointer"
              >
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{cat.emoji}</div>
                <div className="font-bold text-sm">{cat.name}</div>
                <div className="text-[10px] text-muted-foreground">{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />

        <div className="container px-4 md:px-6 relative text-center">
          <div className="glass-card max-w-3xl mx-auto p-12 md:p-16">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                <Zap size={40} className="text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Ready to <span className="gradient-text">Research Smarter</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-[500px] mx-auto">
                Stop drowning in information. Start understanding it.
              </p>
            </div>

            <Link
              href="/feed"
              className="glow-button inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-12 text-base font-bold text-primary-foreground"
            >
              Open Research Feed
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <p className="text-xs text-muted-foreground mt-6">
              No sign-up required • Free to use • Open source
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
