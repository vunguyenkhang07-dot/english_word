const wordsBank = [
    { word: "javascript", phonetic: "/ˈdʒɑːvəˌskrɪpt/", hint: "A high-level programming language core to web development." },
    { word: "developer", phonetic: "/dɪˈvɛləpər/", hint: "A person who builds and creates computer software or applications." },
    { word: "computer", phonetic: "/kəmˈpjuːtər/", hint: "An electronic device for storing and processing data." },
    { word: "universe", phonetic: "/ˈjuːnɪvɜːrs/", hint: "All existing matter and space considered as a whole." },
    { word: "adventure", phonetic: "/ədˈvɛntʃər/", hint: "An unusual and exciting, typically hazardous experience." },
    { word: "knowledge", phonetic: "/ˈnɒlɪdʒ/", hint: "Information and skills gained through education or experience." },
    { word: "challenge", phonetic: "/ˈtʃælɪndʒ/", hint: "A call to take part in a contest or a difficult task." },
    { word: "sunlight", phonetic: "/ˈsʌnlaɪt/", hint: "Light derived directly from the sun." },
    { word: "keyboard", phonetic: "/ˈkiːbɔːrd/", hint: "A panel of keys that operate a computer or typewriter." },
    { word: "mountain", phonetic: "/ˈmaʊntɪn/", hint: "A large natural elevation of the earth's surface." },
    { word: "umbrella", phonetic: "/ʌmˈbrɛlə/", hint: "A device used as protection against rain or sunlight." },
    { word: "festival", phonetic: "/ˈfɛstɪvəl/", hint: "A day or period of celebration, typically for religious reasons." },
    { word: "strategy", phonetic: "/ˈstrætədʒi/", hint: "A plan of action designed to achieve a long-term goal." },
    { word: "discovery", phonetic: "/dɪˈskʌvəri/", hint: "The action or process of discovering or being discovered." },
    { word: "ecosystem", phonetic: "/ˈiːkoʊsɪstəm/", hint: "A biological community of interacting organisms and their physical environment." },
    { word: "brilliant", phonetic: "/ˈbrɪljənt/", hint: "Exceptionally clever or talented; very bright." },
    { word: "starlight", phonetic: "/ˈstɑːrlaɪt/", hint: "Light proceeding from the stars." },
    { word: "rainforest", phonetic: "/ˈreɪnfɔːrɪst/", hint: "A luxuriant, dense forest rich in biodiversity, found in tropical areas." },
    { word: "horizon", phonetic: "/həˈraɪzn/", hint: "The line where the earth and sky appear to meet." },
    { word: "galaxy", phonetic: "/ˈɡæləksi/", hint: "A system of millions or billions of stars, together with gas and dust." },
    { word: "harmony", phonetic: "/ˈhɑːrməni/", hint: "The quality of forming a pleasing and consistent whole." },
    { word: "freedom", phonetic: "/ˈfriːdəm/", hint: "The power or right to act, speak, or think as one wants." },
    { word: "curiosity", phonetic: "/ˌkjʊriˈɒsɪti/", hint: "A strong desire to know or learn something." },
    { word: "magnificent", phonetic: "/mæɡˈnɪfɪsnt/", hint: "Extremely beautiful, elaborate, or impressive." },
    { word: "inspiration", phonetic: "/ˌɪnspəˈreɪʃn/", hint: "The process of being mentally stimulated to do or feel something." },
    { word: "architecture", phonetic: "/ˈɑːrkɪtɛktʃər/", hint: "The art or practice of designing and constructing buildings." },
    { word: "atmosphere", phonetic: "/ˈætməsfɪr/", hint: "The envelope of gases surrounding the earth or another planet." },
    { word: "compassion", phonetic: "/kəmˈpæʃn/", hint: "Sympathetic pity and concern for the sufferings or misfortunes of others." },
    { word: "destination", phonetic: "/ˌdɛstɪˈneɪʃn/", hint: "The place to which someone or something is going or being sent." },
    { word: "electricity", phonetic: "/ɪˌlɛkˈtrɪsɪti/", hint: "A form of energy resulting from the existence of charged particles." }
];

const dropZoneEl = document.getElementById("drop-zone");
const letterPoolEl = document.getElementById("letter-pool");
const hintTextEl = document.getElementById("hint-text");
const phoneticTextEl = document.getElementById("phonetic-text");
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
let audioCtx = null;

// Khởi tạo AudioContext khi người dùng chạm lần đầu (Bắt buộc cho mobile / iOS / iPadOS)
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'correct') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        console.log(e);
    }
}

// Hàm phát âm chuẩn trên điện thoại và máy tính bảng
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
            showMessage("Time's up! Next stage...", "red");
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

    currentWordObj = wordsBank[Math.floor(Math.random() * wordsBank.length)];
    hintTextEl.textContent = currentWordObj.hint;
    phoneticTextEl.textContent = `Pronunciation: ${currentWordObj.phonetic}`;

    const targetWord = currentWordObj.word;

    // Tạo ô trống
    for (let i = 0; i < targetWord.length; i++) {
        const slot = document.createElement("div");
        slot.classList.add("drop-slot");
        slot.dataset.index = i;

        // Xử lý chạm / click vào ô đã điền để trả chữ về kho
        slot.addEventListener("click", () => {
            initAudio();
            if (slot.hasChildNodes()) {
                const tile = slot.firstElementChild;
                tile.classList.remove("used");
                letterPoolEl.appendChild(tile);
                messageEl.textContent = "";
            }
        });

        dropZoneEl.appendChild(slot);
    }

    // Tạo các phím chữ cái xáo trộn
    const shuffledLetters = shuffle(targetWord.split(""));
    shuffledLetters.forEach((char) => {
        const tile = document.createElement("div");
        tile.classList.add("letter-tile");
        tile.textContent = char.toUpperCase();

        // Tối ưu chạm và click cho điện thoại, ipad, pc
        tile.addEventListener("click", () => {
            initAudio();
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
        showMessage("Correct! Awesome job! 🎉", "green");
        speakWord(currentWordObj.word);
        setTimeout(initGame, 1800);
    } else {
        playSound('wrong');
        showMessage("Incorrect! Try again. ❌", "red");
    }
}

// Nút trợ giúp tự động điền 1 chữ cái đúng
helperBtn.addEventListener("click", () => {
    initAudio();
    const targetWord = currentWordObj.word;
    const slots = Array.from(dropZoneEl.children);
    
    for (let i = 0; i < slots.length; i++) {
        const correctChar = targetWord[i].toUpperCase();
        const currentTile = slots[i].firstElementChild;
        
        if (!currentTile || currentTile.textContent !== correctChar) {
            if (currentTile) {
                currentTile.classList.remove("used");
                letterPoolEl.appendChild(currentTile);
            }
            
            const availableTile = Array.from(letterPoolEl.children).find(t => t.textContent === correctChar && !t.classList.contains("used")) ||
                                  slots.find(s => s.firstElementChild && s.firstElementChild.textContent === correctChar)?.firstElementChild;
            
            if (availableTile) {
                availableTile.classList.remove("used");
                slots[i].appendChild(availableTile);
                availableTile.classList.add("used");
                messageEl.textContent = "Helper used: Placed a correct letter!";
                messageEl.style.color = "#2196F3";
                checkWinCondition();
                return;
            }
        }
    }
});

speakBtn.addEventListener("click", () => {
    initAudio();
    speakWord(currentWordObj.word);
});

clearBtn.addEventListener("click", () => {
    initAudio();
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
    initAudio();
    playSound('wrong');
    showMessage(`Skipped! Word was: ${currentWordObj.word}`, "purple");
    setTimeout(initGame, 1500);
});

// Chạm màn hình kích hoạt âm thanh cho lần đầu tiên trên iOS/Android
document.addEventListener('touchstart', initAudio, { once: true });
document.addEventListener('click', initAudio, { once: true });

// Khởi chạy game
initGame();
