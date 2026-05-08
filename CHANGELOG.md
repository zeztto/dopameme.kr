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
