const express = require('express');
const app = express();
const port = process.env.PORT | 3000;

app.use(express.static('public'));

const server = require('http').createServer(app);

let roomCounter = 0;
const roomMatcher = new RegExp(/^[0-9]{1,19}$/);
const TARGET_ROOM_SIZE = 2;

const io = require('socket.io')(server);
io.on('connection', socket => {

  console.log(`${socket.id} is connected`);

  let room = joinRoom(socket);
  socket.emit('established');

  socket.on('move', data => {
    console.log(data);
    io.to(room).emit('player-move', data);
  });

  socket.on('disconnect', () => {
    // console.log(room + ' had a lost connection');
    // io.to(room).emit('connection-lost');
    console.log(`${socket.id} was disconnected`);
  });
  
});

function joinRoom(socket) {
  let room = roomToJoin();
  if (room === null) {
    room = roomCounter.toString();
    roomCounter++;
  }
  socket.join(room);
  checkRoomSize(room);
  return room;
}

function roomToJoin() {
  let roomList = getRoomList();
  let keys = Object.keys(roomList);
  for (let i = 0; i < keys.length; i++) {
    if (roomList[keys[i]].length < TARGET_ROOM_SIZE) {
      return keys[i];
    }
  }
  return null;
}

function getRoomList() {
  let allRooms = io.sockets.adapter.rooms;
  let keys = Object.keys(allRooms).filter(key => key.match(roomMatcher));
  let rooms = {};
  for (let i = 0; i < keys.length; i++) {
    rooms[keys[i]] = allRooms[keys[i]];
  }
  return rooms;
}

function checkRoomSize(room) {
  if (io.sockets.adapter.rooms[room].length === TARGET_ROOM_SIZE) {
    let socketsInRoom = Object.keys(io.sockets.adapter.rooms[room].sockets);
    for (let i = 0; i < socketsInRoom.length; i++) {
      io.sockets.connected[socketsInRoom[i]].emit('room-ready', {
        socketIDs: socketsInRoom,
        idInRoom: i,
        gameStartTime: Date.now() + 6000,
      });
    }
    console.log(room + ' is full');
    console.log(io.sockets.adapter.rooms[room]);
  }
}

server.listen(port, () => console.log(`Server listening on port ${port}!`));