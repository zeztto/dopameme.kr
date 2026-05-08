import { createPublicKey, randomUUID, verify } from 'node:crypto'
import { decodeBase58 } from './base58'
import type { SolanaCluster } from './config'

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex')
const PUBLIC_KEY_BYTES = 32
const SIGNATURE_BYTES = 64
const MAX_ADDRESS_LENGTH = 44
const MAX_SIGNATURE_LENGTH = 120

export const WALLET_LINK_VERSION = 'dopameme-wallet-link-v1'
export const WALLET_LINK_NONCE_TTL_SECONDS = 5 * 60

export type WalletProviderKind =
  | 'phantom'
  | 'solflare'
  | 'backpack'
  | 'wallet-standard'
  | 'unknown'

export type WalletLinkMessageInput = {
  domain: string
  cluster: SolanaCluster
  address: string
  userId: string
  nonce: string
  issuedAt: string
  expiresAt: string
}

export class WalletVerificationError extends Error {
  constructor(
    public readonly code:
      | 'address.invalid'
      | 'signature.invalid_encoding'
      | 'signature.invalid_length'
      | 'signature.mismatch',
    message: string
  ) {
    super(message)
    this.name = 'WalletVerificationError'
  }
}

export function createWalletLinkNonce(): string {
  return randomUUID()
}

export function buildWalletLinkMessage(input: WalletLinkMessageInput): string {
  return [
    'Dopameme Wallet Link',
    `version: ${WALLET_LINK_VERSION}`,
    `domain: ${input.domain}`,
    `cluster: ${input.cluster}`,
    `address: ${input.address}`,
    `user_id: ${input.userId}`,
    `nonce: ${input.nonce}`,
    `issued_at: ${input.issuedAt}`,
    `expires_at: ${input.expiresAt}`,
    'purpose: link Solana wallet to dopameme.kr account',
  ].join('\n')
}

export function decodeSolanaAddress(address: string): Uint8Array {
  const trimmed = address.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_ADDRESS_LENGTH) {
    throw new WalletVerificationError(
      'address.invalid',
      `address must be 1-${MAX_ADDRESS_LENGTH} base58 characters`
    )
  }

  let decoded: Uint8Array
  try {
    decoded = decodeBase58(trimmed)
  } catch {
    throw new WalletVerificationError(
      'address.invalid',
      'address must be base58 encoded'
    )
  }

  if (decoded.length !== PUBLIC_KEY_BYTES) {
    throw new WalletVerificationError(
      'address.invalid',
      'address must decode to 32 bytes'
    )
  }

  return decoded
}

export function isSolanaAddress(address: string): boolean {
  try {
    decodeSolanaAddress(address)
    return true
  } catch {
    return false
  }
}

export function decodeWalletSignature(signature: string): Uint8Array {
  const trimmed = signature.trim()
  if (!trimmed) {
    throw new WalletVerificationError(
      'signature.invalid_encoding',
      'signature is required'
    )
  }

  if (trimmed.length > MAX_SIGNATURE_LENGTH) {
    throw new WalletVerificationError(
      'signature.invalid_length',
      `signature must be at most ${MAX_SIGNATURE_LENGTH} characters`
    )
  }

  const candidates = [tryDecodeBase64(trimmed), tryDecodeBase58(trimmed)].filter(
    (candidate): candidate is Uint8Array => candidate !== null
  )
  const decoded = candidates.find((candidate) => candidate.length === SIGNATURE_BYTES)

  if (!decoded) {
    throw new WalletVerificationError(
      candidates.length === 0
        ? 'signature.invalid_encoding'
        : 'signature.invalid_length',
      'signature must be base64 or base58 encoded 64 bytes'
    )
  }

  return decoded
}

export function verifySolanaWalletSignature(input: {
  address: string
  message: string
  signature: string
}): boolean {
  const publicKey = decodeSolanaAddress(input.address)
  const signature = decodeWalletSignature(input.signature)
  const spki = Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKey)])
  const key = createPublicKey({ key: spki, format: 'der', type: 'spki' })
  const ok = verify(null, Buffer.from(input.message, 'utf8'), key, Buffer.from(signature))

  if (!ok) {
    throw new WalletVerificationError(
      'signature.mismatch',
      'signature does not match address and message'
    )
  }

  return true
}

export function normalizeWalletProvider(value: unknown): WalletProviderKind {
  if (typeof value !== 'string') return 'unknown'
  const normalized = value.trim().toLowerCase()

  if (
    normalized === 'phantom' ||
    normalized === 'solflare' ||
    normalized === 'backpack' ||
    normalized === 'wallet-standard'
  ) {
    return normalized
  }

  return 'unknown'
}

function tryDecodeBase58(value: string): Uint8Array | null {
  try {
    return decodeBase58(value)
  } catch {
    return null
  }
}

function tryDecodeBase64(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) {
    return null
  }

  try {
    const buffer = Buffer.from(value, 'base64')
    const roundtrip = buffer.toString('base64')
    if (roundtrip.replace(/=+$/, '') !== value.replace(/=+$/, '')) return null
    return new Uint8Array(buffer)
  } catch {
    return null
  }
}
