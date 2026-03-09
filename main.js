// main.js

// Lista delle domande da escludere (ban list)
const bannedQuestions = [70, 140, 141, 148]; // aggiungi qui gli ID da escludere

let allQuestions = [];
let quizQuestions = [];
let current = 0;
let correctCount = 0;
let timerInterval;
const TIME_PER_QUESTION = 60; // secondi

// Elementi DOM
const quizContainer = document.getElementById('quiz-container');
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const scoreDisplay = document.getElementById('score');

startBtn.addEventListener('click', startQuiz);

// Avvia il quiz
async function startQuiz() {
  const res = await fetch('quiz.json');
  allQuestions = await res.json();

  // Filtra le domande escluse
  const availableQuestions = allQuestions.filter(q => !bannedQuestions.includes(q.id));

  // Scegli 30 domande casuali
  quizQuestions = shuffle(availableQuestions).slice(0, 30);

  startScreen.style.display = 'none';
  quizContainer.style.display = 'block';
  correctCount = 0;
  current = 0;
  showQuestion();
}

// Funzione per mescolare le domande
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Mostra la domanda corrente
function showQuestion() {
  const q = quizQuestions[current];
  const correctIndex = q.correct; // già 0,1,2 nel JSON corretto

  quizContainer.innerHTML = `
    <div id="timer">Tempo: ${TIME_PER_QUESTION}s</div>
    <div class="question"><strong>Domanda ${current+1}:</strong> ${q.question}</div>
    ${q.options.map((opt,i) => `<div class="option" data-index="${i}">${opt}</div>`).join('')}
  `;
  updateScore();
  startTimer(correctIndex);

  document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(btn, correctIndex));
  });
}

// Gestione della selezione della risposta
function selectAnswer(selectedBtn, correctIndex) {
  stopTimer();

  const buttons = document.querySelectorAll('.option');
  buttons.forEach((btn, i) => {
    if (i === correctIndex) btn.classList.add('correct'); // evidenzia sempre la risposta corretta
  });

  const selectedIndex = parseInt(selectedBtn.dataset.index);
  if (selectedIndex === correctIndex) {
    correctCount++;
    selectedBtn.classList.add('correct');
  } else {
    selectedBtn.classList.add('wrong');
  }

  // passa alla prossima domanda dopo 1 secondo
  setTimeout(() => {
    current++;
    if (current < quizQuestions.length) showQuestion();
    else showResult();
  }, 1000);
}

// Mostra il risultato finale
function showResult() {
  quizContainer.innerHTML = `<h2>Quiz completato! Risposte corrette: ${correctCount} / ${quizQuestions.length}</h2>`;
  scoreDisplay.innerHTML = '';
}

// Timer per la domanda
function startTimer(correctIndex) {
  let time = TIME_PER_QUESTION;
  const timerElem = document.getElementById('timer');
  timerElem.textContent = `Tempo: ${time}s`;

  timerInterval = setInterval(() => {
    time--;
    timerElem.textContent = `Tempo: ${time}s`;
    if (time <= 0) {
      stopTimer();
      // evidenzia risposta corretta
      document.querySelectorAll('.option')[correctIndex].classList.add('correct');
      setTimeout(() => {
        current++;
        if (current < quizQuestions.length) showQuestion();
        else showResult();
      }, 1000);
    }
  }, 1000);
}

// Ferma il timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Aggiorna contatore delle risposte corrette
function updateScore() {
  scoreDisplay.textContent = `Corrette: ${correctCount} / ${quizQuestions.length}`;
}
