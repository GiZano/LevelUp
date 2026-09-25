# Contributing to LevelUp 🏔️

First off, thank you for considering contributing to LevelUp! It's people like you that make the open-source community such a great place to learn, inspire, and create.

## How to Contribute

1. **Fork & Clone**: Fork the repository on GitHub and clone it to your local machine.
2. **Branch**: Create a new branch for your feature or bugfix (`git checkout -b feat/your-feature` or `fix/your-fix`).
3. **Develop**: Write your code. Make sure to adhere to the coding guidelines below.
4. **Test**: Ensure the app builds locally and your changes don't break existing functionality.
5. **Commit**: Use Conventional Commits (e.g., `feat: add new block type`, `fix: resolve crash on peaks screen`).
6. **Push & PR**: Push your branch to your fork and open a Pull Request against the `main` branch of LevelUp.

## Local Development Setup

Ensure you have Node.js and npm installed.

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```
Use the Expo Go app on your phone, or an Android/iOS emulator to test your changes.

## Coding Guidelines
- **Language**: TypeScript is mandatory. Do not use plain JavaScript.
- **Styling**: Use the centralized theme (`src/utils/theme.ts`) for colors, spacing, and typography.
- **i18n**: All user-facing strings must be routed through `src/utils/i18n.ts`. Do not hardcode strings in the UI.
- **State**: Use the existing React Contexts (`PeaksContext`, `PlannerContext`). Do not introduce external state management libraries (like Redux) without discussing it first in an Issue.

## Issues
Before opening a PR for a major feature, please check the issues tab to see if it's already being worked on, or open a new issue to discuss your proposed changes.

## Community and Communication
We believe in open and active communication. If you want to discuss a new feature, a bug fix, or just need help getting started:
- Join our **GitHub Discussions** tab to talk about features, architecture, and user feedback.
- We highly value open-source culture and aim to create a welcoming environment for both veteran engineers and university students looking to make their first open-source contribution.

## Good First Issues
If you are new to the codebase, look for issues labeled `good first issue` or `help wanted`. These are specifically curated to be self-contained and require minimal knowledge of the entire system architecture.

## Modular Architecture
LevelUp strictly follows a modular architecture (inspired by large-scale projects like SymPy). When contributing, please ensure your code is isolated to its specific domain:
- `src/store/`: Core logic, SQLite interactions, and React Context state.
- `src/components/`: Dumb, reusable UI components (e.g., SVG charts, buttons).
- `src/screens/`: Screen-level orchestration.
- `src/utils/`: Isolated helpers (e.g., i18n, stats calculations).
Future modules (like Local AI logic) must be placed in their own isolated domain (e.g., `src/ai/`) so they can be maintained or replaced without side effects on the rest of the application.
