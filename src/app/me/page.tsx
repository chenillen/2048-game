'use client';

import { useState } from 'react';
import { useTheme } from '../../components/theme-provider';
import { useUser } from '../../components/user-context';

export default function Me() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, updateName } = useUser();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSaveName = () => {
    if (newName.trim()) {
      updateName(newName.trim());
      setEditingName(false);
    }
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

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    padding: '24px',
    backgroundColor: theme.colors.tileBackground,
    borderRadius: '12px',
    border: `1px solid ${theme.colors.tileBorder}`,
    marginBottom: '16px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px' }}>👤 Me</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', color: theme.colors.textColor }}>
              Profile
            </h2>
            
            {editingName ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.colors.tileBorder}`,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textColor,
                    fontSize: '16px',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button
                  onClick={handleSaveName}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: theme.colors.textColor,
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', opacity: 0.7 }}>Name</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.name || 'Player'}</p>
                </div>
                <button
                  onClick={() => {
                    setNewName(user?.name || '');
                    setEditingName(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: theme.colors.tileBorder,
                    color: theme.colors.textColor,
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', color: theme.colors.textColor }}>
              Statistics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>Games Played</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{user?.gamesPlayed || 0}</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>High Score</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{user?.highScore || 0}</p>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', color: theme.colors.textColor }}>
              Settings
            </h2>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Theme</span>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme.colors.tileBorder,
                  color: theme.colors.textColor,
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                {theme.name === '2048' ? 'Switch to 4096' : 'Switch to 2048'}
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', color: theme.colors.textColor }}>
              Device ID
            </h2>
            <p style={{ fontSize: '12px', opacity: 0.7, wordBreak: 'break-all' }}>
              {user?.id || 'Unknown'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
