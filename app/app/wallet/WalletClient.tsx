'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type TokenAmount = {
  amount: string
  decimals: number
  ui_amount: string
}

type LinkedSolanaWallet = {
  address: string
  provider: string
  verified_at: string
  explorer_url: string
}

type WithdrawalRequest = {
  id: string
  wallet_address: string
  amount: number
  status: string
  tx_signature: string | null
  user_note: string | null
  requested_at: string
  reviewed_at: string | null
  submitted_at: string | null
  confirmed_at: string | null
  failed_at: string | null
}

type SolanaWalletSummary = {
  cluster: 'devnet' | 'mainnet-beta'
  mint: string
  token_program: 'spl-token' | 'token-2022'
  token_name: string
  token_symbol: string
  mint_explorer_url: string
  game_balance: {
    amount: string
    symbol: string
  }
  withdrawal_policy: {
    min_amount: number
    max_amount: number
    active_request_required_clear: boolean
  }
  linked_wallet: LinkedSolanaWallet | null
  token_balance: TokenAmount | null
  balance_error: string | null
  active_withdrawal: WithdrawalRequest | null
  withdrawals: WithdrawalRequest[]
  claimable: TokenAmount
}

type SolanaProvider = {
  isPhantom?: boolean
  isSolflare?: boolean
  publicKey?: { toString(): string; toBase58?(): string }
  connect(input?: { onlyIfTrusted?: boolean }): Promise<{
    publicKey?: { toString(): string; toBase58?(): string }
  } | void>
  disconnect?(): Promise<void>
  signMessage(
    message: Uint8Array,
    display?: 'utf8' | 'hex'
  ): Promise<Uint8Array | { signature: Uint8Array }>
}

type ProviderWindow = Window & {
  solana?: SolanaProvider
  solflare?: SolanaProvider
}

type RequestState = 'idle' | 'loading' | 'connecting' | 'signing' | 'verifying'

function getInjectedProvider(): SolanaProvider | null {
  if (typeof window === 'undefined') return null

  const providerWindow = window as ProviderWindow
  if (providerWindow.solana?.isPhantom || providerWindow.solana?.isSolflare) {
    return providerWindow.solana
  }

  return providerWindow.solflare ?? providerWindow.solana ?? null
}

function providerName(provider: SolanaProvider | null): string {
  if (!provider) return 'unknown'
  if (provider.isPhantom) return 'phantom'
  if (provider.isSolflare) return 'solflare'
  return 'wallet-standard'
}

function publicKeyToString(
  publicKey: { toString(): string; toBase58?(): string } | undefined
): string {
  return publicKey?.toBase58?.() ?? publicKey?.toString() ?? ''
}

function signatureToBase64(signature: Uint8Array): string {
  let binary = ''
  for (const byte of signature) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function shortAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function formatInteger(value: string | number): string {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed.toLocaleString('ko-KR') : String(value)
}

function withdrawalStatusLabel(status: string): string {
  if (status === 'pending') return '검토 대기'
  if (status === 'approved') return '승인'
  if (status === 'submitted') return '전송됨'
  if (status === 'confirmed') return '확정'
  if (status === 'rejected') return '거절'
  if (status === 'failed') return '실패'
  return status
}

function readSignature(result: Uint8Array | { signature: Uint8Array }): Uint8Array {
  return result instanceof Uint8Array ? result : result.signature
}

export default function WalletClient() {
  const [summary, setSummary] = useState<SolanaWalletSummary | null>(null)
  const [providerAvailable, setProviderAvailable] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)
  const [state, setState] = useState<RequestState>('loading')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const linkedAddress = summary?.linked_wallet?.address ?? null
  const isLinked =
    linkedAddress !== null &&
    currentAddress !== null &&
    linkedAddress === currentAddress

  const loadSummary = useCallback(async () => {
    setError(null)
    setState('loading')
    try {
      const response = await fetch('/api/wallet/solana', {
        method: 'GET',
        cache: 'no-store',
      })
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body?.error?.message ?? '지갑 정보를 불러오지 못했습니다.')
      }

      setSummary(body.data)
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setState('idle')
    }
  }, [])

  useEffect(() => {
    const provider = getInjectedProvider()
    setProviderAvailable(Boolean(provider))
    setCurrentAddress(publicKeyToString(provider?.publicKey) || null)
    void loadSummary()
  }, [loadSummary])

  const onChainBalance = useMemo(() => {
    if (summary?.balance_error) return '조회 실패'
    return summary?.token_balance?.ui_amount ?? '0'
  }, [summary?.balance_error, summary?.token_balance?.ui_amount])

  const availableBalance = Number(summary?.game_balance.amount ?? 0)
  const minWithdrawalAmount = summary?.withdrawal_policy.min_amount ?? 1000
  const maxWithdrawalAmount = summary?.withdrawal_policy.max_amount ?? availableBalance
  const parsedWithdrawalAmount = Number(withdrawAmount)
  const canRequestWithdrawal =
    Boolean(summary?.linked_wallet) &&
    !summary?.active_withdrawal &&
    Number.isInteger(parsedWithdrawalAmount) &&
    parsedWithdrawalAmount >= minWithdrawalAmount &&
    parsedWithdrawalAmount <= maxWithdrawalAmount

  async function handleConnectAndLink() {
    const provider = getInjectedProvider()

    if (!provider) {
      setError('Solana 브라우저 지갑을 찾을 수 없습니다.')
      return
    }

    if (typeof provider.signMessage !== 'function') {
      setError('이 지갑은 message signing을 지원하지 않습니다.')
      return
    }

    setError(null)

    try {
      setState('connecting')
      const connected = await provider.connect()
      const address =
        publicKeyToString(connected?.publicKey) ||
        publicKeyToString(provider.publicKey)

      if (!address) {
        throw new Error('지갑 주소를 확인하지 못했습니다.')
      }

      setCurrentAddress(address)
      setState('signing')

      const nonceResponse = await fetch('/api/wallet/solana/link/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const nonceBody = await nonceResponse.json().catch(() => ({}))

      if (!nonceResponse.ok) {
        throw new Error(
          nonceBody?.error?.message ?? '지갑 연결 메시지를 만들지 못했습니다.'
        )
      }

      const message = nonceBody.data.message as string
      const nonce = nonceBody.data.nonce as string
      const signatureResult = await provider.signMessage(
        new TextEncoder().encode(message),
        'utf8'
      )
      const signature = readSignature(signatureResult)

      setState('verifying')

      const verifyResponse = await fetch('/api/wallet/solana/link/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          nonce,
          message,
          signature: signatureToBase64(signature),
          wallet_provider: providerName(provider),
        }),
      })
      const verifyBody = await verifyResponse.json().catch(() => ({}))

      if (!verifyResponse.ok) {
        throw new Error(
          verifyBody?.error?.message ?? '지갑 서명을 검증하지 못했습니다.'
        )
      }

      await loadSummary()
    } catch (caught) {
      setError((caught as Error).message || '지갑 연결에 실패했습니다.')
      setState('idle')
    }
  }

  async function handleWithdrawalRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canRequestWithdrawal) {
      setError('출금 요청 금액 또는 지갑 연결 상태를 확인해주세요.')
      return
    }

    const confirmed = confirm(
      `${formatInteger(parsedWithdrawalAmount)} DPMM 출금 요청을 생성하시겠습니까? 요청 즉시 장부 잔액에서 차감됩니다.`
    )
    if (!confirmed) return

    setError(null)
    setWithdrawLoading(true)

    try {
      const response = await fetch('/api/wallet/solana/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedWithdrawalAmount }),
      })
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body?.error?.message ?? '출금 요청을 생성하지 못했습니다.')
      }

      setWithdrawAmount('')
      await loadSummary()
    } catch (caught) {
      setError((caught as Error).message || '출금 요청에 실패했습니다.')
    } finally {
      setWithdrawLoading(false)
    }
  }

  async function handleDisconnect() {
    const provider = getInjectedProvider()
    await provider?.disconnect?.()
    setCurrentAddress(null)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border-3 border-primary/25 bg-white p-8 shadow-token-lg">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">
              DPMM Withdrawal
            </p>
            <h1 className="mt-3 text-4xl font-black text-text-primary">
              DPMM 출금 지갑
            </h1>
          </div>
          <a
            href={summary?.mint_explorer_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border-2 border-primary px-5 py-2 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          >
            Mint 보기
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-light-border bg-light-bg-alt p-6">
            <p className="text-sm font-bold text-text-secondary">출금 가능 장부 DPMM</p>
            <p className="mt-3 text-3xl font-black tabular-nums text-text-primary">
              {summary ? formatInteger(summary.game_balance.amount) : '-'}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
            <p className="text-sm font-bold text-text-secondary">지갑 on-chain DPMM</p>
            <p className="mt-3 text-3xl font-black tabular-nums text-primary">
              {onChainBalance}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border-2 border-light-border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-black text-text-primary">출금 받을 지갑</p>
              <p className="mt-1 text-sm font-semibold text-text-secondary">
                {summary?.linked_wallet
                  ? shortAddress(summary.linked_wallet.address)
                  : '연결된 지갑 없음'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleConnectAndLink}
              disabled={!providerAvailable || state !== 'idle' || isLinked}
              className="rounded-full bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-text-tertiary"
            >
              {isLinked
                ? '연결 완료'
                : state === 'connecting'
                  ? '연결 중'
                  : state === 'signing'
                    ? '서명 중'
                    : state === 'verifying'
                      ? '검증 중'
                      : '지갑 연결'}
            </button>
          </div>

          {currentAddress && (
            <div className="mt-5 rounded-xl bg-light-bg-alt p-4">
              <p className="text-xs font-bold uppercase text-text-tertiary">
                Current wallet
              </p>
              <p className="mt-1 break-all font-mono text-sm text-text-secondary">
                {currentAddress}
              </p>
              <button
                type="button"
                onClick={handleDisconnect}
                className="mt-3 text-sm font-black text-secondary hover:text-secondary-dark"
              >
                브라우저 연결 해제
              </button>
            </div>
          )}

          {!providerAvailable && state !== 'loading' && (
            <p className="mt-5 text-sm font-semibold text-text-secondary">
              Phantom 또는 Solflare 브라우저 지갑이 필요합니다.
            </p>
          )}
        </div>

        <section className="mt-8 rounded-2xl border-2 border-secondary/25 bg-secondary/5 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-black text-text-primary">출금 요청</p>
              <p className="mt-1 text-sm font-semibold text-text-secondary">
                최소 {formatInteger(minWithdrawalAmount)} DPMM
              </p>
            </div>
            {summary?.active_withdrawal && (
              <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-secondary">
                {withdrawalStatusLabel(summary.active_withdrawal.status)}
              </span>
            )}
          </div>

          {summary?.active_withdrawal ? (
            <div className="mt-5 rounded-xl bg-white p-4">
              <div className="text-sm font-black text-text-primary">
                {formatInteger(summary.active_withdrawal.amount)} DPMM
              </div>
              <div className="mt-1 text-xs font-semibold text-text-secondary">
                {new Date(summary.active_withdrawal.requested_at).toLocaleString('ko-KR')}
              </div>
              {summary.active_withdrawal.tx_signature && (
                <div className="mt-3 break-all font-mono text-xs text-text-tertiary">
                  {summary.active_withdrawal.tx_signature}
                </div>
              )}
              {summary.active_withdrawal.user_note && (
                <div className="mt-3 text-xs font-semibold text-text-secondary">
                  {summary.active_withdrawal.user_note}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleWithdrawalRequest} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                min={minWithdrawalAmount}
                max={maxWithdrawalAmount}
                step={1}
                placeholder="출금할 DPMM"
                disabled={!summary?.linked_wallet || withdrawLoading}
                className="min-h-12 rounded-dopameme-md border-2 border-light-border bg-white px-4 text-sm font-bold text-text-primary outline-none transition focus:border-secondary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!canRequestWithdrawal || withdrawLoading}
                className="rounded-dopameme-pill bg-secondary px-6 py-3 text-sm font-black text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:bg-text-tertiary"
              >
                {withdrawLoading ? '요청 중' : '출금 요청'}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-5 rounded-xl border-2 border-secondary/30 bg-white p-4 text-sm font-bold text-secondary">
              {error}
            </p>
          )}
        </section>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border-3 border-secondary/25 bg-white p-8 shadow-token-md">
          <p className="text-sm font-black uppercase tracking-wide text-secondary">
            Token
          </p>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-bold text-text-tertiary">Name</dt>
              <dd className="mt-1 font-black text-text-primary">
                {summary?.token_name ?? 'Dopameme'}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">Symbol</dt>
              <dd className="mt-1 font-black text-text-primary">
                {summary?.token_symbol ?? 'DPMM'}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">Cluster</dt>
              <dd className="mt-1 font-black text-text-primary">
                {summary?.cluster ?? 'devnet'}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">Program</dt>
              <dd className="mt-1 font-black text-text-primary">
                {summary?.token_program ?? 'token-2022'}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-text-tertiary">Mint</dt>
              <dd className="mt-1 break-all font-mono text-xs text-text-secondary">
                {summary?.mint ?? '6fQ3D623QNsskcsdwHvUNgutFp1ptbQWUAYSoLFZTeyc'}
              </dd>
            </div>
          </dl>
        </div>

        {summary?.linked_wallet && (
          <a
            href={summary.linked_wallet.explorer_url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-3xl border-3 border-success/25 bg-success/5 p-8 transition hover:shadow-token-md"
          >
            <p className="text-sm font-black uppercase tracking-wide text-success">
              Withdrawal wallet
            </p>
            <p className="mt-4 break-all font-mono text-sm font-bold text-text-primary">
              {summary.linked_wallet.address}
            </p>
            <p className="mt-4 text-xs font-semibold text-text-secondary">
              {new Date(summary.linked_wallet.verified_at).toLocaleString('ko-KR')}
            </p>
          </a>
        )}

        <div className="rounded-3xl border-3 border-light-border bg-white p-8 shadow-token-md">
          <p className="text-sm font-black uppercase tracking-wide text-text-tertiary">
            Withdrawal history
          </p>
          <div className="mt-5 space-y-3">
            {summary?.withdrawals.length ? summary.withdrawals.map((request) => (
              <div key={request.id} className="rounded-2xl border-2 border-light-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-text-primary">
                    {formatInteger(request.amount)} DPMM
                  </span>
                  <span className="rounded-full bg-light-bg-alt px-3 py-1 text-xs font-black text-text-secondary">
                    {withdrawalStatusLabel(request.status)}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-text-tertiary">
                  {new Date(request.requested_at).toLocaleString('ko-KR')}
                </div>
                {request.user_note && (
                  <div className="mt-2 text-xs font-semibold text-text-secondary">
                    {request.user_note}
                  </div>
                )}
              </div>
            )) : (
              <p className="text-sm font-semibold text-text-secondary">
                출금 요청 내역이 없습니다.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
