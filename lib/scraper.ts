import puppeteer from 'puppeteer'

export async function scrapeContent(url: string) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Safer for some envs
        })
        const page = await browser.newPage()

        // Set User Agent to avoid being blocked
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

        // Extract main text content
        const data = await page.evaluate(() => {
            // Remove junk
            const junk = document.querySelectorAll('nav, footer, header, script, style, iframe, .ad, .advertisement, [role="alert"]')
            junk.forEach(el => el.remove())

            // Try to find article body
            const article = document.querySelector('article, main, .content, .post-body, .entry-content')
            const text = article ? (article as HTMLElement).innerText : document.body.innerText

            return {
                title: document.title,
                content: text.replace(/\n\s*\n/g, '\n').substring(0, 15000) // 15k char limit
            }
        })

        await browser.close()
        return data

    } catch (e) {
        console.error("Puppeteer Scrape Failed:", e)
        return null // Caller should fallback or handle error
    }
}
