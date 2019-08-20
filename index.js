const express = require('express');
const app = express();
const port = process.env.PORT | 3000;

app.use(express.static('public'));

const server = require('http').createServer(app);

const io = require('socket.io')(server);
io.on('connection', client => {
  console.log('Connected!');
  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });
});

server.listen(port, () => console.log(`Server listening on port ${port}!`));