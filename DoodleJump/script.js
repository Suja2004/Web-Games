// board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

// doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * (7 / 8) - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
  img: null,
  x: doodlerX,
  y: doodlerY,
  width: doodlerWidth,
  height: doodlerHeight,
};

// physics
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -3.5;
let gravity = 0.05;

// platform
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

// score
let score = 0;
let maxScore = 0;
let gameOver = false;
let gameStarted = false;

// controls
let leftClick = document.getElementById("left");
let rightClick = document.getElementById("right");

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  doodlerRightImg = new Image();
  doodlerRightImg.src = "./assets/doodler-right.png";
  doodler.img = doodlerRightImg;

  doodlerRightImg.onload = () => {
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    drawStartScreen();
  };

  doodlerLeftImg = new Image();
  doodlerLeftImg.src = "./assets/doodler-left.png";

  platformImg = new Image();
  platformImg.src = "./assets/platform.png";

  velocityY = initialVelocityY;

  placePlatforms();

  document.addEventListener("click", startGame);
  document.addEventListener("keydown", moveDoodler);

  // Button Controls - click and touch
  leftClick.addEventListener("mousedown", () => {
    velocityX = -2;
    doodler.img = doodlerLeftImg;
  });
  rightClick.addEventListener("mousedown", () => {
    velocityX = 2;
    doodler.img = doodlerRightImg;
  });
  leftClick.addEventListener("mouseup", () => {
    velocityX = 0;
  });
  rightClick.addEventListener("mouseup", () => {
    velocityX = 0;
  });

  leftClick.addEventListener("touchstart", () => {
    velocityX = -2;
    doodler.img = doodlerLeftImg;
  });
  rightClick.addEventListener("touchstart", () => {
    velocityX = 2;
    doodler.img = doodlerRightImg;
  });
  leftClick.addEventListener("touchend", () => {
    velocityX = 0;
  });
  rightClick.addEventListener("touchend", () => {
    velocityX = 0;
  });

  maxScore = parseInt(localStorage.getItem("maxScore")) || 0;
};

function startGame() {
  if (gameOver) {
    restartGame();
  } else if (!gameStarted) {
    gameStarted = true;
    board.removeEventListener("click", startGame);
    requestAnimationFrame(update);
  }
}

function drawStartScreen() {
  context.clearRect(0, 0, boardWidth, boardHeight);
  context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
  context.fillStyle = "Red";
  context.font = "40px sans-serif";
  context.fillText("Doodle Jump", boardWidth / 6, boardHeight / 2);
  context.fillStyle = "black";
  context.font = "20px sans-serif";
  context.fillText("Start", boardWidth / 2.3, boardHeight / 1.5);
}

function update() {
  if (!gameStarted || gameOver) return;

  requestAnimationFrame(update);
  context.clearRect(0, 0, boardWidth, boardHeight);

  doodler.x += velocityX;

  if (doodler.x > boardWidth) {
    doodler.x = 0;
  } else if (doodler.x + doodler.width < 0) {
    doodler.x = boardWidth;
  }

  velocityY += gravity;
  doodler.y += velocityY;

  if (doodler.y > boardHeight) {
    gameOver = true;
    gameStarted=false;
  }

  context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

  for (let i = 0; i < platformArray.length; i++) {
    let platform = platformArray[i];

    if (velocityY < 0 && doodler.y < (boardHeight * 3) / 4) {
      platform.y -= initialVelocityY;
    }

    if (detectCollision(doodler, platform) && velocityY >= 0) {
      velocityY = initialVelocityY;
    }

    context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
  }

  while (platformArray.length > 0 && platformArray[0].y >= boardHeight - 50) {
    platformArray.shift();
    newPlatform();
  }

  updateScore();

  const highScore = localStorage.getItem("highScore") || 0;
  context.fillStyle = "black";
  context.font = "16px sans-serif";
  context.fillText(`Score: ${score}`, 5, 20);
  context.fillText(`High Score: ${highScore}`, 5, 40);

  if (gameOver) {
    context.fillStyle = "Red";
    context.font = "40px sans-serif";
    context.fillText("Game Over", boardWidth / 4.5, boardHeight / 2);
    context.fillStyle = "black";
    context.font = "20px sans-serif";
    context.fillText("Restart", boardWidth / 2.5, boardHeight / 1.5);
  }
}

function moveDoodler(e) {
  if (e.code == "ArrowRight" || e.code == "KeyD") {
    velocityX = 2;
    doodler.img = doodlerRightImg;
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    velocityX = -2;
    doodler.img = doodlerLeftImg;
  } else if (e.code == "Space" && gameOver) {
    restartGame();
  }
}

function placePlatforms() {
  platformArray = [];

  let platform = {
    img: platformImg,
    x: boardWidth / 2,
    y: boardHeight - 50,
    width: platformWidth,
    height: platformHeight,
  };
  platformArray.push(platform);

  for (let i = 0; i < 6; i++) {
    let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);
    let platform = {
      img: platformImg,
      x: randomX,
      y: boardHeight - 75 * i - 150,
      width: platformWidth,
      height: platformHeight,
    };
    platformArray.push(platform);
  }
}

function newPlatform() {
  let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);
  let platform = {
    img: platformImg,
    x: randomX,
    y: -platformHeight,
    width: platformWidth,
    height: platformHeight,
  };
  platformArray.push(platform);
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateScore() {
  let points = 5;
  if (velocityY < 0) {
    maxScore += points;
    if (score < maxScore) {
      score = maxScore;
      const highScore = parseInt(localStorage.getItem("highScore")) || 0;
      if (score > highScore) {
        localStorage.setItem("highScore", score);
      }
    }
  } else if (velocityY >= 0) {
    maxScore -= points;
  }
}

function restartGame() {
  doodler = {
    img: doodlerRightImg,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight,
  };

  velocityX = 0;
  velocityY = initialVelocityY;
  score = 0;
  maxScore = 0;
  gameOver = false;
  placePlatforms();
}
