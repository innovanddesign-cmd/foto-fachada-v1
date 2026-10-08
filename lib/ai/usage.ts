// Server logs only: never record images, prompts, model text, email or API keys.
// Unknown usage is null, not zero. This is not a durable billing ledger or quota counter.
export function recordAIUsage(userId: string, requestId: string, model: string, metadata: unknown) {
  const usage = metadata && typeof metadata === 'object' ? metadata as Record<string, unknown> : {};
  const count = (key: string) => typeof usage[key] === 'number' && Number.isSafeInteger(usage[key]) && (usage[key] as number) >= 0 ? usage[key] : null;
  console.info(JSON.stringify({ event: 'ai_usage', userId, requestId, model,
    promptTokens: count('promptTokenCount'), outputTokens: count('candidatesTokenCount'),
    thoughtTokens: count('thoughtsTokenCount'), cachedTokens: count('cachedContentTokenCount'),
    totalTokens: count('totalTokenCount'), cost: null }));
}
