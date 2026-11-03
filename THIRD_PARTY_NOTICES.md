# Third-party notices

kryfsec mobile is MIT licensed (see LICENSE). It is built with the open-source software below.

The Expo companion app reuses kryfsec's own code (data model, sample data,
stats and palette from the desktop app). The charts, heatmap, tab bar and the
note editor blocks (code, checklist, quote) were written for this project.
Notes are shown and edited with react-native-enriched-markdown (below).
No third-party source code is copied.
The project was started from the `create-expo-app` default template
(MIT, Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)); the template
screens and images were removed.

Main packages used by the mobile app:

| Package | Version | License |
|---|---|---|
| [expo](https://github.com/expo/expo) (SDK 58) and expo-* modules | 58.x | MIT |
| [expo-router](https://github.com/expo/expo/tree/main/packages/expo-router) | 58.x | MIT |
| [react-native](https://github.com/facebook/react-native) | 0.88.1 | MIT |
| [react](https://github.com/facebook/react) | 19.3.0 | MIT |
| [react-native-svg](https://github.com/software-mansion/react-native-svg) | 15.16.0 | MIT |
| [react-native-safe-area-context](https://github.com/AppAndFlow/react-native-safe-area-context) | 5.x | MIT |
| [react-native-screens](https://github.com/software-mansion/react-native-screens) | 4.x | MIT |
| [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) / react-native-worklets | 4.x / 0.13 | MIT |
| [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) | 3.x | MIT |
| [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) | 2.2.0 | MIT |
| [@tabler/icons-react-native](https://github.com/tabler/tabler-icons) | 3.50.0 | MIT |
| [zustand](https://github.com/pmndrs/zustand) | 5.0.16 | MIT |
| [date-fns](https://github.com/date-fns/date-fns) | 4.4.0 | MIT |
| [react-native-enriched-markdown](https://github.com/software-mansion/enriched-markdown) | 1.1.1 | MIT (Copyright (c) 2025 Software Mansion) |
| [expo-blur](https://github.com/expo/expo/tree/main/packages/expo-blur) | 58.0.x | MIT |
| [react-native-keyboard-controller](https://github.com/kirillzyusko/react-native-keyboard-controller) | 1.22.7 | MIT (Copyright (c) 2021 Kiryl Ziusko) |
| [expo-dev-client](https://github.com/expo/expo/tree/main/packages/expo-dev-client) (dev builds only) | 58.0.x | MIT |
| [react-native-web](https://github.com/necolas/react-native-web) (web preview only) | 0.21.x | MIT |

react-native-enriched-markdown compiles some open-source C code into the app:

- md4c (Markdown parser), MIT, Copyright (c) 2016-2026 Martin Mitáš.
- tree-sitter runtime (code highlighting), MIT, Copyright (c) 2018 Max Brunsfeld.
  It contains Unicode data tables under the Unicode License (ICU 58 and later),
  Copyright (c) 1991-2019 Unicode, Inc., a permissive license.
- tree-sitter grammars for bash, python, javascript, json, html, c and go
  (MIT, Copyright (c) 2014-2017 Max Brunsfeld) and yaml (MIT, Copyright (c) 2024
  tree-sitter-grammars contributors, Copyright (c) 2019-2021 Ika).
