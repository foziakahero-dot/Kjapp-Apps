# KJAPP Pilot Supabase Integration Notes

This patch connects the Expo/React Native app to the existing Supabase project `kjapp-pilot`.

## Supabase project

- Project ref: `pkglucrwmghtghuynnnp`
- API URL: `https://pkglucrwmghtghuynnnp.supabase.co`
- Region: `eu-north-1`

## What changed

- Added Supabase client in `lib/supabase/client.ts`.
- Added KJAPP data API in `lib/supabase/kjapp-api.ts`.
- Replaced demo OTP with Supabase phone OTP flow.
- Replaced local profile creation with `profiles` + `drivers` writes.
- Replaced demo ride creation with insert into `public.rides`.
- Driver screen now reads open `requested` rides from Supabase and accepts rides by assigning `driver_id`.
- Trip history now reads authenticated rider rides from Supabase.
- Added route guard to prevent entering dashboard without onboarding/auth.
- Added location permissions to Expo config.
- Removed unsafe anonymous ride policies in Supabase and added driver status protection.

## Required install

Run:

```bash
pnpm install
```

or, at minimum:

```bash
pnpm add @supabase/supabase-js
```

The lockfile was not regenerated in this environment.

## Required Supabase dashboard setup before real pilot

1. Enable Phone provider in Authentication.
2. Configure SMS provider/OTP settings for Norway.
3. Approve real drivers from admin/flåteportal by changing `drivers.status` from `pending` to `approved`.
4. Add Stripe PaymentSheet through a server-side endpoint/Edge Function before taking real payments.
5. Move AI calls behind Supabase Edge Function before production.
