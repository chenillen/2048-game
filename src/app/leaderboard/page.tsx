'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../components/theme-provider';

interface ScoreEntry {
  id: number;
  score: number;
  mode: string;
  created_at: string;
  user?: { name: string };
}

const SUPABASE_URL = 'https://aizqcftuombkakgaaszd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6MkGtV8tT5JmsPJq6L297Q_j-YgYQC0';

export default function Leaderboard() {
  const { theme } = useTheme();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'easy' | 'hard'>('easy');

  useEffect(() => {
    fetchScores();
  }, [mode]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/scores?mode=eq.${mode}&select=id,score,mode,created_at,user:name&order=score.desc&limit=10`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      const data = await response.json();
      setScores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setScores([]);
    }
    setLoading(false);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: theme.colors.background,
    color: theme.colors.textColor,
    transition: 'background-color 0.3s, color 0.3s',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    backgroundColor: isActive ? theme.colors.textColor : theme.colors.tileBackground,
    color: isActive ? '#fff' : theme.colors.textColor,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px',
    transition: 'all 0.2s',
  });

  const listStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    listStyle: 'none',
    padding: 0,
    marginTop: '20px',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: theme.colors.tileBackground,
    borderRadius: '8px',
    marginBottom: '10px',
    border: `1px solid ${theme.colors.tileBorder}`,
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' }}>🏆 Leaderboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          style={tabStyle(mode === 'easy')}
          onClick={() => setMode('easy')}
        >
          Easy
        </button>
        <button
          style={tabStyle(mode === 'hard')}
          onClick={() => setMode('hard')}
        >
          Hard
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : scores.length === 0 ? (
        <p>No scores yet. Be the first!</p>
      ) : (
        <ul style={listStyle}>
          {scores.map((entry, index) => (
            <li key={entry.id} style={itemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : theme.colors.tileBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: index < 3 ? '#000' : '#fff',
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ fontSize: '16px' }}>{entry.user?.name || 'Anonymous'}</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{entry.score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
