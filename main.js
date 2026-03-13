const bannedQuestions = [70, 140, 141, 148];
const TIME_PER_QUESTION = 60;

let allQuestions = [];
let quizQuestions = [];
let current = 0;
let correctCount = 0;
let timerInterval;

const startScreen = document.getElementById("start-screen");
const quizContainer = document.getElementById("quiz-container");
const scoreScreen = document.getElementById("score-screen");
const feedbackFooter = document.getElementById("feedback-footer");

document.getElementById("start-btn").addEventListener("click", startQuiz);

async function startQuiz() {
    try {
        const res = await fetch("quiz.json");
        allQuestions = await res.json();
        const availableQuestions = allQuestions.filter(q => !bannedQuestions.includes(q.id));
        quizQuestions = shuffle(availableQuestions).slice(0, 30);

        startScreen.style.display = "none";
        quizContainer.style.display = "flex";
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
    feedbackFooter.style.display = "none";
    
    document.getElementById("question-text").innerText = q.question;
    const optionsDiv = document.getElementById("options-container");
    optionsDiv.innerHTML = "";

    // Aggiorna Progresso
    const progress = (current / quizQuestions.length) * 100;
    document.getElementById("progressBar").style.width = `${progress}%`;

    q.options.forEach((opt, i) => {
        const btn = document.createElement("div");
        btn.className = "option";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i);
        optionsDiv.appendChild(btn);
    });

    startTimer();
}

function checkAnswer(selectedIndex) {
    stopTimer();
    const q = quizQuestions[current];
    const isCorrect = selectedIndex === q.correct;
    
    const options = document.querySelectorAll(".option");
    options.forEach(opt => opt.style.pointerEvents = "none");

    feedbackFooter.style.display = "flex";
    const title = document.getElementById("feedback-title");

    if (isCorrect) {
        correctCount++;
        feedbackFooter.className = "correct-bg";
        title.innerText = "Risposta Corretta";
        options[selectedIndex].classList.add("selected");
    } else {
        feedbackFooter.className = "wrong-bg";
        title.innerText = "Risposta Errata";
        options[selectedIndex].style.borderColor = "#d32f2f";
        options[q.correct].style.borderColor = "#2e7d32";
        options[q.correct].style.backgroundColor = "#e8f5e9";
    }
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
    feedbackFooter.style.display = "none";
    scoreScreen.style.display = "flex";

    const percentage = Math.round((correctCount / quizQuestions.length) * 100);
    const passed = percentage >= 80;

    scoreScreen.innerHTML = `
        <h1>Quiz Terminato</h1>
        <div class="score-val">${correctCount} / ${quizQuestions.length}</div>
        <p style="font-size: 20px; margin-bottom: 30px;">
            ${passed ? 'Complimenti, hai superato la prova!' : 'Non hai raggiunto il punteggio minimo (80%).'}
        </p>
        <button class="btn-main" onclick="location.reload()">Riprova</button>
    `;
}

function startTimer() {
    let time = TIME_PER_QUESTION;
    const display = document.getElementById("timer-display");
    display.textContent = time + "s";

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time--;
        display.textContent = time + "s";
        if (time <= 0) {
            stopTimer();
            checkAnswer(-1); // Tempo scaduto = errore
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}
