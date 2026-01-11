import Link from 'next/link'
import { Rocket, Github, Twitter } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t py-12 mt-auto">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* BRAND COL */}
                <div className="md:col-span-1 space-y-4">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                            <Rocket size={18} />
                        </div>
                        <span>DeepResearch</span>
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your AI-powered research assistant. Turn complex articles into clear, actionable insights.
                    </p>
                </div>

                {/* PRODUCT COL */}
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/feed" className="hover:text-primary transition">Research Feed</Link></li>
                        <li><span className="text-muted-foreground">Deep Explain AI</span></li>
                        <li><span className="text-muted-foreground">Knowledge Library</span></li>
                    </ul>
                </div>

                {/* CONNECT COL */}
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Connect</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="https://github.com/hassankhan2510" target="_blank" className="hover:text-primary transition flex items-center gap-2">
                                <Github size={14} /> GitHub
                            </a>
                        </li>
                        <li>
                            <a href="https://twitter.com" target="_blank" className="hover:text-primary transition flex items-center gap-2">
                                <Twitter size={14} /> Twitter
                            </a>
                        </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-6">© 2025 DeepResearch</p>
                </div>
            </div>
        </footer>
    )
}
