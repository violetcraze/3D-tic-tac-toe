"use strict";

let canvas;
let backgroundColor;

function preload() {

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  backgroundColor = color(12, 12, 56);
}

function windowResized() {
  canvas.resize(windowWidth, windowHeight);
}

function draw() {
  background(backgroundColor);
}
