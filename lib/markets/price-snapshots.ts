import type { Prisma } from '@prisma/client'
import { computeAmmOptionProbabilities } from './amm'

type MarketPriceSnapshotSource =
  | 'prediction_stake'
  | 'prediction_liquidation'
  | 'market_seed'
  | 'manual'

export async function recordMarketPriceSnapshot(
  tx: Prisma.TransactionClient,
  input: {
    marketId: string
    source: MarketPriceSnapshotSource
  },
) {
  const options = await tx.marketOption.findMany({
    where: { marketId: input.marketId },
    select: {
      id: true,
      totalAmount: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  if (options.length === 0) {
    return
  }

  const ammConfig = await tx.marketAmmConfig.findUnique({
    where: { marketId: input.marketId },
    select: {
      enabled: true,
      virtualLiquidity: true,
    },
  })
  const totalAmount = options.reduce((sum, option) => sum + option.totalAmount, 0)
  const optionsWithProbability = computeAmmOptionProbabilities(options, ammConfig)

  await tx.marketPriceSnapshot.createMany({
    data: optionsWithProbability.map((option) => ({
      marketId: input.marketId,
      optionId: option.id,
      probabilityBps: option.probabilityBps,
      optionAmount: option.totalAmount,
      totalAmount,
      source: input.source,
    })),
  })
}
