const bannedQuestions = [70, 140, 141, 148];
let allQuestions = [];
let quizQuestions = [];
let wrongQuestions = []; 
let currentWrongAttempts = []; 
let current = 0;
let correctCount = 0;
let timerInterval;
let isReviewMode = false;

const quizContainer = document.getElementById("quiz-container");
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const scoreDisplay = document.getElementById("score");

startBtn.addEventListener("click", startQuiz);

async function startQuiz() {
    try {
        const res = await fetch("quiz.json");
        allQuestions = await res.json();
        const availableQuestions = allQuestions.filter(q => !bannedQuestions.includes(q.id));
        quizQuestions = shuffle(availableQuestions).slice(0, 25);
        startScreen.style.display = "none";
        quizContainer.style.display = "block";
        scoreDisplay.style.display = "none";
        current = 0;
        correctCount = 0;
        wrongQuestions = [];
        isReviewMode = false;
        showQuestion();
    } catch (e) {
        alert("Errore caricamento dati.");
    }
}

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

function showQuestion() {
    const questionsList = isReviewMode ? wrongQuestions : quizQuestions;
    const q = questionsList[current];
    const correctIndex = q.correct;

    quizContainer.innerHTML = `
        <div class="quiz-screen">
            ${!isReviewMode ? '<div id="timeBarContainer"><div id="timeBar"></div></div>' : ''}
            <div style="text-align:center; font-size:12px; margin-bottom:5px;">
                ${isReviewMode ? `RECUPERO ${current + 1}/${questionsList.length}` : `DOMANDA ${current + 1}/25`}
            </div>
            
            <div class="play-area">
                <div class="question">${q.question}</div>
                <div class="answers">
                    ${q.options.map((opt, i) => `
                        <div class="option" onclick="checkAnswer(${i}, ${correctIndex})">${opt}</div>
                    `).join('')}
                </div>
            </div>

            <button id="nextBtn" class="btn-ersa" style="display:none;" onclick="nextQuestion()">AVANTI</button>
        </div>
    `;

    if (!isReviewMode) startTimer(correctIndex);
}

function checkAnswer(selected, correct) {
    if (!isReviewMode) stopTimer();
    const options = document.querySelectorAll(".option");
    options.forEach(opt => opt.style.pointerEvents = "none");

    if (selected === correct) {
        options[selected].classList.add("correct");
        if (!isReviewMode) correctCount++;
    } else {
        if (selected !== -1) options[selected].classList.add("wrong");
        options[correct].classList.add("correct");
        currentWrongAttempts.push(isReviewMode ? wrongQuestions[current] : quizQuestions[current]);
    }
    document.getElementById("nextBtn").style.display = "block";
}

function nextQuestion() {
    const questionsList = isReviewMode ? wrongQuestions : quizQuestions;
    current++;
    if (current < questionsList.length) {
        showQuestion();
    } else {
        const lastWrongCount = isReviewMode ? wrongQuestions.length : 25 - correctCount;
        wrongQuestions = [...currentWrongAttempts];
        currentWrongAttempts = [];
        showResults(lastWrongCount);
    }
}

function showResults(totalAttempted) {
    quizContainer.style.display = "none";
    scoreDisplay.style.display = "block";
    
    let scoreText = isReviewMode ? `${totalAttempted - wrongQuestions.length} / ${totalAttempted}` : `${correctCount} / 25`;
    let bgClass = (correctCount >= 21 || (isReviewMode && wrongQuestions.length === 0)) ? "bg-pass" : "bg-fail";

    scoreDisplay.innerHTML = `
        <div class="result-container">
            <div class="score-box ${bgClass}">
                <h2 style="font-size:40px; margin:0;">${scoreText}</h2>
                <p>Esame terminato</p>
            </div>
            ${wrongQuestions.length > 0 ? `<button class="btn-ersa" style="background-color: #1565c0 !important; margin-bottom: 10px;" onclick="startReview()">Rivedi Errori (${wrongQuestions.length})</button>` : ''}
            <button class="btn-ersa" onclick="location.reload()">Riprova</button>
        </div>
    `;
}

function startReview() {
    isReviewMode = true;
    current = 0;
    currentWrongAttempts = [];
    scoreDisplay.style.display = "none";
    quizContainer.style.display = "block";
    showQuestion();
}

function startTimer(correctIndex) {
    let time = 60;
    const bar = document.getElementById("timeBar");
    if (!bar) return;
    bar.style.width = "100%";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time--;
        bar.style.width = (time / 60 * 100) + "%";
        if (time <= 0) { stopTimer(); checkAnswer(-1, correctIndex); }
    }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }

// LOGICA INSTALLAZIONE
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});
