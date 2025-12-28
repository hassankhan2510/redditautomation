import Link from 'next/link'
import { ModeToggle } from "@/components/mode-toggle"

import { Rocket } from "lucide-react"

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-16 items-center px-4 container mx-auto">
                <Link href="/" className="font-bold text-xl mr-8 flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Rocket size={20} />
                    </div>
                    <span>SoloScale</span>
                </Link>
                <div className="flex items-center space-x-6 text-sm font-medium flex-1">
                    <Link href="/ideas" className="transition-colors hover:text-foreground/80">
                        Post Ideas
                    </Link>
                    <Link href="/subreddits" className="transition-colors hover:text-foreground/80">
                        Subreddits
                    </Link>
                    <Link href="/drafts" className="transition-colors hover:text-foreground/80">
                        Drafts
                    </Link>
                    <Link href="/history" className="transition-colors hover:text-foreground/80">
                        History
                    </Link>
                    <Link href="/scout" className="transition-colors hover:text-teal-500 font-bold">
                        Scout
                    </Link>
                    <Link href="/convert" className="transition-colors hover:text-purple-500 font-bold">
                        Convert
                    </Link>
                    <Link href="/remix" className="transition-colors hover:text-pink-500 font-bold">
                        Remix
                    </Link>
                    <Link href="/timeline" className="transition-colors hover:text-foreground/80">
                        Timeline
                    </Link>
                    <Link href="/repurpose" className="transition-colors hover:text-violet-500 font-bold">
                        Repurpose
                    </Link>
                    <Link href="/reply" className="transition-colors hover:text-green-500 font-bold">
                        Reply Engine
                    </Link>
                    <Link href="/carousel" className="transition-colors hover:text-orange-500 font-bold">
                        Carousel
                    </Link>
                    <Link href="/chart" className="transition-colors hover:text-indigo-500 font-bold">
                        Chart
                    </Link>
                    <Link href="/x" className="transition-colors hover:text-blue-500 font-bold">
                        X Content
                    </Link>
                </div>
                <ModeToggle />
            </div>
        </nav>
    )
}
