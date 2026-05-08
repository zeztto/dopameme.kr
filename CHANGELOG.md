# Changelog

## Unreleased

- Migrated the data access layer from Drizzle ORM to Prisma ORM.
- Added Prisma schema and initial migration for the existing prediction market domain.
- Added Docker, Docker Compose, Caddy, and health-check assets for p1zza/Vultr deployment.
- Updated deployment documentation and environment variable templates.
- Added production seed flow for admin bootstrap, fee-burn account, and mock markets.
- Hardened prediction placement and market resolution transactions against duplicate/race conditions.
- Added hidden-market enforcement, signup validation, login/signup rate limiting, and prediction uniqueness.
- Added DB-backed health readiness checks and bounded rate-limit bucket cleanup.
- Hardened production proxy IP handling for auth rate limits.
- Added a three-tier frontend design token system with Tailwind compatibility aliases.
- Added an admin backoffice shell with dashboard metrics, market management, and mock-market source labeling.
- Hardened admin market deletion rules and optimized backoffice dashboard aggregation queries.
- Added admin member management with role/status controls, JWT session invalidation, and audited DPMM balance adjustments.
- Added Solana devnet DPMM wallet linking and Token-2022 balance lookup.
- Added ledger-based DPMM withdrawal requests with admin approval, user-facing rejection notes, and RPC transaction validation.
- Added append-only DPMM ledger transactions for signup, predictions, settlement, admin adjustments, and withdrawal flows.
