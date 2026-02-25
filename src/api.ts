// projects/2048-game/src/api.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ScoreEntry {
    score: number;
    mode: string;
    user: {
        name: string;
    };
    createdAt: string;
}

export async function getLeaderboard(mode: string = 'normal'): Promise<ScoreEntry[]> {
    try {
        const response = await fetch(`${API_URL}/leaderboard?mode=${mode}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
    }
}

export async function submitScore(name: string, score: number, mode: string) {
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
        console.error('Failed to submit score:', error);
        return null;
    }
}
