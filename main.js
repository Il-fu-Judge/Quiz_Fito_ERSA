// BAN LIST per domande da non utilizzare
const bannedQuestions = [70, 140, 141, 148];

let allQuestions = [];
let quizQuestions = [];
let current = 0;
let correctCount = 0;
let timerInterval;
const TIME_PER_QUESTION = 60;

const quizContainer = document.getElementById("quiz-container");
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const scoreDisplay = document.getElementById("score");

startBtn.addEventListener("click", startQuiz);

// AVVIO QUIZ
async function startQuiz() {
    try {
        const res = await fetch("quiz.json");
        allQuestions = await res.json();

        const availableQuestions = allQuestions.filter(
            q => !bannedQuestions.includes(q.id)
        );

        // Mescola e prendi 30 domande
        quizQuestions = shuffle(availableQuestions).slice(0, 30);

        startScreen.style.display = "none";
        quizContainer.style.display = "block";

        correctCount = 0;
        current = 0;

        showQuestion();
    } catch (error) {
        console.error("Errore nel caricamento del quiz:", error);
        alert("Impossibile caricare il file quiz.json. Assicurati che sia nella stessa cartella.");
    }
}

// RANDOM DOMANDE
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// MOSTRA DOMANDA
function showQuestion() {
    const q = quizQuestions[current];
    const correctIndex = q.correct;

    quizContainer.innerHTML = `
        <div class="quiz-screen">
            <div id="timer">
                <span>Domanda ${current + 1} di ${quizQuestions.length}</span>
                <span id="timeLeft">Tempo: 60</span>
            </div>

            <div id="timeBarContainer">
                <div id="timeBar"></div>
            </div>

            <div class="question">${q.question}</div>

            <div class="answers">
                ${q.options.map((opt, i) => `
                    <div class="option" onclick="checkAnswer(${i}, ${correctIndex})">${opt}</div>
                `).join('')}
            </div>

            <div class="next-container">
                <button id="nextBtn" style="display:none;" onclick="nextQuestion()">Avanti</button>
            </div>
        </div>
    `;

    startTimer(correctIndex);
}

// CONTROLLO RISPOSTA
function checkAnswer(selected, correct) {
    stopTimer();

    const options = document.querySelectorAll(".option");
    options.forEach(opt => opt.style.pointerEvents = "none");

    if (selected === correct) {
        options[selected].classList.add("correct");
        correctCount++;
    } else {
        options[selected].classList.add("wrong");
        options[correct].classList.add("correct");
    }

    document.getElementById("nextBtn").style.display = "block";
}

// PROSSIMA DOMANDA
function nextQuestion() {
    current++;
    if (current < quizQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// RISULTATI FINALI
function showResults() {
    quizContainer.style.display = "none";
    
    const percentage = (correctCount / quizQuestions.length) * 100;
    let message = percentage >= 80 ? "Ottimo lavoro! Supereresti l'esame." : "Hai bisogno di studiare ancora un po'.";
    let statusClass = percentage >= 80 ? "text-success" : "text-danger";

    scoreDisplay.innerHTML = `
        <div class="card result-screen">
            <h2>Risultato Finale</h2>
            <h1>${correctCount} / ${quizQuestions.length}</h1>
            <p id="score-status">${message}</p>
            <button id="restartBtn" onclick="location.reload()">Riprova</button>
        </div>
    `;
}

// TIMER
function startTimer(correctIndex) {
    let time = TIME_PER_QUESTION;
    const timerElem = document.getElementById("timeLeft");
    const bar = document.getElementById("timeBar");

    timerElem.textContent = "Tempo: " + time;
    bar.style.width = "100%";

    timerInterval = setInterval(() => {
        time--;
        timerElem.textContent = "Tempo: " + time;
        bar.style.width = (time / TIME_PER_QUESTION * 100) + "%";

        if (time <= 0) {
            stopTimer();
            autoFail(correctIndex);
        }
    }, 1000);
}

function autoFail(correctIndex) {
    const buttons = document.querySelectorAll(".option");
    buttons.forEach((btn, i) => {
        btn.style.pointerEvents = "none";
        if (i === correctIndex) btn.classList.add("correct");
    });
    document.getElementById("nextBtn").style.display = "block";
}

function stopTimer() {
    clearInterval(timerInterval);
}
