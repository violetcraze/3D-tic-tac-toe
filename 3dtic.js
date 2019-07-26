"use strict";

let canvas;
let backgroundColor;

let board;
let cam;

function preload() {

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  addScreenPositionFunction();

  backgroundColor = color(12, 12, 56);

  cam = createCamera();
  cam.ortho(-width / 2, width / 2, height / 2, -height / 2, -500, 1000);

  rectMode(CENTER);
  smooth();
  noFill();
  stroke(255);
  strokeWeight(2);

  board = new GameBoard(4, 4, 4, 50);
}

function windowResized() {
  canvas.resize(windowWidth, windowHeight);
  cam.ortho(-width / 2, width / 2, height / 2, -height / 2, -500, 1000);
}

function draw() {
  background(backgroundColor);

  cam.setPosition(
    cos(frameCount * 0.001),
    map(mouseY, 0, height, PI/5, PI/7),
    sin(frameCount * 0.001)
  );
  cam.lookAt(0, 0, 0);

  board.updateClosest(createVector(mouseX - width / 2, mouseY - height / 2));
  board.draw();
}

class GameBoard {

  constructor(width, height, depth, scale) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.scale = scale;
    this.closest = -1; // index or negative 1
    this.clear();
  }

  clear() {
    this.state = [];
    for (let i = 0; i < this.width * this.height * this.depth; i++) {
      this.state.push(int(random(3)));
    }
  }

  updateClosest(mouseLocation) {
    let recordDistance = Number.MAX_VALUE;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.depth; k++) {
          const position = this.getPosition(i, j, k);
          const screenLocation = screenPosition(position.x, position.y, position.z);
          const distance = dist(mouseLocation.x, mouseLocation.y, screenLocation.x, screenLocation.y);
          if (recordDistance > distance) {
            recordDistance = distance;
            this.closest = this.index(i, j, k);
          }
        }
      }
    }
    if (recordDistance > this.scale / 2) { 
      this.closest = -1;
    }
  }

  getPosition(i, j, k) {
    return createVector(
      ((i + .5) - (this.width / 2)) * this.scale,
      ((j + .5) - (this.height / 2)) * this.scale * 3,
      ((k + .5) - (this.depth / 2)) * this.scale
    )
  }

  draw(mouseLocation) {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.depth; k++) {
          const position = this.getPosition(i, j, k);
          const index = this.index(i, j, k);
          push();
          if (index == this.closest) {
            stroke(255, 0, 0);
          } else {
            stroke(255);
          }
          translate(position.x, position.y, position.z);
          rotateX(PI / 2);
          square(0, 0, this.scale);
          this.drawIcon(this.state[index]);
          pop();
        }
      }
    }
  }

  drawIcon(state) {
    switch(state) {
      case 1:
        ellipse(0, 0, this.scale * 5 / 11);
        break;
      case 2:
        line(-this.scale / 4, -this.scale / 4, this.scale / 4, this.scale / 4);
        line(-this.scale / 4, this.scale / 4, this.scale / 4, -this.scale / 4);
        break;
    }
  }

  index(x, y, z) {
    return x + (y * this.width) + (z * this.width * this.height);
  }

}