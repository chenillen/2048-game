import './style/main.css';
import { GameLogic, Difficulty } from './logic/game';
import confetti from 'canvas-confetti';
import { getLeaderboard, submitScore, ScoreEntry } from './api';

const gridDisplay = document.getElementById('grid')!;
const scoreDisplay = document.getElementById('score')!;
const bestDisplay = document.getElementById('best')!;
const bestNameDisplay = document.getElementById('best-name')!;
const gameOverModal = document.getElementById('game-over-modal')!;
const finalScoreDisplay = document.getElementById('final-score')!;
const nameModal = document.getElementById('name-modal')!;
const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
const startGameBtn = document.getElementById('start-game-btn')!;
const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
const diffOptions = document.querySelectorAll('.diff-option');

// Leaderboard Elements
const leaderboardBtn = document.getElementById('leaderboard-btn')!;
const leaderboardModal = document.getElementById('leaderboard-modal')!;
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn')!;
const leaderboardList = document.getElementById('leaderboard-list')!;
const lbTabs = document.querySelectorAll('.lb-tab');
const gameOverLbBtn = document.getElementById('game-over-leaderboard-btn')!;

const game = new GameLogic();
let selectedDifficulty: Difficulty = 'easy';
let currentLbMode: string = 'easy';

// Sound Effects
const sfx = {
    celebrate: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3')
};

// Difficulty Selection for New Game
diffOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        sfx.click.play();
        diffOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDifficulty = btn.getAttribute('data-value') as Difficulty;
    });
});

// Leaderboard Tabs
lbTabs.forEach(btn => {
    btn.addEventListener('click', async () => {
        sfx.click.play();
        lbTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLbMode = btn.getAttribute('data-mode') || 'easy';
        await refreshLeaderboard(currentLbMode);
    });
});

async function refreshLeaderboard(mode: string) {
    leaderboardList.innerHTML = 'Loading...';
    const scores = await getLeaderboard(mode);
    leaderboardList.innerHTML = '';
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>No scores yet!</li>';
        return;
    }

    scores.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div><span class="rank">#${index + 1}</span> ${entry.user.name}</div>
            <div>${entry.score}</div>
        `;
        leaderboardList.appendChild(li);
    });
}

function openLeaderboard() {
    leaderboardModal.classList.remove('hidden');
    refreshLeaderboard(currentLbMode);
}

function closeLeaderboard() {
    leaderboardModal.classList.add('hidden');
}

leaderboardBtn.addEventListener('click', () => {
    sfx.click.play();
    openLeaderboard();
});

closeLeaderboardBtn.addEventListener('click', () => {
    sfx.click.play();
    closeLeaderboard();
});

gameOverLbBtn.addEventListener('click', () => {
    sfx.click.play();
    gameOverModal.classList.add('hidden'); // Hide game over modal first
    openLeaderboard();
});

function render() {
    const size = gridDisplay.clientWidth;
    // Mobile optimization: Less padding on small screens
    const padding = size <= 520 ? 6 : size * 0.03; 
    const cellSize = (size - padding * 5) / 4;
    const step = cellSize + padding;

    const currentIds = new Set(game.getGrid().filter(t => t !== null).map(t => t!.id));
    
    // Remove stale tiles
    gridDisplay.querySelectorAll('.tile').forEach(el => {
        const id = parseInt(el.id.split('-')[1]);
        if (!currentIds.has(id)) el.remove();
    });

    // Render tiles
    game.getGrid().forEach((tile, i) => {
        if (!tile) return;

        const row = Math.floor(i / 4);
        const col = i % 4;
        const top = padding + row * step;
        const left = padding + col * step;

        let el = document.getElementById(`tile-${tile.id}`) as HTMLDivElement;
        if (!el) {
            el = document.createElement('div');
            el.id = `tile-${tile.id}`;
            el.classList.add('tile');
            
            el.style.transition = 'none';
            el.style.width = `${cellSize}px`;
            el.style.height = `${cellSize}px`;
            el.style.transform = `translate(${left}px, ${top}px)`;
            
            const inner = document.createElement('div');
            inner.classList.add('tile-inner');
            el.appendChild(inner);
            
            gridDisplay.appendChild(el);
            el.offsetHeight; // force reflow
            el.style.transition = '';
        }

        const inner = el.querySelector('.tile-inner') as HTMLDivElement;
        inner.innerText = tile.value.toString();
        el.className = `tile tile-${tile.value}`;
        
        const digits = tile.value.toString().length;
        if (digits >= 3) el.classList.add(`tile-digits-${digits}`);
        
        if (tile.isNew) el.classList.add('tile-new');
        if (tile.isMerged) el.classList.add('tile-merged');

        el.style.width = `${cellSize}px`;
        el.style.height = `${cellSize}px`;
        el.style.transform = `translate(${left}px, ${top}px)`;
    });

    scoreDisplay.innerText = game.getScore().toString();
    bestDisplay.innerText = game.getBestScore().toString();
    bestNameDisplay.innerText = game.getPlayerName();
    
    undoBtn.style.opacity = game.canUndo() ? '1' : '0.5';

    if (game.isGameOver()) {
        finalScoreDisplay.innerText = game.getScore().toString();
        if (gameOverModal.classList.contains('hidden')) {
            gameOverModal.classList.remove('hidden');
            // Auto submit score
            submitScore(game.getPlayerName(), game.getScore(), game.getDifficulty());
        }
    } else {
        gameOverModal.classList.add('hidden');
    }
}

function isModalOpen() {
    return !gameOverModal.classList.contains('hidden') || 
           !nameModal.classList.contains('hidden') ||
           !leaderboardModal.classList.contains('hidden');
}

function handleInput(direction: 'left' | 'right' | 'up' | 'down') {
    if (game.isGameOver() || isModalOpen()) return;
    
    const result = game.move(direction);
    if (result.moved) {
        if (result.merged && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20);
        }
        render();
        checkCelebration();
    }
}

function checkCelebration() {
    const milestones = [1024, 2048, 4096, 8192];
    const grid = game.getGrid();
    const celebrated = game.getCelebratedTiles();

    for (const tile of grid) {
        if (tile && milestones.includes(tile.value) && !celebrated.has(tile.value)) {
            celebrated.add(tile.value);
            game.saveState();
            triggerConfetti();
            break;
        }
    }
}

function triggerConfetti() {
    sfx.celebrate.play();
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}

(window as any).resetGame = () => {
    sfx.click.play();
    gameOverModal.classList.add('hidden');
    leaderboardModal.classList.add('hidden');
    playerNameInput.value = game.getPlayerName();
    nameModal.classList.remove('hidden');
    playerNameInput.focus();
};

startGameBtn.addEventListener('click', () => {
    sfx.click.play();
    const name = playerNameInput.value.trim() || 'Player';
    game.setPlayerName(name);
    nameModal.classList.add('hidden');
    game.init(false, selectedDifficulty);
    render();
});

undoBtn.addEventListener('click', () => {
    if (game.undo()) {
        sfx.click.play();
        render();
    }
});

playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startGameBtn.click();
});

document.addEventListener('keydown', (e) => {
    if (document.activeElement === playerNameInput) return;
    if (isModalOpen()) return; // Prevent moves when modals are open

    if (e.key === 'ArrowLeft') handleInput('left');
    if (e.key === 'ArrowRight') handleInput('right');
    if (e.key === 'ArrowUp') handleInput('up');
    if (e.key === 'ArrowDown') handleInput('down');
    
    if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        (window as any).resetGame();
    }
    
    if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoBtn.click();
    }
});

// Improved Touch Handling
let startX: number | null, startY: number | null;
const handleTouch = (x: number, y: number) => {
    if (startX === null || startY === null) return;
    const dx = x - startX;
    const dy = y - startY;
    const threshold = 40; // Increased threshold for better distinction
    
    // Only move if swipe is significant
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
            handleInput(dx > 0 ? 'right' : 'left');
        } else {
            handleInput(dy > 0 ? 'down' : 'up');
        }
    }
    startX = startY = null;
};

document.addEventListener('touchstart', e => {
    // Only track if not tapping a button or modal
    if ((e.target as HTMLElement).closest('button') || isModalOpen()) return;
    
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    // Prevent default scrolling only if we are inside the grid
    if ((e.target as HTMLElement).closest('#grid')) {
       // e.preventDefault(); // Optional: might block scrolling page
    }
}, { passive: false });

document.addEventListener('touchend', e => {
    if (isModalOpen()) return;
    handleTouch(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}, { passive: true });

window.addEventListener('resize', render);

// Initial Load
game.init();
render();
