'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from './theme-provider';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/me', label: 'Me', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        borderTop: `1px solid ${theme.colors.tileBorder}`,
        padding: '12px 0',
        zIndex: 1000,
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: isActive ? theme.colors.textColor : theme.colors.secondary,
                transition: 'color 0.2s',
              }}
            >
              <span style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
