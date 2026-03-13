// --- SISTEMA DI ACCESSO CON GOOGLE SHEETS ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXw2pKPkUfx6XWjY6heK7BBGLyVfxEki_JvFk-YcfrrAldqHvPIS4OLjsQNoeaQAtZ/exec"; // Quello che finisce con /exec

function checkAuth() {
    if (localStorage.getItem("isAuthorized") === "true") {
        document.getElementById("auth-overlay").style.display = "none";
    } else {
        document.getElementById("auth-overlay").style.display = "flex";
    }
}

async function validateCode() {
    const input = document.getElementById("access-code").value.trim().toUpperCase();
    const btn = document.querySelector("#auth-overlay .btn-ersa");
    
    if (!input) { alert("Per favore, inserisci un codice."); return; }

    btn.disabled = true;
    btn.innerText = "VERIFICA IN CORSO...";

    try {
        // Inviamo il codice allo script di Google
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ code: input })
        });

        const data = await response.json();

        if (data.result === "success") {
            localStorage.setItem("isAuthorized", "true");
            document.getElementById("auth-overlay").style.display = "none";
            alert("Accesso sbloccato con successo!");
        } else if (data.result === "already_used") {
            alert("Questo codice è già stato utilizzato.");
        } else if (data.result === "not_found") {
            alert("Codice non valido. Riprova.");
        }
    } catch (e) {
        console.error(e);
        alert("Errore durante la verifica. Controlla la connessione.");
    } finally {
        btn.disabled = false;
        btn.innerText = "SBLOCCA";
    }
}

// Avvia il controllo all'apertura
checkAuth();
// --------------------------
const bannedQuestions = [70, 140, 141, 148];
let allQuestions = [];
let quizQuestions = [];
let wrongQuestions = []; 
let currentWrongAttempts = []; 
let current = 0;
let correctCount = 0;
let timerInterval;
let isReviewMode = false;
let totalQuestionsInReview = 0; // Per calcolare il punteggio nel recupero

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
            <button id="nextBtn" class="btn-ersa" onclick="nextQuestion()">AVANTI</button>
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
        
        // Salva la domanda per il prossimo round di revisione
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
        // --- RISULTATI QUIZ PRINCIPALE ---
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
        // --- RISULTATI RECUPERO ERRORI ---
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

    // PULSANTE RIVEDI ERRORI - Ora usa lo stesso blu dell'installazione (#1565c0)
    const reviewBtnHtml = wrongQuestions.length > 0 
        ? `<button class="btn-ersa" style="background-color: #1565c0 !important; margin-bottom: 10px;" onclick="startReview()">Rivedi Errori (${wrongQuestions.length})</button>` 
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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('PWA: Service Worker registrato correttamente'))
            .catch(err => console.log('PWA: Errore registrazione', err));
    });
}

// --- GESTIONE INSTALLAZIONE ANDROID ---
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
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});

window.addEventListener('appinstalled', () => {
    console.log('App installata!');
    installBtn.style.display = 'none';
});
