export function readCart(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("cart") || "{}"); } catch { return {}; }
}
export function addToCart(id: string, d = 1) {
  const c = readCart();
  const q = (c[id] || 0) + d;
  if (q <= 0) delete c[id]; else c[id] = q;
  try { localStorage.setItem("cart", JSON.stringify(c)); } catch {}
  window.dispatchEvent(new Event("cart-change"));
  return q;
}
