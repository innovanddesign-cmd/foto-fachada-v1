/** Decisions confirmed by Javi on 19 October 2026. No provider-token equivalence. */
export const APPROVED_POLICY = {
  revision: '2026-10-19',
  plans: {
    FREE: { monthly: 0, annual: 0, launchAnnual: 0, credits: 0, creditCap: 0, campaignLimit: 0, branding: true },
    BASIC: { monthly: 6, annual: 60, launchAnnual: 60, credits: 100, creditCap: 200, campaignLimit: 0, branding: false },
    PRO: { monthly: 20, annual: 200, launchAnnual: 100, credits: 200, creditCap: 400, campaignLimit: 5, branding: false },
    BUSINESS: { monthly: 38, annual: 380, launchAnnual: 190, credits: 400, creditCap: 800, campaignLimit: 10, branding: false },
  },
  launchCustomers: 100,
  operations: { text: 5, image: 20, metrics_analysis: 20, metrics_comparison: 40 },
  campaignPurchase: { netCents: 4000, expires: false, simultaneous: true, contacts: 100 },
  trial: { campaignDays: 7, startsAt: 'first_publication', basicHours: 48, basicCredits: 40 },
  retention: { archivedMonths: 12, contactsMonths: 12, accessAfterDowngradeDays: 30, eventDays: 90, backupDays: 30, warningDays: [30, 7] },
  contacts: { PRO: 500, BUSINESS: 1500 },
  metrics: { sessionMinutes: 30, smallSessionSample: 100, smallResultSample: 10, maxDays: 90, maxCampaigns: 3 },
  scheduling: { attempts: 3, retryWindowMinutes: 15, credits: 0 },
  email: { initialPlan: 'free', dailyQuota: 100, monthlyQuota: 3000, groupMinutes: 15, summaryHour: 9, alerts: [.8, .9], credits: 0 },
  topUpsEnabled: false,
} as const;
export type StandardPlan = keyof typeof APPROVED_POLICY.plans;
export type ApprovedOperation = keyof typeof APPROVED_POLICY.operations;
export function operationCost(plan: StandardPlan, operation: ApprovedOperation): number | null {
  if (plan === 'FREE') return null;
  if ((operation === 'metrics_analysis' || operation === 'metrics_comparison') && plan !== 'BUSINESS') return null;
  return APPROVED_POLICY.operations[operation];
}
export function grantMonthlyCredits(plan: StandardPlan, includedBalance: number): number {
  if (!Number.isSafeInteger(includedBalance) || includedBalance < 0) throw Error('INVALID_BALANCE');
  const p = APPROVED_POLICY.plans[plan];
  return Math.min(p.credits, Math.max(0, p.creditCap - includedBalance));
}
/** Launch eligibility must be supplied by trusted account/order state, never a request body. */
export function planPrice(plan: StandardPlan, billing: 'monthly' | 'annual', launchEligible = false): number {
  const p = APPROVED_POLICY.plans[plan];
  return (billing === 'monthly' ? p.monthly : launchEligible ? p.launchAnnual : p.annual) * 100;
}
