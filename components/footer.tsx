import Link from 'next/link'
import { Rocket, Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t py-12 mt-auto">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* BRAND COL */}
                <div className="md:col-span-1 space-y-4">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                            <Rocket size={18} />
                        </div>
                        <span>SoloScale</span>
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        The all-in-one Growth OS for solopreneurs. Build faster, reach further.
                    </p>
                </div>

                {/* PRODUCT COL */}
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/scout" className="hover:text-primary transition">Lead Scout</Link></li>
                        <li><Link href="/remix" className="hover:text-primary transition">Remix Vault</Link></li>
                        <li><Link href="/chart" className="hover:text-primary transition">Chart Studio</Link></li>
                        <li><Link href="/convert" className="hover:text-primary transition">Blog Converter</Link></li>
                    </ul>
                </div>

                {/* COMPANY COL */}
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/about" className="hover:text-primary transition">About Founder</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
                        <li><a href="https://github.com/hassankhan2510" target="_blank" className="hover:text-primary transition">GitHub</a></li>
                    </ul>
                </div>

                {/* LEGAL COL */}
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Legal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                        <li>© 2025 SoloScale</li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}
