/** Customer credits are not provider tokens. Prices exclude VAT. */
export const CREDIT_POLICY = {
  version: '2026-10-10', monthly: { FREE: 0, PRO: 1000, BUSINESS: 1000 },
  costs: { PRO: { campaign: 200, design: 100, marketing: 100, analysis: 100 }, BUSINESS: { campaign: 100, design: 50, marketing: 50, analysis: 50 } },
  packs: [{ id: 'small', credits: 200, netCents: 500 }, { id: 'medium', credits: 600, netCents: 1200 }, { id: 'large', credits: 1400, netCents: 2500 }],
  providerBudgetUSD: 25, providerAlertUSD: 20,
} as const;
export const AI_OPERATIONS = ['analysis','design','marketing','campaign','free_text','free_image','free_logo'] as const;
export type AIOperation = typeof AI_OPERATIONS[number];
export const isAIOperation = (v: unknown): v is AIOperation => typeof v === 'string' && (AI_OPERATIONS as readonly string[]).includes(v);
