// Configuração de áudios
const somFundo = new Audio('./audio/musica pou.mp3'); // Música de fundo
somFundo.loop = true; // Define a música de fundo para tocar em loop
const audioComendo = new Audio('./audio/pou-comendo.mp3'); // Som ao comer
const audioMaxScore = new Audio('./audio/ele-fezz-de-novo-incansavel.mp3'); // Som ao atingir o máximo score
const audioRisada = new Audio('./audio/risada-do-gato.mp3'); // Risada ao perder
const audioBatida = new Audio('./audio/miau-triste.mp3'); // Som ao bater na borda
const audioGyro = new Audio('./audio/foi-quando-gyro-finalmente-entendeu.mp3'); // Som especial ao quase bater o recorde

// Configuração do canvas
const canvas = document.querySelector('canvas'); // Seleção do elemento canvas
const ctx = canvas.getContext('2d'); // Contexto 2D para desenhar no canvas
const quadrado = 20; // Tamanho de cada célula no grid

// Variáveis de jogo
let dificuldade = "normal"; // Dificuldade padrão
let speed = 200; // Velocidade inicial (ms)
let loop; // Loop principal do jogo
let direcao = ""; // Direção atual da cobra
let score = 0; // Pontuação inicial
let max_score = localStorage.getItem('max_score') || 0; // Recupera o recorde do localStorage
let boolMaxScore = false; // Controle para tocar o som de recorde uma vez

// Configuração da comida
let comida = {
  x: Math.floor(Math.random() * (canvas.width / quadrado)) * quadrado, // Posição aleatória no eixo X
  y: Math.floor(Math.random() * (canvas.height / quadrado)) * quadrado, // Posição aleatória no eixo Y
};

// Configuração inicial da cobra
const cobra = [{ x: 100, y: 100 }]; // Cobra inicia com um único segmento

// Função para desenhar a cobra
function desenharCobra() {
  ctx.fillStyle = "#ddd"; // Cor padrão dos segmentos

  cobra.forEach((posicao, index) => {
    if (index === cobra.length - 1) { // Cor diferente para a cabeça da cobra
      ctx.fillStyle = "green";
    }
    ctx.fillRect(posicao.x, posicao.y, quadrado, quadrado); // Desenha cada segmento
  });
}

// Função para desenhar a comida
function desenhaComida() {
  ctx.fillStyle = "red"; // Cor da comida
  ctx.fillRect(comida.x, comida.y, quadrado, quadrado); // Desenha a comida no canvas
}

// Função para verificar se a cobra comeu a comida
function verificarComida() {
  const cabeca = cobra.at(-1); // Obtém a cabeça da cobra

  if (cabeca.x === comida.x && cabeca.y === comida.y) { // Verifica se a posição coincide
    audioComendo.play(); // Toca o som de comer
    cobra.unshift({ ...cobra[0] }); // Adiciona um novo segmento à cobra

    // Gera uma nova posição aleatória para a comida
    comida = {
      x: Math.floor(Math.random() * (canvas.width / quadrado)) * quadrado,
      y: Math.floor(Math.random() * (canvas.height / quadrado)) * quadrado,
    };

    score += 1; // Incrementa a pontuação
    atualizarScore(); // Atualiza a pontuação na interface
    atualizaMaxScore(); // Verifica se houve novo recorde
  }
}

// Função para verificar colisão com a borda
function verificarBorda() {
  const cabeca = cobra.at(-1); // Obtém a cabeça da cobra

  if (cabeca.x < 0 || cabeca.y < 0 || cabeca.x >= canvas.width || cabeca.y >= canvas.height) { // Verifica se está fora do canvas
    if (score >= max_score - 2 && score < max_score) { // Se está perto do recorde
      audioGyro.play(); // Toca o som especial
    } else {
      audioBatida.play(); // Toca o som de batida
    }
    alert("GAME OVER!! BATEU O COCO NA PAREDE KKKKKK!!"); // Alerta de fim de jogo
    reset(); // Reinicia o jogo
  }
}

// Função para verificar colisão da cobra com ela mesma
function verificarColisao() {
  if (cobra.length <= 1) return; // Não verifica se a cobra tem apenas um segmento

  const cabeca = cobra.at(-1); // Obtém a cabeça da cobra
  let i = 0;
  let colisao = false;

  // Verifica se a cabeça coincide com qualquer outro segmento
  do {
    if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
      colisao = true;
    }
    i++;
  } while (i < cobra.length - 1 && !colisao);

  if (colisao) {
    if (score >= max_score - 2 && score < max_score) { // Som especial perto do recorde
      audioGyro.play();
    } else {
      audioRisada.play(); // Toca o som de risada
    }
    alert("GAME OVER!! SEU CORPO NÃO É COMIDA MULA"); // Alerta de fim de jogo

    reset(); // Reinicia o jogo
  }
}

// Função para movimentar a cobra no canvas
function mover() {
  const cabeca = cobra.at(-1); // Obtém a posição atual da cabeça da cobra

  if (!direcao || direcao === "stop") return; // Se a direção for "stop", a cobra não se move

  // Movimenta a cobra na direção atual
  if (direcao === "direita") {
    cobra.shift(); // Remove o segmento mais antigo
    cobra.push({ x: cabeca.x + quadrado, y: cabeca.y }); // Adiciona um novo segmento à direita
  }
  if (direcao === "esquerda") {
    cobra.shift();
    cobra.push({ x: cabeca.x - quadrado, y: cabeca.y });
  }
  if (direcao === "cima") {
    cobra.shift();
    cobra.push({ x: cabeca.x, y: cabeca.y - quadrado });
  }
  if (direcao === "baixo") {
    cobra.shift();
    cobra.push({ x: cabeca.x, y: cabeca.y + quadrado });
  }

  verificarBorda(); // Verifica colisões com as bordas do canvas
  verificarColisao(); // Verifica colisões da cobra consigo mesma
}

// Função para atualizar a pontuação na interface
function atualizarScore() {
  const scoreFront = document.getElementById("score"); // Seleciona o elemento da pontuação
  scoreFront.textContent = `Score: ${score}`; // Atualiza o texto
}

// Função para verificar e atualizar o recorde (Max Score)
function atualizaMaxScore() {
  if (max_score <= score) { // Verifica se a pontuação atual é um novo recorde
    max_score = score;
    boolMaxScore = true; // Marca para tocar som especial
    localStorage.setItem('max_score', max_score); // Armazena o novo recorde no localStorage
    const maxScoreFront = document.getElementById("max-score");
    maxScoreFront.textContent = `Max Score: ${localStorage.getItem('max_score')}`;
  }
}

// Função para alterar a dificuldade do jogo
function alterarDificuldade(dif, color) {
  dificuldade = dif; // Define a nova dificuldade

  // Reseta o estilo de todos os botões
  document.querySelectorAll(".button-dificuldade").forEach((button) => {
    button.style.background = "";
  });

  // Aplica a cor no botão da dificuldade atual
  const button = document.getElementById(dif);
  button.style.background = color;
}

// Função para atualizar a velocidade do jogo com base na dificuldade
function atualizarVelocidade() {
  if (dificuldade === "hard") {
    speed = 100; // Velocidade mais rápida
  } else if (dificuldade === "easy") {
    speed = 300; // Velocidade mais lenta
  } else if (dificuldade === "normal") {
    speed = 150; // Velocidade intermediária
  }

  clearInterval(loop); // Interrompe o loop atual
  loop = setInterval(() => {
    jogo(); // Reinicia o loop com a nova velocidade
  }, speed);
}

// Função para resetar o jogo
function reset() {
  audioRisada.pause();
  audioBatida.pause();

  if (boolMaxScore) {
    audioMaxScore.play(); // Toca som especial se um novo recorde foi alcançado
  }

  boolMaxScore = false; // Reseta o estado do som de recorde
  cobra.length = 1; // Reseta o tamanho da cobra
  cobra[0] = { x: 100, y: 100 }; // Reseta a posição inicial
  direcao = ""; // Reseta a direção
  score = 0; // Reseta a pontuação
  document.querySelector(".mostra-dificuldade").textContent = `Dificuldade: ${dificuldade}`;
  atualizarScore(); // Atualiza a pontuação na interface
  atualizarVelocidade(); // Reinicia o loop com a velocidade correspondente
}

// Função para iniciar o jogo
function iniciarJogo() {
  reset(); // Reseta o jogo para o estado inicial
  clearInterval(loop);
  loop = setInterval(() => {
    jogo(); // Inicia o loop principal do jogo
  }, speed);
}

// Função principal do jogo
function jogo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

  mover(); // Move a cobra
  verificarComida(); // Verifica se a cobra comeu a comida
  desenharCobra(); // Desenha a cobra
  desenhaComida(); // Desenha a comida
}

// Adiciona eventos de teclado para movimentação
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
    direcao = "stop"; // Pausa o jogo
  }
});

// Adiciona eventos para alterar a dificuldade ao clicar nos botões
document.getElementById("easy").addEventListener("click", () => alterarDificuldade("easy", "green"));
document.getElementById("normal").addEventListener("click", () => alterarDificuldade("normal", "blue"));
document.getElementById("hard").addEventListener("click", () => alterarDificuldade("hard", "red"));

// Define o texto do Max Score inicial
document.getElementById("max-score").textContent = `Max Score: ${max_score}`;

// Inicia o jogo ao carregar
iniciarJogo();
