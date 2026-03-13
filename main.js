const bannedQuestions = [70, 140, 141, 148];
let allQuestions = [];
let quizQuestions = [];
let current = 0;
let correctCount = 0;
let timerInterval;
const TIME_PER_QUESTION = 60;
const TOTAL_QUESTIONS = 25; // Modificato a 25 come richiesto

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
        
        // Mescola e prendi 25 domande
        quizQuestions = shuffle(availableQuestions).slice(0, TOTAL_QUESTIONS);

        startScreen.style.display = "none";
        quizContainer.style.display = "block";
        scoreDisplay.style.display = "none";
        
        current = 0;
        correctCount = 0;
        showQuestion();
    } catch (e) {
        alert("Errore nel caricamento del file quiz.json");
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
            <div id="timeBarContainer">
                <div id="timeBar"></div>
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Domanda ${current + 1} di ${TOTAL_QUESTIONS}</div>
            <div class="question">${q.question}</div>
            <div class="answers">
                ${q.options.map((opt, i) => `
                    <div class="option" onclick="checkAnswer(${i}, ${correctIndex})">${opt}</div>
                `).join('')}
            </div>
            <button id="nextBtn" onclick="nextQuestion()">AVANTI</button>
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
    scoreDisplay.style.display = "block";

    let resultClass = "";
    let title = "";
    let message = "";

    if (correctCount >= 24) {
        // SCENARIO VERDE: PASSATO
        resultClass = "res-pass";
        title = "ESAME SUPERATO";
        message = "Eccellente! Hai dimostrato una preparazione completa.";
    } else if (correctCount >= 21) {
        // SCENARIO ARANCIONE: ORALE AUSILIARIO
        resultClass = "res-oral";
        title = "ESAME SUPERATO*";
        message = "Esame superato con riserva. Sarà necessario sostenere un esame orale ausiliario per confermare l'abilitazione.";
    } else {
        // SCENARIO ROSSO: NON SUPERATO
        resultClass = "res-fail";
        title = "ESAME NON SUPERATO";
        message = "Attenzione: ERSA permette due tentativi per ogni domanda d'esame. Se entrambi non sono positivi, sarà necessario presentare nuovamente la documentazione per una nuova richiesta d'esame.";
    }

    scoreDisplay.innerHTML = `
        <div class="result-screen ${resultClass}">
            <h1>${title}</h1>
            <div class="score-box">${correctCount} / ${TOTAL_QUESTIONS}</div>
            <p class="result-msg">${message}</p>
            <button id="restartBtn" onclick="location.reload()">RIPROVA ESERCITAZIONE</button>
        </div>
    `;
}

function startTimer(correctIndex) {
    let time = TIME_PER_QUESTION;
    const bar = document.getElementById("timeBar");
    bar.style.width = "100%";

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time--;
        bar.style.width = (time / TIME_PER_QUESTION * 100) + "%";
        if (time <= 0) {
            stopTimer();
            checkAnswer(-1, correctIndex);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}
