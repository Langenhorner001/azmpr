// Price helpers — products store price as strings like "Rs 1,099" or
// "Rs 1,099 - Rs 1,699" or "Contact for pricing". These helpers normalize.

/** Parse a price string to a number. Returns 0 if unparseable. */
export function parsePrice(str) {
  if (str === null || str === undefined) return 0;
  const cleaned = String(str).replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/** Format a number as "Rs 1,099" (Pakistani locale). */
export function formatPrice(n) {
  if (!n || n <= 0) return "";
  return `Rs ${Math.round(n).toLocaleString("en-PK")}`;
}
