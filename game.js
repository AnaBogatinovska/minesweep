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

let gameSlots = [];
let timerIntervalId = null;

const gameSettings = {
  inputRows: 9,
  inputCols: 9,
  inputBombs: 10,
  gameOver: false,
  gameWon: false,
  timeCounter: 0,
};

const countRemainingBombs = () => {
  let remainingBombs = gameSettings.inputBombs;
  let countFlags = 0;
  gameSlots.forEach((slot) => {
    if (slot.flag) {
      countFlags += 1;
    }
  });
  remainingBombs -= countFlags;
  renderBombRemaining(remainingBombs);
};

const renderBombRemaining = (remainingBombs) => {
  $bombRemaining.innerHTML = remainingBombs;
};

const startTimer = () => {
  timerIntervalId = setInterval(() => {
    gameSettings.timeCounter++;
    renderTimer();
  }, 1000);
};

const stopTimer = () => {
  if (timerIntervalId != null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
};

const renderTimer = () => {
  $timeCount.innerHTML = gameSettings.timeCounter;
};

const resetTimer = () => {
  stopTimer();
  gameSettings.timeCounter = 0;
  renderTimer();
};

// // const initializeBoard = (rows, cols) => {
// //   gameSettings.gameOver = false;
// //   gameSlots = [];
// //   for (let i = 1; i <= rows; i++) {
// //     for (let j = 1; j <= cols; j++) {
// //       const slot = {
// //         status: HIDDEN,
// //         type: EMPTY,
// //         bombCount: 0,
// //         wrongBomb: false,
// //         flag: false,
// //         x: i,
// //         y: j,
// //       };
// //       gameSlots.push(slot);
// //     }
// //   }
// // };

// // const initializeBombs = () => {
// //   let i = 0;
// //   while (i < gameSettings.inputBombs) {
// //     const randomIndex = Math.floor(
// //       Math.random() * (gameSettings.inputRows * gameSettings.inputCols)
// //     );
// //     gameSlots[randomIndex].type = BOMB;
// //     const filterSlots = gameSlots.filter((slot) => slot.type === BOMB);
// //     i = filterSlots.length;
// //   }
// // };

// // const initializeNumbers = () => {
// //   for (const slot of gameSlots) {
// //     if (slot.type === BOMB) {
// //       continue;
// //     }
// //     const x = slot.x;
// //     const y = slot.y;
// //     let bombNum = 0;
// //     const cols = gameSettings.inputCols;
// //     const rows = gameSettings.inputRows;

// //     // Neighbourd: (x, y-1) --1
// //     if (y - 1 > 0) {
// //       const slotIndex = y - 2 + cols * (x - 1);
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }
// //     // Neighbourd: (x, y+1) --2
// //     if (y + 1 <= cols) {
// //       const slotIndex = y + cols * (x - 1);
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }

// //     // Neighbourd: (x-1, y-1) --3
// //     if (x - 1 > 0 && y - 1 > 0) {
// //       const slotIndex = y - 2 + cols * (x - 2);
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }

// //     // Neighbourd: (x-1, y) --4
// //     if (x - 1 > 0) {
// //       const slotIndex = y - 1 + cols * (x - 2);
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }

// //     // Neighbourd: (x-1, y+1) --5
// //     if (x - 1 > 0 && y + 1 <= cols) {
// //       const slotIndex = y + cols * (x - 2);
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }

// //     // Neighbourd: (x+1, y-1) --6
// //     if (x + 1 <= rows && y - 1 > 0) {
// //       const slotIndex = y - 2 + cols * x;
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }

// //     // Neighbourd: (x+1, y) --7
// //     if (x + 1 <= rows) {
// //       const slotIndex = y - 1 + cols * x;
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }

// //     // Neighbourd: (x+1, y+1) --8
// //     if (x + 1 <= rows && y + 1 <= cols) {
// //       const slotIndex = y + cols * x;
// //       let neighbourSlot = gameSlots[slotIndex];
// //       if (neighbourSlot.type === BOMB) {
// //         bombNum++;
// //       }
// //     }

// //     if (bombNum > 0) {
// //       slot.type = NUMBER;
// //       slot.bombCount = bombNum;
// //     } else if (bombNum === 0) {
// //       slot.type = EMPTY;
// //     }
// //   }
// // };

// // const revealEmptyNeighbourds = (slot) => {
// //   const x = slot.x;
// //   const y = slot.y;
// //   const cols = gameSettings.inputCols;
// //   const rows = gameSettings.inputRows;

// //   function checkNeighbourSlots(surroundingSlot, sIndex) {
// //     if (
// //       surroundingSlot.type === EMPTY &&
// //       surroundingSlot.status === HIDDEN &&
// //       surroundingSlot.flag === false
// //     ) {
// //       surroundingSlot.status = VISIBLE;
// //       revealEmptyNeighbourds(surroundingSlot);
// //     } else if (
// //       surroundingSlot.type === NUMBER &&
// //       surroundingSlot.status === HIDDEN &&
// //       surroundingSlot.flag === false
// //     ) {
// //       surroundingSlot.status = VISIBLE;
// //     }
// //   }

// //   // reveal-Neighbourd: (x, y-1) --1
// //   if (y - 1 > 0) {
// //     const slotIndex = y - 2 + cols * (x - 1);
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }

// //   // reveal-Neighbourd: (x, y+1) --2
// //   if (y + 1 <= cols) {
// //     const slotIndex = y + cols * (x - 1);
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }

// //   // reveal-Neighbourd: (x-1, y-1) --3
// //   if (x - 1 > 0 && y - 1 > 0) {
// //     const slotIndex = y - 2 + cols * (x - 2);
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }

// //   // reveal-Neighbourd: (x-1, y) --4
// //   if (x - 1 > 0) {
// //     const slotIndex = y - 1 + cols * (x - 2);
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }

// //   // reveal-Neighbourd: (x-1, y+1) --5
// //   if (x - 1 > 0 && y + 1 <= cols) {
// //     const slotIndex = y + cols * (x - 2);
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }

// //   // reveal-Neighbourd: (x+1, y-1) --6
// //   if (x + 1 <= rows && y - 1 > 0) {
// //     const slotIndex = y - 2 + cols * x;
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }

// //   // reveal-Neighbourd: (x+1, y) --7
// //   if (x + 1 <= rows) {
// //     const slotIndex = y - 1 + cols * x;
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }

// //   // reveal-Neighbourd: (x+1, y+1) --8
// //   if (x + 1 <= rows && y + 1 <= cols) {
// //     const slotIndex = y + cols * x;
// //     let neighbourSlot = gameSlots[slotIndex];
// //     checkNeighbourSlots(neighbourSlot, slotIndex);
// //   }
// // };

// // const gameOver = () => {
// //   gameSettings.gameOver = true;
// //   stopTimer();
// // };

// const slotClickHandler = (slot, event) => {
//   //left-click
//   if (event.button === 0) {
//     if (!slot.flag) {
//       slot.status = VISIBLE;

//       if (slot.type === BOMB) {
//         for (const slot1 of gameSlots.filter((s) => s.type === BOMB)) {
//           slot1.status = VISIBLE;
//         }
//         gameOver();
//         slot.type = EXPLODE;
//       }

//       if (slot.type === EMPTY) {
//         revealEmptyNeighbourds(slot);
//       }
//     }
//   } else if (event.button === 2) {
//     //right-click
//     if (slot.status != VISIBLE) {
//       if (slot.flag) {
//         slot.flag = false;
//       } else {
//         slot.flag = true;
//       }
//       countRemainingBombs();
//     }
//   }
//   if (!gameSettings.gameOver && timerIntervalId === null) {
//     startTimer();
//   }
//   //check wrong bomb
//   if (gameSettings.gameOver) {
//     for (const slot of gameSlots.filter(
//       (s) => s.flag === true && s.type != BOMB
//     )) {
//       slot.wrongBomb = true;
//     }
//   }

//   //check for WIN
//   const filterVisibleSlots = gameSlots.filter(
//     (s) => s.status === VISIBLE || s.flag === true
//   );
//   const filterFlagSlots = gameSlots.filter((s) => s.flag === true);
//   if (
//     filterVisibleSlots.length === gameSlots.length &&
//     filterFlagSlots.length === gameSettings.inputBombs
//   ) {
//     gameSettings.gameWon = true;
//     stopTimer();
//   }

//   renderBoard(gameSettings.inputRows, gameSettings.inputCols);
// };

// // const renderBoard = (rows, cols) => {
// //   $slotContainer.innerHTML = "";

// //   for (let i = 1; i <= rows; i++) {
// //     const $row = document.createElement("div");
// //     $row.className = "row";
// //     $slotContainer.appendChild($row);

// //     for (let j = 1; j <= cols; j++) {
// //       const slotIndex = j - 1 + cols * (i - 1);
// //       const slot = gameSlots[slotIndex];
// //       const $slot = document.createElement("div");
// //       $slot.className = "slot";
// //       $row.appendChild($slot);

// //       $slot.addEventListener("mousedown", (event) => {
// //         event.preventDefault();
// //         if (!gameSettings.gameOver) {
// //           $refreshGameBtn.classList.remove("emoji-happy");
// //           $refreshGameBtn.classList.add("emoji-click");
// //         }
// //       });
// //       $slot.addEventListener("mouseup", (event) => {
// //         event.preventDefault();
// //         if (!gameSettings.gameOver) {
// //           slotClickHandler(slot, event);
// //           $refreshGameBtn.classList.remove("emoji-click");
// //           $refreshGameBtn.classList.add("emoji-happy");
// //         }
// //       });

// //       if (slot.type === BOMB && slot.status === VISIBLE && !slot.flag) {
// //         $slot.classList.add("bomb-slot");
// //       }

// //       if (slot.type === NUMBER && slot.status === VISIBLE) {
// //         let number = slot.bombCount;
// //         $slot.innerHTML = number;
// //         switch (number) {
// //           case 1:
// //             $slot.classList.add("number-1");
// //             break;
// //           case 2:
// //             $slot.classList.add("number-2");
// //             break;
// //           case 3:
// //             $slot.classList.add("number-3");
// //             break;
// //           case 4:
// //             $slot.classList.add("number-4");
// //             break;
// //           case 5:
// //             $slot.classList.add("number-5");
// //             break;
// //           case 6:
// //             $slot.classList.add("number-6");
// //             break;
// //           case 7:
// //             $slot.classList.add("number-7");
// //             break;
// //           case 8:
// //             $slot.classList.add("number-8");
// //             break;
// //           default:
// //         }
// //       }
// //       if (slot.type === EMPTY && slot.status === VISIBLE) {
// //         $slot.classList.add("empty-slot");
// //       }

// //       if (slot.flag) {
// //         $slot.classList.add("flag-slot");
// //       }

// //       if (slot.wrongBomb) {
// //         $slot.classList.remove("flag-slot");
// //         $slot.classList.add("wrong-bomb");
// //       }
// //       if (slot.type === EXPLODE) {
// //         $slot.classList.remove("bomb-slot");
// //         $slot.classList.add("bomb-red");
// //       }
// //     }
// //   }
// //   if (gameSettings.gameWon) {
// //     $refreshGameBtn.classList.remove("emoji-happy");
// //     $refreshGameBtn.classList.add("emoji-win");
// //   }
// //   if (gameSettings.gameOver) {
// //     $refreshGameBtn.classList.remove("emoji-happy");
// //     $refreshGameBtn.classList.add("emoji-sad");
// //   }
// // };


const startBtnHandler = () => $form.classList.toggle("visible");
const backdropHandler = () => $backdrop.classList.toggle("visible");
const toggleForm = () => {
  startBtnHandler();
  backdropHandler();
  };

// // const clearInputs = () => {
// //   for (const input of $userInputs) {
// //     input.value = "";
// //   }
// // };

// // const refreshGame = () => {
// //   if (gameSettings.gameWon) {
// //     gameSettings.gameWon = false;
// //     $refreshGameBtn.classList.remove("emoji-win");
// //     $refreshGameBtn.classList.add("emoji-happy");
// //   }
// //   $refreshGameBtn.classList.remove("emoji-sad");
// //   $refreshGameBtn.classList.add("emoji-happy");
// // };

const startGame = () => {
  refreshGame();
  resetTimer();
  initializeBoard(gameSettings.inputRows, gameSettings.inputCols);
  initializeBombs();
  initializeNumbers();
  countRemainingBombs();
  renderBoard(gameSettings.inputRows, gameSettings.inputCols);
};

const newGameBtnHandler = (event) => {
  event.preventDefault();
  gameSettings.inputRows = parseInt(userInputs[0].value.trim());
  gameSettings.inputCols = parseInt(userInputs[1].value.trim());
  gameSettings.inputBombs = parseInt(userInputs[2].value.trim());

  if (
    gameSettings.inputRows === "" ||
    gameSettings.inputCols === "" ||
    gameSettings.inputBombs === ""
  ) {
    return alert("Please enter a number");
  }
  startGame();
  toggleForm();
  clearInputs();
};

$startBtn.addEventListener("click", toggleForm);
$backdrop.addEventListener("click", toggleForm);
$cancelBtn.addEventListener("click", (event) => {
  event.preventDefault();
  toggleForm();
});
$form.addEventListener("submit", newGameBtnHandler);

$slotContainer.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  return false;
});

$refreshGameBtn.addEventListener("click", () => {
  startGame();
});

startGame();