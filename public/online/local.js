"use strict";

let connected = false;

let canvas;

let game;
let gameGraphics;
let cam;

let currentPlayer;

let gradientColor1;
let gradientColor2;

function preload() {

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  gradientColor1 = color(73, 6, 99);
  gradientColor2 = color(10, 92, 165);

  updateStatus();
}

function setupGame() {
  gameGraphics = createGraphics(width, height, WEBGL);

  currentPlayer = int(random(2)) + 1;

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
    game.draw(currentPlayer, gameGraphics);
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
  let successful = game.makeMove(currentPlayer);
  if (successful) {
    currentPlayer++;
    if (currentPlayer === 3) {
      currentPlayer = 1;
    }
    updateStatus();
  }
}

function updateStatus() {
  const statusDiv = select('#local-status');
  if (!connected) {
    statusDiv.html(`Searching for another player ...<br>This is dependent on another person visiting the site.`);
    return;
  }
  if (game.winner !== null) {
    if (currentPlayer === 1) {
      statusDiv.html(`Player 2 Won`);
    } else {
      statusDiv.html(`Player 1 Won`);
    }
  } else {
    statusDiv.html(`Player ${currentPlayer}'s Turn`);
  }
}
