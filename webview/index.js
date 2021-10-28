const landingTitle = document.getElementById('landingTitle');
const landing = document.getElementById('landing');

const returnDate = localStorage.getItem('returning');
const returning = returnDate ? (Date.now() - returnDate) < 20 * 60 * 60 * 1000 : false;

var typewriter = new Typewriter(landingTitle, {
    loop: false,
    wrapperClassName: 'h1',
    cursorClassName: 'h1',
    delay: returning ? 0 : 100
})

typewriter
    .typeString(`Kartei`)
    .pauseFor(returning ? 0 : 750)
    .typeString('<br><br>by <a href="https://lmf.logge.top/">LMF</a>')
    .pauseFor(returning ? 0 : 250)
    .start()
    .callFunction(() => {
        landing.classList.add('fade')
        setTimeout(() => {
            landing.remove()
            localStorage.setItem('returning', Date.now())
        }, 1000)
    })


const homeView = document.getElementById('home')
const gameView = document.getElementById('game')

const playSmart = document.getElementById('playSmart')
const playRandom = document.getElementById('playRandom')
const playCategory = document.getElementById('playCategory')

let game = {
    "mode": "smart",
    "category": null,
    "user": null,
    "stats": {
        "correct": 0,
        "incorrect": 0,
        "total": 0,
        "streak": 0,
        "totalCards": 0,

    },
    "question": {
        "id": null,
        "german": null,
        "english": null,
        "image": null,
        "sentence": null,
        "streak": null
    }
}

const baseWeight = 10

const shuffle = () => Math.random() - .5

const shuffleWeighted = (questionA, questionB) => {
    const weightA = (questionA.played ? questionA.incorrect / questionA.played * 100 : 1) + baseWeight * Math.random()
    const weightB = (questionB.played ? questionB.incorrect / questionB.played * 100 : 1) + baseWeight * Math.random()
    return Math.random() * (weightA + weightB) - weightA
}

let questions = []
let allQuestions = []

fetch('data').then(res => {
    console.log(res.status)
    res.json().then(data => {
        allQuestions = data
        questions = JSON.parse(JSON.stringify(allQuestions))
        console.log(questions)

        document.getElementById('statsTotalCards').innerText = allQuestions.length
        document.getElementById('statsCardsPlayed').innerText = allQuestions.reduce((acc, cur) => acc + cur.played, 0)

        const correctPlayed = allQuestions.reduce((acc, cur) => acc + cur.correct, 0)
        const incorrectPlayed = allQuestions.reduce((acc, cur) => acc + cur.incorrect, 0)

        document.getElementById('statsCardsCorrect').innerText =
            Math.round(correctPlayed / (correctPlayed + incorrectPlayed) * 100)
        playSmart.disabled = false
    }).catch(console.error)
}).catch(console.error)

const updateDB = document.getElementById('updateDB')
updateDB.addEventListener('click', async () => {
    updateDB.disabled = true
    await fetch('updateDB')
    setTimeout(() => {
        location.reload()
    }, 5000)
})

// Game Vars

const statsGameMode = document.getElementById('statsGameMode')
const statsGameCategory = document.getElementById('statsGameCategory')
const statsGameWord = document.getElementById('statsGameWord')
const statsGameWordStreak = document.getElementById('statsGameWordStreak')
const statsGameStreak = document.getElementById('statsGameStreak')

const gameWordGerman = document.getElementById('gameWordGerman')
const gameWordEnglish = document.getElementById('gameWordEnglish')
const gameButtonReveal = document.getElementById('gameButtonReveal')
const gameButtonCorrect = document.getElementById('gameButtonCorrect')
const gameButtonIncorrect = document.getElementById('gameButtonIncorrect')

playSmart.addEventListener('click', () => {
    game.mode = "smart"

    homeView.classList.add('fade')
    homeView.classList.add('fixed-top')
    gameView.style.display = 'flex'
    setTimeout(() => {
        homeView.style.display = 'none'
    }, 1000)

    // if (game.mode == "smart") {
    questions = allQuestions.sort(shuffle).sort(shuffleWeighted)
    // }

    nextQuestion()
})

function nextQuestion() {

    if (game.question.id) sendAnswer(game.question)

    gameView.classList.add('fade-out')
    gameWordEnglish.classList.add('blur')
    setTimeout(() => {
        gameView.classList.remove('fade-out')

        if (questions.length == 0) questions = allQuestions.sort(shuffle).sort(shuffleWeighted)
        game.question = questions.shift()

        updateGameStats()

        console.log(game.question)

        gameWordEnglish.innerText = game.question.english
        gameWordGerman.innerText = game.question.german

        gameButtonReveal.disabled = false
        gameButtonCorrect.disabled = true
        gameButtonIncorrect.disabled = true

        setTimeout(() => {
            gameView.classList.remove('fade-in')
            gameView.classList.remove('fade-out')
        }, 500)
    }, 500)
}

gameButtonReveal.addEventListener('click', () => {
    gameButtonReveal.disabled = true
    gameButtonCorrect.disabled = false
    gameButtonIncorrect.disabled = false

    gameWordEnglish.classList.remove('blur')
})

gameButtonCorrect.addEventListener('click', () => {
    game.question.correct = true
    game.question.played = true
    game.question.streak = game.question.streak + 1
    game.stats.streak = game.stats.streak + 1
    game.stats.correct = game.stats.correct + 1
    game.stats.total = game.stats.total + 1

    nextQuestion()
})

gameButtonIncorrect.addEventListener('click', () => {
    game.question.correct = false
    game.question.played = true
    game.question.streak = 0
    game.stats.streak = 0
    game.stats.incorrect = game.stats.incorrect + 1
    game.stats.total = game.stats.total + 1

    nextQuestion()
})

function sendAnswer(question) {
    const vote = question.correct ? 'correct' : 'incorrect'
    fetch(`judge/${question.id}/${vote}`
    ).then(res => res.json()).then(data => {
        console.log(data)
    }).catch(console.error)
}

function updateGameStats() {
    statsGameMode.innerText = game.mode
    statsGameCategory.innerText = game.question.category
    statsGameWord.innerText = game.question.played > 0 ? (game.question.correct / game.question.played).toFixed(2) * 100 + '%' : '-%'
    statsGameWordStreak.innerText = game.question.streak
    statsGameStreak.innerText = game.stats.streak
}