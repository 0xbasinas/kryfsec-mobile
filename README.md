# CyberJourney mobile

Phone companion for the [CyberJourney desktop app](https://github.com/0xbasinas/cyberjourney-desktop). Built with Expo (SDK 58), Expo Router and TypeScript.

Your data is saved on the phone (AsyncStorage). Sync with the desktop app is not built yet.

Run the commands below from the repo root.

## Run it

The note editor uses [react-native-enriched-markdown](https://github.com/software-mansion/enriched-markdown),
which has native code. That means **Expo Go can not run this app any more**. You need a
development build (your own copy of the app with the native parts inside) or a normal APK.

### Development build on an Android phone (for example a Redmi)

Needs the Android SDK and JDK 17 on the computer.

```bash
npm install
npx expo run:android            # builds the dev app and installs it on the phone over USB
npm start                       # later: start Metro and open the dev app
```

With the phone on the same Wi-Fi (or Tailscale), the dev app finds Metro from the QR code
or the URL shown by `npm start`. Over USB, run `adb reverse tcp:8081 tcp:8081` first.

On Xiaomi / HyperOS, allow the app to "Display pop-up windows while running in the background"
and turn off battery saver for it if it will not reload.

### Install as a normal app (APK)

Local build, no account needed:

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

Or in the cloud with EAS: `npm i -g eas-cli && eas build -p android --profile preview` (free Expo account).

The `android/` and `ios/` folders are made by `npx expo prebuild` and are not committed.

## Scripts

- `npm run typecheck` – TypeScript check
- `npm run lint` – Expo lint
- `npm run android` – build and run the dev app (`expo run:android`)
- `npm start` – Metro for the dev app

## Layout

- `src/app` – screens (Expo Router). Tabs: Home, Journal, Roadmap, Labs, More.
- `src/components` – UI pieces, charts, tab bar, note editor (`note-editor.tsx`) and note viewer (`note-view.tsx`).
- `src/lib` – types, sample data and stats (shared with the desktop app), store, note blocks (`note-blocks.ts`).
- `src/theme` – colors for dark and light, same as the desktop app.
- `screenshots/` – shots from the Android emulator.

## Notes editor

- Text, headings, bold, italic, strike, links and lists are edited in the native rich input from enriched-markdown.
- That input does not support code blocks, checklists or quotes, so those are their own blocks
  (type ```` ``` ````, `[]` or `>` on an empty line, or use the toolbar).
- Inline code stays as `` `text` `` with its backticks while you edit, and shows as code when you read.
- Tables are kept as plain markdown text while editing.
- Notes are saved as markdown, so they open the same way in the desktop app.

## Licenses

MIT – see [LICENSE](LICENSE). Third-party packages: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
