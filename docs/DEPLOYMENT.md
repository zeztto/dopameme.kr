# Dopameme Docker/Vultr Deployment

## Target

- Repository: `zeztto/dopameme.kr`
- Service name: `dopameme-kr`
- Deploy host: `p1zza-2nd`
- Deploy path: `/opt/dopameme-kr`
- Domain: `dopameme.kr`
- Compose file: `compose.yml`
- Caddy file: `infra/caddy/dopameme-kr.caddy`
- Health URL: `https://dopameme.kr/api/health`

## Runtime Stack

- Next.js standalone server in Docker
- Prisma ORM with PostgreSQL
- Docker Compose managed app, migration, and PostgreSQL services
- Caddy gateway reverse proxy
- Central p1zza self-hosted runner workflow

## Required Server Env

Create `/opt/dopameme-kr/.env.production` on `p1zza-2nd`.
Use `.env.example` as the template and replace all placeholder values.

Required values:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SOLANA_CLUSTER`
- `SOLANA_RPC_URL`
- `DPMM_MINT_ADDRESS`
- `DPMM_TOKEN_PROGRAM`
- `DPMM_DECIMALS`
- `DPMM_TOKEN_NAME`
- `DPMM_TOKEN_SYMBOL`
- `DPMM_WALLET_LINK_DOMAIN`
- `DPMM_EXPLORER_URL`
- `DPMM_MIN_WITHDRAWAL_AMOUNT`
- `DPMM_TREASURY_WALLET_ADDRESS` (optional public address)
- `B2B_API_KEYS` (optional comma-separated API keys)
- `WEB_PUSH_VAPID_PUBLIC_KEY` (optional PWA push public key)
- `WEB_PUSH_VAPID_PRIVATE_KEY` (optional PWA push private key)
- `WEB_PUSH_CONTACT` (optional VAPID subject, `mailto:` or HTTPS URL)
- `WEBAUTHN_ORIGIN` (optional, defaults from `NEXTAUTH_URL`)
- `WEBAUTHN_RP_ID` (optional, defaults from `NEXTAUTH_URL` hostname)
- `NODE_ENV`
- `PORT`
- `HOSTNAME`

## First Deploy Dispatch

`DATABASE_URL` must use the Docker service host `postgres` and a URL-encoded
password. For example, `p@ss#word` must be written as `p%40ss%23word` inside
the connection string.

If PWA push notifications are enabled, generate VAPID keys before deployment:

```bash
npx web-push generate-vapid-keys
```

Run from any machine authenticated with GitHub CLI:

```bash
gh workflow run "Deploy service with Docker Compose" \
  --repo zeztto/p1zza-1st-self-hosted-runner \
  --ref main \
  -f repository=zeztto/dopameme.kr \
  -f ref=main \
  -f deploy_host=p1zza-2nd \
  -f service_name=dopameme-kr \
  -f compose_files=compose.yml \
  -f caddy_site_file=infra/caddy/dopameme-kr.caddy \
  -f health_url=https://dopameme.kr/api/health
```

## Smoke Test

Run after deployment, or against a local server with the same database-backed
routes available:

```bash
npm run smoke -- --base-url https://dopameme.kr
```

The smoke test checks health/database readiness, public pages, protected-page
redirects, and anonymous API auth boundaries without requiring extra
dependencies.

## React Native Shell

The native app scaffold lives in `mobile/` and is not built by the Docker
deployment. It loads only the production web origin, `https://dopameme.kr`,
through Expo WebView.

```bash
cd mobile
npm install
npm run ios
npm run android
```

Before app-store distribution, confirm native icon/splash assets, privacy
metadata, push notification entitlements, and WebView passkey fallback behavior
per target OS version.

## Notes

- Real env files are not committed and are not synced by the deploy workflow.
- `migrate` runs `prisma migrate deploy` before seed/app startup.
- Migration `0008_add_dpmm_ledger_transactions` backfills opening ledger rows
  for existing non-zero DPMM balances, then all new balance mutations are
  recorded by application transactions.
- `seed` creates the initial admin user, fee-burn account, and mock markets idempotently.
- Keep `AUTH_URL` and `NEXTAUTH_URL` set to `https://dopameme.kr` in production.
- Solana values are public token/RPC settings only. Do not place mint authority,
  keypair, seed phrase, or private key values in the app environment.
- The current withdrawal flow is manual-signature operation: admin records a
  Solana transaction signature after treasury transfer. The app validates the
  confirmed transaction's DPMM mint, destination wallet, and amount through the
  configured RPC. If `DPMM_TREASURY_WALLET_ADDRESS` is set, the source wallet
  delta is also validated. No treasury private key is required in this app.
