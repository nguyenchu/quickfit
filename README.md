# QuickFit

A cross-platform workout companion built with **React Native + Expo** — browse a
training program, open any session, and get hands-free spoken guidance while you
train. Runs on iOS, Android and web from a single codebase.

## Features

- **Program-based training** — a structured home workout program with per-session detail views
- **Hands-free guidance** — spoken cues via `expo-speech` so you don't need to look at the screen mid-set
- **Native-feel UI** — modern iOS glass effects (`expo-glass-effect`, `@expo/ui`) and a shared theme
- **Truly cross-platform** — one codebase targets iOS, Android and web (`react-native-web`)

## Tech stack

| Area        | Tech |
|-------------|------|
| Framework   | React Native, Expo |
| Navigation  | Expo Router (file-based routing) |
| Language    | TypeScript |
| UI          | `@expo/ui`, `expo-glass-effect`, `expo-image`, custom theme |
| Voice       | `expo-speech` |
| Tooling     | pnpm workspaces, ESLint |

## Project structure

```
src/
  app/            Expo Router screens
    index.tsx       Program overview
    program/[id]    Session detail (dynamic route)
  data/           Program definition + image map
  lib/            Shared theme
```

## Run locally

```bash
pnpm install
pnpm start        # Expo dev server — press i / a / w for iOS, Android or web
```

Requires the [Expo Go](https://expo.dev/go) app or a simulator/emulator.
