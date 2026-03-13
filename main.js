// --- PWA & IOS LOGIC ---
let deferredPrompt;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-pwa-btn').style.display = 'block';
});

window.addEventListener('load', () => {
    if (isIOS && !isStandalone) {
        document.getElementById('ios-instruction').style.display = 'block';
    }
});

async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') document.getElementById('install-pwa-btn').style.display = 'none';
    deferredPrompt = null;
}

// --- QUIZ LOGIC ---
const bannedQuestions = [70, 140, 141, 148];
let allQuestions = [], quizQuestions = [], wrongQuestions = [], currentWrongAttempts = [];
let current = 0, correctCount = 0, timerInterval, isReviewMode = false;

const quizContainer = document.getElementById("quiz-container");
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const scoreDisplay = document.getElementById("score");
const nextBtn = document.getElementById("nextBtn");

startBtn.addEventListener("click", startQuiz);

async function startQuiz() {
    try {
        const res = await fetch("quiz.json");
        allQuestions = await res.json();
        const availableQuestions = allQuestions.filter(q => !bannedQuestions.includes(q.id));
        quizQuestions = shuffle(availableQuestions).slice(0, 25);
        
        startScreen.style.display = "none";
        quizContainer.style.display = "flex";
        scoreDisplay.style.display = "none";
        
        current = 0; correctCount = 0; wrongQuestions = []; isReviewMode = false;
        showQuestion();
    } catch (e) { alert("Errore caricamento dati."); }
}

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

function showQuestion() {
    const questionsList = isReviewMode ? wrongQuestions : quizQuestions;
    const q = questionsList[current];
    const correctIndex = q.correct;

    // Struttura interna fluida per mantenere la centratura
    quizContainer.innerHTML = `
        <div style="width:100%;">
            ${!isReviewMode ? '<div id="timeBarContainer"><div id="timeBar"></div></div>' : ''}
            <div style="font-size:12px; color:#666; margin-bottom:15px; font-weight:bold;">
                ${isReviewMode ? `RECUPERO ERRORE ${current + 1}/${questionsList.length}` : `DOMANDA ${current + 1}/25`}
            </div>
            <div class="question">${q.question}</div>
            <div class="answers">
                ${q.options.map((opt, i) => `
                    <div class="option" onclick="checkAnswer(${i}, ${correctIndex})">${opt}</div>
                `).join('')}
            </div>
        </div>
    `;
    nextBtn.style.display = "none";
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
    nextBtn.style.display = "block";
}

function nextQuestion() {
    const questionsList = isReviewMode ? wrongQuestions : quizQuestions;
    current++;
    if (current < questionsList.length) {
        showQuestion();
    } else {
        const lastCount = isReviewMode ? wrongQuestions.length : 25 - correctCount;
        wrongQuestions = [...currentWrongAttempts];
        currentWrongAttempts = [];
        showResults(lastCount);
    }
}

function showResults(totalAttempted) {
    quizContainer.style.display = "none";
    nextBtn.style.display = "none";
    scoreDisplay.style.display = "flex";
    
    let bg = "", title = "", msg = "", scoreText = "";

    if (!isReviewMode) {
        scoreText = `${correctCount} / 25`;
        if (correctCount >= 24) { bg="bg-pass"; title="Superato"; msg="Ottimo lavoro!"; }
        else if (correctCount >= 21) { bg="bg-oral"; title="Superato*"; msg="Passato con riserva."; }
        else { bg="bg-fail"; title="Non Superato"; msg="Devi studiare ancora."; }
    } else {
        const corrects = totalAttempted - wrongQuestions.length;
        scoreText = `${corrects} / ${totalAttempted}`;
        bg = wrongQuestions.length === 0 ? "bg-pass" : "bg-fail";
        title = "Recupero"; msg = "Revisione completata.";
    }

    const reviewBtn = wrongQuestions.length > 0 ? `<button class="btn-ersa" style="background-color:#555!important;" onclick="startReview()">Rivedi Errori (${wrongQuestions.length})</button>` : "";
    
    scoreDisplay.innerHTML = `
        <div style="width:100%;">
            <div class="result-title">${title}</div>
            <div class="score-box ${bg}"><h2>${scoreText}</h2><p>${msg}</p></div>
            ${reviewBtn}
            <button class="btn-ersa" onclick="location.reload()">Home</button>
        </div>
    `;
}

function startReview() { isReviewMode = true; current = 0; currentWrongAttempts = []; scoreDisplay.style.display = "none"; quizContainer.style.display = "flex"; showQuestion(); }

function startTimer(idx) {
    let t = 60; const bar = document.getElementById("timeBar");
    timerInterval = setInterval(() => {
        t--; if (bar) bar.style.width = (t/60*100) + "%";
        if (t <= 0) { stopTimer(); checkAnswer(-1, idx); }
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW Error', err));
    });
}
