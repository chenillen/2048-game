import '../styles/globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { UserProvider } from '../components/user-context';
import BottomNav from '../components/bottom-nav';

export const metadata = {
  title: '4096 Game',
  description: 'A modern take on the classic 2048 puzzle game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <UserProvider>
            <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
              {children}
            </main>
            <BottomNav />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
