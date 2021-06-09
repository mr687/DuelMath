const express = require('express')
const {
  Server
} = require('socket.io')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

const onDisconnect = () => {
  console.log(`Client disconnected.`);
}

const battle = require('./battle')

const onConnection = (client) => {
  console.log(`${client.id} : Client connected.`);

  client.on('search enemy', (data) => {
    const enemy = battle.checkWaitingList()
    data.id = client.id
    client.data = data
    if (enemy === false) {
      battle.storeClient(client)
    } else {
      console.log(`${data.username} melawan ${enemy.data.username}`);
      io.to(client.id)
        .emit('enemy found', {
          enemy: enemy.data,
          current: client.data
        })
      io.to(enemy.id)
        .emit('enemy found', {
          enemy: client.data,
          current: enemy.data
        })
    }
  })

  client.on('surrender', (data) => {
    io.to(data.win.id)
      .emit('surrender', data)
  })

  client.on('correct answer', (data) => {
    io.to(data.enemy.id)
      .emit('correct answer', data.score)
  })

  client.on('battle finish', (data) => {
    io.to(data.lose.id)
      .emit('battle finish', data)
  })

  client.on('disconnect', onDisconnect)
}

io.on('connection', onConnection)

const port = 5555;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
})