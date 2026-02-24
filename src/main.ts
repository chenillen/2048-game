import './style/main.css';
import { GameLogic } from './logic/game';

const gridDisplay = document.getElementById('grid')!;
const scoreDisplay = document.getElementById('score')!;
const bestDisplay = document.getElementById('best')!;
const bestNameDisplay = document.getElementById('best-name')!;
const game = new GameLogic();

function render() {
    const size = gridDisplay.clientWidth;
    const padding = size * 0.0375;
    const cellSize = (size - padding * 5) / 4;
    const step = cellSize + padding;

    const currentIds = new Set(game.getGrid().filter(t => t !== null).map(t => t!.id));
    
    // Cleanup removed elements
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

        let el = document.getElementById(`tile-${tile.id}`);
        if (!el) {
            el = document.createElement('div');
            el.id = `tile-${tile.id}`;
            el.classList.add('tile');
            gridDisplay.appendChild(el);
        }

        el.innerText = tile.value.toString();
        el.className = `tile tile-${tile.value}`;
        if (tile.isNew) el.classList.add('tile-new');
        if (tile.isMerged) el.classList.add('tile-merged');

        el.style.width = `${cellSize}px`;
        el.style.height = `${cellSize}px`;
        el.style.transform = `translate(${left}px, ${top}px)`;
    });

    scoreDisplay.innerText = game.getScore().toString();
    bestDisplay.innerText = game.getBestScore().toString();
    bestNameDisplay.innerText = game.getPlayerName();
}

function handleInput(direction: 'left' | 'right' | 'up' | 'down') {
    if (game.move(direction)) {
        render();
    }
}

// Global reset for the button
(window as any).resetGame = () => {
    const name = prompt("Enter your name for high scores:", game.getPlayerName());
    if (name) game.setPlayerName(name);
    game.init(false);
    render();
};

// Keyboard Handlers
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') handleInput('left');
    if (e.key === 'ArrowRight') handleInput('right');
    if (e.key === 'ArrowUp') handleInput('up');
    if (e.key === 'ArrowDown') handleInput('down');
    
    // CMD+N or CTRL+N for new game
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        (window as any).resetGame();
    }
});

// Swipe Logic
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

// Startup
game.init();
render();
