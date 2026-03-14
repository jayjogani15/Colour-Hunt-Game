const COLORS = [
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#22c55e" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Orange", hex: "#f97316" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Amber", hex: "#f59e0b" }
];

let gameState = {
    score: 0,
    highScore: localStorage.getItem('colorHuntHighScore') || 0,
    timeLeft: 30,
    maxTime: 30,
    currentColor: null,
    currentWord: null,
    timerInterval: null,
    isActive: false,
    combo: 0,
    maxCombo: localStorage.getItem('colorHuntMaxCombo') || 0
};

// Audio Manager
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const sounds = {
    success: (freq = 600) => playTone(freq, 0.1, 'sine'),
    error: () => playTone(150, 0.2, 'sawtooth'),
    tick: () => playTone(800, 0.05, 'sine', 0.1),
    gameOver: () => {
        playTone(400, 0.2, 'sine');
        setTimeout(() => playTone(300, 0.2, 'sine'), 200);
        setTimeout(() => playTone(200, 0.4, 'sine'), 400);
    }
};

function playTone(freq, duration, type, volume = 0.2) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over-screen')
};

const elements = {
    colorWord: document.getElementById('color-word'),
    btnContainer: document.getElementById('btn-grid'),
    score: document.getElementById('current-score'),
    highScore: document.getElementById('high-score'),
    timer: document.getElementById('timer-val'),
    timerProgress: document.getElementById('timer-progress'),
    finalScore: document.getElementById('final-score'),
    flash: document.getElementById('feedback-flash'),
    combo: document.getElementById('combo-display'),
    app: document.getElementById('app-container')
};

function init() {
    elements.highScore.textContent = gameState.highScore;
    registerListeners();
}

function registerListeners() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
}

function showScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenKey].classList.add('active');
}

function startGame() {
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxTime = 30;
    gameState.timeLeft = gameState.maxTime;
    gameState.isActive = true;
    
    elements.score.textContent = '0';
    elements.timer.textContent = gameState.maxTime;
    elements.timerProgress.style.width = '100%';
    elements.timerProgress.style.backgroundColor = 'var(--primary)';

    createButtons();
    pickNewChallenge();
    showScreen('game');

    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function createButtons() {
    elements.btnContainer.innerHTML = '';
    COLORS.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color.hex;
        btn.addEventListener('click', (e) => handleColorClick(color.name, e));
        elements.btnContainer.appendChild(btn);
    });
}

function pickNewChallenge() {
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    let colorIdx;
    do {
        colorIdx = Math.floor(Math.random() * COLORS.length);
    } while (colorIdx === wordIdx);

    gameState.currentWord = COLORS[wordIdx].name;
    gameState.currentColor = COLORS[colorIdx].name;

    elements.colorWord.textContent = gameState.currentWord;
    elements.colorWord.style.color = COLORS[colorIdx].hex;
    
    // Add dynamic pitch based on combo
    const pitch = 600 + (gameState.combo * 50);
    sounds.success(pitch);

    elements.colorWord.style.animation = 'none';
    elements.colorWord.offsetHeight;
    elements.colorWord.style.animation = 'fadeIn 0.2s ease-out';
}

function handleColorClick(clickedColorName, event) {
    if (!gameState.isActive) return;

    if (clickedColorName === gameState.currentColor) {
        // Correct Answer
        gameState.combo++;
        const multiplier = Math.floor(gameState.combo / 5) + 1;
        gameState.score += multiplier;
        elements.score.textContent = gameState.score;
        
        if (gameState.combo >= 3) {
            updateComboDisplay();
        }

        triggerFeedback('correct');
        createParticles(event.clientX, event.clientY, COLORS.find(c => c.name === clickedColorName).hex);
        
        gameState.maxTime = Math.max(10, 30 - Math.floor(gameState.score / 10) * 2);
        gameState.timeLeft = Math.min(gameState.maxTime, gameState.timeLeft + 1.5);
        
        pickNewChallenge();
    } else {
        // Wrong Answer
        gameState.combo = 0;
        hideComboDisplay();
        sounds.error();
        triggerFeedback('wrong');
        triggerShake();
        gameState.timeLeft = Math.max(0, gameState.timeLeft - 3);
        updateTimerVisuals();
    }
}

function updateComboDisplay() {
    elements.combo.textContent = `COMBO X${gameState.combo}!`;
    elements.combo.classList.add('active');
}

function hideComboDisplay() {
    elements.combo.classList.remove('active');
}

function triggerShake() {
    elements.app.classList.add('shake');
    setTimeout(() => elements.app.classList.remove('shake'), 400);
}

function createParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        document.body.appendChild(p);
        
        p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => p.remove();
    }
}

function triggerFeedback(type) {
    elements.flash.className = type;
    setTimeout(() => {
        elements.flash.className = '';
    }, 150);
}

function updateTimer() {
    gameState.timeLeft--;
    updateTimerVisuals();

    if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
        sounds.tick();
    }

    if (gameState.timeLeft <= 0) {
        sounds.gameOver();
        endGame();
    }
}

function updateTimerVisuals() {
    elements.timer.textContent = Math.max(0, gameState.timeLeft);
    const percentage = (gameState.timeLeft / gameState.maxTime) * 100;
    elements.timerProgress.style.width = `${percentage}%`;
    
    if (gameState.timeLeft <= (gameState.maxTime * 0.2)) {
        elements.timerProgress.style.backgroundColor = 'var(--wrong)';
    } else {
        elements.timerProgress.style.backgroundColor = 'var(--primary)';
    }
}

function endGame() {
    gameState.isActive = false;
    clearInterval(gameState.timerInterval);
    hideComboDisplay();
    
    elements.finalScore.textContent = gameState.score;
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('colorHuntHighScore', gameState.score);
        elements.highScore.textContent = gameState.highScore;
    }

    if (gameState.combo > gameState.maxCombo) {
        gameState.maxCombo = gameState.combo;
        localStorage.setItem('colorHuntMaxCombo', gameState.maxCombo);
    }
    
    showScreen('gameOver');
}

init();
