export type SolanaCluster = 'devnet' | 'mainnet-beta'
export type TokenProgramKind = 'spl-token' | 'token-2022'

export type SolanaTokenConfig = {
  cluster: SolanaCluster
  rpcUrl: string
  mint: string
  tokenProgram: TokenProgramKind
  tokenProgramId: string
  decimals: number
  tokenName: string
  tokenSymbol: string
  linkDomain: string
  explorerUrl: string
  treasuryWalletAddress: string | null
}

const DEFAULT_CLUSTER: SolanaCluster = 'devnet'
const DEFAULT_RPC_URL = 'https://api.devnet.solana.com'
const DEFAULT_DPMM_MINT = '6fQ3D623QNsskcsdwHvUNgutFp1ptbQWUAYSoLFZTeyc'
const DEFAULT_DPMM_DECIMALS = 9
const DEFAULT_DPMM_TOKEN_NAME = 'Dopameme'
const DEFAULT_DPMM_TOKEN_SYMBOL = 'DPMM'
const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

function normalizeCluster(value: string | undefined): SolanaCluster {
  return value === 'mainnet-beta' ? 'mainnet-beta' : DEFAULT_CLUSTER
}

function normalizeTokenProgram(value: string | undefined): TokenProgramKind {
  return value === 'spl-token' ? 'spl-token' : 'token-2022'
}

function normalizeDecimals(value: string | undefined): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 18) {
    return DEFAULT_DPMM_DECIMALS
  }
  return parsed
}

function getLinkDomain(): string {
  const configured = process.env.DPMM_WALLET_LINK_DOMAIN?.trim()
  if (configured) return configured

  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
  if (authUrl) {
    try {
      return new URL(authUrl).host
    } catch {
      return 'dopameme.kr'
    }
  }

  return 'dopameme.kr'
}

export function getSolanaTokenConfig(): SolanaTokenConfig {
  const cluster = normalizeCluster(process.env.SOLANA_CLUSTER)
  const tokenProgram = normalizeTokenProgram(process.env.DPMM_TOKEN_PROGRAM)

  return {
    cluster,
    rpcUrl: process.env.SOLANA_RPC_URL?.trim() || DEFAULT_RPC_URL,
    mint: process.env.DPMM_MINT_ADDRESS?.trim() || DEFAULT_DPMM_MINT,
    tokenProgram,
    tokenProgramId:
      tokenProgram === 'token-2022' ? TOKEN_2022_PROGRAM_ID : SPL_TOKEN_PROGRAM_ID,
    decimals: normalizeDecimals(process.env.DPMM_DECIMALS),
    tokenName: process.env.DPMM_TOKEN_NAME?.trim() || DEFAULT_DPMM_TOKEN_NAME,
    tokenSymbol: process.env.DPMM_TOKEN_SYMBOL?.trim() || DEFAULT_DPMM_TOKEN_SYMBOL,
    linkDomain: getLinkDomain(),
    explorerUrl:
      process.env.DPMM_EXPLORER_URL?.trim() || 'https://explorer.solana.com',
    treasuryWalletAddress:
      process.env.DPMM_TREASURY_WALLET_ADDRESS?.trim() || null,
  }
}

export function buildExplorerAddressUrl(address: string): string {
  const config = getSolanaTokenConfig()
  const suffix = config.cluster === 'devnet' ? '?cluster=devnet' : ''
  return `${config.explorerUrl}/address/${encodeURIComponent(address)}${suffix}`
}
