let xBase = 0;
const base = document.getElementById("base");
const pipetop = document.getElementsByClassName("pipetop");
const pipebot = document.getElementsByClassName("pipebot");
const pipeContainer = document.getElementById("pipeContainer");
const scoreContainer = document.getElementById("score");
const bestscoreContainer = document.getElementById("bestScore");
const instructions = document.getElementById("instructions");
let swooshSound = new Audio("audio/wing.ogg");
let hitSound = new Audio("audio/hit.ogg");
let dieSound = new Audio("audio/die.ogg");
let pointSound = new Audio("audio/point.ogg");

let pipe = [];
let birdSprite = document.getElementById("bird");
let myInterval = setInterval(gameLoop, 1000 / 24);
let birdInterval = setInterval(birdLoop, 1000 / 24);
let bird = { x: 127, y: 160, frame: 0, speed: -8, velY: 0 };
let score = 0,
  bestScore = 0;
let gameOver = false;

function gameLoop() {
  bestScore = JSON.parse(window.localStorage.getItem("bestScore"));
  moveBase();
  spawnPipe();
  displayPipe();
  movePipe();
  detectCollision();
  displayScore();
  displayInstructions();
}
//separate for death animation
function birdLoop() {
  moveBird();
  displayBird();
}

function deathAnimation() {
  // bird.velY -= 1;
  dieSound.play();
}

function detectCollision() {
  //bird.x bird.y width34px height24px
  //toppipe x, y0, w52, toph
  //botpipe x, boty, 52, both
  for (let i = 0; i < pipe.length; i++) {
    if (bird.x < pipe[i].x + 50 && bird.x + 32 > pipe[i].x && bird.y < pipe[i].topH && bird.y + 24 > 0) {
      gameOver = true;
      clearInterval(myInterval);
      hitSound.play();
      deathAnimation();
    }
    if (
      bird.x < pipe[i].x + 50 &&
      bird.x + 32 > pipe[i].x &&
      bird.y < pipe[i].botH + pipe[i].botY + 2 &&
      bird.y + 24 > pipe[i].botY
    ) {
      gameOver = true;
      clearInterval(myInterval);
      hitSound.play();
      deathAnimation();
    }
    if (bird.y > 292) {
      gameOver = true;
      clearInterval(myInterval);
      hitSound.play();
      deathAnimation();
    }
  }
}

function moveBase() {
  xBase -= 5;
  base.style.backgroundPositionX = xBase + "px";
}

function spawnPipe() {
  if (pipe.length == 0) {
    pipe.push(
      { topH: 100, botH: 120, botY: 200, x: 320, isScore: false },
      { topH: 40, botH: 180, botY: 140, x: 480, isScore: false },
      { topH: 100, botH: 120, botY: 200, x: 640, isScore: false }
    );
  }
  if (pipe.length < 3) {
    let topHeight = Math.round(Math.random() * 160) + 20;
    let botHeight = 320 - topHeight - 100;
    let botYPos = 320 - botHeight;
    pipe.push({ topH: topHeight, botH: botHeight, botY: botYPos, x: pipe[1].x + 160, isScore: false });
  }
}

function movePipe() {
  for (let i = 0; i < pipe.length; i++) {
    pipe[i].x -= 5;
    if (pipe[i].x <= -52) {
      pipe.splice(i, 1);
    }
    if (pipe[i].x < bird.x && !pipe[i].isScore) {
      score++;
      pipe[i].isScore = true;
      pointSound.play();
    }
  }
}

function moveBird() {
  bird.velY += 0.7;
  bird.y += bird.velY;
  bird.frame++;
  if (bird.velY < 0) {
    birdSprite.style.transform = "rotate(" + (bird.velY * 45) / 7.3 + "deg)";
  } else if (bird.velY > 0) {
    birdSprite.style.transform = "rotate(" + (bird.velY * 45) / 7.3 + "deg)";
  }
}

function displayScore() {
  scoreContainer.innerHTML = score;
  bestscoreContainer.innerHTML = "Best: " + bestScore;
}

function displayInstructions() {
  if (!gameOver) {
    instructions.innerHTML = "Press spacebar to flap.";
  } else {
    instructions.innerHTML = "Press spacebar to restart.";
  }
}

function displayPipe() {
  let output = "";
  for (let i = 0; i < pipe.length; i++) {
    output += `<div class='pipetop' style='height:${pipe[i].topH}px; left:${pipe[i].x}px;'></div>`;
    output += `<div class='pipebot' style='height:${pipe[i].botH}px; top:${pipe[i].botY}px; left:${pipe[i].x}px;'></div>`;
  }
  pipeContainer.innerHTML = output;
}

function displayBird() {
  birdSprite.style.top = bird.y + "px";
  if (bird.frame == 0 || bird.frame == 1 || bird.frame == 2) {
    birdSprite.style.backgroundPositionX = "0px";
  } else if (bird.frame == 3 || bird.frame == 4 || bird.frame == 5) {
    birdSprite.style.backgroundPositionX = "34px";
  } else if (bird.frame == 6 || bird.frame == 7) {
    birdSprite.style.backgroundPositionX = "68px";
    bird.frame = 0;
  } else if (bird.frame == 8) {
    birdSprite.style.backgroundPositionX = "68px";
    bird.frame = 0;
  }
  if (bird.y >= 296) {
    bird.y = 296;
    clearInterval(birdInterval);
  }
}

let flapAllowed = true;

function flapRate() {
  flapAllowed = true;
  clearInterval(flapInterval);
}

document.onkeydown = (e) => {
  if (e.keyCode == 32 && flapAllowed) {
    flapAllowed = false;
    flapInterval = setInterval(flapRate, 319.5);
    swooshSound.play();
    bird.velY = bird.speed;
    if (gameOver) {
      pipe.length = 0;
      gameOver = false;
      if (bestScore < score) {
        bestScore = score;
        window.localStorage.setItem("bestScore", JSON.stringify(bestScore));
      }
      score = 0;
      clearInterval(birdInterval);
      myInterval = setInterval(gameLoop, 1000 / 24);
      birdInterval = setInterval(birdLoop, 1000 / 24);
      bird = { x: 127, y: 160, frame: 0, speed: -8, velY: 0 };
      displayBird();
    }
  }
};

document.ontouchstart = (e) => {
  if (e.type == "touchstart" && flapAllowed) {
    flapAllowed = false;
    flapInterval = setInterval(flapRate, 319.5);
    swooshSound.play();
    bird.velY = bird.speed;
    if (gameOver) {
      pipe.length = 0;
      gameOver = false;
      if (bestScore < score) {
        bestScore = score;
        window.localStorage.setItem("bestScore", JSON.stringify(bestScore));
      }
      score = 0;
      clearInterval(birdInterval);
      myInterval = setInterval(gameLoop, 1000 / 24);
      birdInterval = setInterval(birdLoop, 1000 / 24);
      bird = { x: 127, y: 160, frame: 0, speed: -8, velY: 0 };
      displayBird();
    }
  }
};

function loadNew() {}
let loadInterval = setTimeout(loadNew, 5000);
