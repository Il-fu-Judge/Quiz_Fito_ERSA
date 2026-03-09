let allQuestions = [];
let quizQuestions = [];
let current = 0;
let correctCount = 0;
let timerInterval;
const TIME_PER_QUESTION = 60; // secondi

const quizContainer = document.getElementById('quiz-container');
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const scoreDisplay = document.getElementById('score');

startBtn.addEventListener('click', startQuiz);

async function startQuiz() {
  const res = await fetch('quiz.json');
  allQuestions = await res.json();

  // Scegli 30 domande casuali
  quizQuestions = shuffle(allQuestions).slice(0, 30);

  startScreen.style.display = 'none';
  quizContainer.style.display = 'block';
  correctCount = 0;
  current = 0;
  showQuestion();
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showQuestion() {
  const q = quizQuestions[current];
  quizContainer.innerHTML = `
    <div id="timer">Tempo: ${TIME_PER_QUESTION}s</div>
    <div class="question"><strong>Domanda ${current+1}:</strong> ${q.question}</div>
    ${q.options.map((opt,i) => `<div class="option" data-index="${i}">${opt}</div>`).join('')}
  `;
  updateScore();
  startTimer();

  document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(btn, q.correct));
  });
}

function selectAnswer(selectedBtn, correctIndex) {
  stopTimer();

  const buttons = document.querySelectorAll('.option');
  buttons.forEach((btn, i) => {
    if (i === correctIndex) btn.classList.add('correct');
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

function showResult() {
  quizContainer.innerHTML = `<h2>Quiz completato! Risposte corrette: ${correctCount} / ${quizQuestions.length}</h2>`;
  scoreDisplay.innerHTML = '';
}

function startTimer() {
  let time = TIME_PER_QUESTION;
  const timerElem = document.getElementById('timer');
  timerElem.textContent = `Tempo: ${time}s`;

  timerInterval = setInterval(() => {
    time--;
    timerElem.textContent = `Tempo: ${time}s`;
    if (time <= 0) {
      stopTimer();
      // evidenzia la risposta corretta
      document.querySelectorAll('.option')[quizQuestions[current].correct].classList.add('correct');
      setTimeout(() => {
        current++;
        if (current < quizQuestions.length) showQuestion();
        else showResult();
      }, 1000);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateScore() {
  scoreDisplay.textContent = `Corrette: ${correctCount} / ${quizQuestions.length}`;
}
