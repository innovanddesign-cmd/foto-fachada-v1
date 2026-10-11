/** Only app-owned destinations, never an external or protocol-relative redirect. */
export function returnPath(value: string | null | undefined): string {
  if(value==='/auth/reset')return value;
  if (!value || !/^\/(dashboard|create|checkout|operator)([/?#]|$)/.test(value) || /[\\\r\n]/.test(value)) return '/dashboard';
  return value;
}
