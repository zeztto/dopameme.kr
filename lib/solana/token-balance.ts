import { getSolanaTokenConfig } from './config'
import { isSolanaAddress } from './wallet-link'

export type TokenAmount = {
  amount: string
  decimals: number
  ui_amount: string
}

type ParsedTokenAccount = {
  account?: {
    owner?: string
    data?: {
      program?: string
      parsed?: {
        info?: {
          mint?: string
          owner?: string
          tokenAmount?: {
            amount?: string
            decimals?: number
            uiAmountString?: string
          }
        }
      }
    }
  }
}

type RpcResponse<T> = {
  result?: T
  error?: {
    code?: number
    message?: string
  }
}

type TokenAccountsResult = {
  value?: ParsedTokenAccount[]
}

const SOLANA_RPC_TIMEOUT_MS = 5000

export function zeroTokenAmount(decimals = getSolanaTokenConfig().decimals): TokenAmount {
  return {
    amount: '0',
    decimals,
    ui_amount: '0',
  }
}

export async function getDpmmTokenBalance(address: string): Promise<TokenAmount> {
  const config = getSolanaTokenConfig()

  if (!isSolanaAddress(address)) {
    throw new Error('invalid Solana address')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SOLANA_RPC_TIMEOUT_MS)
  let response: Response

  try {
    response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dopameme-dpmm-balance',
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { mint: config.mint },
          { encoding: 'jsonParsed', commitment: 'confirmed' },
        ],
      }),
      cache: 'no-store',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new Error('Solana RPC request failed')
  }

  const body = (await response.json()) as RpcResponse<TokenAccountsResult>
  if (body.error) {
    throw new Error(body.error.message || 'Solana RPC returned an error')
  }

  const accounts = body.result?.value ?? []
  let total = BigInt(0)
  let decimals = config.decimals

  for (const item of accounts) {
    const accountOwner = item.account?.owner
    const parsed = item.account?.data?.parsed
    const info = parsed?.info
    const tokenAmount = info?.tokenAmount

    if (
      accountOwner !== config.tokenProgramId ||
      info?.mint !== config.mint ||
      info?.owner !== address ||
      !/^\d+$/.test(tokenAmount?.amount ?? '')
    ) {
      continue
    }

    decimals =
      typeof tokenAmount?.decimals === 'number' ? tokenAmount.decimals : decimals
    total += BigInt(tokenAmount?.amount ?? '0')
  }

  return {
    amount: total.toString(),
    decimals,
    ui_amount: formatTokenAmount(total, decimals),
  }
}

export function formatTokenAmount(rawAmount: bigint, decimals: number): string {
  const negative = rawAmount < BigInt(0)
  const absolute = negative ? -rawAmount : rawAmount
  const scale = BigInt(10) ** BigInt(decimals)
  const whole = absolute / scale
  const fraction = absolute % scale

  if (fraction === BigInt(0)) {
    return `${negative ? '-' : ''}${whole.toString()}`
  }

  const paddedFraction = fraction
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '')

  return `${negative ? '-' : ''}${whole.toString()}.${paddedFraction}`
}
