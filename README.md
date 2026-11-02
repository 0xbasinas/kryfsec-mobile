# CyberJourney mobile

Phone companion for the CyberJourney desktop app. Built with Expo (SDK 58), Expo Router and TypeScript.

Your data is saved on the phone (AsyncStorage). Sync with the desktop app is not built yet.

## Run it

```bash
cd mobile
npm install
npx expo start
```

### On an Android phone (for example a Redmi)

1. Install **Expo Go** from the Play Store. The app targets SDK 58, which the latest Expo Go supports. If Expo Go moves to a newer SDK, upgrade with `npx expo install expo@latest --fix`.
2. Put the phone and the computer on the same Wi-Fi (or the same Tailscale network, then run `npx expo start --tunnel` or use the Tailscale IP).
3. Scan the QR code from `npx expo start` with Expo Go.

On Xiaomi / HyperOS, allow Expo Go to "Display pop-up windows while running in the background" and turn off battery saver for it if it will not reload.

### Install as a normal app (APK)

```bash
npm i -g eas-cli
eas build -p android --profile preview   # needs a free Expo account
```

Or build locally with `npx expo run:android` (needs the Android SDK).

## Scripts

- `npm run typecheck` – TypeScript check
- `npm run lint` – Expo lint
- `npm run android` / `npm run web`

## Layout

- `src/app` – screens (Expo Router). Tabs: Home, Journal, Roadmap, Labs, More.
- `src/components` – UI pieces, charts, markdown renderer, tab bar.
- `src/lib` – types, sample data and stats (shared with the desktop app), store.
- `src/theme` – colors for dark and light, same as the desktop app.
- `screenshots/` – shots from the Android emulator.
