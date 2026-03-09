const app = document.getElementById("app")

let questions = []
let currentQuestion = 0
let score = 0
let selectedAnswer = null


function showStartScreen(){

    app.innerHTML = `
    <div class="screen center-screen">

        <h1>Genera Quiz</h1>

        <button id="generateQuiz">Genera Quiz</button>

    </div>
    `

    document.getElementById("generateQuiz").addEventListener("click", generateQuiz)

}



function generateQuiz(){

    questions = [

        {
            question:"Qual è la capitale d'Italia?",
            answers:["Milano","Roma","Napoli","Torino"],
            correct:1
        },

        {
            question:"Quanto fa 2 + 2 ?",
            answers:["3","4","5","6"],
            correct:1
        },

        {
            question:"Quale pianeta è il più grande?",
            answers:["Marte","Giove","Venere","Mercurio"],
            correct:1
        }

    ]

    currentQuestion = 0
    score = 0

    showQuestion()

}



function showQuestion(){

    selectedAnswer = null

    const q = questions[currentQuestion]

    app.innerHTML = `
    <div class="screen center-screen">

        <h2>${q.question}</h2>

        <div id="answers" class="answers"></div>

        <div class="next-container">
            <button id="nextBtn">Next</button>
        </div>

    </div>
    `

    const answersDiv = document.getElementById("answers")

    q.answers.forEach((answer,index)=>{

        const btn = document.createElement("button")
        btn.className = "answer-btn"
        btn.textContent = answer

        btn.addEventListener("click",()=>{

            selectedAnswer = index

            document.querySelectorAll(".answer-btn").forEach(b=>b.style.background="white")

            btn.style.background="#cce5ff"

        })

        answersDiv.appendChild(btn)

    })

    document.getElementById("nextBtn").addEventListener("click", nextQuestion)

}



function nextQuestion(){

    if(selectedAnswer === null){
        alert("Seleziona una risposta")
        return
    }

    const q = questions[currentQuestion]

    if(selectedAnswer === q.correct){
        score++
    }

    currentQuestion++

    if(currentQuestion >= questions.length){
        showResult()
    }else{
        showQuestion()
    }

}



function showResult(){

    app.innerHTML = `
    <div class="screen center-screen">

        <h2>Risultato</h2>

        <div class="result">
            ${score} / ${questions.length}
        </div>

        <button id="restartBtn">Ricomincia</button>

    </div>
    `

    document.getElementById("restartBtn").addEventListener("click", showStartScreen)

}



showStartScreen()
