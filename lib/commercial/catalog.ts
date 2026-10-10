/** Confirmed commercial terms. Null values deliberately block undecided offers. */
export type Plan = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export const PLANS = {
  FREE: { name: 'Free', monthly: 0, annual: 0, launchAnnual: 0, activeCampaigns: 1 },
  PRO: { name: 'Pro', monthly: 20, annual: 200, launchAnnual: 100, activeCampaigns: 5 },
  BUSINESS: { name: 'Business', monthly: 38, annual: 380, launchAnnual: 190, activeCampaigns: 10 },
  ENTERPRISE: { name: 'Enterprise', monthly: null, annual: null, launchAnnual: null, activeCampaigns: null },
} as const;
export const LAUNCH_CUSTOMERS = 50;
export const POLICY_PENDING = ['launchRenewal', 'freeCredits', 'creditPacks', 'graceCapabilities', 'domainRenewal', 'supportDays', 'initialRevisions', 'upgradeProration'] as const;
export function normalizePlan(value: unknown): Plan {
  if (value === 'ESCAPARATE') return 'BUSINESS'; // Existing saved drafts remain readable.
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANS, value) ? value as Plan : 'FREE';
}
export function legacyPlan(value: unknown): 'FREE' | 'PRO' | 'ESCAPARATE' {
  const plan = normalizePlan(value);
  return plan === 'BUSINESS' || plan === 'ENTERPRISE' ? 'ESCAPARATE' : plan;
}
