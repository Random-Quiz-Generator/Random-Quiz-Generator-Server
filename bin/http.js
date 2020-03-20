const app = require('../app')
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)
const fs = require('fs')
const port = 3000

const players = []
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf-8'))
let playing = false
let counter = 0

io.on('connection', socket => {
  console.log('konek')

  socket.on('joined', (playerName) => {
    console.log('A player joined', playerName)
    socket.player = players.length
    players.push(playerName)
    io.emit('updatePlayer', players)
    
    socket.on('leave', () => {
      console.log('A player leave')
      socket.disconnect()
    })
  })

  socket.on('start', () => {
    console.log('mulai game')
    if (players.length >= 2) playing = true
    else playing = false
    io.emit('updatePlaying', playing)
    io.emit('getQuestion', getQuestion())
  })

  socket.on('fetchQuestion', () => {
    let question = {}
    if (playing) question = getQuestion() 
    io.emit('getQuestion', question)
  })

  socket.on('updateScore', players => {
    io.emit('updatePlayer', players)
  })

  socket.on('end', () => {
    if (playing) {
      playing = false
    }
    io.emit('updatePlaying', playing)
  })
  
  socket.on('disconnect', function () {
    console.log('diskonek')
    players.splice(socket.player, 1)
    io.emit('updatePlayer', players)
    socket.emit('updatePlaying', false)
  })
})
  
//nanti dipanggil ke function socket yang get question
function getQuestion () {
  if (counter <= 10) {
    counter += 1
    const random = Math.floor(Math.random() * Math.floor(questions.length))
    return questions.splice(random, 1)
  } else {
    return {}
  }
}

server.listen(port, _ => {
  console.log(`Working on port ${port}`);
})