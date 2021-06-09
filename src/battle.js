const waitingList = []

const storeClient = (client) => {
  waitingList.push(client)
  console.log(`${client.data.username} Menunggu lawan`);
}

const checkWaitingList = () => {
  if (waitingList.length < 1) {
    return false
  }
  return waitingList.shift()
}

module.exports = {
  storeClient,
  checkWaitingList
}