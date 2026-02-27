import '../styles/globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { UserProvider } from '../components/user-context';
import BottomNav from '../components/bottom-nav';

export const metadata = {
  title: '4096',
  description: 'A modern take on the classic 2048 puzzle game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: '100%', overflow: 'hidden' }}>
      <body style={{ 
        height: '100%', 
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}>
        <ThemeProvider>
          <UserProvider>
            <main style={{ 
              height: '100vh', 
              width: '100vw',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {children}
            </main>
            <BottomNav />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
