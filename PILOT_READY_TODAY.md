# KJAPP Pilotklar sprintpakke

Denne pakken gjør appen klar for intern pilotflyt: kunde-login, ekte Supabase-profiler, ride request, sjåfør-feed, sjåfør aksepterer tur, AI via Edge Function fallback, web-safe maps, EAS build-profiler og GitHub Actions.

## Må settes som secrets

Supabase/Expo:
- `EXPO_PUBLIC_SUPABASE_URL=https://pkglucrwmghtghuynnnp.supabase.co`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_fdLxGfKBBMoeOwn4zqif4A_Q_UgrLZb`
- `EXPO_TOKEN` i GitHub Actions for APK/iOS builds
- `OPENAI_API_KEY` i Supabase Edge Function secrets hvis AI skal bruke OpenAI. Uten denne brukes trygg fallback.

## Pilot testflyt

1. Kunde logger inn med norsk telefonnummer.
2. Kunde bestiller tur.
3. Sjåfør logger inn, bruker pilotkode `KJAPP-PILOT-2505`, går online.
4. Sjåfør ser åpen tur og aksepterer.
5. Kundeappen får status via Realtime/polling.

## Build

Android APK:
```bash
npm ci
npm run eas:android:apk
```

iOS preview/TestFlight krever Apple Developer koblet til Expo:
```bash
npm run eas:ios:preview
```

Web/Vercel:
```bash
npm run web:build
```

## Viktig sikkerhetsnotat for intern pilot

For å få intern pilot i gang raskt er midlertidig sjåføraktivering støttet i appen med pilotkode `KJAPP-PILOT-2505`. Dette er OK for lukket test med egne sjåfører, men før offentlig lansering skal dette flyttes til admin/flåteportal med BankID/løyve/kjøreseddel-kontroll.

## Hva som nå er backend-koblet

- `profiles`: ekte brukerprofil etter Supabase OTP.
- `drivers`: sjåførprofil og online/offline-status.
- `rides`: kunde oppretter ride request, sjåfør leser/aksepterer, status oppdateres.
- `kjapp-ai`: Supabase Edge Function deployet med JWT og fallback.
