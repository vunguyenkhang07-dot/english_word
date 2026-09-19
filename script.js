const words = [
    { word: "javascript", hint: "Ngôn ngữ lập trình phổ biến cho web" },
    { word: "developer", hint: "Người chuyên xây dựng phần mềm, ứng dụng" },
    { word: "computer", hint: "Thiết bị điện tử dùng để tính toán, xử lý dữ liệu" },
    { word: "universe", hint: "Toàn bộ không gian, thời gian và vật chất" },
    { word: "sunlight", hint: "Ánh sáng chiếu từ mặt trời" },
    { word: "adventure", hint: "Chuyến đi mạo hiểm, khám phá thú vị" }
];

const dropZoneEl = document.getElementById("drop-zone");
const letterPoolEl = document.getElementById("letter-pool");
const hintTextEl = document.getElementById("hint-text");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");
const clearBtn = document.getElementById("clear-btn");
const skipBtn = document.getElementById("skip-btn");

let currentWordObj = {};
let score = 0;
let timer;
let timeLeft = 45;
let draggedTile = null;

function startTimer() {
    clearInterval(timer);
    timeLeft = 45;
    timerEl.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            showMessage("Hết giờ mất rồi! Đang đổi từ...", "red");
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

    currentWordObj = words[Math.floor(Math.random() * words.length)];
    hintTextEl.textContent = currentWordObj.hint;

    const targetWord = currentWordObj.word;

    // Tạo các ô trống tương ứng số chữ cái
    for (let i = 0; i < targetWord.length; i++) {
        const slot = document.createElement("div");
        slot.classList.add("drop-slot");
        slot.dataset.index = i;

        // Sự kiện kéo thả vào ô trống
        slot.addEventListener("dragover", (e) => e.preventDefault());
        slot.addEventListener("drop", (e) => {
            e.preventDefault();
            if (draggedTile && !slot.hasChildNodes()) {
                slot.appendChild(draggedTile);
                draggedTile.classList.add("used");
                checkWinCondition();
            }
        });

        // Hỗ trợ bấm chạm trên điện thoại (Click để đưa vào ô trống đầu tiên trống)
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

    // Xáo trộn chữ cái để làm bảng chọn
    const shuffledLetters = shuffle(targetWord.split(""));
    shuffledLetters.forEach((char, index) => {
        const tile = document.createElement("div");
        tile.classList.add("letter-tile");
        tile.textContent = char.toUpperCase();
        tile.draggable = true;
        tile.dataset.id = index;

        tile.addEventListener("dragstart", () => {
            draggedTile = tile;
        });

        // Hỗ trợ bấm chọn nhanh trên điện thoại hoặc máy tính
        tile.addEventListener("click", () => {
            if (tile.classList.contains("used")) return;
            // Tìm ô trống đầu tiên chưa có chữ
            const emptySlot = Array.from(dropZoneEl.children).find(slot => !slot.hasChildNodes());
            if (emptySlot) {
                emptySlot.appendChild(tile);
                tile.classList.add("used");
                checkWinCondition();
            }
        });

        letterPoolEl.appendChild(tile);
    });
}

function showMessage(text, color) {
    messageEl.textContent = text;
    messageEl.style.color = color;
}

function checkWinCondition() {
    const slots = Array.from(dropZoneEl.children);
    // Kiểm tra xem tất cả các ô đã được điền chưa
    if (slots.some(slot => !slot.hasChildNodes())) return;

    // Ghép các chữ cái lại thành từ của người dùng
    const userWord = slots.map(slot => slot.firstElementChild.textContent.toLowerCase()).join("");

    if (userWord === currentWordObj.word) {
        score += 10;
        scoreEl.textContent = score;
        clearInterval(timer);
        showMessage("Chính xác! Xuất sắc lắm 🎉", "green");
        setTimeout(initGame, 1500);
    } else {
        showMessage("Chưa đúng rồi, hãy thử sắp xếp lại nhé! ❌", "red");
    }
}

clearBtn.addEventListener("click", () => {
    // Trả tất cả các thẻ về khu vực ban đầu
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
    showMessage(`Đã bỏ qua. Từ đúng là: ${currentWordObj.word}`, "purple");
    setTimeout(initGame, 1500);
});

// Khởi chạy trò chơi lần đầu
initGame();
