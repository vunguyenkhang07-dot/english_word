const words = [
    { word: "javascript", hint: "Ngôn ngữ lập trình phổ biến cho web" },
    { word: "developer", hint: "Người chuyên xây dựng phần mềm, ứng dụng" },
    { word: "computer", hint: "Thiết bị điện tử dùng để tính toán, xử lý dữ liệu" },
    { word: "universe", hint: "Toàn bộ không gian, thời gian và vật chất" },
    { word: "sunlight", hint: "Ánh sáng chiếu từ mặt trời" },
    { word: "adventure", hint: "Một chuyến đi mạo hiểm, khám phá thú vị" },
    { word: "knowledge", hint: "Sự hiểu biết, thông tin tích lũy được" },
    { word: "challenge", hint: "Thử thách đòi hỏi sự nỗ lực vượt qua" }
];

const scrambledWordEl = document.getElementById("scrambled-word");
const hintTextEl = document.getElementById("hint-text");
const userInputEl = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const skipBtn = document.getElementById("skip-btn");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");

let currentWordObj = {};
let score = 0;
let timer;
let timeLeft = 30;

function startTimer() {
    clearInterval(timer);
    timeLeft = 30;
    timerEl.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            showMessage("Hết giờ mất rồi! Chuyển từ tiếp theo.", "red");
            setTimeout(initGame, 1500);
        }
    }, 1000);
}

function shuffleWord(word) {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const shuffled = arr.join("");
    // Đảm bảo từ xáo trộn khác từ gốc
    if (shuffled === word) {
        return shuffleWord(word);
    }
    return shuffled;
}

function initGame() {
    startTimer();
    userInputEl.value = "";
    messageEl.textContent = "";
    
    // Chọn ngẫu nhiên một từ trong danh sách
    currentWordObj = words[Math.floor(Math.random() * words.length)];
    scrambledWordEl.textContent = shuffleWord(currentWordObj.word);
    hintTextEl.textContent = currentWordObj.hint;
}

function showMessage(text, color) {
    messageEl.textContent = text;
    messageEl.style.color = color;
}

function checkWord() {
    const userGuess = userInputEl.value.trim().toLowerCase();
    if (!userGuess) {
        showMessage("Vui lòng nhập từ trả lời!", "orange");
        return;
    }

    if (userGuess === currentWordObj.word) {
        score += 10;
        scoreEl.textContent = score;
        clearInterval(timer);
        showMessage("Chính xác! Làm rất tốt 🎉", "green");
        setTimeout(initGame, 1500);
    } else {
        showMessage("Sai rồi, hãy thử lại nhé! ❌", "red");
    }
}

// Sự kiện bấm nút
submitBtn.addEventListener("click", checkWord);
userInputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkWord();
});

hintBtn.addEventListener("click", () => {
    const word = currentWordObj.word;
    showMessage(`Gợi ý chữ cái đầu: "${word[0].toUpperCase()}" và có ${word.length} chữ cái.`, "blue");
});

skipBtn.addEventListener("click", () => {
    showMessage(`Đã bỏ qua. Từ đúng là: ${currentWordObj.word}`, "purple");
    setTimeout(initGame, 1500);
});

// Chạy game lần đầu
initGame();
