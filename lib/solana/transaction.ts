import { getSolanaTokenConfig } from './config'
import { isSolanaAddress } from './wallet-link'

type RpcResponse<T> = {
  result?: T | null
  error?: {
    code?: number
    message?: string
  }
}

type ParsedTokenBalance = {
  mint?: string
  owner?: string
  uiTokenAmount?: {
    amount?: string
    decimals?: number
  }
}

type TransactionResult = {
  meta?: {
    err?: unknown
    preTokenBalances?: ParsedTokenBalance[]
    postTokenBalances?: ParsedTokenBalance[]
  } | null
}

const SOLANA_RPC_TIMEOUT_MS = 7000

export class WithdrawalTransactionVerificationError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'WithdrawalTransactionVerificationError'
  }
}

function rawTokenAmount(amount: number, decimals: number): bigint {
  return BigInt(amount) * BigInt(10) ** BigInt(decimals)
}

function addBalance(
  balances: Map<string, bigint>,
  owner: string | undefined,
  mint: string | undefined,
  amount: string | undefined
) {
  if (!owner || !mint || !amount || !/^\d+$/.test(amount)) return

  const key = `${owner}:${mint}`
  balances.set(key, (balances.get(key) ?? BigInt(0)) + BigInt(amount))
}

function sumBalances(items: ParsedTokenBalance[] | undefined) {
  const balances = new Map<string, bigint>()

  for (const item of items ?? []) {
    addBalance(balances, item.owner, item.mint, item.uiTokenAmount?.amount)
  }

  return balances
}

function getDelta(
  preBalances: Map<string, bigint>,
  postBalances: Map<string, bigint>,
  owner: string,
  mint: string
) {
  const key = `${owner}:${mint}`
  return (postBalances.get(key) ?? BigInt(0)) - (preBalances.get(key) ?? BigInt(0))
}

export async function verifyDpmmWithdrawalTransaction(input: {
  signature: string
  walletAddress: string
  cluster?: string
  amount: number
}) {
  const config = getSolanaTokenConfig()

  if (input.cluster && input.cluster !== config.cluster) {
    throw new WithdrawalTransactionVerificationError(
      'cluster_mismatch',
      '출금 요청 cluster와 현재 Solana RPC cluster가 일치하지 않습니다'
    )
  }

  if (!isSolanaAddress(input.walletAddress)) {
    throw new WithdrawalTransactionVerificationError(
      'destination_invalid',
      '출금 지갑 주소가 올바르지 않습니다'
    )
  }

  if (
    config.treasuryWalletAddress &&
    !isSolanaAddress(config.treasuryWalletAddress)
  ) {
    throw new WithdrawalTransactionVerificationError(
      'treasury_invalid',
      'DPMM treasury 지갑 주소 설정이 올바르지 않습니다'
    )
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
        id: 'dopameme-dpmm-withdrawal-tx',
        method: 'getTransaction',
        params: [
          input.signature,
          {
            encoding: 'jsonParsed',
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
      cache: 'no-store',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new WithdrawalTransactionVerificationError(
      'rpc_failed',
      'Solana RPC 요청에 실패했습니다'
    )
  }

  const body = (await response.json()) as RpcResponse<TransactionResult>

  if (body.error) {
    throw new WithdrawalTransactionVerificationError(
      'rpc_error',
      body.error.message || 'Solana RPC 오류가 발생했습니다'
    )
  }

  const transaction = body.result
  if (!transaction?.meta) {
    throw new WithdrawalTransactionVerificationError(
      'transaction_not_found',
      '확인된 Solana transaction을 찾을 수 없습니다'
    )
  }

  if (transaction.meta.err) {
    throw new WithdrawalTransactionVerificationError(
      'transaction_failed',
      '실패한 Solana transaction입니다'
    )
  }

  const preBalances = sumBalances(transaction.meta.preTokenBalances)
  const postBalances = sumBalances(transaction.meta.postTokenBalances)
  const expectedRawAmount = rawTokenAmount(input.amount, config.decimals)
  const destinationDelta = getDelta(
    preBalances,
    postBalances,
    input.walletAddress,
    config.mint
  )

  if (destinationDelta !== expectedRawAmount) {
    throw new WithdrawalTransactionVerificationError(
      'destination_amount_mismatch',
      '출금 지갑, mint, 금액이 transaction과 일치하지 않습니다'
    )
  }

  if (config.treasuryWalletAddress) {
    const treasuryDelta = getDelta(
      preBalances,
      postBalances,
      config.treasuryWalletAddress,
      config.mint
    )

    if (treasuryDelta !== -expectedRawAmount) {
      throw new WithdrawalTransactionVerificationError(
        'treasury_amount_mismatch',
        'treasury 지갑의 전송 금액이 transaction과 일치하지 않습니다'
      )
    }
  }
}
