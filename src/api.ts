// projects/2048-game/src/api.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const LOCAL_STORAGE_KEY = '2048-leaderboard';

export interface ScoreEntry {
    score: number;
    mode: string;
    user: {
        name: string;
    };
    createdAt: string;
}

function getLocalLeaderboard(): ScoreEntry[] {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

function saveLocalLeaderboard(scores: ScoreEntry[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
}

export async function getLeaderboard(mode: string = 'normal'): Promise<ScoreEntry[]> {
    let localScores = getLocalLeaderboard();
    const filtered = localScores.filter(s => s.mode === mode);
    
    try {
        const response = await fetch(`${API_URL}/leaderboard?mode=${mode}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const serverScores: ScoreEntry[] = await response.json();
        
        const merged = [...filtered, ...serverScores]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        return merged;
    } catch (error) {
        console.error('Failed to fetch leaderboard, using local:', error);
        return filtered.sort((a, b) => b.score - a.score).slice(0, 10);
    }
}

export async function submitScore(name: string, score: number, mode: string): Promise<ScoreEntry | null> {
    const newEntry: ScoreEntry = {
        score,
        mode,
        user: { name },
        createdAt: new Date().toISOString()
    };

    const localScores = getLocalLeaderboard();
    localScores.push(newEntry);
    saveLocalLeaderboard(localScores);

    try {
        const response = await fetch(`${API_URL}/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, score, mode }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to submit score to server, saved locally:', error);
        return newEntry;
    }
}
