# KJAPP Pilot GitHub Activation

Status: GitHub is activated for the KJAPP pilot workstream.

## Repository

`foziakahero-dot/Kjapp-Apps`

## Active pilot branch

`pilot/expo-supabase-ready-20260525`

## Source package

The current working source package is the locally generated Expo/Supabase pilot package:

`kjapp-pilot-ready-today.zip`

It contains:

- Expo Router mobile app
- Supabase Auth OTP connection
- Supabase rides flow
- driver online/offline flow
- driver ride acceptance/status flow
- Supabase Edge Function `kjapp-ai`
- EAS Android/iOS build config
- GitHub Actions build workflow
- Vercel config for web/static preview

## Supabase project

- Project name: `kjapp-pilot`
- Ref: `pkglucrwmghtghuynnnp`
- Region: `eu-north-1`

## Required secrets before APK/iOS build

Set these in GitHub → Settings → Secrets and variables → Actions:

```text
EXPO_TOKEN
```

Optional later:

```text
OPENAI_API_KEY
STRIPE_SECRET_KEY
SUPABASE_ACCESS_TOKEN
```

## Pilot build command

After importing the ZIP contents into this branch:

```bash
npm ci
npm run check
npm run web:build
npm run eas:android:apk
```

## Pilot acceptance checklist

- Customer can login by OTP.
- Customer can create ride request.
- Driver can login and go online.
- Driver can see open ride requests.
- Driver can accept ride.
- Customer sees accepted ride status.
- Driver can update ride status: on the way, arrived, in progress, completed.
- AI assistant responds through Supabase Edge Function.
- No raw card data is collected in-app.

## Important note

This branch was created so pilot work can continue safely without breaking the existing main branch. The next step is to import the Expo source files from the generated ZIP into this branch, then run GitHub Actions/EAS builds.
