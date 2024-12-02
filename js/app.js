const somFundo = new Audio('./audio/musica pou.mp3');
somFundo.loop = true;
const audioComendo = new Audio('./audio/pou-comendo.mp3');
const audioMaxScore = new Audio('./audio/ele-fezz-de-novo-incansavel.mp3');
const audioRisada = new Audio('./audio/risada-do-gato.mp3');
const audioBatida = new Audio('./audio/miau-triste.mp3');
const audioGyro = new Audio('./audio/foi-quando-gyro-finalmente-entendeu.mp3')

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const quadrado = 20;

let dificuldade = "normal";
let speed = 200;
let loop;
let direcao = "";
let score = 0;
let max_score = localStorage.getItem('max_score') || 0;
let boolMaxScore = false;

let comida = {
  x: Math.floor(Math.random() * (canvas.width / quadrado)) * quadrado,
  y: Math.floor(Math.random() * (canvas.height / quadrado)) * quadrado,
};
const cobra = [{x: 100, y: 100}];

function desenharCobra() {
  ctx.fillStyle = "#ddd";

  cobra.forEach((posicao, index) => {
    if (index === cobra.length - 1) {
      ctx.fillStyle = "green";
    }
    ctx.fillRect(posicao.x, posicao.y, quadrado, quadrado);
  });
}

function desenhaComida() {
  ctx.fillStyle = "red";
  ctx.fillRect(comida.x, comida.y, quadrado, quadrado);
}

function verificarComida() {
  const cabeca = cobra.at(-1);

  if (cabeca.x === comida.x && cabeca.y === comida.y) {
    audioComendo.play();
    cobra.unshift({...cobra[0]});

    comida = {
      x: Math.floor(Math.random() * (canvas.width / quadrado)) * quadrado,
      y: Math.floor(Math.random() * (canvas.height / quadrado)) * quadrado,
    };

    score += 1;
    atualizarScore();
    atualizaMaxScore();
  }
}

function verificarBorda() {
  const cabeca = cobra.at(-1);

  if (cabeca.x < 0 || cabeca.y < 0 || cabeca.x >= canvas.width || cabeca.y >= canvas.height) {

    if (score >= max_score - 2 && score < max_score) {
      audioGyro.play();
    } else {
      audioBatida.play();
    }
    alert("GAME OVER!! BATEU O COCO NA PAREDE KKKKKK!!");
    reset();
  }
}

function verificarColisao() {
  if (cobra.length <= 1) return;

  const cabeca = cobra.at(-1);
  let i = 0;
  let colisao = false;

  do {
    if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
      colisao = true;
    }
    i++;
  } while (i < cobra.length - 1 && !colisao);

  if (colisao) {
    if (score >= max_score - 2 && score < max_score) {
      audioGyro.play();
    } else {
      audioRisada.play();
    }
    alert("GAME OVER!! SEU CORPO NÃO É COMIDA MULA");

    reset();
  }
}

function mover() {
  const cabeca = cobra.at(-1);

  if (!direcao || direcao === "stop") return;

  if (direcao === "direita") {
    cobra.shift();
    cobra.push({x: cabeca.x + quadrado, y: cabeca.y});
  }
  if (direcao === "esquerda") {
    cobra.shift();
    cobra.push({x: cabeca.x - quadrado, y: cabeca.y});
  }
  if (direcao === "cima") {
    cobra.shift();
    cobra.push({x: cabeca.x, y: cabeca.y - quadrado});
  }
  if (direcao === "baixo") {
    cobra.shift();
    cobra.push({x: cabeca.x, y: cabeca.y + quadrado});
  }

  verificarBorda();
  verificarColisao();
}

function atualizarScore() {
  const scoreFront = document.getElementById("score");
  scoreFront.textContent = `Score: ${score}`;
}

function atualizaMaxScore() {

  if (max_score <= score) {
    max_score = score;
    boolMaxScore = true;
    localStorage.setItem('max_score', max_score);
    const maxScoreFront = document.getElementById("max-score");
    maxScoreFront.textContent = `Max Score: ${localStorage.getItem('max_score')}`;
  }

}

function alterarDificuldade(dif, color) {
  dificuldade = dif;

  document.querySelectorAll(".button-dificuldade").forEach((button) => {
    button.style.background = "";
  });

  const button = document.getElementById(dif);
  button.style.background = color;

}

function atualizarVelocidade() {
  if (dificuldade === "hard") {
    speed = 100;
  } else if (dificuldade === "easy") {
    speed = 300;
  } else if (dificuldade === "normal") {
    speed = 150;
  }

  clearInterval(loop)
  loop = setInterval(() => {
    jogo();
  }, speed);
}

function reset() {
  audioRisada.pause();
  audioBatida.pause();

  if (boolMaxScore) {
    audioMaxScore.play();
  }

  boolMaxScore = false;
  cobra.length = 1;
  cobra[0] = {x: 100, y: 100};
  direcao = "";
  score = 0;
  document.querySelector(".mostra-dificuldade").textContent = `Dificuldade: ${dificuldade}`
  atualizarScore();
  atualizarVelocidade();
}

function iniciarJogo() {
  reset();
  // somFundo.play();

  clearInterval(loop);
  loop = setInterval(() => {
    jogo();
  }, speed);
}

function jogo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mover();
  verificarComida();
  desenharCobra();
  desenhaComida();
}

document.addEventListener("keydown", (event) => {
  if ((event.key === "w" || event.key === "ArrowUp") && direcao !== "baixo") {
    direcao = "cima";
  }
  if ((event.key === "s" || event.key === "ArrowDown") && direcao !== "cima") {
    direcao = "baixo";
  }
  if ((event.key === "a" || event.key === "ArrowLeft") && direcao !== "direita") {
    direcao = "esquerda";
  }
  if ((event.key === "d" || event.key === "ArrowRight") && direcao !== "esquerda") {
    direcao = "direita";
  }
  if (event.key === "Escape") {
    direcao = "stop";
  }
});

document.getElementById("easy").addEventListener("click", () => alterarDificuldade("easy", "green"));
document.getElementById("normal").addEventListener("click", () => alterarDificuldade("normal", "blue"));
document.getElementById("hard").addEventListener("click", () => alterarDificuldade("hard", "red"));
document.getElementById("max-score").textContent = `Max Score: ${max_score}`;

iniciarJogo();
