"use strict";

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

  gameGraphics = createGraphics(width, height, WEBGL);

  addScreenPositionFunction(gameGraphics);

  currentPlayer = int(random(2)) + 1;

  cam = gameGraphics.createCamera();
  cam.ortho(-width / 2, width / 2, height / 2, -height / 2, -500, 1000);

  gameGraphics.rectMode(CENTER);
  gameGraphics.noFill();
  gameGraphics.stroke(255);
  gameGraphics.strokeWeight(2);

  game = new TicTacToeGame(4, 4, 4, 50);

  gradientColor1 = color(73, 6, 99);
  gradientColor2 = color(10, 92, 165);
}

function windowResized() {
  canvas.resize(windowWidth, windowHeight);
  // cam.ortho(-width / 2, width / 2, height / 2, -height / 2, -500, 1000);
}

function draw() {
  gameGraphics.clear();
  drawGradientBackground(gradientColor1, gradientColor2);

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
  }
}
