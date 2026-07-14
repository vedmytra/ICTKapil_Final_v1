# IctKapil — Forex Trading Cockpit

Next.js 15 · TypeScript · Tailwind · Firebase (Auth, Firestore, Storage).

## What this is

This is the merged, final build combining:
- **ictkapil-phase1.zip** — the Next.js App Router scaffold: auth pages (login/signup/forgot-password),
  session-cookie middleware, protected routes, sidebar shell, dashboard stat cards, UI kit, Firestore/Storage rules.
- **trading-journal Phase 2 → Phase 5** (uploaded as two zips of the same Vite/React app at two points in time;
  the later one — "phase1-5" — is the complete version and is what was ported) — a fully working Trade Journal,
  Backtesting module, Strategy Library, Calculators (Lot/Pip/Position/Risk), News Calendar, Session Clock, and Analytics.

The two were **different frameworks** (Next.js App Router vs. Vite + react-router), so this wasn't a plain file merge —
each Vite page/component was ported into the Next.js route structure, with framework-specific code (routing, the
old `AuthContext`, `Sidebar`, `Login`, `main.tsx`) dropped in favor of the equivalent, already-working Next.js code.

> Note: only 3 zip files were actually provided ("Phase 3" and "Phase 4" zips referenced in the request were not
> among the uploads). The instructions below reflect what was actually merged.

## Feature → route map

| Route | Source | Notes |
|---|---|---|
| `/dashboard` | Next scaffold + ported Analytics | Stat cards + equity curve (scaffold), plus PnL-by-strategy/symbol charts (ported from Phase 5 Analytics) |
| `/journal` | Ported Phase 5 `Journal.tsx` | Full CRUD, CSV import/export, screenshot upload; added a Table/Calendar toggle (folds in Phase 5's `CalendarView.tsx`) |
| `/backtesting` | Ported Phase 5 `Backtesting.tsx` | Full CRUD, charts, screenshot upload |
| `/calculator` | Ported Phase 5 `Calculators.tsx` | Lot Size / Pip Value / Position Size / Risk-Reward tabs |
| `/calendar` | Ported Phase 5 `Market.tsx` | News Calendar + Session Clock tabs (renamed from "Market" to match the scaffold's existing "News Calendar" stub) |
| `/notes` | Ported Phase 5 `StrategyLibrary.tsx` | **Repurposed**: the scaffold's "Notes" stub had no Phase 5 counterpart; the fully-built Strategy Library had no scaffold route. Sidebar label changed to "Strategy Library" accordingly. |
| `/settings` | Net new | No Phase 5 source existed; minimal profile-editing panel added so the route isn't a dead stub |
| `/login`, `/signup`, `/forgot-password` | Kept from scaffold, unchanged | Already fully working against Firebase Auth; Phase 5's own `Login.tsx` (react-router based) was not used |

## Key merge/conflict decisions

- **Trade data model**: the scaffold's dashboard originally read a `journal` collection typed as `JournalTrade`.
  The ported Journal/Backtesting features use a different, more complete `Trade`/`BacktestEntry` model (in
  `types/trade.ts`) against `trades`/`backtests`/`strategies` collections. Keeping both would mean the dashboard
  never shows real data, so `hooks/use-dashboard-stats.ts` and `components/dashboard/equity-curve.tsx` were
  adapted to read from the same `trades` collection the Journal page writes to. The old `JournalTrade` type was
  removed from `types/firestore.ts` (see the comment left there).
- **Firebase client**: two different Firebase init files existed (`@/lib/firebase` in the Vite code,
  `@/lib/firebase/client` in the scaffold). The scaffold's version was kept (it's HMR/SSR-safe), and
  `lib/firebase.ts` is now a one-line re-export shim so none of the ported service files needed edits.
  Environment variables must therefore use `NEXT_PUBLIC_FIREBASE_*` (not the old `VITE_FIREBASE_*`).
  Firestore rules were extended (not replaced) to also cover `trades`/`strategies`/`backtests`, which key
  ownership by a `userId` field rather than the scaffold's `uid` convention — both are handled explicitly.
- **Tailwind theme**: the ported components style against a `surface`/`surface-light`/`surface-border` palette
  (Vite side) rather than the scaffold's `bg-0/1/2/3` ember palette. Both are now defined in `tailwind.config.ts`
  so no ported className strings needed rewriting.

## What was NOT independently verified

This merge was done by static code review and import/type-consistency checks — **not** a live build, because
the assistant's sandbox has no network access (`npm install` can't run) and no Firebase/Vercel credentials to
test against. Before treating this as production-ready:

1. `npm install`
2. `npm run build` — fix any TypeScript errors that only surface once real type packages are installed
3. Create a Firebase project, enable Auth (Email/Password + Google), Firestore, and Storage; fill in `.env.local`
   from `.env.local.example`; deploy `firestore.rules` and `storage.rules`
4. Test sign-up/login, then exercise each route above against your real Firebase project
5. Deploy to Vercel and confirm environment variables are set there too

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase config
npm run dev
```
