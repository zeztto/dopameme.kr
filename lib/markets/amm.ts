export const AMM_MAX_BPS = 10_000
export const DEFAULT_AMM_VIRTUAL_LIQUIDITY = 5_000

export type AmmConfigInput = {
  enabled?: boolean | null
  virtualLiquidity?: number | null
} | null | undefined

export type AmmOptionInput = {
  id: string
  totalAmount: number
}

export function getAmmVirtualLiquidity(config: AmmConfigInput) {
  if (config?.enabled === false) return 0

  const virtualLiquidity = config?.virtualLiquidity ?? DEFAULT_AMM_VIRTUAL_LIQUIDITY
  return Math.max(0, Math.floor(virtualLiquidity))
}

export function computeAmmOptionProbabilities<TOption extends AmmOptionInput>(
  options: TOption[],
  config?: AmmConfigInput,
) {
  if (options.length === 0) {
    return []
  }

  const virtualLiquidity = getAmmVirtualLiquidity(config)
  const totalAmount = options.reduce((sum, option) => sum + option.totalAmount, 0)
  const denominator = totalAmount + virtualLiquidity * options.length
  const defaultBps = Math.round(AMM_MAX_BPS / options.length)

  return options.map((option) => {
    const probabilityBps = denominator > 0
      ? Math.round(((option.totalAmount + virtualLiquidity) / denominator) * AMM_MAX_BPS)
      : defaultBps

    return {
      ...option,
      probabilityBps,
      percentage: Math.round(probabilityBps / 100),
    }
  })
}

export function quoteAmmStake(
  input: {
    options: AmmOptionInput[]
    optionId: string
    amount: number
    config?: AmmConfigInput
  },
) {
  const selectedOption = input.options.find((option) => option.id === input.optionId)

  if (!selectedOption || input.amount <= 0) {
    return null
  }

  const before = computeAmmOptionProbabilities(input.options, input.config)
  const after = computeAmmOptionProbabilities(
    input.options.map((option) => (
      option.id === input.optionId
        ? { ...option, totalAmount: option.totalAmount + input.amount }
        : option
    )),
    input.config,
  )
  const beforeSelected = before.find((option) => option.id === input.optionId)
  const afterSelected = after.find((option) => option.id === input.optionId)

  if (!beforeSelected || !afterSelected) {
    return null
  }

  const averagePriceBps = Math.max(1, Math.round((beforeSelected.probabilityBps + afterSelected.probabilityBps) / 2))

  return {
    beforeProbabilityBps: beforeSelected.probabilityBps,
    afterProbabilityBps: afterSelected.probabilityBps,
    averagePriceBps,
    priceImpactBps: Math.max(0, afterSelected.probabilityBps - beforeSelected.probabilityBps),
    estimatedShares: Math.floor((input.amount * AMM_MAX_BPS) / averagePriceBps),
  }
}
