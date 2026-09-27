# GYM82

Next.js App Router + TypeScript. Responsive Latvian landing page with Archivo headings, Figtree body, supplied GYM82 logos, membership selection, FAQ, email sign-in interface and member dashboard preview.

## Run

```sh
npm ci
npm run dev
npm run build
```

The current preview exports static files to `out/`. Deployment identity lives in `.openai/hosting.json`.

## Current scope

- Pirmais solis: €0 (free workout); Rīts: €24.95 / 12 visits, 05:00–13:00; Aktīvais: €34.95 / 16 visits; Ultra: €44.95 / unlimited, 05:00–24:00.
- Validity period and Full plan access hours are deliberately unspecified until confirmed.
- All four membership detail dialogs and the profile preview work. No purchase, active membership, door access, or persisted account data is simulated.
- Supabase magic-link authentication is implemented conditionally. Add public project URL and anon key from `.env.example`, and configure the exact production origin in Supabase Auth redirect URLs. Supabase is not connected or end-to-end tested yet.
- The member dashboard is currently a preview, including after sign-in. Before production, replace its empty membership display with authenticated database queries and RLS.
- Payments, Sanity CMS, Resend, GitHub remote and custom-domain Cloudflare DNS have not been connected. The Sites source repository is not a GitHub repository.
- Door control remains disabled pending hardware. Future control must be server-side, check authenticated user and verified membership, enforce time/visit rules, rate-limit requests, and log access. Never place a door API secret in the browser.

## Production continuation

Confirm membership validity and Full hours, actual address, gym photos and trainer information. Select payment provider, provision Supabase (RLS-protected profiles, plans, memberships, payments and visits), implement verified payment webhooks, then connect Sanity and Resend server-side. Remove static export for server routes or place trusted server logic in Supabase Edge Functions. Store all service credentials server-side. Do not grant membership based on browser state or checkout redirect.

## Visual assets

- Logo: user-supplied SVG files, originals preserved in `public/assets/`.
- Hero/athlete photo: original AI-generated illustrative photography, not the actual GYM82 facility or staff.
- Gym interior: illustrative Unsplash image by Amine Ben Mohamed, https://unsplash.com/photos/a-gym-filled-with-lots-of-exercise-equipment-hMz9BimiFRQ . Replace with actual GYM82 photography for launch.
- Fonts: Google Fonts, Archivo and Figtree.

## Latest interface revision

- Removed em dashes, section numbering and short fragmented slogans; navigation uses the supplied logo without a duplicate wordmark.
- Animated strip: SPĒKS, DISCIPLĪNA, IZTURĪBA, REZULTĀTS. Respects reduced-motion preferences.
- Added a student discount announcement, prominent mobile profile button and expanded footer.
- Three trainer cards use the user-supplied temporary name Jānis and +371 22 33 44 55. Replace these with confirmed details before launch.
- Trainer form validates contact details and requested date/time, prepares an editable-by-form WhatsApp message and offers a telephone link. A reservation is not confirmed automatically; the customer sends the message in WhatsApp and agrees on availability with the trainer. No booking data is stored by this preview.

## Supabase

- Project: GYM82 (eu-west-2), linked to GitHub `nlzbaltic/gym82`. Migrations in `supabase/migrations/` run on push to `main`.
- `profiles` table: created automatically on sign-up; RLS lets each user read and edit only their own name, phone and student flag.
- Cloudflare build variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Auth: email + password (sign up with name, sign in, password reset via email link). Supabase Auth → Minimum password length should be 8.
- `visits` table: one row per door opening, written only server-side (future door Edge Function with service role). `my_visit_stats()` returns trainings in the last year (distinct Riga days) and the last visit for the member dashboard.

## Pages and membership flow (2026-09-27)

- Routes: `/` (landing), `/autorizacija`, `/registracija`, `/atjaunot-paroli`, `/mans-profils`. Shared header/footer in `app/layout.tsx`; auth state in `components/AuthProvider.tsx` (session persisted in localStorage, members stay signed in).
- Plan buttons on the landing page lead to `/registracija?abonements=<slug>` (or straight to the profile when signed in); the profile opens the activation sheet for that plan.
- `supabase/migrations/20260927100000_memberships.sql`: `plans`, `discount_codes` (seed `SKOLENS20` = 20%), `memberships`, `check_discount()`, `purchase_membership()` and `open_door()`.
- NO PAYMENTS: `purchase_membership()` activates immediately for free. Before launch it must create a pending membership activated only by a verified payment webhook.
- Assumptions to confirm: validity 30 days (Pirmais solis 14 days, once per member); Aktīvais access 05:00–24:00.
- `open_door()` checks the active membership, access hours and a 10 s rate limit, uses one visit on the first opening of the day and logs the visit. The door hardware call is not connected yet.
- Light theme: `data-theme` on `<html>`, saved in localStorage (`gym82-theme`), default dark. The light overrides at the end of `app/globals.css` are generated by `scripts/light-theme.py`; re-run it after changing colours.
- Waze: `public/assets/waze.svg` is a neutral placeholder pin; replace it with the official Waze logo file. Destination is `Smiltene` until the address is confirmed (`WAZE_URL` in `components/SiteHeader.tsx`).
