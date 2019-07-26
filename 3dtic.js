"use strict";

let canvas;
let backgroundColor;

let board;
let cam;

function preload() {

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
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

  board.draw();
}

class GameBoard {

  constructor(width, height, depth, scale) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.scale = scale;
    this.clear();
    console.log(this);
  }

  clear() {
    this.state = [];
    for (let i = 0; i < this.width * this.height * this.depth; i++) {
      this.state.push(int(random(3)));
    }
  }

  draw() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.depth; k++) {
          push();
          let x = ((i + .5) - (this.width / 2)) * this.scale;
          let y = ((j + .5) - (this.height / 2)) * this.scale * 3;
          let z = ((k + .5) - (this.depth / 2)) * this.scale;
          translate(x, y, z);
          rotateX(PI / 2);
          //box(this.scale, 0, this.scale);
          square(0, 0, this.scale);
          this.drawIcon(this.state[this.index(i, j, k)]);
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