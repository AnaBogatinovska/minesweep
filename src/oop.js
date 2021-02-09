"use strict";
const $startBtn = document.getElementById("start-btn");
const $cancelBtn = document.getElementById("cancel-btn");
// const $clearBtn = document.getElementById("clear-btn");

const $form = document.getElementById("form-numbers");
const $backdrop = document.getElementById("backdrop-id");
const $userInputs = document.querySelectorAll("input");
const $gameContainer = document.getElementById("game-container");

const EMPTY = "empty";
const BOMB = "bomb";
const NUMBER = "number";
const HIDDEN = "hidden";
const VISIBLE = "visible";
const EXPLODE = "explode";

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
  gameSlots = [];
  $refreshGameBtn = null;
  $slotContainer = null;
  $headerBox = null;
  $bombRemaining = null;
  timer = new Timer();

  constructor(inputRows, inputCols, inputBombs) {
    this.inputRows = inputRows;
    this.inputCols = inputCols;
    this.inputBombs = inputBombs;
  }

  startGame() {
    this.renderGame();
    this.refreshGame();
    this.timer.resetTimer();
    this.initializeBoard();
    this.initializeBombs();
    this.initializeNumbers();
    this.countRemainingBombs();
    this.renderSlots();
  }

  refreshGame() {
    if (this.gameWon) {
      this.gameWon = false;
      this.$refreshGameBtn.classList.add("emoji-happy");
    }
    this.$refreshGameBtn.classList.remove("emoji-sad");
    this.$refreshGameBtn.classList.add("emoji-happy");
  }

  // == INITIALIZING GAME
  initializeBoard() {
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
      const randomIndex = Math.floor(Math.random() * this.gameSlots.length);
      this.gameSlots[randomIndex].type = BOMB;
      const filterSlots = this.gameSlots.filter((slot) => slot.type === BOMB);
      i = filterSlots.length;
    }
  }

  countBombsForNeighbour(x, y, bNum) {
    const slotIndex = y - 1 + this.inputCols * (x - 1);
    let neighbourSlot = this.gameSlots[slotIndex];

    if (neighbourSlot.type === BOMB) {
      bNum++;
    }
    return bNum;
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
        bombNum = this.countBombsForNeighbour(x, y - 1, bombNum);
      }

      // Neighbourd: (x, y+1) --2

      if (y + 1 <= cols) {
        bombNum = this.countBombsForNeighbour(x, y + 1, bombNum);
      }

      // Neighbourd: (x-1, y-1) --3
      if (x - 1 > 0 && y - 1 > 0) {
        bombNum = this.countBombsForNeighbour(x - 1, y - 1, bombNum);
      }

      // Neighbourd: (x-1, y) --4
      if (x - 1 > 0) {
        bombNum = this.countBombsForNeighbour(x - 1, y, bombNum);
      }

      // Neighbourd: (x-1, y+1) --5
      if (x - 1 > 0 && y + 1 <= cols) {
        bombNum = this.countBombsForNeighbour(x - 1, y + 1, bombNum);
      }

      // Neighbourd: (x+1, y-1) --6
      if (x + 1 <= rows && y - 1 > 0) {
        bombNum = this.countBombsForNeighbour(x + 1, y - 1, bombNum);
      }

      // Neighbourd: (x+1, y) --7
      if (x + 1 <= rows) {
        bombNum = this.countBombsForNeighbour(x + 1, y, bombNum);
      }

      // Neighbourd: (x+1, y+1) --8
      if (x + 1 <= rows && y + 1 <= cols) {
        bombNum = this.countBombsForNeighbour(x + 1, y + 1, bombNum);
      }

      if (bombNum > 0) {
        slot.type = NUMBER;
        slot.bombCount = bombNum;
      } else if (bombNum === 0) {
        slot.type = EMPTY;
      }
    }
  }

  renderGame() {
    const $minesweepBox = document.createElement("div");
    $minesweepBox.className = "minesweep-box";
    $minesweepBox.id = "minesweep-box";
    $gameContainer.appendChild($minesweepBox);

    // mineSweepBox start
    this.$headerBox = document.createElement("div");
    this.$headerBox.className = "header border";
    this.$headerBox.id = "header-box";
    $minesweepBox.appendChild(this.$headerBox);

    //header-box childs
    this.$bombRemaining = document.createElement("div");
    this.$bombRemaining.id = "bomb-remaining";
    this.$headerBox.appendChild(this.$bombRemaining);

    this.$refreshGameBtn = document.createElement("div");
    this.$refreshGameBtn.className = "emoji-happy";
    this.$refreshGameBtn.id = "refresh-btn";
    this.$headerBox.appendChild(this.$refreshGameBtn);

    let $timeCount = document.createElement("div");
    this.timer.setTimerCounter($timeCount);
    $timeCount.id = "time";
    this.$headerBox.appendChild($timeCount);
    //header-box childs end

    this.$slotContainer = document.createElement("div");
    this.$slotContainer.className = "border";
    this.$slotContainer.id = "slots-container";
    $minesweepBox.appendChild(this.$slotContainer);
    //mineSweepBox end

    this.$refreshGameBtn.addEventListener("click", () => {
      this.refreshGame();
      this.timer.resetTimer();
      this.initializeBoard();
      this.initializeBombs();
      this.initializeNumbers();
      this.countRemainingBombs();
      this.renderSlots();
    });

    this.$slotContainer.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      return false;
    });
  }

  // == RENDERING SLOTS
  renderSlots() {
    this.$slotContainer.innerHTML = "";

    for (let i = 1; i <= this.inputRows; i++) {
      const $row = document.createElement("div");
      $row.className = "row";
      this.$slotContainer.appendChild($row);

      for (let j = 1; j <= this.inputCols; j++) {
        const slotIndex = j - 1 + this.inputCols * (i - 1);
        const slot = this.gameSlots[slotIndex];
        const $slot = document.createElement("div");
        $slot.className = "slot";
        $row.appendChild($slot);

        $slot.addEventListener("mousedown", (event) => {
          event.preventDefault();
          if (!this.gameOver) {
            this.$refreshGameBtn.classList.remove("emoji-happy");
            this.$refreshGameBtn.classList.add("emoji-click");
          }
        });

        $slot.addEventListener("mouseup", (event) => {
          event.preventDefault();

          if (!this.gameOver) {
            this.slotClickHandler(slot, event);
            this.$refreshGameBtn.classList.remove("emoji-click");
            this.$refreshGameBtn.classList.add("emoji-happy");
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
        this.$bombRemaining.innerHTML = "";
        this.$bombRemaining.innerHTML = "WIN";
        this.$refreshGameBtn.classList.remove("emoji-happy");
        this.$refreshGameBtn.classList.add("emoji-win");
      }
      if (this.gameOver) {
        this.$bombRemaining.innerHTML = "";
        this.$bombRemaining.innerHTML = "LOST";
        this.$refreshGameBtn.classList.remove("emoji-happy");
        this.$refreshGameBtn.classList.add("emoji-sad");
      }
    }
  } // ---> end of renderSlots !

  renderBombRemaining(remainingBombs) {
    this.$bombRemaining.innerHTML = remainingBombs;
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
    this.timer.stopTimer();
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
    if (!this.gameOver && this.timer.timerIntervalId === null) {
      this.timer.timeCounter = 1;
      this.timer.renderTimer();
      this.timer.startTimer();
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
      this.timer.stopTimer();
    }

    this.renderSlots();
  }
} // end GAME class

class Timer {
  timeCounter = 0;
  timerIntervalId = null;
  $timeCount = null;

  startTimer() {
    this.timerIntervalId = setInterval(() => {
      this.timeCounter++;
      this.renderTimer();
    }, 1000);
  }

  resetTimer() {
    this.stopTimer();
    this.timeCounter = 0;
    this.renderTimer();
  }

  stopTimer() {
    if (this.timerIntervalId != null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  setTimerCounter(timeCount) {
    this.$timeCount = timeCount;
  }

  renderTimer() {
    this.$timeCount.innerHTML = this.timeCounter;
  }
}

class Minesweeper {
  gameBoards = [];
  addGame(game) {
    this.gameBoards.push(game);
    console.log(this.gameBoards)
  }
}

const clearInputs = () => {
  $userInputs[0].value = "";
  $userInputs[1].value = "";
  $userInputs[2].value = "";
};

const newGameBtnHandler = () => {
  const inputRows = parseInt($userInputs[0].value.trim());
  const inputCols = parseInt($userInputs[1].value.trim());
  const inputBombs = parseInt($userInputs[2].value.trim());

  if (!inputRows || !inputCols || !inputBombs) {
    return alert("Please enter a number");
  }

  let game = new Game(inputRows, inputCols, inputBombs);
  let minesweeper = new Minesweeper()
  minesweeper.addGame(game);
  game.startGame();
  toggleForm();
  clearInputs();
}; 

const startBtnHandler = () => {
  $form.classList.toggle("visible");
};

const backdropHandler = () => {
  $backdrop.classList.toggle("visible");
};

const toggleForm = () => {
  startBtnHandler();
  backdropHandler();
};

$startBtn.addEventListener("click", toggleForm);
$backdrop.addEventListener("click", toggleForm);

$cancelBtn.addEventListener("click", (event) => {
  event.preventDefault();
  toggleForm();
});
$form.addEventListener("submit", (event) => {
  event.preventDefault();
  newGameBtnHandler();
});
// $clearBtn.addEventListener('click', () => {
//   localStorage.clear();
// });
// let minesweep = new Minesweeper();

// function localStorageCreateItem() {
//   localStorage.setItem("minesweep", minesweep.gameBoards);
// }

// function readValueLocalStorage() {
//   let games = localStorage.getItem("minesweep");
  
//   $gameContainer.innerHTML = games;
// }
// localStorageCreateItem();
// readValueLocalStorage();