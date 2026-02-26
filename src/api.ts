// projects/2048-game/src/api.ts

const SUPABASE_URL = 'https://aizqcftuombkakgaaszd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6MkGtV8tT5JmsPJq6L297Q_j-YgYQC0';
const LOCAL_STORAGE_KEY = '2048-leaderboard';

const VALID_MODES = ['normal', 'easy', 'hard'];

function isValidMode(mode: string): boolean {
    return VALID_MODES.includes(mode);
}

export interface ScoreEntry {
    id?: number;
    score: number;
    mode: string;
    user: {
        name: string;
    };
    created_at?: string;
    createdAt?: string;
}

function getLocalLeaderboard(): ScoreEntry[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to parse local leaderboard:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return [];
}

function saveLocalLeaderboard(scores: ScoreEntry[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
}

async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        ...options,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': options.method === 'POST' ? 'return=representation' : 'return=minimal',
            ...options.headers,
        },
    });
    if (!response.ok) {
        throw new Error(`Supabase error: ${response.statusText}`);
    }
    if (options.method === 'POST' || options.method === 'GET') {
        return response.json();
    }
    return null;
}

export async function getLeaderboard(mode: string = 'normal'): Promise<ScoreEntry[]> {
    const validMode = isValidMode(mode) ? mode : 'normal';
    let localScores = getLocalLeaderboard();
    const filtered = localScores.filter(s => s.mode === validMode);
    
    try {
        const scoresData = await supabaseRequest(
            `scores?mode=eq.${validMode}&select=id,score,mode,created_at,user_id&order=score.desc&limit=10`,
            { method: 'GET' }
        );
        
        const usersData = await supabaseRequest(
            `users?select=id,name`,
            { method: 'GET' }
        );
        
        interface SupabaseScore {
            id: number;
            score: number;
            mode: string;
            created_at: string;
            user_id: number;
        }
        
        interface SupabaseUser {
            id: number;
            name: string;
        }
        
        const scores = Array.isArray(scoresData) ? scoresData : [];
        const users = Array.isArray(usersData) ? usersData : [];
        const userMap = new Map(users.map((u: SupabaseUser) => [u.id, u.name]));
        
        const mapped: ScoreEntry[] = scores.map((s: SupabaseScore) => ({
            score: s.score,
            mode: s.mode,
            user: { name: userMap.get(s.user_id) || 'Anonymous' },
            createdAt: s.created_at,
        }));
        
        const merged = [...filtered, ...mapped]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        return merged;
    } catch (error) {
        console.error('Failed to fetch leaderboard, using local:', error);
        return filtered.sort((a, b) => b.score - a.score).slice(0, 10);
    }
}

export async function submitScore(name: string, score: number, mode: string): Promise<ScoreEntry | null> {
    const trimmedName = (name || '').trim();
    if (!trimmedName || trimmedName.length > 50) {
        console.error('Invalid name');
        return null;
    }
    if (typeof score !== 'number' || score < 0 || !Number.isFinite(score)) {
        console.error('Invalid score');
        return null;
    }
    
    const validMode = isValidMode(mode) ? mode : 'normal';
    
    const newEntry: ScoreEntry = {
        score,
        mode: validMode,
        user: { name: trimmedName },
        createdAt: new Date().toISOString()
    };

    const localScores = getLocalLeaderboard();
    localScores.push(newEntry);
    saveLocalLeaderboard(localScores);

    try {
        let userData = await supabaseRequest(
            `users?name=eq.${encodeURIComponent(trimmedName)}&select=id`,
            { method: 'GET' }
        );
        
        let userId: number;
        
        if (Array.isArray(userData) && userData.length > 0) {
            userId = userData[0].id;
        } else {
            const created = await supabaseRequest('users', {
                method: 'POST',
                body: JSON.stringify({ name: trimmedName }),
            });
            userId = created[0]?.id;
        }

        if (userId) {
            await supabaseRequest('scores', {
                method: 'POST',
                body: JSON.stringify({ score, mode: validMode, user_id: userId }),
            });
        }

        return newEntry;
    } catch (error) {
        console.error('Failed to submit score to server, saved locally:', error);
        return newEntry;
    }
}
