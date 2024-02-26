/**
 * Snake game created with plain JavaScript by Ibrahim fariat.
 * Follow me if you like it!
 **/
let snakePos;
let currentDegree;
const infoPage = document.querySelector('.info-page');
const infoPageButton = infoPage.querySelector('.info-page__button');
const infoPageText = infoPage.querySelector('.info-page__text');
const controlsBlock = document.getElementById('controls');
const infoPC = document.querySelector('.info-pc');
const settingsPage = document.querySelector('.settings-page');
const settingsPageClose = settingsPage.querySelector('.settings-page__close');
const settingsPageInput = settingsPage.querySelector('.settings-page__color-input');
const settingsPageButton = settingsPage.querySelector('.settings-page__button');
const settingsPageSpeed = settingsPage.querySelector('#speed');

const infoPage2 = document.querySelector('.info-page-2');
const infoPage2Button = infoPage2.querySelector('.info-page-2__button');

const endPage = document.querySelector('.end-page');
const endPageButton = endPage.querySelector('.end-page__button');

const firstPage = document.querySelector('.first-page');
const firstPageButton = firstPage.querySelector('.first-page__button');

firstPageButton.addEventListener('click', () => {
  firstPage.classList.remove('first-page_active');
});

const img = document.querySelector('.arrow-btn');

const headImg = new Image();
headImg.src = './images/snake-head.svg';
const bodyImg = new Image();
bodyImg.src = './images/snake-body.svg';
const foodImg1 = new Image();
const foodImg2 = new Image();
const foodImg3 = new Image();
const foodImg4 = new Image();
foodImg1.src = './images/snake-diamond1.svg';
foodImg2.src = './images/snake-diamond2.svg';
foodImg3.src = './images/snake-diamond3.svg';
foodImg4.src = './images/snake-diamond4.svg';
const ufoImg = new Image();
ufoImg.src = './images/snake-ufo.svg';
const monsterImg = new Image();
monsterImg.src = './images/monster.svg';
const blackHoleImg = new Image();
blackHoleImg.src = './images/black-hole.svg';

function rotateHead(x, y, degrees) {
  CTX.save();
  // Перемещаем точку начала координат в центр изображения
  CTX.translate(x + headImg.width / 2, y + headImg.height / 2);

  // Поворачиваем контекст холста на заданный угол (в радианах)
  CTX.rotate(degrees*Math.PI/180); // Поворот на 45 градусов (пример)
  // Нарисуем изображение с учетом поворота
  CTX.drawImage(headImg, -headImg.width / 2, -headImg.height / 2, headImg.width, headImg.height);

  // Восстанавливаем предыдущее состояние контекста холста
  CTX.restore();
}


let hexSnake = '';
let speedSnake;
let buildWalls = false;

settingsPageButton.addEventListener('click', () => {
  hexSnake = settingsPageInput.value.trim();
  if (settingsPageSpeed.value === 'low') {
    speedSnake = 15;
  }
  if (settingsPageSpeed.value === 'medium') {
    speedSnake = 5;
  }
  if (settingsPageSpeed.value === 'high') {
    speedSnake = 1;
  }
  reset();
});

settingsPageClose.addEventListener('click', () => {
  settingsPage.classList.remove('settings-page_active');
})

infoPageButton.addEventListener('click', () => {
  infoPage.classList.remove('info-page_active');
  setTimeout(() => {  continiue();}, 400)
});
infoPage2Button.addEventListener('click', () => {
  infoPage2.classList.remove('info-page-2_active');
  setTimeout(() => {  continiue();}, 400)
})
// document.addEventListener('click', (evt) => {
//   console.log(evt.currentTarget)
//   if (evt.target.className.includes('info-page_active')) {
//     infoPage.classList.remove('info-page_active');
//     continiue();
//   }
// });

let detect = new MobileDetect(window.navigator.userAgent);

if (detect.os() == null) {
  console.log('It is PC');
  controlsBlock.style.display = 'none';
}

else {
  infoPC.style.display = 'none';
}


let dom_replay = document.querySelector("#replay");
let dom_score = document.querySelector("#score");
let dom_canvas = document.createElement("canvas");
document.querySelector("#canvas").appendChild(dom_canvas);
let CTX = dom_canvas.getContext("2d");
const W = (dom_canvas.width = 300);
const H = (dom_canvas.height = 300);

let snake,
  food,
  currentHue,
  cells = 20,
  cellSize,
  walls,
  isGameOver = false,
  tails = [],
  score = 0,
  maxScore = window.localStorage.getItem("maxScore") || undefined,
  particles = [],
  splashingParticleCount = 20,
  cellsCount,
  requestID;

let helpers = {
  Vec: class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    mult(v) {
      if (v instanceof helpers.Vec) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
      } else {
        this.x *= v;
        this.y *= v;
        return this;
      }
    }
  },
  isCollision(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y;
  },
  garbageCollector() {
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].size <= 0) {
        particles.splice(i, 1);
      }
    }
  },
  drawGrid() {
    CTX.lineWidth = 1.1;
    CTX.shadowBlur = 0;

    for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
            // Вычисляем цвет ячейки в зависимости от чётности индексов i и j
            let color = (i + j) % 2 === 0 ? "#1c0b5d" : "#251565";
            CTX.fillStyle = color;
            
            // Рассчитываем координаты ячейки
            let x = (W / cells) * i;
            let y = (H / cells) * j;
            
            // Закрашиваем прямоугольник
            CTX.fillRect(x, y, W / cells, H / cells);
        }
    }
},
  randHue() {
    return ~~(Math.random() * 360);
  },
  hsl2rgb(hue, saturation, lightness) {
    if (hue == undefined) {
      return [0, 0, 0];
    }
    var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    var huePrime = hue / 60;
    var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = ~~huePrime;
    var red;
    var green;
    var blue;

    if (huePrime === 0) {
      red = chroma;
      green = secondComponent;
      blue = 0;
    } else if (huePrime === 1) {
      red = secondComponent;
      green = chroma;
      blue = 0;
    } else if (huePrime === 2) {
      red = 0;
      green = chroma;
      blue = secondComponent;
    } else if (huePrime === 3) {
      red = 0;
      green = secondComponent;
      blue = chroma;
    } else if (huePrime === 4) {
      red = secondComponent;
      green = 0;
      blue = chroma;
    } else if (huePrime === 5) {
      red = chroma;
      green = 0;
      blue = secondComponent;
    }

    var lightnessAdjustment = lightness - chroma / 2;
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    return [
      Math.round(red * 255),
      Math.round(green * 255),
      Math.round(blue * 255)
    ];
  },
  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
};
let historyKey = [];
let KEY = {
  ArrowUp: false,
  ArrowRight: false,
  ArrowDown: false,
  ArrowLeft: false,
  resetState() {
    this.ArrowUp = false;
    this.ArrowRight = false;
    this.ArrowDown = false;
    this.ArrowLeft = false;
  },
  listenMobile() {
    if (detect.os() == null) {
      // addEventListener(
      //   "keydown",
      //   (e) => {
      //     if (e.key === "w" && this.ArrowDown) return;
      //     if (e.key === "s" && this.ArrowUp) return;
      //     if (e.key === "a" && this.ArrowRight) return;
      //     if (e.key === "d" && this.ArrowLeft) return;
      //     switch (e.key) {
      //       case "w":
      //         this.ArrowUp = true;
      //         directionName = 'ArrowUp';
      //         break;
      //       case "s":
      //         this.ArrowDown = true;
      //         directionName = 'ArrowDown';
      //         break;
      //       case "a":
      //         this.ArrowLeft = true;
      //         directionName = 'ArrowLeft';
      //         break;
      //       case "d":
      //         this.ArrowRight = true;
      //         directionName = 'ArrowRight';
      //         break;
      //       default:
      //         break;
      //     }
      //     Object.keys(this)
      //       .filter((f) => f !== directionName && f !== "listenMobile" && f !== "resetState")
      //       .forEach((k) => {
      //         this[k] = false;
      //       });
      //   },
      //   false
      // );
        let directionName;
      addEventListener(      
        "keydown",
        (e) => {
          if ((e.key === "ArrowUp" || e.key === "w") && this.ArrowDown) return;
          if ((e.key === "ArrowDown" || e.key === "s") && this.ArrowUp) return;
          if ((e.key === "ArrowLeft" || e.key === "a") && this.ArrowRight) return;
          if ((e.key === "ArrowRight" || e.key === "d") && this.ArrowLeft) return;
          if (e.key === "ArrowUp" || e.key === "w") {
            this.ArrowUp = true;
            currentDegree = 90;
            directionName = 'ArrowUp';
          }
          if (e.key === "ArrowDown" || e.key === "s") {
            this.ArrowDown = true;
            currentDegree = -90;
            directionName = 'ArrowDown';
          } 
          if (e.key === "ArrowLeft" || e.key === "a") {
            this.ArrowLeft = true;
            currentDegree = 0;
            directionName = 'ArrowLeft';
          } 
          if (e.key === "ArrowRight" || e.key === "d") {
            this.ArrowRight = true;
            currentDegree = 180;
            directionName = 'ArrowRight';
          } 
          this[e.key] = true;
          Object.keys(this)
            .filter((f) => f !== e.key && f !== directionName && f !== "listenMobile" && f !== "resetState")
            .forEach((k) => {
              this[k] = false;
            });
        },
        false
      );
      
    }
    else {
      addEventListener(
        "touchstart",
        (e) => {
          if (e.target.id === "ArrowUp" && this.ArrowDown) {console.log(1);return};
          if (e.target.id === "ArrowDown" && this.ArrowUp) return;
          if (e.target.id === "ArrowLeft" && this.ArrowRight) return;
          if (e.target.id === "ArrowRight" && this.ArrowLeft) return;
          switch (e.target.id) {
            case "ArrowUp":
              this.ArrowUp = true;
              currentDegree = 90;
              break;
            case "ArrowDown":
              this.ArrowDown = true;
              currentDegree = -90;
              break;
            case "ArrowLeft":
              this.ArrowLeft = true;
              currentDegree = 0;
              break;
            case "ArrowRight":
              this.ArrowRight = true;
              currentDegree = 180;
              break;
            default:
              break;
          }
          Object.keys(this)
            .filter((f) => f !== e.target.id && f !== "listenMobile" && f !== "resetState")
            .forEach((k) => {
              this[k] = false;
            });
        },
        false
      );
    }
  }
};

class Snake {
  constructor(i, type) {
    this.pos = new helpers.Vec(W / 2, H / 2);
    this.dir = new helpers.Vec(0, 0);
    this.type = type;
    this.index = i;
    this.delay = speedSnake ? speedSnake : 5;
    this.size = W / cells;
    this.color = hexSnake ? hexSnake : "white";
    this.history = [];
    this.total = 1;
    this.stopArray = false;
  }
  draw() {
    let { x, y } = this.pos;
    snakePos = {x: x, y: y};
    CTX.fillStyle = this.color;
    CTX.shadowBlur = 20;
    rotateHead(x, y, currentDegree);
    // CTX.drawImage(headImg, x, y, this.size, this.size);

    // CTX.fillRect(x, y, this.size, this.size);

    // CTX.shadowBlur = 0;
    if (this.total >= 2) {
      for (let i = 0; i < this.history.length - 1; i++) {
        let { x, y } = this.history[i];
        // CTX.lineWidth = 1;
        // CTX.fillStyle = hexSnake ? hexSnake : "white";
        // CTX.fillRect(x, y, this.size, this.size);
        if (detect.os() === 'iOS') {
          CTX.fillStyle = CTX.createPattern(bodyImg, 'repeat');
          CTX.fillRect(x, y, 15, 15);
        }
        else {
          CTX.drawImage(bodyImg, x, y, 15, 15);
        }
      }
    }
  }
  walls() {
    let { x, y } = this.pos;
    if (x + cellSize > W) {
      this.pos.x = 0;
    }
    if (y + cellSize > W) {
      this.pos.y = 0;
    }
    if (y < 0) {
      this.pos.y = H - cellSize;
    }
    if (x < 0) {
      this.pos.x = W - cellSize;
    }
  }
  controlls() {
    let dir = this.size;
    if (KEY.ArrowUp) {
      this.dir = new helpers.Vec(0, -dir);
    }
    if (KEY.ArrowDown) {
      this.dir = new helpers.Vec(0, dir);
    }
    if (KEY.ArrowLeft) {
      this.dir = new helpers.Vec(-dir, 0);
    }
    if (KEY.ArrowRight) {
      this.dir = new helpers.Vec(dir, 0);
    }
  }
  wallsCollision() {
    walls.pos.forEach((elem) => {
      if (helpers.isCollision(this.pos, elem)) {
        isGameOver = true;
      }
    });
  }
  selfCollision() {
    for (let i = 0; i < this.history.length; i++) {
      let p = this.history[i];
      if (helpers.isCollision(this.pos, p)) {
        isGameOver = true;
      }
    }
  }
  update() {
    this.walls();
    this.draw();
    if (buildWalls) {
      this.wallsCollision();
    }
    this.controlls();
    if (!this.delay--) {
      if (helpers.isCollision(this.pos, food.pos)) {
        incrementScore();
        particleSplash();
        food.spawn();
        this.total++;
      }
      this.history[this.total - 1] = new helpers.Vec(this.pos.x, this.pos.y);
      for (let i = 0; i < this.total - 1; i++) {
        this.history[i] = this.history[i + 1];
      }
      this.pos.add(this.dir);
      this.delay = speedSnake ? speedSnake : 5;
      this.total > 3 ? this.selfCollision() : null;
    }
  }
}

class Walls {
  constructor() {
    this.pos = [new helpers.Vec(W / 20, H / 2), new helpers.Vec(W / 10, H / 2), new helpers.Vec(W / 5, H / 2), new helpers.Vec(W / 5, H / 20), new helpers.Vec(W / 5, H / 10), new helpers.Vec(W / 5, H / 5), new helpers.Vec(W / 10, H / 2), new helpers.Vec(W / 4, H / 5)];
  }
  draw() {
    if (buildWalls) {
      this.pos.forEach((elem) => {
        let {x, y} = elem;
        // CTX.fillStyle = "black";
        // CTX.fillRect(x, y, cellSize, cellSize);
        if (detect.os() === 'iOS') {
          CTX.fillStyle = CTX.createPattern(monsterImg, 'repeat');
          CTX.fillRect(x, y, cellSize, cellSize);
        }
        else {
          CTX.drawImage(monsterImg, x, y, cellSize, cellSize);
        }
      });
    }
  }
}

class Food {
  constructor() {
    this.pos = new helpers.Vec(
      ~~(Math.random() * cells) * cellSize,
      ~~(Math.random() * cells) * cellSize
    );
    this.color = currentHue = `hsl(${~~(Math.random() * 360)},100%,50%)`;
    this.size = cellSize;
    this.foodImg = foodImg1;
  }
  getRandomImg() {
    const min = Math.ceil(1);
    const max = Math.floor(4);
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    if (randomNum === 1) {
      this.foodImg = foodImg1;
    }
    else if (randomNum === 2) {
      this.foodImg = foodImg2;
    }
    else if (randomNum === 3) {
      this.foodImg = foodImg3
    }
    else {
      this.foodImg = foodImg4
    }
  }
  draw() {
    let { x, y } = this.pos;
    CTX.globalCompositeOperation = "lighter";
    CTX.shadowBlur = 20;
    CTX.shadowColor = this.color;
    CTX.fillStyle = this.color;
    if (score === 3) {
      if (detect.os() === 'iOS') {
        CTX.fillStyle = CTX.createPattern(ufoImg, 'repeat');
        CTX.fillRect(x, y, this.size, this.size);
      }
      else {
        CTX.drawImage(ufoImg, x, y, this.size, this.size);
      }
    }
    else if (score === 6) {
      if (detect.os() === 'iOS') {
        CTX.fillStyle = CTX.createPattern(blackHoleImg, 'repeat');
        CTX.fillRect(x, y, this.size, this.size);
      }
      else {
        CTX.drawImage(blackHoleImg, x, y, this.size, this.size);
      }
    }
    else {
      if (detect.os() === 'iOS') {
        CTX.fillStyle = CTX.createPattern(this.foodImg, 'repeat');
        CTX.fillRect(x, y, this.size, this.size);
      }
      else {
        CTX.drawImage(this.foodImg, x, y, this.size, this.size);
      }
      // CTX.fillRect(x, y, this.size, this.size);
    }
    CTX.globalCompositeOperation = "source-over";
    CTX.shadowBlur = 0;
  }
  wallsCollision(x, y) {
    this.bool = false;
    walls.pos.forEach((elem) => {
      if (elem.x == x && elem.y == y) {
        this.bool = true;
        return;
      }
    });
  }
  spawn() {
    let randX = ~~(Math.random() * cells) * this.size;
    let randY = ~~(Math.random() * cells) * this.size;
    // if (buildWalls) {
    //   this.wallsCollision(randX, randY);
    //   while (this.bool) {
    //     randX = ~~(Math.random() * cells) * this.size;
    //     randY = ~~(Math.random() * cells) * this.size;
    //     this.wallsCollision(randX, randY);
    //   }
    // }
      this.wallsCollision(randX, randY);
      while (this.bool) {
        randX = ~~(Math.random() * cells) * this.size;
        randY = ~~(Math.random() * cells) * this.size;
        this.wallsCollision(randX, randY);
      }
    for (let path of snake.history) {
      if (helpers.isCollision(new helpers.Vec(randX, randY), path)) {
        return this.spawn();
      }
    }
    this.color = currentHue = `hsl(${helpers.randHue()}, 100%, 50%)`;
    this.pos = new helpers.Vec(randX, randY);
  }
}

class Particle {
  constructor(pos, color, size, vel) {
    this.pos = pos;
    this.color = color;
    this.size = Math.abs(size / 2);
    this.ttl = 0;
    this.gravity = -0.2;
    this.vel = vel;
  }
  draw() {
    let { x, y } = this.pos;
    let hsl = this.color
      .split("")
      .filter((l) => l.match(/[^hsl()$% ]/g))
      .join("")
      .split(",")
      .map((n) => +n);
    let [r, g, b] = helpers.hsl2rgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
    CTX.shadowColor = `rgb(${r},${g},${b},${1})`;
    CTX.shadowBlur = 0;
    CTX.globalCompositeOperation = "lighter";
    CTX.fillStyle = `rgb(${r},${g},${b},${1})`;
    CTX.fillRect(x, y, this.size, this.size);
    CTX.globalCompositeOperation = "source-over";
  }
  update() {
    this.draw();
    this.size -= 0.3;
    this.ttl += 1;
    this.pos.add(this.vel);
    this.vel.y -= this.gravity;
  }
}

function incrementScore() {
  score++;
  food.getRandomImg();
  dom_score.innerText = score.toString().padStart(2, "0");
  if (score === 4) {
    buildWalls = true;
    pause();
    infoPage.classList.add('info-page_active');
  }
  if (score === 7) {
    buildWalls = false;
    pause();
    infoPage2.classList.add('info-page-2_active');
  }
}

function particleSplash() {
  for (let i = 0; i < splashingParticleCount; i++) {
    let vel = new helpers.Vec(Math.random() * 6 - 3, Math.random() * 6 - 3);
    let position = new helpers.Vec(food.pos.x, food.pos.y);
    particles.push(new Particle(position, currentHue, food.size, vel));
  }
}

function clear() {
  CTX.clearRect(0, 0, W, H);
}

function initialize() {
  CTX.imageSmoothingEnabled = false;
  KEY.listenMobile();
  cellsCount = cells * cells;
  cellSize = W / cells;
  snake = new Snake();
  food = new Food();
  walls = new Walls();
  dom_replay.addEventListener("click", reset, false);
  loop();
}

function loop() {
  clear();
  if (!isGameOver) {
    // requestID = setTimeout(loop, 1000 / 60);
    requestID = requestAnimationFrame(loop)
    helpers.drawGrid();
    snake.update();
    food.draw();
    walls.draw();
    for (let p of particles) {
      p.update();
    }
    helpers.garbageCollector();
  } else {
    clear();
    gameOver();
  }
}

function pause() {
  // clearTimeout(requestID);
  cancelAnimationFrame(requestID)
}

function continiue() {
  // requestID = setTimeout(loop, 1000 / 60);
  requestID = requestAnimationFrame(loop)
}

function gameOver() {
  maxScore ? null : (maxScore = score);
  score > maxScore ? (maxScore = score) : null;
  window.localStorage.setItem("maxScore", maxScore);
  endPage.classList.add('end-page_active');
  endPage.querySelector('.end-page__score-count').textContent = score;
  endPage.querySelector('.end-page__score-count_best').textContent = maxScore;
}

endPageButton.addEventListener("click", reset, false);

function reset() {
  endPage.classList.remove('end-page_active');
  dom_score.innerText = "00";
  score = "00";
  snake = new Snake();
  buildWalls = false;
  food.spawn();
  KEY.resetState();
  isGameOver = false;
  // clearTimeout(requestID);
  cancelAnimationFrame(requestID);
  requestID = null;
  loop();
}

initialize();
