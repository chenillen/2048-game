# 2048 Game - Marvis Edition 🤪

A refactored, robust implementation of the classic 2048 game built with **TypeScript** and **Vite**.

## Development Philosophy

-   **Separation of Concerns:** Logic is completely separated from the DOM. The `GameLogic` class handles state, moves, and calculations, while `main.ts` handles rendering and event listeners.
-   **Persistence First:** Game state is automatically saved to `localStorage` on every move. The highest score is also persistent and tied to a player name.
-   **Hard Mode Mechanics:** New tiles are not just 2s and 4s. As you combine larger tiles, new tiles can spawn with values up to 2 levels below your maximum tile (e.g., if your max is 1024, tiles up to 256 can spawn). Higher values have lower spawn rates.
-   **Responsive & Smooth:** Built with mobile-first CSS and hardware-accelerated transforms for smooth 60fps tile animations. Strictly non-scrolling and centered layout.
-   **Developer Experience:** Uses TypeScript for type safety and Vite for ultra-fast bundling and HMR.

## Controls

-   **Keyboard:** Use **Arrow Keys** to move. Press **ALT+N** to start a new game.
-   **Mouse/Touch:** Swipe or drag in the desired direction.

## Build & Deployment

The project is configured to build into a `dist/` directory, which is then served via GitHub Pages using GitHub Actions.

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
-   [x] Smooth tile movement, pop, and merge animations.
-   [x] Stylish Game Over and Name Input modals.
-   [x] Confetti celebrations for reaching 1024, 2048, etc.
-   [x] High-digit tile support (up to 65536) with dynamic font scaling.
