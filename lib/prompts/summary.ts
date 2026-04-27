export const SUMMARY_GENERATION_PROMPT = `
You are generating a structured session summary for The Reinventor's Mindset™ Companion.

Analyse the conversation and return ONLY a valid JSON object with exactly these seven fields. No preamble. No explanation. No markdown fences. Just the raw JSON object.

{
  "context_detected": "The user's context this session: building, leading, transitioning, or unclear",
  "framework_explored": "Name of the primary Reinventor's Mindset framework discussed",
  "core_tension": "1-2 sentence summary of what the user is wrestling with",
  "practical_action": "The single specific action the user committed to this week. Write 'No action committed.' if none was given.",
  "open_questions": "Any unresolved threads or questions to carry forward. Write 'None.' if there are none.",
  "shift_observed": "Any observable change in the user's thinking during this session. Write 'None observed.' if there was none.",
  "journey": "If detectable from context: founder, innovator, or leader. Otherwise write 'unknown'."
}

Return ONLY the JSON object. No other text whatsoever.
`
