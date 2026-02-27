'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../components/theme-provider';
import { useUser } from '../components/user-context';

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

type Grid = (Tile | null)[][];

export default function Home() {
  const { theme } = useTheme();
  const { user, updateGameStats } = useUser();
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [history, setHistory] = useState<Grid[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');

  const initGame = useCallback(() => {
    const newGrid: Grid = Array(4).fill(null).map(() => Array(4).fill(null));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setHistory([]);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const addRandomTile = (currentGrid: Grid) => {
    const emptyCells: { row: number; col: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!currentGrid[r][c]) emptyCells.push({ row: r, col: c });
      }
    }
    if (emptyCells.length === 0) return;
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = difficulty === 'easy' ? (Math.random() < 0.9 ? 2 : 4) : (Math.random() < 0.5 ? 2 : Math.random() < 0.8 ? 4 : 8);
    currentGrid[row][col] = { id: Date.now() + Math.random(), value, row, col, isNew: true, isMerged: false };
  };

  const cloneGrid = (g: Grid): Grid => {
    return g.map(row => row.map(cell => cell ? { ...cell } : null));
  };

  const saveState = () => {
    setHistory(prev => [...prev, cloneGrid(grid)]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previousGrid = history[history.length - 1];
    setGrid(cloneGrid(previousGrid));
    setHistory(prev => prev.slice(0, -1));
  };

  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    
    saveState();
    let newGrid = cloneGrid(grid);
    let moved = false;
    let newScore = score;

    const rotateGrid = (g: Grid): Grid => {
      return g[0].map((_, i) => g.map((row) => row[i]).reverse());
    };

    const slide = (row: (Tile | null)[]): (Tile | null)[] => {
      let arr = row.filter((c) => c !== null) as Tile[];
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].value === arr[i + 1].value) {
          arr[i].value *= 2;
          arr[i].isMerged = true;
          newScore += arr[i].value;
          arr.splice(i + 1, 1);
        }
      }
      while (arr.length < 4) arr.push(null as unknown as Tile);
      return arr;
    };

    if (direction === 'right') newGrid = newGrid.map(row => slide([...row].reverse()).reverse() as (Tile | null)[]);
    else if (direction === 'left') newGrid = newGrid.map(row => slide([...row]) as (Tile | null)[]);
    else if (direction === 'up') {
      newGrid = rotateGrid(newGrid);
      newGrid = newGrid.map(row => slide([...row]) as (Tile | null)[]);
      newGrid = rotateGrid(rotateGrid(rotateGrid(newGrid)));
    } else if (direction === 'down') {
      newGrid = rotateGrid(rotateGrid(rotateGrid(newGrid)));
      newGrid = newGrid.map(row => slide([...row]) as (Tile | null)[]);
      newGrid = rotateGrid(newGrid);
    }

    const oldStr = JSON.stringify(grid);
    const newStr = JSON.stringify(newGrid);
    if (oldStr !== newStr) moved = true;

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      if (newScore > bestScore) setBestScore(newScore);
      
      if (isGameOver(newGrid)) {
        setGameOver(true);
        if (user) updateGameStats(newScore);
      }
    } else {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const isGameOver = (currentGrid: Grid): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!currentGrid[r][c]) return false;
      }
    }
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = currentGrid[r][c]!.value;
        if (r < 3 && currentGrid[r + 1][c]!.value === val) return false;
        if (c < 3 && currentGrid[r][c + 1]!.value === val) return false;
      }
    }
    return true;
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showNameModal) return;
      if (e.key === 'ArrowLeft') move('left');
      else if (e.key === 'ArrowRight') move('right');
      else if (e.key === 'ArrowUp') move('up');
      else if (e.key === 'ArrowDown') move('down');
    },
    [grid, gameOver, showNameModal]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || showNameModal || gameOver) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipeDistance) {
        // Inverted X: swipe left moves right, swipe right moves left
        move(dx > 0 ? 'left' : 'right');
      }
    } else {
      if (Math.abs(dy) > minSwipeDistance) {
        // Inverted Y: swipe up moves down, swipe down moves up
        move(dy < 0 ? 'down' : 'up');
      }
    }
    
    setTouchStart(null);
  };

  const startNewGame = () => {
    setShowNameModal(true);
  };

  const handleStartGame = () => {
    setShowNameModal(false);
    initGame();
  };

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: 'var(--tile-2)',
      4: 'var(--tile-4)',
      8: 'var(--tile-8)',
      16: 'var(--tile-16)',
      32: 'var(--tile-32)',
      64: 'var(--tile-64)',
      128: 'var(--tile-128)',
      256: 'var(--tile-256)',
      512: 'var(--tile-512)',
      1024: 'var(--tile-1024)',
      2048: 'var(--tile-2048)',
      4096: 'var(--tile-4096)',
    };
    return colors[value] || '#3c3a32';
  };

  const getTextColor = (value: number) => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        height: '100vh',
        padding: '10px',
        backgroundColor: theme.colors.background,
        color: theme.colors.textColor,
        transition: 'background-color 0.3s, color 0.3s',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: '360px',
        marginBottom: '10px',
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          color: theme.colors.textColor,
          margin: 0,
        }}>4096</h1>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '10px',
      }}>
        <div style={{
          backgroundColor: theme.colors.tileBorder,
          padding: '8px 16px',
          borderRadius: '6px',
          textAlign: 'center',
          minWidth: '70px',
        }}>
          <div style={{ fontSize: '11px', color: '#eee4da' }}>SCORE</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{score}</div>
        </div>
        <div style={{
          backgroundColor: theme.colors.tileBorder,
          padding: '8px 16px',
          borderRadius: '6px',
          textAlign: 'center',
          minWidth: '70px',
        }}>
          <div style={{ fontSize: '11px', color: '#eee4da' }}>BEST</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{bestScore}</div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '10px',
      }}>
        <button
          onClick={() => setDifficulty(difficulty === 'easy' ? 'hard' : 'easy')}
          style={{
            padding: '6px 12px',
            backgroundColor: theme.colors.tileBackground,
            color: theme.colors.textColor,
            borderRadius: '6px',
            fontSize: '13px',
            border: 'none',
          }}
        >
          {difficulty === 'easy' ? 'Easy' : 'Hard'}
        </button>
        <button
          onClick={undo}
          disabled={history.length === 0}
          style={{
            padding: '6px 12px',
            backgroundColor: theme.colors.tileBackground,
            color: theme.colors.textColor,
            borderRadius: '6px',
            fontSize: '13px',
            border: 'none',
            opacity: history.length === 0 ? 0.5 : 1,
          }}
        >
          ↩ Undo
        </button>
        <button
          onClick={startNewGame}
          style={{
            padding: '6px 12px',
            backgroundColor: theme.colors.textColor,
            color: '#fff',
            borderRadius: '6px',
            fontSize: '13px',
            border: 'none',
          }}
        >
          New Game
        </button>
      </div>

      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundColor: theme.colors.tileBorder,
          padding: '8px',
          borderRadius: '6px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: '8px',
          width: 'min(85vw, 340px)',
          height: 'min(85vw, 340px)',
          maxWidth: '340px',
          maxHeight: '340px',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                backgroundColor: tile ? getTileColor(tile.value) : theme.colors.tileBackground,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tile && tile.value > 100 ? 'min(5vw, 22px)' : 'min(7vw, 28px)',
                fontWeight: 'bold',
                color: tile ? getTextColor(tile.value) : 'transparent',
                transition: 'all 0.15s ease-in-out',
                aspectRatio: '1',
                width: '100%',
                height: '100%',
              }}
            >
              {tile?.value}
            </div>
          ))
        )}
      </div>

      {gameOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            zIndex: 100,
          }}
        >
          <h2 style={{ color: '#fff', fontSize: '36px', marginBottom: '15px' }}>Game Over!</h2>
          <p style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>Score: {score}</p>
          <button
            onClick={initGame}
            style={{
              padding: '12px 24px',
              backgroundColor: theme.colors.textColor,
              color: '#fff',
              borderRadius: '6px',
              fontSize: '16px',
              border: 'none',
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {showNameModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.background,
              padding: '25px',
              borderRadius: '8px',
              textAlign: 'center',
              maxWidth: '300px',
              width: '90%',
            }}
          >
            <h2 style={{ marginBottom: '15px', color: theme.colors.textColor, fontSize: '24px' }}>Enter Your Name</h2>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              style={{
                padding: '10px',
                fontSize: '16px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.tileBorder}`,
                marginBottom: '15px',
                width: '100%',
                textAlign: 'center',
                backgroundColor: theme.colors.tileBackground,
                color: theme.colors.textColor,
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
            />
            <button
              onClick={handleStartGame}
              style={{
                padding: '10px 24px',
                backgroundColor: theme.colors.textColor,
                color: '#fff',
                borderRadius: '6px',
                fontSize: '16px',
                border: 'none',
                width: '100%',
              }}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
