import Link from 'next/link'
import { ModeToggle } from "@/components/mode-toggle"
import { Rocket, ChevronDown, PenTool, BarChart, Settings, Users } from "lucide-react"

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">

                {/* BRAND */}
                <Link href="/" className="font-bold text-xl flex items-center gap-2 mr-8">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Rocket size={20} />
                    </div>
                    <span>SoloScale</span>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center space-x-6 text-sm font-medium">

                    {/* TOOLS DROPDOWN */}
                    <div className="relative group z-50">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors py-4">
                            <PenTool size={16} /> Creation Suite <ChevronDown size={14} />
                        </button>
                        <div className="absolute top-full left-0 w-56 bg-card border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 p-2 z-50">
                            <DropdownLink href="/studio" label="Universal Studio" />
                            <div className="h-px bg-border my-1" />
                            <span className="text-[10px] text-muted-foreground px-3 uppercase tracking-wider font-bold">Tools</span>
                            <DropdownLink href="/ideas" label="Post Ideas" />
                            <DropdownLink href="/remix" label="Remix Vault" />
                        </div>
                    </div>

                    {/* GROWTH DROPDOWN */}
                    <div className="relative group z-50">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors py-4">
                            <BarChart size={16} /> Growth <ChevronDown size={14} />
                        </button>
                        <div className="absolute top-full left-0 w-48 bg-card border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 p-2 z-50">
                            <DropdownLink href="/radar" label="Opportunity Radar" />
                            <DropdownLink href="/feed" label="Deep Feed (Intel)" />
                            <div className="h-px bg-border my-1" />
                            <DropdownLink href="/history" label="Post History" />
                            <DropdownLink href="/timeline" label="Timeline" />
                        </div>
                    </div>

                    {/* MANAGE DROPDOWN */}
                    <div className="relative group z-50">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors py-4">
                            <Settings size={16} /> Manage <ChevronDown size={14} />
                        </button>
                        <div className="absolute top-full left-0 w-48 bg-card border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 p-2 z-50">
                            <DropdownLink href="/subreddits" label="Subreddits" />
                            <DropdownLink href="/drafts" label="Drafts" />
                        </div>
                    </div>

                    <Link href="/about" className="hover:text-primary transition-colors flex items-center gap-1">
                        <Users size={16} /> About
                    </Link>
                    <Link href="/contact" className="hover:text-primary transition-colors">
                        Contact
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <ModeToggle />
                </div>
            </div>
        </nav>
    )
}

function DropdownLink({ href, label }: { href: string, label: string }) {
    return (
        <Link href={href} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors">
            {label}
        </Link>
    )
}
