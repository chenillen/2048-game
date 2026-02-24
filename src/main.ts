import './style/main.css';
import { GameLogic, Difficulty } from './logic/game';
import confetti from 'canvas-confetti';

const gridDisplay = document.getElementById('grid')!;
const scoreDisplay = document.getElementById('score')!;
const bestDisplay = document.getElementById('best')!;
const bestNameDisplay = document.getElementById('best-name')!;
const gameOverModal = document.getElementById('game-over-modal')!;
const finalScoreDisplay = document.getElementById('final-score')!;
const nameModal = document.getElementById('name-modal')!;
const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
const startGameBtn = document.getElementById('start-game-btn')!;
const musicToggle = document.getElementById('music-toggle')!;
const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
const diffOptions = document.querySelectorAll('.diff-option');

const game = new GameLogic();
let selectedDifficulty: Difficulty = 'easy';

// Sound Effects
const sfx = {
    move: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    merge: new Audio('https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3'),
    celebrate: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3')
};

// Music Logic
const tracks = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
];

const musicAudio = new Audio();
musicAudio.loop = false; // We'll manually handle track change
let isMusicOn = false;

function playRandomTrack() {
    if (!isMusicOn) return;
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    musicAudio.src = randomTrack;
    musicAudio.play().catch(() => {
        isMusicOn = false;
        updateMusicUI();
    });
}

musicAudio.onended = () => playRandomTrack();

function updateMusicUI() {
    musicToggle.innerText = isMusicOn ? '🎵 On' : '🎵 Off';
    musicToggle.classList.toggle('off', !isMusicOn);
}

musicToggle.addEventListener('click', () => {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
        if (!musicAudio.src) playRandomTrack();
        else musicAudio.play();
    } else {
        musicAudio.pause();
    }
    updateMusicUI();
});

// Difficulty Selection
diffOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        sfx.click.play();
        diffOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDifficulty = btn.getAttribute('data-value') as Difficulty;
    });
});

function render() {
    const size = gridDisplay.clientWidth;
    const padding = size * 0.0375;
    const cellSize = (size - padding * 5) / 4;
    const step = cellSize + padding;

    const currentIds = new Set(game.getGrid().filter(t => t !== null).map(t => t!.id));
    
    gridDisplay.querySelectorAll('.tile').forEach(el => {
        const id = parseInt(el.id.split('-')[1]);
        if (!currentIds.has(id)) el.remove();
    });

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
            gridDisplay.appendChild(el);
            el.offsetHeight; 
            el.style.transition = '';
        }

        el.innerText = tile.value.toString();
        el.className = `tile tile-${tile.value}`;
        
        const digits = tile.value.toString().length;
        if (digits >= 4) el.classList.add(`tile-digits-${digits}`);
        
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
        gameOverModal.classList.remove('hidden');
    } else {
        gameOverModal.classList.add('hidden');
    }
}

function isModalOpen() {
    return !gameOverModal.classList.contains('hidden') || !nameModal.classList.contains('hidden');
}

function handleInput(direction: 'left' | 'right' | 'up' | 'down') {
    if (game.isGameOver() || isModalOpen()) return;
    
    const result = game.move(direction);
    if (result.moved) {
        if (result.merged) {
            sfx.merge.currentTime = 0;
            sfx.merge.play();
        } else {
            sfx.move.currentTime = 0;
            sfx.move.play();
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
            sfx.celebrate.play();
            triggerConfetti();
            break;
        }
    }
}

function triggerConfetti() {
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

// Global reset for the button
(window as any).resetGame = () => {
    sfx.click.play();
    gameOverModal.classList.add('hidden');
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
    if (isMusicOn && !musicAudio.src) playRandomTrack();
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

let startX: number | null, startY: number | null;
const handleTouch = (x: number, y: number) => {
    if (startX === null || startY === null) return;
    const dx = x - startX;
    const dy = y - startY;
    const threshold = 30;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > threshold) handleInput(dx > 0 ? 'right' : 'left');
    } else {
        if (Math.abs(dy) > threshold) handleInput(dy > 0 ? 'down' : 'up');
    }
    startX = startY = null;
};

document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', e => handleTouch(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true });
document.addEventListener('mousedown', e => { startX = e.clientX; startY = e.clientY; });
document.addEventListener('mouseup', e => handleTouch(e.clientX, e.clientY));

window.addEventListener('resize', render);

game.init();
render();
