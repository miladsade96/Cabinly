# Cabinly staff dashboard

A React/Vite staff application for cabins, bookings, check-in/out, hotel settings and staff invitations. It uses React Query and Supabase. This is separate from the `next_cabinly` guest website prototype.

## Run without real services

Use Node 22.14 or newer (Node 22 is recorded in `.nvmrc`).

```sh
npm ci
npm run preview:offline
```

Open http://127.0.0.1:4183. The preview imports the real application and substitutes only its service adapters with in-memory sample data. It is visibly labeled, sends no emails, and resets data on refresh. It includes an example administrator for reviewing layouts and flows. It is a separate test entry point; production has no preview sign-in bypass.

For the normal app, use `npm run dev`. Without service configuration it displays a setup notice instead of querying an old hardcoded database.

## Connect a development Supabase project

1. Copy `.env.example` to `.env.local`. Set the project URL and a browser-safe publishable key, or a legacy anon key. Restart Vite after changing them. Never use a secret or service-role key in a `VITE_` variable.
2. Use a **development copy** of the existing database with `cabins`, `bookings`, `guests` and `settings` tables and their existing relationships. This repository does not contain a full initial database schema. The settings row must have ID `1`. Cabin fields include `name`, `description`, `maxCapacity`, `regularPrice`, `discount`, `image`; bookings join cabins and guests.
3. Review and apply `supabase/migrations/202611190001_staff_access.sql` to that development database. It enables RLS and adds restrictive staff guards, including storage write guards. It deliberately blocks legacy public policies for these tables. This migration was **not applied or integration-tested against a real database** during this repair.
4. Create public photo buckets `cabin-images` and `avatars`, if absent. Avatar objects use `<user-id>/<random-file-name>`. Public buckets are for display photos, never guest identity documents. Existing rows may need their image URLs migrated when changing Supabase projects.
5. Create the initial administrator through the trusted Supabase administration interface/API with `app_metadata.app_role` set to `admin`. Other authorized users require `staff` or `admin`. Editable `user_metadata` cannot grant staff access. Sign in again after assigning a role to refresh the JWT. Do not enable public self-registration as a substitute for staff provisioning.
6. Confirm directly with anon, ordinary authenticated, staff and administrator sessions that database/storage rules enforce the intended access. Client validation and route guards supplement RLS; they cannot replace it. Staff currently have CRUD access to the management tables, while staff invitations require an administrator.

## Staff invitations

The Users page invokes the `invite-staff` Edge Function, rather than creating a new client session with `signUp`.

- Deploy `supabase/functions/invite-staff` to the development project with the Supabase CLI/dashboard.
- Set its server-only `STAFF_SITE_URL` to the exact frontend origin, for example `http://localhost:5173`. Requests from another origin are rejected. Use that same origin in the browser.
- The function uses server-provided `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key stays on the server.
- Add `<STAFF_SITE_URL>/account` to the allowed Auth redirect URLs and configure invitation email delivery. The function verifies the caller and requires trusted administrator metadata before inviting a user and assigning the staff role.
- Test the full email acceptance, session refresh, password setup and staff access flow before enabling invitations for real users. If role assignment fails after the email has been sent, the invited account requires an administrator to finish provisioning; do not treat it as completed.

No real database writes, invitations or emails were sent during this repair.

## Repairs

- Removed embedded Supabase configuration and the automatic error-reload loop; added setup and retry states.
- Added trusted staff/admin checks, session cache cleanup, server-side staff invitations and an RLS migration to review.
- Fixed cabin upload ordering and rollback: upload failure cannot delete an existing cabin. Editing without a new photo retains the existing photo; duplicates reuse it.
- Validated IDs, input fields, prices, discounts, image types/sizes, settings and booking status transitions. Stale booking status changes are rejected.
- Corrected booking page offsets, sorting/filtering and prefetch effects.
- Added explicit settings saves, zero-price breakfast support, payment confirmation fixes and correct disabled/loading buttons.
- Improved mobile layout, scrollable tables, dialog focus/Escape handling, input labels, dark mode and safe storage reads.
- Updated dependencies/tooling, migrated Storybook configuration and split production routes into smaller bundles.

## Checks and their limits

```sh
npm test
npm run lint
npm run build
npm audit
npm run build-storybook
```

On 2026-11-19: 39 automated tests passed, including service validation/rollback, invitation authorization, UI behavior and payment confirmation. Lint, production build and Storybook build passed. npm audit reported 0 vulnerabilities in the installed dependency tree. Storybook's documentation bundle still emits a size advisory; application routes are split into separate chunks.

Browser QA covered desktop and 390px mobile layouts, light/dark mode, cabin editing without photo replacement, settings validation/save, the second booking page, booking details, check-in and the production setup notice. The dashboard screenshots use **offline sample data** and are stored in the local, ignored `qa` folder.

Legacy Cypress/Playwright suites require a configured, disposable service environment and were not run. Unit/service mocks and the offline browser preview do not prove real Supabase policies, storage, concurrency or email delivery. Those integration checks remain necessary before production use.

## Hosting

`npm run build` outputs `dist`. `netlify.toml` includes a SPA fallback so routes such as `/bookings/8` work after refresh. Configure the browser-safe environment variables at build time, then rebuild. The Edge Function and database migration deploy separately from Netlify. No deployment was performed.

Changes are on `codex/fix-cabinly`.
