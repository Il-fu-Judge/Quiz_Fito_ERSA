const bannedQuestions = [70, 140, 141, 148];
let allQuestions = [];
let quizQuestions = [];
let current = 0;
let correctCount = 0;
let timerInterval;
const TIME_PER_QUESTION = 60;
const TOTAL_QUESTIONS = 25;

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
        quizQuestions = shuffle(availableQuestions).slice(0, TOTAL_QUESTIONS);

        startScreen.style.display = "none";
        quizContainer.style.display = "block";
        scoreDisplay.style.display = "none";
        
        current = 0;
        correctCount = 0;
        showQuestion();
    } catch (e) {
        alert("Errore caricamento dati.");
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function showQuestion() {
    const q = quizQuestions[current];
    const correctIndex = q.correct;

    quizContainer.innerHTML = `
        <div class="quiz-screen">
            <div id="timeBarContainer"><div id="timeBar"></div></div>
            <div style="text-align:center; font-size:14px; color:#666; margin-bottom:10px;">Domanda ${current + 1} di ${TOTAL_QUESTIONS}</div>
            <div class="question">${q.question}</div>
            <div class="answers">
                ${q.options.map((opt, i) => `
                    <div class="option" onclick="checkAnswer(${i}, ${correctIndex})">${opt}</div>
                `).join('')}
            </div>
            <button id="nextBtn" class="btn-green" onclick="nextQuestion()">AVANTI</button>
        </div>
    `;
    startTimer(correctIndex);
}

function checkAnswer(selected, correct) {
    stopTimer();
    const options = document.querySelectorAll(".option");
    options.forEach(opt => opt.style.pointerEvents = "none");

    if (selected === correct) {
        options[selected].classList.add("correct");
        correctCount++;
    } else {
        if (selected !== -1) options[selected].classList.add("wrong");
        options[correct].classList.add("correct");
    }
    document.getElementById("nextBtn").style.display = "block";
}

function nextQuestion() {
    current++;
    if (current < quizQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizContainer.style.display = "none";
    scoreDisplay.style.display = "flex";

    let bgClass = "";
    let title = "";
    let message = "";

    if (correctCount >= 24) {
        bgClass = "bg-pass";
        title = "ESAME SUPERATO";
        message = "Ottima preparazione! Hai superato brillantemente l'esercitazione.";
    } else if (correctCount >= 21) {
        bgClass = "bg-oral";
        title = "ESAME SUPERATO*";
        message = "Esame superato. Sarà necessario sostenere un esame orale ausiliario per confermare l'abilitazione.";
    } else {
        bgClass = "bg-fail";
        title = "ESAME NON SUPERATO";
        message = "ERSA permette due tentativi. Se entrambi sono negativi, bisognerà rifare la richiesta consegnando nuovamente la documentazione.";
    }

    scoreDisplay.innerHTML = `
        <div class="result-container">
            <div class="result-title">${title}</div>
            <div class="score-box ${bgClass}">
                <h2>${correctCount} / ${TOTAL_QUESTIONS}</h2>
                <p>${message}</p>
            </div>
            <button id="restartBtn" class="btn-green" onclick="location.reload()">Riprova l'Esercitazione</button>
        </div>
    `;
}

function startTimer(correctIndex) {
    let time = TIME_PER_QUESTION;
    const bar = document.getElementById("timeBar");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time--;
        bar.style.width = (time / TIME_PER_QUESTION * 100) + "%";
        if (time <= 0) { stopTimer(); checkAnswer(-1, correctIndex); }
    }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }
