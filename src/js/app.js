import { Vector } from './vector';

let width;
let height;

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let offscreenCanvas = document.getElementById('offscreenCanvas');
let offscreenCtx = offscreenCanvas.getContext('2d');

function scaleCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  for (let c of [canvas, offscreenCanvas]) {
    c.width = width;
    c.height = height;

    c.style.width = `${width}px`;
    c.style.height = `${height}px`;
  }

  offscreenCtx.globalAlpha = 0.8;
}

scaleCanvas();
window.onresize = scaleCanvas;

document.oncontextmenu = function(e) {
  e.preventDefault();
  return false;
};

function mouseMoveHandler(e) {
  paddle.position.x = e.clientX - paddleWidth / 2;
}

function mouseDownHandler(e) {
}

function mouseUpHander(e) {
}

document.onmousemove = mouseMoveHandler;

document.onmousedown = mouseDownHandler;
document.onmouseup = mouseUpHander;

let keys = {};

document.onkeydown = (e) => {
  keys[e.key.toLowerCase()] = true;
};

document.onkeyup = (e) => {
  keys[e.key.toLowerCase()] = false;
};

let lastUpdateTime = performance.now();

let fpsArr = [];
let frame = 0;

let obstacleWidth = 150;
let obstacleHeight = 30;

let obstacleSeparationX = 40;
let obstacleSeparationY = 30;

let obstacles = [];

generateObstacles();

function generateObstacles() {
  obstacles = [];

  for (let y = 20; y < height / 2; y += obstacleHeight + obstacleSeparationY) {
    for (let x = 20; x < width - 20; x += obstacleWidth + obstacleSeparationX) {
      obstacles.push({
        x,
        y
      });
    }
  }
}

let paddleY = height - 50;

let paddleWidth = 300;
let paddleHeight = 30;

let paddle = {
  position: new Vector((width - paddleWidth) / 2, height - 50),
  velocity: new Vector(0, 0)
};

let ballStartY = paddleY - 50;

let ball = {
  position: new Vector(width / 2, ballStartY),
  velocity: new Vector(0, 0)
};

let ballRadius = 20;
let ballCollisionRadius = ballRadius * 1;

function generateRandomBallVelocity() {
  ball.velocity = new Vector((Math.random() * 5) - 5, -10);
}

generateRandomBallVelocity();

function drawBall() {
  drawCircle(ctx, true, ball.position.x, ball.position.y, ballRadius);
}

function drawCircle(context, border, centerX, centerY, radius, borderWidth = 5, mainColor = 'white', borderColor = 'black') {
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = mainColor;
  context.fill();
  
  if (!border) return;

  context.lineWidth = borderWidth;
  context.strokeStyle = borderColor;
  context.stroke();
}

function drawPaddle() {
  ctx.fillRect(paddle.position.x, paddle.position.y, paddleWidth, paddleHeight);
}

function updatePaddle() {
  if (keys['a']) {
    paddle.velocity.x -= 3;
  }

  if (keys['d']) {
    paddle.velocity.x += 3;
  }

  paddle.position.add(paddle.velocity);

  paddle.velocity.scale(0.5);
}

function checkBallCollision(oPos, oWidth, oHeight) {
  return (ball.position.x + ballCollisionRadius >= oPos.x && ball.position.x - ballCollisionRadius <= oPos.x + oWidth) && (ball.position.y + ballCollisionRadius >= oPos.y && ball.position.y - ballCollisionRadius <= oPos.y + oHeight);
}

let failX = undefined;

function failAnimation(scale) {
  if (scale < 0 || scale > 1) return;

  console.log(scale);

  if (failX === undefined) {
    failX = ball.position.x;
  }

  drawCircle(ctx, true, failX, height, ((height - paddleY) * 4) * scale, 20, 'transparent', 'white');
}

function updateBall() {
  if (checkBallCollision(paddle.position, paddleWidth, paddleHeight)) {
    bounceBall();
  }

  ball.position.add(ball.velocity);

  if (ball.position.x - ballCollisionRadius < 0 || ball.position.x + ballCollisionRadius > width) {
    ball.velocity.x *= -1;
  }

  if (ball.position.y - ballCollisionRadius < 0) {
    ball.velocity.y *= -1;
  }

  if (ball.position.y - ballCollisionRadius > height) {
    //console.log(ball.position.y, height = 300)
    failAnimation((ball.position.y - (height + 100)) / 300);

    if (ball.position.y > height + 300) {
      failX = undefined;

      ball.position.y = ballStartY;
      ball.position.x = width / 2;
  
      generateRandomBallVelocity();
    }
  }

  //if (ball.position.x + (ball) > width || ball.position.x < 0 ) {
    //ball.position.x *= -1;
  //}
}

function bounceBall() {
  ball.velocity.y *= -1;
  ball.velocity.scale(1.02);
}

let lastBallPos = ball.position.clone();

async function update() {
  let timeNow = performance.now();
  let deltaTime = (timeNow - lastUpdateTime) / 1000;
  lastUpdateTime = timeNow;

  fpsArr.push(Math.round(1 / deltaTime));
  if (fpsArr.length > 10) fpsArr.shift();

  drawCircle(ctx, false, lastBallPos.x, lastBallPos.y, ballRadius + 3);

  offscreenCtx.clearRect(0, 0, width, height);
  offscreenCtx.drawImage(canvas, 0, 0, width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(offscreenCanvas, 0, 0, width, height);

  ctx.fillStyle = 'white';

  for (let o of obstacles.slice()) {
    if (checkBallCollision(o, obstacleWidth, obstacleHeight)) {
      obstacles.splice(obstacles.indexOf(o), 1);

      bounceBall();

      continue;
    }

    ctx.fillRect(o.x, o.y, obstacleWidth, obstacleHeight);
  }

  drawBall();
  drawPaddle();

  lastBallPos = ball.position.clone();

  updatePaddle();
  updateBall();

  frame++;

  requestAnimationFrame(update);
}

function mean(array) {
  return array.reduce((a, b) => a + b) / array.length;
}

update();