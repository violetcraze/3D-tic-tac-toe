"use strict";

let canvas;
let backgroundColor;

let board;

function preload() {

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  backgroundColor = color(12, 12, 56);
  rectMode(CENTER);
  noFill();
  stroke(255);
  strokeWeight(3);

  board = new GameBoard(4, 4, 4);
}

function windowResized() {
  canvas.resize(windowWidth, windowHeight);
}

function draw() {
  background(backgroundColor);

  board.draw();
}

class GameBoard {

  constructor(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.clear();
    console.log(this);
  }

  clear() {
    this.state = [];
    for (let i = 0; i < this.width * this.height * this.depth; i++) {
      this.state.push(0);
    }
  }

  draw() {
    let w = width / this.width;
    let h = height / this.height;
    for (let i = 0; i < this.height; i++) {
      let x = width / 2;
      let y = h / 2 + (i * h);
      square(x, y, h);
    }
  }

}