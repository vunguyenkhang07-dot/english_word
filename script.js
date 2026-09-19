const wordsBank = [
    { word: "javascript", hint: "A high-level programming language core to web development" },
    { word: "developer", hint: "A person who builds and creates computer software or applications" },
    { word: "computer", hint: "An electronic device for storing and processing data" },
    { word: "universe", hint: "All existing matter and space considered as a whole" },
    { word: "adventure", hint: "An unusual and exciting, typically hazardous experience" },
    { word: "knowledge", hint: "Information and skills gained through education or experience" },
    { word: "challenge", hint: "A call to take part in a contest or a difficult task" },
    { word: "sunlight", hint: "Light derived directly from the sun" },
    { word: "keyboard", hint: "A panel of keys that operate a computer or typewriter" },
    { word: "mountain", hint: "A large natural elevation of the earth's surface" },
    { word: "umbrella", hint: "A device used as protection against rain or sunlight" },
    { word: "festival", hint: "A day or period of celebration, typically for religious reasons" },
    { word: "response", hint: "An answer or reaction to something" },
    { word: "strategy", hint: "A plan of action designed to achieve a long-term goal" }
];

const dropZoneEl = document.getElementById("drop-zone");
const letterPoolEl = document.getElementById("letter-pool");
const hintTextEl = document.getElementById("hint-text");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");
const clearBtn = document.getElementById("clear-btn");
const skipBtn = document.getElementById("skip-btn");
const helperBtn = document.getElementById("helper-btn");
const speakBtn = document.getElementById("speak-btn");

let currentWordObj = {};
let score = 0;
let level = 1;
let timer;
let timeLeft = 45;
let draggedTile = null;

// Hàm phát âm thanh hiệu ứng bằng Web Audio API
function playSound(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

// Phát âm từ tiếng Anh sử dụng Speech Synthesis
function speakWord(word) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 45;
    timerEl.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            playSound('wrong');
            showMessage("Time's up! Loading next word...", "red");
            setTimeout(initGame, 1500);
        }
    }, 1000);
}

function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initGame() {
    startTimer();
    messageEl.textContent = "";
    dropZoneEl.innerHTML = "";
    letterPoolEl.innerHTML = "";

    // Mạng vô hạn: Lấy ngẫu nhiên từ kho từ vựng
    currentWordObj = wordsBank[Math.floor(Math.random() * wordsBank.length)];
    hintTextEl.textContent = currentWordObj.hint;

    const targetWord = currentWordObj.word;

    // Tạo các ô trống
    for (let i = 0; i < targetWord.length; i++) {
        const slot = document.createElement("div");
        slot.classList.add("drop-slot");
        slot.dataset.index = i;

        slot.addEventListener("dragover", (e) => e.preventDefault());
        slot.addEventListener("drop", (e) => {
            e.preventDefault();
            if (draggedTile && !slot.hasChildNodes()) {
                slot.appendChild(draggedTile);
                draggedTile.classList.add("used");
                checkWinCondition();
            }
        });

        slot.addEventListener("click", () => {
            if (slot.hasChildNodes()) {
                const tile = slot.firstElementChild;
                tile.classList.remove("used");
                letterPoolEl.appendChild(tile);
                messageEl.textContent = "";
            }
        });

        dropZoneEl.appendChild(slot);
    }

    // Tạo các khối chữ cái xáo trộn
    const shuffledLetters = shuffle(targetWord.split(""));
    shuffledLetters.forEach((char, index) => {
        const tile = document.createElement("div");
        tile.classList.add("letter-tile");
        tile.textContent = char.toUpperCase();
        tile.dataset.char = char;
        tile.draggable = true;

        tile.addEventListener("dragstart", () => {
            draggedTile = tile;
        });

        tile.addEventListener("click", () => {
            if (tile.classList.contains("used")) return;
            const emptySlot = Array.from(dropZoneEl.children).find(slot => !slot.hasChildNodes());
            if (emptySlot) {
                emptySlot.appendChild(tile);
                tile.classList.add("used");
                checkWinCondition();
            }
        });

        letterPoolEl.appendChild(tile);
    });

    // Tự động phát âm gợi ý nhẹ khi đổi từ mới (tùy chọn)
    speakWord(currentWordObj.word);
}

function showMessage(text, color) {
    messageEl.textContent = text;
    messageEl.style.color = color;
}

function checkWinCondition() {
    const slots = Array.from(dropZoneEl.children);
    if (slots.some(slot => !slot.hasChildNodes())) return;

    const userWord = slots.map(slot => slot.firstElementChild.textContent.toLowerCase()).join("");

    if (userWord === currentWordObj.word) {
        score += 10;
        level += 1;
        scoreEl.textContent = score;
        levelEl.textContent = level;
        clearInterval(timer);
        playSound('correct');
        showMessage("Correct! Excellent job! 🎉", "green");
        speakWord(currentWordObj.word);
        setTimeout(initGame, 1800);
    } else {
        playSound('wrong');
        showMessage("Incorrect! Try rearranging the letters. ❌", "red");
    }
}

// Tính năng trợ giúp: Đặt đúng một chữ cái vào ô trống đầu tiên chưa điền
helperBtn.addEventListener("click", () => {
    const targetWord = currentWordObj.word;
    const slots = Array.from(dropZoneEl.children);
    
    // Tìm ô trống đầu tiên chưa khớp đúng chữ cái
    for (let i = 0; i < slots.length; i++) {
        const correctChar = targetWord[i].toUpperCase();
        const currentTile = slots[i].firstElementChild;
        
        if (!currentTile || currentTile.textContent !== correctChar) {
            // Nếu ô đang chứa sai chữ, trả tile cũ về pool
            if (currentTile) {
                currentTile.classList.remove("used");
                letterPoolEl.appendChild(currentTile);
            }
            
            // Tìm tile đúng từ pool hoặc các ô khác
            const availableTile = Array.from(letterPoolEl.children).find(t => t.textContent === correctChar && t.classList.contains("used") === false) ||
                                  slots.find(s => s.firstElementChild && s.firstElementChild.textContent === correctChar)?.firstElementChild;
            
            if (availableTile) {
                availableTile.classList.remove("used");
                slots[i].appendChild(availableTile);
                availableTile.classList.add("used");
                messageEl.textContent = "Hint used: Placed a correct letter!";
                messageEl.style.color = "#2196F3";
                checkWinCondition();
                return;
            }
        }
    }
});

speakBtn.addEventListener("click", () => {
    speakWord(currentWordObj.word);
});

clearBtn.addEventListener("click", () => {
    Array.from(dropZoneEl.children).forEach(slot => {
        if (slot.hasChildNodes()) {
            const tile = slot.firstElementChild;
            tile.classList.remove("used");
            letterPoolEl.appendChild(tile);
        }
    });
    messageEl.textContent = "";
});

skipBtn.addEventListener("click", () => {
    playSound('wrong');
    showMessage(`Skipped! The word was: ${currentWordObj.word}`, "purple");
    setTimeout(initGame, 1500);
});

// Khởi chạy game lần đầu
initGame();
