import { decodeBase58 } from './base58'

export const WITHDRAWAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'submitted',
  'confirmed',
  'failed',
] as const

export const ACTIVE_WITHDRAWAL_STATUSES = [
  'pending',
  'approved',
  'submitted',
] as const

export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number]
export type ActiveWithdrawalStatus = (typeof ACTIVE_WITHDRAWAL_STATUSES)[number]

export const DEFAULT_MIN_WITHDRAWAL_AMOUNT = 1000
export const MAX_WITHDRAWAL_AMOUNT = 1_000_000

export function getMinWithdrawalAmount(): number {
  const configured = Number(process.env.DPMM_MIN_WITHDRAWAL_AMOUNT)
  if (!Number.isInteger(configured) || configured < 1 || configured > MAX_WITHDRAWAL_AMOUNT) {
    return DEFAULT_MIN_WITHDRAWAL_AMOUNT
  }
  return configured
}

export function isWithdrawalStatus(value: string): value is WithdrawalStatus {
  return WITHDRAWAL_STATUSES.includes(value as WithdrawalStatus)
}

export function isActiveWithdrawalStatus(value: string): value is ActiveWithdrawalStatus {
  return ACTIVE_WITHDRAWAL_STATUSES.includes(value as ActiveWithdrawalStatus)
}

export function normalizeWithdrawalAmount(value: unknown): number {
  const amount = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(amount) ? amount : 0
}

export function validateAdminNote(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, 500)
}

export function isValidSolanaTransactionSignature(value: string): boolean {
  const signature = value.trim()
  if (signature.length < 64 || signature.length > 88) return false

  try {
    return decodeBase58(signature).length === 64
  } catch {
    return false
  }
}
