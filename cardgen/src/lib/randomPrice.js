/** Random shop price in euro cents (100 = €1 … 100000 = €1000). */
export function randomPriceCents(min = 100, max = 100000) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
