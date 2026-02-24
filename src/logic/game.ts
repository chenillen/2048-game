export interface Tile {
    value: number;
    id: number;
    isNew: boolean;
    isMerged: boolean;
}

export type Grid = (Tile | null)[];

export class GameLogic {
    private grid: Grid = Array(16).fill(null);
    private score: number = 0;
    private bestScore: number = 0;
    private playerName: string = 'Player';
    private tileCounter: number = 0;
    private celebratedTiles: Set<number> = new Set();

    constructor() {
        this.loadScores();
    }

    private loadScores() {
        const savedBest = localStorage.getItem('2048-best-score');
        if (savedBest) {
            const data = JSON.parse(savedBest);
            this.bestScore = data.score;
            this.playerName = data.name;
        }
    }

    private saveScores() {
        localStorage.setItem('2048-best-score', JSON.stringify({
            score: this.bestScore,
            name: this.playerName
        }));
    }

    public saveState() {
        localStorage.setItem('2048-game-state', JSON.stringify({
            grid: this.grid,
            score: this.score,
            tileCounter: this.tileCounter,
            celebratedTiles: Array.from(this.celebratedTiles)
        }));
    }

    public loadState(): boolean {
        const saved = localStorage.getItem('2048-game-state');
        if (saved) {
            const data = JSON.parse(saved);
            this.grid = data.grid;
            this.score = data.score;
            this.tileCounter = data.tileCounter;
            this.celebratedTiles = new Set(data.celebratedTiles || []);
            return true;
        }
        return false;
    }

    public init(restore: boolean = true) {
        if (restore && this.loadState()) {
            return;
        }
        this.grid = Array(16).fill(null);
        this.score = 0;
        this.celebratedTiles = new Set();
        this.addTile();
        this.addTile();
    }

    public addTile() {
        const emptyIndices = this.grid.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);
        if (emptyIndices.length > 0) {
            const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            
            // Revised Hard Mode Logic:
            // New tiles can be any power of 2 up to 2 levels below max_tile (max_tile / 4).
            // Larger numbers have a significantly lower spawn rate.
            const maxVal = Math.max(...this.grid.map(t => t ? t.value : 0));
            let newValue = 2;

            if (maxVal >= 16) {
                const maxLevel = Math.log2(maxVal) - 2; // 2 levels below max
                // Weighting: Higher numbers are less likely.
                // We'll use an exponential distribution or simple weighting.
                const possibleLevels = [];
                for (let i = 1; i <= maxLevel; i++) {
                    // level 1 (value 2) gets weight 100, level 2 (value 4) gets 50, level 3 (value 8) gets 25...
                    const weight = Math.floor(200 / Math.pow(2, i));
                    for (let j = 0; j < weight; j++) possibleLevels.push(i);
                }
                const randomLevel = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];
                newValue = Math.pow(2, randomLevel);
            } else {
                newValue = Math.random() < 0.9 ? 2 : 4;
            }

            this.grid[randomIdx] = {
                value: newValue,
                id: this.tileCounter++,
                isNew: true,
                isMerged: false
            };
        }
    }

    public isGameOver(): boolean {
        // 1. Check for empty cells
        if (this.grid.some(t => t === null)) return false;

        // 2. Check for possible merges
        const size = 4;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const current = this.grid[r * size + c]!.value;
                // Check right
                if (c < size - 1 && current === this.grid[r * size + c + 1]!.value) return false;
                // Check down
                if (r < size - 1 && current === this.grid[(r + 1) * size + c]!.value) return false;
            }
        }

        return true;
    }

    public move(direction: 'left' | 'right' | 'up' | 'down'): boolean {
        let moved = false;
        const size = 4;
        let newGrid = Array(16).fill(null);

        const getIdx = (r: number, c: number) => r * size + c;

        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < size; r++) {
                let row: (Tile | null)[] = [];
                for (let c = 0; c < size; c++) row.push(this.grid[getIdx(r, c)]);
                if (direction === 'right') row.reverse();

                let filtered = row.filter((t): t is Tile => t !== null);
                let merged: (Tile | null)[] = [];

                for (let i = 0; i < filtered.length; i++) {
                    if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value) {
                        const newValue = filtered[i].value * 2;
                        merged.push({
                            value: newValue,
                            id: filtered[i].id,
                            isNew: false,
                            isMerged: true
                        });
                        this.score += newValue;
                        i++;
                        moved = true;
                    } else {
                        filtered[i].isNew = false;
                        filtered[i].isMerged = false;
                        merged.push(filtered[i]);
                    }
                }

                while (merged.length < size) merged.push(null);
                if (direction === 'right') merged.reverse();
                for (let c = 0; c < size; c++) {
                    if (this.grid[getIdx(r, c)]?.id !== merged[c]?.id) moved = true;
                    newGrid[getIdx(r, c)] = merged[c];
                }
            }
        } else {
            for (let c = 0; c < size; c++) {
                let col: (Tile | null)[] = [];
                for (let r = 0; r < size; r++) col.push(this.grid[getIdx(r, c)]);
                if (direction === 'down') col.reverse();

                let filtered = col.filter((t): t is Tile => t !== null);
                let merged: (Tile | null)[] = [];

                for (let i = 0; i < filtered.length; i++) {
                    if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value) {
                        const newValue = filtered[i].value * 2;
                        merged.push({ value: newValue, id: filtered[i].id, isNew: false, isMerged: true });
                        this.score += newValue;
                        i++;
                        moved = true;
                    } else {
                        filtered[i].isNew = false;
                        filtered[i].isMerged = false;
                        merged.push(filtered[i]);
                    }
                }

                while (merged.length < size) merged.push(null);
                if (direction === 'down') merged.reverse();
                for (let r = 0; r < size; r++) {
                    if (this.grid[getIdx(r, c)]?.id !== merged[r]?.id) moved = true;
                    newGrid[getIdx(r, c)] = merged[r];
                }
            }
        }

        if (moved) {
            this.grid = newGrid;
            this.addTile();
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.saveScores();
            }
            this.saveState();
        }
        return moved;
    }

    public getGrid() { return this.grid; }
    public getScore() { return this.score; }
    public getBestScore() { return this.bestScore; }
    public getPlayerName() { return this.playerName; }
    public getCelebratedTiles() { return this.celebratedTiles; }
    public setPlayerName(name: string) { 
        this.playerName = name; 
        this.saveScores();
    }
}
