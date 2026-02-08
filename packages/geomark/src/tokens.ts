/**
 * Estimate token count from text using a simple word-based heuristic.
 *
 * Uses the approximation of ~0.75 words per token (or ~4 chars per token)
 * which is a reasonable average for English text across most LLM tokenizers.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // Character-based estimation: ~4 chars per token
  const charEstimate = Math.ceil(text.length / 4);

  // Word-based estimation: ~0.75 words per token (1 token ≈ 1.33 words)
  const words = text.split(/\s+/).filter(Boolean).length;
  const wordEstimate = Math.ceil(words / 0.75);

  // Average both estimates for better accuracy
  return Math.round((charEstimate + wordEstimate) / 2);
}

/**
 * Count words in text.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate reading time in minutes.
 * Uses average reading speed of 238 words per minute.
 */
export function estimateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.round(wordCount / 238));
}
