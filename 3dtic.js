"use strict";

let canvas;
let backgroundColor;

let board;
let cam;

let currentPlayer;

function preload() {

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  addScreenPositionFunction();

  backgroundColor = color(12, 12, 56);

  currentPlayer = int(random(2)) + 1;

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
  board.draw(currentPlayer);
}

function mouseReleased() {
  let successful = board.makeMove(currentPlayer);
  if (successful) {
    //currentPlayer++;
    if (currentPlayer === 3) {
      currentPlayer = 1;
    }
  }
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
      this.state.push(0);
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

  draw(currentPlayer) {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.depth; k++) {
          const position = this.getPosition(i, j, k);
          const index = this.index(i, j, k);
          push();
          
          stroke(255);
          translate(position.x, position.y, position.z);
          rotateX(PI / 2);
          square(0, 0, this.scale);
          if (index === this.closest && this.state[index] === 0) {
            stroke(255, 0, 0);
            this.drawIcon(currentPlayer);
          } else {
            this.drawIcon(this.state[index]);
          }
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

  makeMove(currentPlayer) {
    if (this.closest !== -1 && this.state[this.closest]=== 0) {
      this.state[this.closest] = currentPlayer;
      this.checkForWinner();
      return true;
    }
    return false;
  }

  checkForWinner() {
    
    console.log(this);
    
    // // check x
    // for (let j = 0; j < this.height; j++) {
    //   for (let k = 0; k < this.depth; k++) {
    //     let equal = true;
    //     let checkState = this.state[this.index(0, j, k)];
    //     if (checkState === 0) {
    //       equal = false;
    //     }
    //     for (let i = 1; i < this.width; i++) {
    //       if (checkState !== this.state[this.index(i, j, k)]) {
    //         equal = false;
    //       }
    //     }
    //     if (equal) {
    //       console.log("Winner");
    //     }
    //   }
    // }

    // // check y
    // for (let i = 0; i < this.width; i++) {
    //   for (let k = 0; k < this.depth; k++) {
    //     let equal = true;
    //     let checkState = this.state[this.index(i, 0, k)];
    //     if (checkState === 0) {
    //       equal = false;
    //     }
    //     for (let j = 1; j < this.height; j++) {
    //       if (checkState !== this.state[this.index(i, j, k)]) {
    //         equal = false;
    //       }
    //     }
    //     if (equal) {
    //       console.log("Winner");
    //     }
    //   }
    // }

    // // check z
    // for (let i = 0; i < this.width; i++) {
    //   for (let j = 0; j < this.height; j++) {
    //     let equal = true;
    //     let checkState = this.state[this.index(i, j, 0)];
    //     if (checkState === 0) {
    //       equal = false;
    //     }
    //     for (let k = 1; k < this.height; k++) {
    //       if (checkState !== this.state[this.index(i, j, k)]) {
    //         equal = false;
    //       }
    //     }
    //     if (equal) {
    //       console.log("Winner");
    //     }
    //   }
    // }

    for (let i = 0; i < 3; i++) {
      this.checkDimension(i);
    }

  }

  /**
   * 
   * @param {Number} dimension 0 = x, 1 = y, 2 = z
   */
  checkDimension(dimension) {

    if (dimension < 0 || dimension > 2) {
      console.log(dimension);
      console.log("WARN: Invalid input to checkDimension method!");
      return false;
    }

    let bounds = [];
    switch(dimension) {
      case 0:
        bounds.push(this.height);
        bounds.push(this.depth);
        bounds.push(this.width);
        break;
      case 1:
        bounds.push(this.width);
        bounds.push(this.depth);
        bounds.push(this.height);
        break;
      case 2:
        bounds.push(this.width);
        bounds.push(this.height);
        bounds.push(this.depth);
        break;
    }

    for (let i = 0; i < bounds[0]; i++) {
      for (let j = 0; j < bounds[1]; j++) {
        let equal = true;
        let checkState = 0;
        switch(dimension) {
          case 0:
            checkState = this.state[this.index(0, i, j)];
            break;
          case 1:
            checkState = this.state[this.index(i, 0, j)];
            break;
          case 2:
            checkState = this.state[this.index(i, j, 0)];
            break;
        }
        if (checkState === 0) {
          equal = false;
        }
        for (let k = 1; k < bounds[2]; k++) {
          let againstState = 0;
          switch(dimension) {
            case 0:
              againstState = this.state[this.index(k, i, j)];
              break;
            case 1:
              againstState = this.state[this.index(i, k, j)];
              break;
            case 2:
              againstState = this.state[this.index(i, j, k)];
              break;
          }
          if (checkState !== againstState) {
            equal = false;
          }
        }
        if (equal) {
          console.log("Winner");
          return true;
        }
      }
    }

  }

}