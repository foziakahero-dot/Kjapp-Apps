# KJAPP - Design Specification

## Design Direction: Nordic Dark Premium + Neon Blue Glow

The app uses a **dark premium background** (#0A0E1A to #0F1629) with **neon-blue glow effects** (#00A3FF, #006DFF), **glassmorphic cards** (rgba(255,255,255,0.06) with blur), and **ice-white text**. The overall feel is ultra-premium, futuristic, Norwegian, and trustworthy.

---

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| Background Dark | #0A0E1A | Main app background |
| Background Soft | #0F1629 | Secondary surfaces |
| Background Card | rgba(255,255,255,0.06) | Glassmorphic cards |
| Card Border | rgba(0,163,255,0.15) | Subtle neon borders |
| Neon Blue | #00A3FF | Primary accent, glow |
| Neon Blue Strong | #006DFF | Buttons, CTA |
| Neon Blue Glow | rgba(0,163,255,0.3) | Shadow/glow effects |
| Text Primary | #FFFFFF | Headings, primary text |
| Text Secondary | #8BA3C7 | Muted/secondary text |
| Text Muted | #4A6180 | Disabled/hint text |
| Success | #00E68A | Confirmations |
| Warning | #FFB020 | Alerts |
| Danger | #FF4757 | Errors |

## Typography

- Font: System (SF Pro on iOS, default on Android)
- Headings: Bold, -0.04em letter-spacing
- Body: Regular, 15-16px
- All text in Norwegian (Bokmål)

## Visual Effects

- **Glassmorphic cards**: backdrop-blur(20px), semi-transparent white bg, neon border
- **Neon glow**: box-shadow with blue glow on interactive elements
- **Gradient buttons**: Linear gradient from #00A3FF to #006DFF
- **Subtle animations**: Fade-in, scale on press, pulse on AI thinking

---

## Screen List

### 1. Intro/Onboarding (3 slides)
- Slide 1: "KJAPP" logo with neon glow animation + tagline "Din AI-drevne taxi"
- Slide 2: "Smart AI bestiller for deg" - illustration of AI chat
- Slide 3: "Trygt. Enkelt. Kjapt." - call to action

### 2. Login/Registration
- Phone number input (Norwegian +47 format)
- SMS verification code
- Name input for new customers
- Only customers can register directly
- Driver access requires admin/fleet owner approval code

### 3. Customer Dashboard (Main)
- **Top bar**: KJAPP logo (neon glow) + Settings gear icon
- **AI Chat bubble**: "Hei! Hvor skal du i dag?" - floating AI assistant
- **Map view**: Full real map (react-native-maps) showing current location
- **Quick booking card**: Pickup + destination with AI suggestions
- **Recent trips**: Last 3 trips as glassmorphic cards
- **Bottom nav**: Hjem, Turer, AI, Profil

### 4. AI Chat Screen (Customer)
- Full-screen chat interface
- AI suggests destinations, estimates fares, gives recommendations
- "Bestill nå" quick action from AI response
- Voice input option
- Norwegian language AI responses

### 5. Ride Selection
- Title: "Velg din tur"
- Route summary on map
- Ride type cards: KJAPP (129kr), KJAPP XL (169kr), KJAPP Premium (249kr)
- Payment method selector
- CTA: "Bekreft tur"

### 6. Live Tracking
- Real-time map with driver location
- Driver info card (name, car, rating)
- ETA countdown
- Action buttons: Melding, Ring, Del tur
- Cancel option

### 7. Settings/Profile (Customer)
- Profile info (name, phone, email)
- **Betalingsmetoder** (Payment methods - Stripe-ready)
  - Add card flow
  - Saved cards list
  - Vipps integration placeholder
- Favorittadresser (Favorite addresses)
- Reisehistorikk (Trip history)
- Språk (Language)
- Hjelp & Support
- Logg ut

### 8. Driver Dashboard
- **Access gate**: "Venter på godkjenning" screen if not approved
- **Active screen**: Current ride request with map
- **AI Assistant**: Route optimization, traffic alerts, earnings tips
- **Earnings card**: Today's earnings summary
- **Toggle online/offline**
- **Navigation**: Full turn-by-turn with real map

---

## Key User Flows

### Customer Booking Flow
1. Open app → Customer Dashboard with map
2. Tap AI chat or "Hvor skal du?" field
3. AI suggests or user types destination
4. Select ride type → See fare estimate
5. Confirm booking → Wait for driver match
6. Live tracking → Ride in progress → Complete → Rate

### Driver Flow
1. Register → "Venter på godkjenning" screen
2. Admin approves → Dashboard unlocks
3. Go online → Receive ride requests
4. Accept → Navigate to pickup → Start ride → Complete

### Settings/Payment Flow
1. Tap gear icon → Settings screen
2. Tap "Betalingsmetoder"
3. Add card (Stripe Elements ready)
4. Card saved for future rides

---

## Architecture Notes

- **Supabase-ready**: All data models designed for Supabase tables
- **OpenAI integration**: Real GPT-4 for AI assistant (via API key)
- **Maps**: react-native-maps with real Google Maps/Apple Maps
- **Stripe-ready**: Payment UI built, ready for Stripe SDK connection
- **State management**: React Context + AsyncStorage for local state
