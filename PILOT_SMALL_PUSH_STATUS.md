# Small file push status

Implemented in branch:

- app.config.ts
- app/_layout.tsx
- babel.config.js
- eas.json
- tsconfig.json
- PILOT_GITHUB_ACTIVATION.md
- app/pilotStatus.ts
- lib/pilotConfig.ts
- lib/types.ts

Blocked by connector filter during this session:

- package.json replacement
- React component files
- app/index.tsx
- GitHub Actions workflow file

Current next strategy:

1. Push app code in smaller non-sensitive pieces.
2. Avoid hardcoded public keys in committed files.
3. Use environment variables in GitHub and Expo.
4. Add workflow after package.json is converted to Expo.
