# Dopameme Design System

## Direction

Dopameme keeps a bright prediction-game visual language: white surfaces, strong blue/red decision colors, high-contrast typography, thick borders, large rounded panels, and confident motion. The token system preserves that feel while making future UI changes deterministic.

## Token Tiers

### Tier 1: Primitive

Primitive tokens are raw values. Do not use them directly in components unless defining a semantic token.

- Color: `--primitive-blue-600`, `--primitive-red-600`, `--primitive-emerald-500`
- Surface neutrals: `--primitive-white`, `--primitive-slate-50`, `--primitive-slate-200`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill`
- Shadow: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-brand`
- Motion: `--duration-fast`, `--duration-normal`, `--duration-slow`, `--ease-standard`

### Tier 2: Semantic

Semantic tokens describe product meaning. New pages and components should prefer these through Tailwind aliases.

- Brand: `--brand-primary`, `--brand-secondary`
- Content: `--content-primary`, `--content-secondary`, `--content-tertiary`, `--content-inverse`
- Surface: `--surface-canvas`, `--surface-muted`, `--surface-raised`
- Border: `--border-default`, `--border-muted`, `--border-strong`
- Status/accent: `--status-success`, `--accent-premium`, `--accent-data`, `--accent-attention`

Tailwind compatibility aliases:

- `primary` → `--brand-primary`
- `secondary` → `--brand-secondary`
- `success` → `--status-success`
- `text-primary` → `--content-primary`
- `text-secondary` → `--content-secondary`
- `text-tertiary` → `--content-tertiary`
- `light-bg`, `light-bg-alt`, `light-card`, `light-border` → surface/border tokens

### Tier 3: Component

Component tokens define reusable UI decisions.

- Header: `--component-header-bg`, `--component-header-border`
- Card: `--component-card-bg`, `--component-card-border`, `--component-card-radius`
- Button: `--component-button-primary-bg`, `--component-button-secondary-bg`, `--component-button-radius`
- Form: `--component-field-border`, `--component-focus-ring`
- Market: `--component-market-yes`, `--component-market-no`, `--component-market-win`

## Usage Rules

- Keep existing Tailwind aliases (`bg-primary`, `text-secondary`, `border-light-border`) for app code.
- Add new color intent through `app/globals.css` first, then expose it in `tailwind.config.ts` only when it is needed in class names.
- Prefer semantic names over raw palette names in UI code.
- Use `border-3` for Dopameme cards and major feature panels.
- Use pill radius for primary actions and badges.
- Use red for high-energy action or no-side market meaning, blue for trust/default action, green for wins/success.
- Respect `prefers-reduced-motion`; global reduced-motion handling is defined in `app/globals.css`.
