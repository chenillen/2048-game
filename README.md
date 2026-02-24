# 2048 Game - Marvis Edition 🤪

A refactored, robust implementation of the classic 2048 game built with **TypeScript** and **Vite**.

## Development Philosophy

-   **Separation of Concerns:** Logic is completely separated from the DOM. The `GameLogic` class handles state, moves, and calculations, while `main.ts` handles rendering and event listeners.
-   **Persistence First:** Game state is automatically saved to `localStorage` on every move. The highest score is also persistent and tied to a player name.
-   **Responsive & Smooth:** Built with mobile-first CSS and hardware-accelerated transforms for smooth 60fps tile animations.
-   **Developer Experience:** Uses TypeScript for type safety and Vite for ultra-fast bundling and HMR.

## Controls

-   **Keyboard:** Use **Arrow Keys** to move. Press **CMD+N** (macOS) or **CTRL+N** (Windows/Linux) to start a new game.
-   **Mouse/Touch:** Swipe or drag in the desired direction.

## Build & Deployment

The project is configured to build into a `dist/` directory, which is then served via GitHub Pages.

```bash
npm install
npm run build
```

## Features

-   [x] TypeScript for logic and state management.
-   [x] Split CSS, Logic, and Entry points.
-   [x] Save/Restore game state on refresh.
-   [x] Local high score tracking with player name.
-   [x] Keyboard shortcuts and touch/mouse gesture support.
-   [x] Smooth tile movement and pop animations.
