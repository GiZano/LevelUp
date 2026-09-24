# 🏔️ LevelUp

**Gamify your goals. Conquer your peaks.**

LevelUp is a mobile app for long-term goal tracking, built around the metaphor of **mountain climbing**: every goal is a peak to reach, every sub-goal is a base camp along the way. It includes a weekly planner to organize your week in blocks and eliminate *decision fatigue*.

> [!NOTE]
> Personal project born to solve a real problem: not knowing what to do in free time and ending up scrolling the phone. The app is the scaffolding — the real goal is to build the time-boxing habit until it becomes natural.

---

## ✨ Features

### MVP — Peaks and Camps
- 🏔️ **Peaks**: long-term goals (exams, Codeforces rating, personal projects)
- ⛺ **Camps**: checkable sub-goals along the path to the peak
- 📊 **Visual progress**: SVG mountain path that fills up gradually
- 🔥 **Streak**: consecutive days of activity counter
- 🏁 **Celebrations**: visual feedback upon completing camps and peaks
- 🌗 **Light/Dark theme**: follows system preferences

### Weekly Planner *(Phase 2)*
- 📅 Weekly grid view with drag & drop blocks
- ⏱️ Target hours per category with progress bars
- 📋 Daily view "what should I do today"
- 📝 Sunday weekly review

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev/) (React Native) |
| Navigation | Expo Router |
| Local Storage | expo-sqlite / AsyncStorage |
| SVG Graphics | react-native-svg |
| Build & Deploy | EAS Build + GitHub Actions |
| Language | TypeScript |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- An Android device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/gizano/LevelUp.git
cd LevelUp

# Install dependencies
npm install

# Start in development mode
npx expo start
```

### Build APK

```bash
# Local build (requires Android SDK)
npx expo run:android

# Or cloud build via EAS
eas build --platform android --profile preview
```

### Installation from Release

1. Go to the [Releases](https://github.com/gizano/LevelUp/releases) page of the repository
2. Download the APK of the latest release
3. Transfer it to your phone and install it (enable "Install from unknown sources" if asked)

---

## 📁 Project Structure

```
LevelUp/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── store/          # State and data persistence
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utilities and helpers
│   └── assets/         # Images, fonts, icons
├── app/                # Expo Router (entry point and routing)
├── ROADMAP.md          # Detailed development plan
└── README.md
```

---

## 📐 Data Architecture

```typescript
interface Peak {
  id: string;
  name: string;            // e.g. "1400 Codeforces Rating"
  description?: string;
  camps: Camp[];
  createdAt: Date;
  completedAt?: Date;
}

interface Camp {
  id: string;
  name: string;            // e.g. "Solve 20 Div.2 A problems"
  done: boolean;
  completedAt?: Date;
  order: number;           // position along the path
}

interface WeeklyBlock {
  id: string;
  name: string;            // e.g. "Study OSTEP"
  category: string;        // e.g. "study", "cp", "hobby"
  color: string;
  estimatedHours: number;
  peakId?: string;         // optional link to a peak
}
```

---

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for the complete development plan.

| Phase | Content | Status |
|---|---|---|
| **Phase 0** | Project Setup | 🟢 Completed |
| **Phase 1** | MVP: Peaks and Camps | 🟢 Completed |
| **Phase 2** | Weekly Planner | 🟢 Completed |
| **Phase 3** | CI/CD and automation | 🟡 In Progress |


---

## 📄 License

MIT

---

<p align="center">
  <i>Made with ☕ and AI by a computer science student aiming for ETH who didn't know what to do in his free time.</i>
</p>
