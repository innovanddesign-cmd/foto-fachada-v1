'use client';
/** Stable across retries and reloads. A server allowance also limits new UUIDs. */
export function aiCampaignId() {
  let id = sessionStorage.getItem('innova-ai-campaign');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) { id=crypto.randomUUID(); sessionStorage.setItem('innova-ai-campaign',id); }
  return id;
}
