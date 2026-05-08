const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE = BigInt(58)
const MAP = new Map(Array.from(ALPHABET, (char, index) => [char, index]))

export function decodeBase58(value: string): Uint8Array {
  if (!value) return new Uint8Array()

  let decoded = BigInt(0)
  for (const char of value) {
    const digit = MAP.get(char)
    if (digit === undefined) {
      throw new Error('invalid base58 character')
    }
    decoded = decoded * BASE + BigInt(digit)
  }

  const bytes: number[] = []
  while (decoded > BigInt(0)) {
    bytes.push(Number(decoded % BigInt(256)))
    decoded /= BigInt(256)
  }
  bytes.reverse()

  let leadingZeroes = 0
  for (const char of value) {
    if (char !== '1') break
    leadingZeroes += 1
  }

  return Uint8Array.from([...new Array(leadingZeroes).fill(0), ...bytes])
}
