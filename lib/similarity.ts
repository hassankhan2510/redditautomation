import { generateCompletion } from './llm'

export async function calculateSimilarity(text1: string, text2: string): Promise<number> {
    // Quick check for identical content
    if (text1 === text2) return 1.0

    // Use LLM to judge similarity keying on semantic overlap
    const prompt = `
Compare the following two Reddit post drafts.
Determine how similar they are in terms of phrasing, structure, and unique content.
Ignore minor variations like "Hi Reddit" vs "Hello everyone".
Focus on whether they look like "spin-tax" copies (BAD) or distinct content (GOOD).

Draft 1:
${text1.slice(0, 1000)}...

Draft 2:
${text2.slice(0, 1000)}...

Return a single number between 0.0 (completely different) and 1.0 (exact copy).
Just the number.
`

    try {
        const result = await generateCompletion(
            "You are a similarity scoring algorithm. Output only a number.",
            prompt
        )
        const score = parseFloat(result.trim())
        return isNaN(score) ? 0.5 : score
    } catch (e) {
        console.error("Similarity check failed", e)
        return 0.0 // Fail open? Or safe?
    }
}
