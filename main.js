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

    const res = await fetch("quiz.json");
    allQuestions = await res.json();

    const availableQuestions = allQuestions.filter(
        q => !bannedQuestions.includes(q.id)
    );

    quizQuestions = shuffle(availableQuestions).slice(0, 30);

    startScreen.style.display = "none";
    quizContainer.style.display = "block";

    correctCount = 0;
    current = 0;

    showQuestion();
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

            <div id="timer">Tempo: 60</div>

            <div id="timeBarContainer">
                <div id="timeBar"></div>
            </div>

            <div class="question">
                <strong>Domanda ${current + 1}</strong><br>
                ${q.question}
            </div>

            <div class="answers">

                ${q.options.map((opt, i) =>
                    `<div class="option" data-index="${i}">${opt}</div>`
                ).join("")}

            </div>

            <div class="next-container">
                <button id="nextBtn" style="display:none;">Next</button>
            </div>

        </div>
    `;

    updateScore();
    startTimer(correctIndex);

    document.querySelectorAll(".option").forEach(btn => {
        btn.addEventListener("click", () => selectAnswer(btn, correctIndex));
    });

    document.getElementById("nextBtn").addEventListener("click", nextQuestion);
}


// SELEZIONE RISPOSTA
function selectAnswer(selectedBtn, correctIndex) {

    stopTimer();

    const buttons = document.querySelectorAll(".option");

    buttons.forEach((btn, i) => {

        btn.style.pointerEvents = "none";

        if (i === correctIndex) {
            btn.classList.add("correct");
        }

    });

    const selectedIndex = parseInt(selectedBtn.dataset.index);

    if (selectedIndex === correctIndex) {

        correctCount++;
        selectedBtn.classList.add("correct");

    } else {

        selectedBtn.classList.add("wrong");

    }

    document.getElementById("nextBtn").style.display = "block";
}


// NEXT DOMANDA
function nextQuestion() {

    current++;

    if (current < quizQuestions.length) {

        showQuestion();

    } else {

        showResult();

    }

}


// RISULTATO FINALE
function showResult() {

    let background = "";
    let message = "";

    if (correctCount >= 28) {

        background = "#4CAF50";

        message = `
        🎉 Complimenti! 🎉<br><br>
        Hai superato il test con un ottimo risultato.<br>
        Sei decisamente preparato!
        `;

    } else if (correctCount >= 23) {

        background = "#ff9800";

        message = `
        👍 Buon lavoro!<br><br>
        Sei vicino alla preparazione completa.<br>
        Un piccolo ripasso e sarai pronto!
        `;

    } else {

        background = "#f44336";

        message = `
        📚 Continua a studiare!<br><br>
        Ripassa gli argomenti e riprova il test.
        `;

    }

    quizContainer.innerHTML = `
        <div id="resultScreen" style="background:${background}">
            <h2>Risultato finale</h2>
            <h1>${correctCount} / ${quizQuestions.length}</h1>
            <p>${message}</p>
            <button id="restartBtn">Rifai il quiz</button>
        </div>
    `;

    scoreDisplay.innerHTML = "";

    document.getElementById("restartBtn").addEventListener("click", () => {
        location.reload();
    });

}


// TIMER
function startTimer(correctIndex) {

    let time = TIME_PER_QUESTION;

    const timerElem = document.getElementById("timer");
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


// TEMPO SCADUTO
function autoFail(correctIndex) {

    const buttons = document.querySelectorAll(".option");

    buttons.forEach((btn, i) => {

        btn.style.pointerEvents = "none";

        if (i === correctIndex) {
            btn.classList.add("correct");
        }

    });

    document.getElementById("nextBtn").style.display = "block";
}


// STOP TIMER
function stopTimer() {
    clearInterval(timerInterval);
}


// CONTATORE RISPOSTE
function updateScore() {
    scoreDisplay.textContent = `Corrette: ${correctCount} / ${quizQuestions.length}`;
}
