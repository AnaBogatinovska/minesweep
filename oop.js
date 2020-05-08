"use strict";
const $startBtn = document.getElementById("start-btn");
const $form = document.getElementById("form-numbers");
const $backdrop = document.getElementById("backdrop-id");
const $newGameBtn = document.getElementById("new-game-btn");
const $cancelBtn = document.getElementById("cancel-btn");
const $refreshGameBtn = document.getElementById("refresh-btn");
const $slotContainer = document.getElementById("slots-container");
const $bombRemaining = document.getElementById("bomb-remaining");
const $timeCount = document.getElementById("time");

const EMPTY = "empty";
const BOMB = "bomb";
const NUMBER = "number";
const HIDDEN = "hidden";
const VISIBLE = "visible";
const EXPLODE = "explode";

const $userInputs = document.querySelectorAll("input");
const userInputs = Array.from($userInputs);

class Slot {
  status = HIDDEN;
  type = EMPTY;
  bombCount = 0;
  wrongBomb = false;
  flag = false;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Game {
  inputRows = 9;
  inputCols = 9;
  inputBombs = 10;
  gameOver = false;
  gameWon = false;
  timeCounter = 0;
  gameSlots = [];
  timerIntervalId = null;

  startGame() {
    this.refreshGame();
    timer.renderTimer();
    this.initializeBoard();
    this.initializeBombs();
    this.initializeNumbers();
    this.countRemainingBombs();
    this.renderBoard();
  }

  refreshGame() {
    if (this.gameWon) {
      this.gameWon = false;
      $refreshGameBtn.classList.remove("emoji-win");
      $refreshGameBtn.classList.add("emoji-happy");
    }
    $refreshGameBtn.classList.remove("emoji-sad");
    $refreshGameBtn.classList.add("emoji-happy");
  }

  // == INITIALIZING GAME
  initializeBoard(rows, cols) {
    this.gameOver = false;
    this.gameSlots = [];

    for (let i = 1; i <= this.inputRows; i++) {
      for (let j = 1; j <= this.inputCols; j++) {
        const slot = new Slot(i, j);
        this.gameSlots.push(slot);
      }
    }
  }

  initializeBombs() {
    let i = 0;
    while (i < this.inputBombs) {
      const randomIndex = Math.floor(
        Math.random() * (this.inputRows * this.inputCols)
      );
      this.gameSlots[randomIndex].type = BOMB;
      const filterSlots = this.gameSlots.filter((slot) => slot.type === BOMB);
      i = filterSlots.length;
    }
  }

  initializeNumbers() {
    for (const slot of this.gameSlots) {
      if (slot.type === BOMB) {
        continue;
      }
      const x = slot.x;
      const y = slot.y;
      const cols = this.inputCols;
      const rows = this.inputRows;
      let bombNum = 0;

      // Neighbourd: (x, y-1) --1
      if (y - 1 > 0) {
        const slotIndex = y - 2 + cols * (x - 1);
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }
      // Neighbourd: (x, y+1) --2
      if (y + 1 <= cols) {
        const slotIndex = y + cols * (x - 1);
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }

      // Neighbourd: (x-1, y-1) --3
      if (x - 1 > 0 && y - 1 > 0) {
        const slotIndex = y - 2 + cols * (x - 2);
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }

      // Neighbourd: (x-1, y) --4
      if (x - 1 > 0) {
        const slotIndex = y - 1 + cols * (x - 2);
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }

      // Neighbourd: (x-1, y+1) --5
      if (x - 1 > 0 && y + 1 <= cols) {
        const slotIndex = y + cols * (x - 2);
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }

      // Neighbourd: (x+1, y-1) --6
      if (x + 1 <= rows && y - 1 > 0) {
        const slotIndex = y - 2 + cols * x;
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }

      // Neighbourd: (x+1, y) --7
      if (x + 1 <= rows) {
        const slotIndex = y - 1 + cols * x;
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }

      // Neighbourd: (x+1, y+1) --8
      if (x + 1 <= rows && y + 1 <= cols) {
        const slotIndex = y + cols * x;
        let neighbourSlot = this.gameSlots[slotIndex];
        if (neighbourSlot.type === BOMB) {
          bombNum++;
        }
      }

      if (bombNum > 0) {
        slot.type = NUMBER;
        slot.bombCount = bombNum;
      } else if (bombNum === 0) {
        slot.type = EMPTY;
      }
    }
  }

  // == RENDERING GAME
  renderBoard() {
    $slotContainer.innerHTML = "";

    for (let i = 1; i <= this.inputRows; i++) {
      const $row = document.createElement("div");
      $row.className = "row";
      $slotContainer.appendChild($row);

      for (let j = 1; j <= this.inputCols; j++) {
        const slotIndex = j - 1 + this.inputCols * (i - 1);
        const slot = this.gameSlots[slotIndex];
        const $slot = document.createElement("div");
        $slot.className = "slot";
        $row.appendChild($slot);

        $slot.addEventListener("mousedown", (event) => {
          event.preventDefault();
          if (!this.gameOver) {
            $refreshGameBtn.classList.remove("emoji-happy");
            $refreshGameBtn.classList.add("emoji-click");
          }
        });
        $slot.addEventListener("mouseup", (event) => {
          event.preventDefault();

          if (!this.gameOver) {
            this.slotClickHandler(slot, event);
            $refreshGameBtn.classList.remove("emoji-click");
            $refreshGameBtn.classList.add("emoji-happy");
          }
        });
        if (slot.type === BOMB && slot.status === VISIBLE && !slot.flag) {
          $slot.classList.add("bomb-slot");
        }

        if (slot.type === NUMBER && slot.status === VISIBLE) {
          let number = slot.bombCount;
          $slot.innerHTML = number;
          switch (number) {
            case 1:
              $slot.classList.add("number-1");
              break;
            case 2:
              $slot.classList.add("number-2");
              break;
            case 3:
              $slot.classList.add("number-3");
              break;
            case 4:
              $slot.classList.add("number-4");
              break;
            case 5:
              $slot.classList.add("number-5");
              break;
            case 6:
              $slot.classList.add("number-6");
              break;
            case 7:
              $slot.classList.add("number-7");
              break;
            case 8:
              $slot.classList.add("number-8");
              break;
            default:
          }
        }
        if (slot.type === EMPTY && slot.status === VISIBLE) {
          $slot.classList.add("empty-slot");
        }

        if (slot.flag) {
          $slot.classList.add("flag-slot");
        }

        if (slot.wrongBomb) {
          $slot.classList.remove("flag-slot");
          $slot.classList.add("wrong-bomb");
        }
        if (slot.type === EXPLODE) {
          $slot.classList.remove("bomb-slot");
          $slot.classList.add("bomb-red");
        }
      }

      if (this.gameWon) {
        $bombRemaining.innerHTML = "";
        $bombRemaining.innerHTML = "WIN";
        $refreshGameBtn.classList.remove("emoji-happy");
        $refreshGameBtn.classList.add("emoji-win");
      }
      if (this.gameOver) {
        $bombRemaining.innerHTML = "";
        $bombRemaining.innerHTML = "LOST";
        $refreshGameBtn.classList.remove("emoji-happy");
        $refreshGameBtn.classList.add("emoji-sad");
      }
    }
  } // ---> end of renderBoard !

  renderBombRemaining(remainingBombs) {
    $bombRemaining.innerHTML = remainingBombs;
  }

  countRemainingBombs() {
    let remainingBombs = this.inputBombs;
    let countFlags = 0;
    this.gameSlots.forEach((slot) => {
      if (slot.flag) {
        countFlags += 1;
      }
    });
    remainingBombs -= countFlags;
    this.renderBombRemaining(remainingBombs);
  }

  checkNeighbourSlots(surroundingSlot) {
    if (
      surroundingSlot.type === EMPTY &&
      surroundingSlot.status === HIDDEN &&
      surroundingSlot.flag === false
    ) {
      surroundingSlot.status = VISIBLE;
      this.revealEmptyNeighbourds(surroundingSlot);
    } else if (
      surroundingSlot.type === NUMBER &&
      surroundingSlot.status === HIDDEN &&
      surroundingSlot.flag === false
    ) {
      surroundingSlot.status = VISIBLE;
    }
  }

  revealEmptyNeighbourds(slot) {
    const x = slot.x;
    const y = slot.y;
    const cols = this.inputCols;
    const rows = this.inputRows;

    // reveal-Neighbourd: (x, y-1) --1
    if (y - 1 > 0) {
      const slotIndex = y - 2 + cols * (x - 1);
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }

    // reveal-Neighbourd: (x, y+1) --2
    if (y + 1 <= cols) {
      const slotIndex = y + cols * (x - 1);
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }

    // reveal-Neighbourd: (x-1, y-1) --3
    if (x - 1 > 0 && y - 1 > 0) {
      const slotIndex = y - 2 + cols * (x - 2);
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }

    // reveal-Neighbourd: (x-1, y) --4
    if (x - 1 > 0) {
      const slotIndex = y - 1 + cols * (x - 2);
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }

    // reveal-Neighbourd: (x-1, y+1) --5
    if (x - 1 > 0 && y + 1 <= cols) {
      const slotIndex = y + cols * (x - 2);
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }

    // reveal-Neighbourd: (x+1, y-1) --6
    if (x + 1 <= rows && y - 1 > 0) {
      const slotIndex = y - 2 + cols * x;
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }

    // reveal-Neighbourd: (x+1, y) --7
    if (x + 1 <= rows) {
      const slotIndex = y - 1 + cols * x;
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }

    // reveal-Neighbourd: (x+1, y+1) --8
    if (x + 1 <= rows && y + 1 <= cols) {
      const slotIndex = y + cols * x;
      let neighbourSlot = this.gameSlots[slotIndex];
      this.checkNeighbourSlots(neighbourSlot);
    }
  }

  gameOverEnd() {
    this.gameOver = true;
    timer.stopTimer();
  }

  slotClickHandler(slot, event) {
    //left-click
    if (event.button === 0) {
      if (!slot.flag) {
        slot.status = VISIBLE;

        if (slot.type === BOMB) {
          for (const slot1 of this.gameSlots.filter((s) => s.type === BOMB)) {
            slot1.status = VISIBLE;
          }
          this.gameOverEnd();
          slot.type = EXPLODE;
        }

        if (slot.type === EMPTY) {
          this.revealEmptyNeighbourds(slot);
        }
      }
    } else if (event.button === 2) {
      //right-click
      if (slot.status != VISIBLE) {
        if (slot.flag) {
          slot.flag = false;
        } else {
          slot.flag = true;
        }
        this.countRemainingBombs();
      }
    }
    if (!this.gameOver && this.timerIntervalId === null) {
      timer.startTimer();
    }
    //check wrong bomb
    if (this.gameOver) {
      for (const slot of this.gameSlots.filter(
        (s) => s.flag === true && s.type != BOMB
      )) {
        slot.wrongBomb = true;
      }
    }
    //check for WIN
    const filterVisibleSlots = this.gameSlots.filter(
      (s) => s.status === VISIBLE || s.flag === true
    );
    const filterFlagSlots = this.gameSlots.filter((s) => s.flag === true);
    if (
      filterVisibleSlots.length === this.gameSlots.length &&
      filterFlagSlots.length === this.inputBombs
    ) {
      this.gameWon = true;
      timer.stopTimer();
    }

    this.renderBoard();
  }

  clearInputs() {
    userInputs[0].value = "";
    userInputs[1].value = "";
    userInputs[2].value = "";
  }

  newGameBtnHandler() {
    this.inputRows = parseInt(userInputs[0].value.trim());
    this.inputCols = parseInt(userInputs[1].value.trim());
    this.inputBombs = parseInt(userInputs[2].value.trim());

    if (
      this.inputRows === "" ||
      this.inputCols === "" ||
      this.inputBombs === ""
    ) {
      return alert("Please enter a number");
    }
    this.startGame();
    this.toggleForm();
    this.clearInputs();
  } //---->> end of newGameBtnHandler

  startBtnHandler() {
    $form.classList.toggle("visible");
  }

  backdropHandler() {
    $backdrop.classList.toggle("visible");
  }

  toggleForm() {
    this.startBtnHandler();
    this.backdropHandler();
  }
} // end GAME class

class Timer {
  startTimer() {
    game.timerIntervalId = setInterval(() => {
      game.timeCounter++;
      this.renderTimer();
    }, 1000);
  }

  resetTimer() {
    this.stopTimer();
    game.timeCounter = 0;
    this.renderTimer();
  }

  stopTimer() {
    if (game.timerIntervalId != null) {
      clearInterval(game.timerIntervalId);
      game.timerIntervalId = null;
    }
  }

  renderTimer() {
    $timeCount.innerHTML = game.timeCounter;
  }
}

let game = new Game();
let timer = new Timer();
game.startGame();

$startBtn.addEventListener("click", (event) => {
  game.toggleForm();
});
$backdrop.addEventListener("click", (event) => {
  game.toggleForm();
});
$cancelBtn.addEventListener("click", (event) => {
  event.preventDefault();
  game.toggleForm();
});
$form.addEventListener("submit", (event) => {
  event.preventDefault();
  game.newGameBtnHandler();
});

$slotContainer.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  return false;
});

$refreshGameBtn.addEventListener("click", () => {
  timer.stopTimer();
  timer.resetTimer();
  game.startGame();
});
