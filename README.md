# KJAPP Apps — Design 5 Ice Master Repo

Clean implementation repo for KJAPP Smart AI Taxi using the uploaded Stitch Design 5 Ice package as the locked visual source.

## Status

- Next.js app foundation
- Mobile-first shell: 100svh, safe-area support, max-width 430px
- Customer flow: Intro, Login, OTP, AI Home, Locating, Booking, Live Ride, Receipt
- Driver flow: Driver Home, Trip Request, Active Navigation
- Admin/support flow: Trip History, Profile Wallet, Notifications, AI Settings, Help Center
- Supabase environment names prepared
- Capacitor Android path prepared
- GitHub Actions prepared for web build and Android debug APK

## Locked source policy

The app follows the uploaded Design 5 documents and locked folders:

- official_design_5_master_screens.md
- kjapp_final_project_inventory.md
- kjapp_technical_handover_guide.md
- kjapp_react_implementation_blueprint.md
- kjapp_frontend_architecture_system.md

This repo is for Design 5 Ice / AI Mobility OS only.

## Run locally

npm install
npm run dev

## Build

npm run build

## Mobile export

KJAPP_STATIC_EXPORT=true npm run build
npx cap add android
npx cap sync android

## Next phases

1. Convert each locked Stitch HTML screen into reusable React components.
2. Add Supabase typed client and generated database types.
3. Connect auth, profile, trips and wallet.
4. Add realtime driver location.
5. Add native Android signing.
6. Prepare iOS/TestFlight on macOS/Xcode.
