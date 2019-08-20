
class TicTacToeGame {

  constructor(size, scale) {
    this.width = size;
    this.height = size;
    this.depth = size;
    this.scale = int(scale);

    this.playerColors = [];
    this.playerColors.push([color(181, 181, 251), color(1, 111, 253, 0)]);
    this.playerColors.push([color(185, 241, 212), color(125, 219, 171, 0)]);

    this.boardColor = color(251, 24, 202);

    this.closest = -1; // index or negative 1
    this.clear();
  }

  setScale(scale) {
    this.scale = int(scale);
  }

  clear() {
    this.state = [];
    for (let i = 0; i < this.width * this.height * this.depth; i++) {
      this.state.push(0);
    }
    this.winner = null;
  }

  updateClosest(mouseLocation, pg) {
    let recordDistance = Number.MAX_VALUE;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.depth; k++) {
          const position = this.getPosition(i, j, k);
          const screenLocation = pg.screenPosition(position.x, position.y, position.z);
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

  draw(currentPlayer, pg) {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        for (let k = 0; k < this.depth; k++) {
          const position = this.getPosition(i, j, k);
          const index = this.index(i, j, k);
          pg.push();
          pg.translate(position.x, position.y, position.z);
          pg.rotateX(PI / 2);
          this.drawBorder(pg);
          if (index === this.closest && this.state[index] === 0) {
            this.drawIcon(currentPlayer, pg);
          } else {
            this.drawIcon(this.state[index], pg);
          }
          pg.pop();
        }
      }
    }

    if (this.winner !== null) {
      this.drawWinner(pg);
    }
  }

  drawBorder(pg) {

    pg.noStroke();
    pg.fill(this.boardColor);

    let thickness = 2;

    pg.translate(0, this.scale / 2, 0);
    pg.box(this.scale, thickness, thickness);
    pg.translate(0, -this.scale, 0);
    pg.box(this.scale, thickness, thickness);
    pg.translate(0, this.scale / 2, 0);

    pg.translate(this.scale / 2, 0, 0);
    pg.box(thickness, this.scale, thickness);
    pg.translate(-this.scale, 0, 0);
    pg.box(thickness, this.scale, thickness);
    pg.translate(this.scale / 2, 0, 0);

  }

  drawIcon(state, pg) {
    let colorIndex = state - 1;
    if (colorIndex !== 0 && colorIndex !== 1) {
      return;
    }
    pg.noStroke();
    let gradientIterations = 10;
    for (let i = 0; i <= gradientIterations; i++) {
      let amt = i / float(gradientIterations);
      let c = lerpColor(this.playerColors[colorIndex][1], this.playerColors[colorIndex][0], amt);
      pg.fill(c);
      pg.sphere(lerp(this.scale / 2, this.scale/10, amt));
    }
  }

  drawWinner(pg) {
    const start = this.getPosition(this.winner[0], this.winner[1], this.winner[2]);
    const end = this.getPosition(this.winner[3], this.winner[4], this.winner[5]);
    pg.noFill();
    pg.stroke(this.boardColor);
    pg.strokeWeight(3);
    pg.line(start.x, start.y, start.z, end.x, end.y, end.z);
    pg.strokeWeight(1);
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

    for (let i = 0; i < 3; i++) {
      this.checkStraights(i);
    }
    // x y diagonals
    for (let i = 0; i < this.depth; i++) {
      this.checkDiagonal(0, 0, i, this.width - 1, this.height - 1, i);
      this.checkDiagonal(this.width - 1, 0, i, 0, this.height - 1, i);
    }
    // x z diagonals
    for (let i = 0; i < this.depth; i++) {
      this.checkDiagonal(0, i, 0, this.width - 1, i, this.depth - 1);
      this.checkDiagonal(this.width - 1, i, 0, 0, i, this.depth - 1);
    }
    // y z diagonals
    for (let i = 0; i < this.depth; i++) {
      this.checkDiagonal(i, 0, 0, i, this.height - 1, this.depth - 1);
      this.checkDiagonal(i, this.height - 1, 0, i, 0, this.depth - 1);
    }
    // 3 way diagonals
    this.checkDiagonal(0, 0, 0, this.width - 1, this.height - 1, this.depth - 1);
    this.checkDiagonal(this.width - 1, 0, 0, 0, this.height - 1, this.depth - 1);
    this.checkDiagonal(this.width - 1, this.height - 1, 0, 0, 0, this.depth - 1);
    this.checkDiagonal(0, this.height - 1, 0, this.width - 1, 0, this.depth - 1);

  }

  /**
   * 
   * @param {Number} dimension 0 = x, 1 = y, 2 = z
   */
  checkStraights(dimension) {

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
          switch(dimension) {
            case 0:
              this.winner = [0, i, j, bounds[2] - 1, i, j];
              break;
            case 1:
              this.winner = [i, 0, j, i, bounds[2] - 1, j];
              break;
            case 2:
              this.winner = [i, j, 0, i, j, bounds[2] - 1];
              break;
          }
        }
      }
    }

  }

  checkDiagonal(x1, y1, z1, x2, y2, z2) {

    const diff = [];
    diff.push(abs(x1 - x2));
    diff.push(abs(y1 - y2));
    diff.push(abs(z1 - z2));
    const checkDiff = diff[0] !== 0 ? 0 : 1;

    let equal = true;
    let checkState = this.state[this.index(x1, y1, z1)];
    if (checkState === 0) {
      equal = false;
    } else {
      for (let i = 1; i <= diff[checkDiff]; i++) {
        let x, y, z;
  
        if (x1 < x2) {
          x = x1 + i;
        } else if (x1 === x2) {
          x = x1;
        } else {
          x = x1 - i;
        }
  
        if (y1 < y2) {
          y = y1 + i;
        } else if (y1 === y2) {
          y = y1;
        } else {
          y = y1 - i;
        }
  
        if (z1 < z2) {
          z = z1 + i;
        } else if (z1 === z2) {
          z = z1;
        } else {
          z = z1 - i;
        }
  
        if (checkState !== this.state[this.index(x, y, z)]) {
          equal = false;
        }
  
      }
    }

    if (equal) {
      this.winner = [x1, y1, z1, x2, y2, z2];
    }

  }

}
