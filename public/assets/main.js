const socket = io()

let currentQuiz = undefined
let roomData = undefined
let tick = 0
let isWaiting = false

setInterval(() => {
  if (isWaiting === true) {
    const viewTick = document.getElementById('waitingTick')
    tick++
    const labelTick = `Mencari lawan.. ${tick} detik`
    viewTick.innerHTML = labelTick
    viewTick.style.display = 'inline'
  }
}, 1000);

const resetForm = () => {
  isWaiting = false
  document.getElementById('searchEnemy').disabled = false
  refreshDisplay(false)
  currentQuiz = undefined
  roomData = undefined
  tick = 0
  document.getElementById('waitingTick').style.display = 'none'
  document.getElementById('username').value = ''
  document.getElementById('inputAnswer').value = ''
}

const refreshDisplay = (enemyFound = false) => {
  if (enemyFound === true) {
    document.getElementById('landingSection').style.display = 'none'
    document.getElementById('battleSection').style.display = 'block'
    document.getElementById('currentUsername').innerHTML = roomData.current.username
    document.getElementById('enemyUsername').innerHTML = roomData.enemy.username
  } else {
    document.getElementById('landingSection').style.display = 'block'
    document.getElementById('battleSection').style.display = 'none'
  }
  refreshQuiz()
}

const refreshQuiz = () => {
  currentQuiz = [
    Math.floor(Math.random() * 50),
    Math.floor(Math.random() * 50)
  ]
  const label = `${currentQuiz[0]} + ${currentQuiz[1]} =`
  document.getElementById('quiz').innerHTML = label
}

const battleFinish = (data) => {
  if (data.win.id == roomData.current.id) {
    alert(`KAMU MENANG!! Lawanmu ${data.lose.username} kalah cepat.`)
  } else {
    alert(`KAMU KALAH CEPAT!! Pemenangnya adalah ${data.win.username}.`)
  }
  resetForm()
}

const correctAnswer = () => {
  const currentProgress = document.getElementById('currentProgress')
  let score = parseInt(currentProgress.getAttribute('aria-valuenow'))

  if (score === 90) {
    const data = {
      win: roomData.current,
      lose: roomData.enemy
    }
    socket.emit('battle finish', data)
    battleFinish(data)
    return
  }

  score = score + 10
  currentProgress.style.width = `${score}%`
  currentProgress.setAttribute('aria-valuenow', score)

  socket.emit('correct answer', {
    score: score,
    enemy: roomData.enemy
  })
  refreshQuiz()
}

const onInputEntered = (e) => {
  if (e.keyCode == 13) {
    const correct = currentQuiz[0] + currentQuiz[1]
    const userAnswer = document.getElementById('inputAnswer')

    if (correct == userAnswer.value) {
      correctAnswer()
    }

    userAnswer.value = ''
    userAnswer.focus()
  }
}

socket.on('enemy found', (data) => {
  resetForm()
  alert(`Kamu akan melawan ${data.enemy.username}`)
  roomData = data
  refreshDisplay(true)
})

socket.on('battle finish', (data) => {
  battleFinish(data)
})

socket.on('surrender', (data) => {
  if (data.win.id == roomData.current.id) {
    alert(`KAMU MENANG!! Lawangmu ${data.lose.username} menyerah`)
    resetForm()
  }
})

socket.on('correct answer', (score) => {
  const enemyProgress = document.getElementById('enemyProgress')
  enemyProgress.style.width = `${score}%`
  enemyProgress.setAttribute('aria-valuenow', score)
})

document.getElementById('searchEnemy')
  .addEventListener('click', () => {
    const username = document.getElementById('username')

    if (username.value.length < 1) {
      alert('Kamu harus mengisi namamu!')
      username.focus()
    } else {
      isWaiting = true
      // disabled current button
      document.getElementById('searchEnemy').disabled = true

      const data = {
        username: username.value
      }
      socket.emit('search enemy', data)
    }
  })

document.getElementById('surrender')
  .addEventListener('click', () => {
    socket.emit('surrender', {
      win: roomData.enemy,
      lose: roomData.current
    })
    alert(`KAMU KALAH!! Karena menyerah. Pemenangnya adalah ${roomData.enemy.username}`)
    resetForm()
  })