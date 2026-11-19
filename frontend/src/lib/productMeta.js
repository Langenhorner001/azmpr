// Synthetic, DETERMINISTIC product metadata.
// Same product id ALWAYS produces the same rating / reviews / sales / badges.
// IMPORTANT: This is PLACEHOLDER data — swap with real metrics when available.

const stringHash = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i); // djb2 xor
  }
  // unsigned 32-bit
  return h >>> 0;
};

/**
 * Get deterministic synthetic metadata for a product.
 * @param {number|string} productId
 * @param {number} basePrice numeric current price (used to derive fake original).
 *   Pass 0 if unknown — original/discount will be omitted.
 * @returns {{
 *   rating: number,         // 4.20 .. 4.99
 *   reviews: number,        // 35 .. 504
 *   salesCount: number,     // 120 .. 1999
 *   isBestseller: boolean,
 *   isTrending: boolean,
 *   fakeOriginal: number,   // 0 if basePrice is 0
 *   discountPct: number     // 0 if basePrice is 0
 * }}
 */
export function getProductMeta(productId, basePrice = 0) {
  const h = stringHash(String(productId));
  const rating = Math.round((4.2 + (h % 80) / 100) * 100) / 100; // round to 2dp
  const reviews = 35 + (h % 470);
  const salesCount = 120 + (h % 1880);
  const isBestseller = h % 7 === 0;
  const isTrending = !isBestseller && h % 11 === 0;
  let fakeOriginal = 0;
  let discountPct = 0;
  if (basePrice > 0) {
    fakeOriginal = Math.round(basePrice * (1.18 + (h % 20) / 100));
    discountPct = Math.max(
      0,
      Math.round(((fakeOriginal - basePrice) / fakeOriginal) * 100)
    );
  }
  return { rating, reviews, salesCount, isBestseller, isTrending, fakeOriginal, discountPct };
}

// Re-exported for tests / dev tools
export const __test_hash = stringHash;
