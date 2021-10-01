const landingTitle = document.getElementById('landingTitle');
const landing = document.getElementById('landing');

const returnDate = localStorage.getItem('returning');
const returning = returnDate ? (Date.now() - returnDate) < 24 * 60 * 60 * 1000 : false;

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

let questions = []

fetch('/data').then(res => res.json()).then(data => {
    questions = data
    console.log(questions)

    document.getElementById('statsTotalCards').innerText = questions.length
    document.getElementById('statsCardsPlayed').innerText = questions.reduce((acc, cur) => acc + cur.played, 0)
    document.getElementById('statsCardsCorrect').innerText =
        Math.round(
            questions.reduce((acc, cur) => acc + cur.correct, 0) / questions.reduce((acc, cur) => acc + cur.incorrect, 1e-9)
            * 100)

})

// Game Vars

const statsGameMode = document.getElementById('statsGameMode')
const statsGameCategory = document.getElementById('statsGameCategory')
const statsGameWord = document.getElementById('statsGameWord')
const statsGameWordStreak = document.getElementById('statsGameWordStreak')
const statsGameStreak = document.getElementById('statsGameStreak')

playSmart.addEventListener('click', () => {

    game.mode = "smart"

    homeView.classList.add('fade')
    homeView.classList.add('fixed-top')
    gameView.style.display = 'flex'
    setTimeout(() => {
        homeView.style.display = 'none'
    }, 1000)



})