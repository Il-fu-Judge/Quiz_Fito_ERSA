// --- LOGICA PWA: GESTIONE INSTALLAZIONE ---
let deferredPrompt;
const installBtn = document.getElementById('install-pwa-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Impedisce a Chrome di mostrare il banner automatico
    e.preventDefault();
    // Salva l'evento per usarlo in seguito
    deferredPrompt = e;
    // Mostra il pulsante di installazione nell'interfaccia
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

async function installPWA() {
    if (!deferredPrompt) return;
    
    // Mostra il prompt di installazione
    deferredPrompt.prompt();
    
    // Attendi la risposta dell'utente
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Risposta dell'utente all'installazione: ${outcome}`);
    
    // Pulizia: il prompt può essere usato una sola volta
    deferredPrompt = null;
    if (installBtn) installBtn.style.display = 'none';
}

// Nascondi il pulsante se l'app viene installata con successo
window.addEventListener('appinstalled', () => {
    console.log('PWA installata correttamente!');
    if (installBtn) installBtn.style.display = 'none';
    deferredPrompt = null;
});

// --- LOGICA QUIZ ORIGINALE ---
const bannedQuestions = [70, 140, 141, 148];
let allQuestions = [];
let quizQuestions = [];
let wrongQuestions = []; 
let currentWrongAttempts = []; 
let current = 0;
let correctCount = 0;
let timerInterval;
let isReviewMode = false;
let totalQuestionsInReview = 0;

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
        quizContainer.style.display = "flex";
        scoreDisplay.style.display = "none";
        
        current = 0;
        correctCount = 0;
        wrongQuestions = [];
        isReviewMode = false;
        showQuestion();
    } catch (e) {
        alert("Errore nel caricamento dei dati.");
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function showQuestion() {
    const questionsList = isReviewMode ? wrongQuestions : quizQuestions;
    const q = questionsList[current];
    const correctIndex = q.correct;

    quizContainer.innerHTML = `
        <div class="quiz-screen">
            ${!isReviewMode ? '<div id="timeBarContainer"><div id="timeBar"></div></div>' : ''}
            <div style="text-align:center; font-size:13px; color:#666; margin-bottom:10px; font-weight:bold;">
                ${isReviewMode ? `RECUPERO ERRORE ${current + 1} DI ${questionsList.length}` : `DOMANDA ${current + 1} DI 25`}
            </div>
            <div class="question">${q.question}</div>
            <div class="answers">
                ${q.options.map((opt, i) => `
                    <div class="option" onclick="checkAnswer(${i}, ${correctIndex})">${opt}</div>
                `).join('')}
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

function showResults(totalAttemptedInRound) {
    quizContainer.style.display = "none";
    scoreDisplay.style.display = "flex";

    let bgClass = "";
    let title = "";
    let message = "";
    let scoreText = "";

    if (!isReviewMode) {
        scoreText = `${correctCount} / 25`;
        if (correctCount >= 24) {
            bgClass = "bg-pass"; title = "Esame Superato";
            message = "Complimenti! La tua preparazione è eccellente. Sei pronto per l'esame ufficiale!";
        } else if (correctCount >= 21) {
            bgClass = "bg-oral"; title = "Esame Superato*";
            message = "Buon lavoro! Hai superato la prova, ma non abbassare la guardia: un ultimo sforzo per l'orale!";
        } else {
            bgClass = "bg-fail"; title = "Esame Non Superato";
            message = "Non scoraggiarti! L'agricoltura richiede pazienza e dedizione. Rivedi i tuoi errori e riprova, ce la farai!";
        }
    } else {
        const correctsInReview = totalAttemptedInRound - wrongQuestions.length;
        scoreText = `${correctsInReview} / ${totalAttemptedInRound}`;

        if (wrongQuestions.length === 0) {
            bgClass = "bg-pass";
            title = "Recupero Completato";
            message = "Ottimo! Hai corretto ogni incertezza. Ogni errore affrontato è una lezione imparata per sempre!";
        } else {
            bgClass = "bg-fail";
            title = "Recupero Incompleto";
            message = "Stai andando bene! Alcuni concetti sono ostici, ma affrontandoli uno ad uno diventerai un esperto.";
        }
    }

    const reviewBtnHtml = wrongQuestions.length > 0 
        ? `<button class="btn-ersa" style="background-color: #555 !important; margin-bottom: 10px;" onclick="startReview()">Rivedi Errori (${wrongQuestions.length})</button>` 
        : "";

    scoreDisplay.innerHTML = `
        <div class="result-container">
            <div class="result-title">${title}</div>
            <div class="score-box ${bgClass}">
                <h2>${scoreText}</h2>
                <p style="font-style: italic; font-weight: bold; margin-bottom: 15px;">${message}</p>
                ${!isReviewMode && correctCount < 21 ? `<p style="font-size: 14px; opacity: 0.9;">Ricorda: la documentazione è valida per due tentativi d'esame. Se necessario, dovrai ripresentare la domanda.</p>` : ''}
            </div>
            ${reviewBtnHtml}
            <button class="btn-ersa" onclick="location.reload()">Riprova l'esercitazione</button>
        </div>
    `;
}

function startReview() {
    isReviewMode = true;
    current = 0;
    currentWrongAttempts = [];
    scoreDisplay.style.display = "none";
    quizContainer.style.display = "flex";
    showQuestion();
}

function startTimer(correctIndex) {
    let time = 60;
    const bar = document.getElementById("timeBar");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time--;
        if (bar) bar.style.width = (time / 60 * 100) + "%";
        if (time <= 0) { stopTimer(); checkAnswer(-1, correctIndex); }
    }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }

// Registrazione Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('PWA: Service Worker registrato correttamente'))
            .catch(err => console.log('PWA: Errore registrazione', err));
    });
}
