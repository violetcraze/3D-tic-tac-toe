"use strict";

let connected = false;
let socket;

let canvas;

let game;
let gameGraphics;
let cam;

let player;
let playersTurn = false;

let gradientColor1;
let gradientColor2;

function preload() {

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  gradientColor1 = color(106, 0, 128);
  gradientColor2 = color(0, 26, 77);

  updateStatus();
  setupSocket();
}

function setupSocket() {
  socket = io('http://localhost:3000');

  socket.on('established', () => {
    updateStatus('Waiting for another player ...<br>Invite a friend or you may be here awhile.');
  });

  socket.on('room-ready', data => {
    console.log(data.idInRoom);
    player = data.idInRoom + 1;
    if (player === 1) {
      playersTurn = true;
    } else {
      playersTurn = false;
    }
    updateStatus();
    statusConnecting(false);
    setupGame();
    connected = true;
  });

  socket.on('connection-lost', () => {
    statusConnecting(true);
    clearStatus();
    connected = false;
    updateStatus('Connection Lost!');
    game.clear();
  });

  socket.on('player-move', (data) => {
    if (player !== data.player) {
      playersTurn = !playersTurn;
      game.automatedMove(data.index, data.player);
      updateStatus();
    }
    console.log(data);
  });

  emitMove = emitMove.bind(socket);

}

function emitMove(successful, index) {
  if (successful) {
    const data = {
      player: player,
      index: index,
    }
    this.emit('move', data);
  }
}

function setupGame() {
  gameGraphics = createGraphics(width, height, WEBGL);

  setupGameGraphics();

  game = new TicTacToeGame(4, height / 15);
}

function setupGameGraphics() {
  addScreenPositionFunction(gameGraphics);

  cam = gameGraphics.createCamera();
  cam.ortho(-width / 2, width / 2, height / 2, -height / 2, -500, 1000);

  gameGraphics.rectMode(CENTER);
  gameGraphics.noFill();
  gameGraphics.stroke(255);
  gameGraphics.strokeWeight(2);
}

function windowResized() {
  canvas.resize(windowWidth, windowHeight);
  
  setupGameGraphics();

  game.setScale(height / 15);
}

function draw() {
  drawGradientBackground(gradientColor1, gradientColor2);

  if (connected) {
    gameGraphics.clear();
  
    cam.setPosition(
      cos(frameCount * 0.001),
      map(mouseY, 0, height, PI/5, PI/7),
      sin(frameCount * 0.001)
    );
    cam.lookAt(0, 0, 0);
  
    gameGraphics.setCamera(cam);
  
    game.updateClosest(createVector(mouseX - width / 2, mouseY - height / 2), gameGraphics);
    game.draw(player, gameGraphics);
    image(gameGraphics, 0, 0);
  }
}

function drawGradientBackground(c1, c2) {
  push();
  translate(0, 0, 0);
  for (let i = 0; i < height; i++) {
    stroke(lerpColor(c1, c2, i/float(height)));
    line(0, i, width, i);
  }
  pop();
}

function mouseReleased() {
  if (playersTurn) {
    let successful = game.makeMove(player, emitMove);
    if (successful) {
      playersTurn = !playersTurn;
      updateStatus();
    }
  }
}

function updateStatus(str) {
  const statusDiv = select('#local-status');
  if (!connected) {
    let html = statusDiv.html();
    if (str) {
      html += '<br>' + str;
    }
    statusDiv.html(html);
    return;
  }
  if (game.winner !== null) {
    if (playersTurn) {
      statusDiv.html(`Your Opponent Won`);
    } else {
      statusDiv.html(`You Won!`);
    }
  } else {
    if (playersTurn) {
      statusDiv.html(`It's Your Turn`);
    } else {
      statusDiv.html(`It's Your Opponent's Turn`);
    }
  }
}

function clearStatus() {
  const statusDiv = select('#local-status');
  statusDiv.html = '';
}

function statusConnecting(connecting) {
  const statusDiv = select('#local-status');
  if (connecting) {
    statusDiv.addClass('connecting');
  } else {
    statusDiv.removeClass('connecting');
  }
}
