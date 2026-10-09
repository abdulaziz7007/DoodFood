export const PROMOS: Record<string, number> = { DOOD5: 5, DOOD10: 10, DOOD15: 15, LAVASH20: 20 };
export const promoPercent = (code?: string) => PROMOS[(code || "").trim().toUpperCase()] ?? 0;
