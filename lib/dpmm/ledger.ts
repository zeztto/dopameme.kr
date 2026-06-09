import type { Prisma } from '@prisma/client'

export const DPMM_LEDGER_TYPES = [
  'opening_balance',
  'welcome_bonus',
  'admin_adjustment',
  'prediction_stake',
  'prediction_liquidation',
  'prediction_liquidation_fee',
  'position_purchase',
  'position_sale',
  'position_sale_fee',
  'market_payout',
  'market_fee',
  'withdrawal_request',
  'withdrawal_refund',
  'level_reward',
  'item_purchase',
] as const

export type DpmmLedgerType = (typeof DPMM_LEDGER_TYPES)[number]

export async function createDpmmLedgerEntry(
  tx: Prisma.TransactionClient,
  input: {
    userId: string
    actorId?: string | null
    type: DpmmLedgerType
    delta: number
    balanceAfter: number
    reason?: string | null
    sourceType?: string | null
    sourceId?: string | null
  }
) {
  return tx.dpmmLedgerTransaction.create({
    data: {
      userId: input.userId,
      actorId: input.actorId ?? null,
      type: input.type,
      delta: input.delta,
      balanceAfter: input.balanceAfter,
      reason: input.reason ?? null,
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
    },
  })
}
