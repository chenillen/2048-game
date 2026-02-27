# 4096 Game Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4096 theme with modern gradient design, bottom navigation, device ID user management, and Next.js migration while keeping existing 2048 version live.

**Architecture:** Progressive enhancement approach - keep existing 2048 version intact, add 4096 theme as optional choice, migrate to Next.js with backward-compatible database schema, deploy separately to Vercel.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Supabase, CSS custom properties, React components

---

### Task 1: Theme System Setup

**Files:**
- Create: `src/components/theme-provider.tsx`
- Create: `src/styles/themes.css`
- Modify: `src/components/game-container.tsx:1-200`

**Step 1: Create theme provider component**

```tsx
// src/components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface Theme {
  name: '2048' | '4096';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    tileBackground: string;
    tileBorder: string;
  };
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: {
    name: '2048',
    colors: {
      primary: '#f9f6f2',
      secondary: '#776e65',
      background: '#faf8ef',
      tileBackground: '#cdc1b4',
      tileBorder: '#bbada0'
    }
  },
  setTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>({
    name: '2048',
    colors: {
      primary: '#f9f6f2',
      secondary: '#776e65',
      background: '#faf8ef',
      tileBackground: '#cdc1b4',
      tileBorder: '#bbada0'
    }
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div style={{
        background: theme.colors.background,
        color: theme.colors.primary,
        transition: 'background 0.3s, color 0.3s'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

**Step 2: Create theme styles**

```css
// src/styles/themes.css */
:root {
  --theme-primary: #f9f6f2;
  --theme-secondary: #776e65;
  --theme-background: #faf8ef;
  --theme-tile-background: #cdc1b4;
  --theme-tile-border: #bbada0;
}

[data-theme="4096"] {
  --theme-primary: #ffffff;
  --theme-secondary: #2c3e50;
  --theme-background: #34495e;
  --theme-tile-background: #3498db;
  --theme-tile-border: #2980b9;
}
```

**Step 3: Update game container to use theme**

```tsx
// src/components/game-container.tsx (add theme usage)
import { useTheme } from './theme-provider';

export const GameContainer: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="game-container" style={{
      background: theme.colors.background,
      color: theme.colors.primary
    }}>
      {/* existing game content */}
    </div>
  );
};
```

**Step 4: Run build to verify theme system works**

Run: `npm run build`
Expected: Build completes without errors

**Step 5: Commit**

```bash
git add src/components/theme-provider.tsx src/styles/themes.css src/components/game-container.tsx
git commit -m "feat: add theme system with 2048 and 4096 themes"
```

---

### Task 2: Bottom Navigation Component

**Files:**
- Create: `src/components/bottom-navigation.tsx`
- Create: `src/components/navigation-item.tsx`
- Modify: `src/components/app-layout.tsx:1-100`

**Step 1: Create navigation item component**

```tsx
// src/components/navigation-item.tsx
import { ReactNode } from 'react';

interface NavigationItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  label,
  href,
  isActive = false
}) => {
  return (
    <a href={href} className={`navigation-item ${isActive ? 'active' : ''}`}>
      <div className="navigation-icon">{icon}</div>
      <div className="navigation-label">{label}</div>
    </a>
  );
};
```

**Step 2: Create bottom navigation component**

```tsx
// src/components/bottom-navigation.tsx
import { NavigationItem } from './navigation-item';

export const BottomNavigation: React.FC = () => {
  const navigationItems = [
    { icon: '🏠', label: 'Home', href: '/' },
    { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
    { icon: '👤', label: 'Me', href: '/me' }
  ];

  return (
    <nav className="bottom-navigation">
      <div className="navigation-items">
        {navigationItems.map((item, index) => (
          <NavigationItem 
            key={index} 
            {...item} 
            isActive={window.location.pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
};
```

**Step 3: Update app layout to include bottom navigation**

```tsx
// src/components/app-layout.tsx
import { BottomNavigation } from './bottom-navigation';

export const AppLayout: React.FC = ({ children }) => {
  return (
    <div className="app-layout">
      {children}
      <BottomNavigation />
    </div>
  );
};
```

**Step 4: Add bottom navigation styles**

```css
/* src/styles/bottom-navigation.css */
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--theme-background);
  border-top: 1px solid var(--theme-tile-border);
  padding: 8px 0;
  z-index: 1000;
}

.navigation-items {
  display: flex;
  justify-content: space-around;
}

.navigation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--theme-secondary);
  padding: 8px;
  transition: color 0.2s;
}

.navigation-item.active {
  color: var(--theme-primary);
}

.navigation-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.navigation-label {
  font-size: 10px;
  font-weight: 500;
}
```

**Step 5: Commit**

```bash
git add src/components/bottom-navigation.tsx src/components/navigation-item.tsx src/components/app-layout.tsx src/styles/bottom-navigation.css
git commit -m "feat: add bottom navigation with Home/Leaderboard/Me items"
```

---

### Task 3: In-Game Action Buttons

**Files:**
- Create: `src/components/game-actions.tsx`
- Modify: `src/components/game-container.tsx:201-300`

**Step 1: Create game actions component**

```tsx
// src/components/game-actions.tsx
import { useTheme } from './theme-provider';

export const GameActions: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  const switchTheme = () => {
    setTheme(theme.name === '2048' 
      ? {
          name: '4096',
          colors: {
            primary: '#ffffff',
            secondary: '#2c3e50',
            background: '#34495e',
            tileBackground: '#3498db',
            tileBorder: '#2980b9'
          }
        }
      : {
          name: '2048',
          colors: {
            primary: '#f9f6f2',
            secondary: '#776e65',
            background: '#faf8ef',
            tileBackground: '#cdc1b4',
            tileBorder: '#bbada0'
          }
        }
    );
  };

  return (
    <div className="game-actions">
      <button 
        className="action-button"
        onClick={() => setShowOptions(!showOptions)}
      >
        ⚙️
      </button>
      {showOptions && (
        <div className="action-options">
          <button 
            className="theme-switcher"
            onClick={switchTheme}
          >
            {theme.name === '2048' ? 'Switch to 4096' : 'Switch to 2048'}
          </button>
          <button 
            className="restart-button"
            onClick={() => window.location.reload()}
          >
            🔄 Restart
          </button>
        </div>
      )}
    </div>
  );
};
```

**Step 2: Add game actions styles**

```css
/* src/styles/game-actions.css */
.game-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.action-button {
  width: 44px;
  height: 44px;
  border: 2px solid var(--theme-tile-border);
  background: var(--theme-tile-background);
  color: var(--theme-primary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.action-button:hover {
  background: var(--theme-primary);
  color: var(--theme-background);
  transform: scale(1.1);
}

.action-options {
  position: absolute;
  top: 50px;
  right: 0;
  background: var(--theme-background);
  border: 2px solid var(--theme-tile-border);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.theme-switcher,
.restart-button {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--theme-tile-border);
  background: var(--theme-tile-background);
  color: var(--theme-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.theme-switcher:hover,
.restart-button:hover {
  background: var(--theme-primary);
  color: var(--theme-background);
  border-color: var(--theme-secondary);
}
```

**Step 3: Update game container to include action buttons**

```tsx
// src/components/game-container.tsx (add at top-right corner)
import { GameActions } from './game-actions';

export const GameContainer: React.FC = () => {
  return (
    <div className="game-container">
      <GameActions />
      {/* existing game content */}
    </div>
  );
};
```

**Step 4: Run build to verify action buttons work**

Run: `npm run build`
Expected: Build completes without errors

**Step 5: Commit**

```bash
git add src/components/game-actions.tsx src/styles/game-actions.css src/components/game-container.tsx
git commit -m "feat: add in-game action buttons with theme switcher and restart"
```

---

### Task 4: Device ID Generation and User Management

**Files:**
- Create: `src/utils/device-id.ts`
- Create: `src/hooks/use-user.ts`
- Create: `src/components/user-context.tsx`
- Modify: `src/components/app-layout.tsx:101-200`

**Step 1: Create device ID utility**

```typescript
// src/utils/device-id.ts
export const generateDeviceId = (): string => {
  const randomString = () => Math.random().toString(36).substring(2, 15);
  return `${randomString()}-${randomString()}-${Date.now()}`;
};

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};
```

**Step 2: Create user context and hook**

```tsx
// src/components/user-context.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getDeviceId } from '../utils/device-id';

interface User {
  id: string;
  created: string;
  gamesPlayed: number;
  highScore: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const deviceId = getDeviceId();
      // Mock user data - in real implementation, fetch from Supabase
      const userData = {
        id: deviceId,
        created: new Date().toISOString(),
        gamesPlayed: 0,
        highScore: 0
      };
      setUser(userData);
      setLoading(false);
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
```

**Step 3: Create user hook for data management**

```tsx
// src/hooks/use-user.ts
import { useUser } from '../components/user-context';

export const useUserActions = () => {
  const { user } = useUser();

  const updateUserGame = (score: number) => {
    if (user) {
      // Mock update - in real implementation, update Supabase
      const updatedUser = {
        ...user,
        gamesPlayed: user.gamesPlayed + 1,
        highScore: Math.max(user.highScore, score)
      };
      // localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  };

  return {
    updateUserGame
  };
};
```

**Step 4: Update app layout to include user provider**

```tsx
// src/components/app-layout.tsx (wrap with UserProvider)
import { UserProvider } from './user-context';

export const AppLayout: React.FC = ({ children }) => {
  return (
    <UserProvider>
      <div className="app-layout">
        {children}
        <BottomNavigation />
      </div>
    </UserProvider>
  );
};
```

**Step 5: Commit**

```bash
git add src/utils/device-id.ts src/hooks/use-user.ts src/components/user-context.tsx src/components/app-layout.tsx
git commit -m "feat: add device ID generation and user management system"
```

---

### Task 5: Next.js Migration Setup

**Files:**
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `src/app/page.tsx`
- Create: `src/app/layout.tsx`
- Modify: `package.json:10-20`

**Step 1: Create Next.js configuration**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

**Step 2: Create TypeScript configuration**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["next-env.d.ts", "src"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create Next.js app structure**

```tsx
// src/app/layout.tsx
import { AppLayout } from './components/app-layout';
import './styles/themes.css';
import './styles/bottom-navigation.css';
import './styles/game-actions.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
import { GameContainer } from './components/game-container';

export default function Home() {
  return <GameContainer />;
}
```

**Step 4: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Step 5: Install Next.js dependencies**

Run: `npm install next react react-dom`
Expected: Dependencies installed successfully

**Step 6: Commit**

```bash
git add next.config.js tsconfig.json src/app/ package.json
git commit -m "feat: migrate to Next.js with App Router structure"
```

---

### Task 6: Mobile Optimization

**Files:**
- Create: `src/styles/mobile.css`
- Modify: `src/components/bottom-navigation.tsx:10-30`
- Modify: `src/components/game-actions.tsx:15-40`

**Step 1: Create mobile-specific styles**

```css
/* src/styles/mobile.css */
@media (max-width: 768px) {
  :root {
    font-size: 14px;
  }

  .game-container {
    padding: 16px;
  }

  .grid-container {
    width: 280px;
    height: 280px;
  }

  .grid-row {
    height: 70px;
  }

  .grid-cell {
    width: 66px;
    height: 66px;
    margin: 2px;
  }

  .tile {
    width: 66px;
    height: 66px;
    font-size: 24px;
  }

  .tile.tile-2048 {
    font-size: 20px;
  }

  .tile.tile-4096 {
    font-size: 20px;
  }

  .score-container,
  .best-container,
  .moves-container {
    font-size: 16px;
    margin: 8px 0;
  }

  .game-message {
    padding: 20px;
  }

  .game-message p {
    font-size: 18px;
  }

  .game-message .button {
    padding: 12px 20px;
    font-size: 16px;
  }
}
```

**Step 2: Update bottom navigation for mobile**

```tsx
// src/components/bottom-navigation.tsx (add mobile logic)
const isMobile = () => window.innerWidth <= 768;

export const BottomNavigation: React.FC = () => {
  const navigationItems = [
    { icon: '🏠', label: 'Home', href: '/' },
    { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
    { icon: '👤', label: 'Me', href: '/me' }
  ];

  return (
    <nav className={`bottom-navigation ${isMobile() ? 'mobile' : ''}`}>
      {/* existing content */}
    </nav>
  );
};
```

**Step 3: Update game actions for mobile**

```tsx
// src/components/game-actions.tsx (add mobile logic)
const isMobile = () => window.innerWidth <= 768;

export const GameActions: React.FC = () => {
  return (
    <div className={`game-actions ${isMobile() ? 'mobile' : ''}`}>
      {/* existing content */}
    </div>
  );
};
```

**Step 4: Add mobile CSS imports**

```tsx
// src/app/layout.tsx (add mobile styles)
import './styles/mobile.css';
```

**Step 5: Test mobile responsiveness**

Run: `npm run dev`
Test: Open browser dev tools, toggle device mode, verify layout

**Step 6: Commit**

```bash
git add src/styles/mobile.css src/components/bottom-navigation.tsx src/components/game-actions.tsx src/app/layout.tsx
git commit -m "feat: add mobile optimization for screens up to 768px"
```

---

### Task 7: Supabase Integration Setup

**Files:**
- Create: `supabase.config.js`
- Create: `src/lib/supabase.ts`
- Create: `src/components/leaderboard.tsx`
- Create: `src/pages/leaderboard.tsx`

**Step 1: Create Supabase configuration**

```javascript
// supabase.config.js
module.exports = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  schema: 'public'
}
```

**Step 2: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl!,
  supabaseKey!,
  {
    schema: 'public'
  }
);
```

**Step 3: Create leaderboard component**

```tsx
// src/components/leaderboard.tsx
import { supabase } from '../lib/supabase';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .range(0, 10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaderboard(data || []);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      <div className="leaderboard-list">
        {leaderboard.map((entry: any, index: number) => (
          <div key={index} className="leaderboard-entry">
            <span className="rank">{index + 1}</span>
            <span className="username">{entry.user_id}</span>
            <span className="score">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Step 4: Create leaderboard page**

```tsx
// src/pages/leaderboard.tsx
import { Leaderboard } from '@/components/leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="leaderboard-page">
      <Leaderboard />
    </div>
  );
}
```

**Step 5: Add leaderboard styles**

```css
/* src/styles/leaderboard.css */
.leaderboard {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.leaderboard h2 {
  text-align: center;
  margin-bottom: 20px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--theme-tile-background);
  border: 1px solid var(--theme-tile-border);
  border-radius: 4px;
}

.rank {
  font-weight: bold;
  width: 40px;
}

.username {
  flex: 1;
  text-align: left;
}

.score {
  font-weight: bold;
  width: 80px;
  text-align: right;
}
```

**Step 6: Add leaderboard styles import**

```tsx
// src/app/layout.tsx (add leaderboard styles)
import './styles/leaderboard.css';
```

**Step 7: Commit**

```bash
git add supabase.config.js src/lib/supabase.ts src/components/leaderboard.tsx src/pages/leaderboard.tsx src/styles/leaderboard.css
git commit -m "feat: add Supabase integration and leaderboard component"
```

---

### Task 8: Final Integration and Testing

**Files:**
- Modify: `src/app/layout.tsx:1-50`
- Create: `src/pages/me.tsx`
- Create: `src/components/user-profile.tsx`

**Step 1: Create user profile component**

```tsx
// src/components/user-profile.tsx
import { useUser } from '@/components/user-context';

export const UserProfile: React.FC = () => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading user profile...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="user-profile">
      <h2>👤 Your Profile</h2>
      <div className="user-stats">
        <div className="stat">
          <span className="stat-label">User ID:</span>
          <span className="stat-value">{user.id}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Games Played:</span>
          <span className="stat-value">{user.gamesPlayed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">High Score:</span>
          <span className="stat-value">{user.highScore}</span>
        </div>
      </div>
    </div>
  );
};
```

**Step 2: Create me page**

```tsx
// src/pages/me.tsx
import { UserProfile } from '@/components/user-profile';

export default function MePage() {
  return (
    <div className="me-page">
      <UserProfile />
    </div>
  );
}
```

**Step 3: Add user profile styles**

```css
/* src/styles/user-profile.css */
.user-profile {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.user-profile h2 {
  text-align: center;
  margin-bottom: 20px;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--theme-tile-background);
  border: 1px solid var(--theme-tile-border);
  border-radius: 4px;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  font-weight: bold;
}
```

**Step 4: Add user profile styles import**

```tsx
// src/app/layout.tsx (add user profile styles)
import './styles/user-profile.css';
```

**Step 5: Update layout to handle theme switching**

```tsx
// src/app/layout.tsx (add theme data attribute)
<body data-theme={theme.name}>
```

**Step 6: Run comprehensive test**

Run: `npm run build`
Expected: Build completes without errors

Run: `npm run dev`
Test: Verify all pages load, navigation works, theme switching works

**Step 7: Commit**

```bash
git add src/components/user-profile.tsx src/pages/me.tsx src/styles/user-profile.css src/app/layout.tsx
git commit -m "feat: add user profile page and complete integration"
```

---

### Task 9: Vercel Deployment Configuration

**Files:**
- Create: `vercel.json`
- Create: `.github/workflows/deploy.yml`

**Step 1: Create Vercel configuration**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=1200, stale-while-revalidate=600"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Step 2: Create GitHub Actions workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**Step 3: Update package.json for production**

```json
// package.json (add production scripts)
{
  "scripts": {
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint"
  }
}
```

**Step 4: Commit**

```bash
git add vercel.json .github/workflows/deploy.yml package.json
git commit -m "feat: add Vercel deployment configuration and GitHub Actions"
```

---

### Task 10: Documentation and Cleanup

**Files:**
- Create: `README.md`
- Create: `docs/4096-redesign.md`

**Step 1: Create project README**

```markdown
# 2048/4096 Game

A modern take on the classic 2048 game with both 2048 and 4096 themes.

## Features

- **Classic 2048 Theme**: Original design with beige tones
- **Modern 4096 Theme**: Gradient design with blue accents
- **Mobile-Optimized**: Touch controls and responsive design
- **Device ID User Management**: No login required, persistent user data
- **Bottom Navigation**: Home/Leaderboard/Me navigation
- **In-Game Actions**: Theme switcher and restart buttons
- **Supabase Integration**: Leaderboard and user data persistence

## Tech Stack

- **Next.js 14+**: App Router and modern React features
- **TypeScript**: Type-safe development
- **Supabase**: Database and authentication
- **CSS Custom Properties**: Theme system
- **Vercel**: Deployment platform

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

## Deployment

The project is configured for Vercel deployment with GitHub Actions CI/CD.
```

**Step 2: Create redesign documentation**

```markdown
# 4096 Game Redesign Documentation

## Overview

This document outlines the implementation of the 4096 theme redesign for the existing 2048 game.

## Architecture

The redesign follows a progressive enhancement approach:
- Existing 2048 version remains unchanged
- 4096 theme added as optional choice
- Mobile-first design with bottom navigation
- Device ID user management (no email/password)
- Next.js migration with backward compatibility

## Key Features

1. **Theme System**: CSS custom properties for 2048 and 4096 themes
2. **Bottom Navigation**: Home/Leaderboard/Me with touch-friendly interface
3. **In-Game Actions**: Theme switcher and restart functionality
4. **User Management**: Device ID generation with persistent data
5. **Mobile Optimization**: Responsive design for all screen sizes
6. **Supabase Integration**: Leaderboard and user data persistence

## Implementation Details

### Theme System
- CSS custom properties for color management
- Theme switching via React context
- Smooth transitions between themes

### Navigation
- Fixed bottom navigation bar
- Touch-friendly button sizes
- Active state indicators

### User Management
- Device ID generation using localStorage
- Mock user data structure (real implementation uses Supabase)
- Persistent high scores and game statistics

### Mobile Optimization
- Responsive grid sizing
- Touch event handling
- Mobile-specific CSS media queries

## Deployment

- **Vercel**: Primary deployment platform
- **GitHub Actions**: CI/CD pipeline
- **Separate deployment**: 4096 version deployed alongside existing 2048
```

**Step 3: Commit**

```bash
git add README.md docs/4096-redesign.md
git commit -m "docs: add project documentation and redesign overview"
```

---

## Plan Complete

The implementation plan is complete and saved to `docs/plans/2026-02-27-4096-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**