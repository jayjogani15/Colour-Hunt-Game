# Colour-Hunt-Game
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Stroop Effect Color Hunt</title>
<style>
  body {
    font-family: Arial, sans-serif;
    text-align: center;
    background: #f0f0f0;
    padding: 20px;
  }
  h1 {
    margin-bottom: 10px;
  }
  #instruction {
    font-weight: bold;
    margin-bottom: 20px;
  }
  #color-word {
    font-size: 48px;
    margin: 20px 0;
    height: 60px;
  }
  #buttons-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
    max-width: 500px;
    margin: 0 auto 20px;
  }
  .color-button {
    width: 80px;
    height: 80px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.1s ease;
  }
  .color-button:active {
    transform: scale(0.9);
  }
  #score-timer {
    font-size: 18px;
    margin-bottom: 10px;
  }
  #message {
    height: 24px;
    font-weight: bold;
    color: green;
    margin-bottom: 15px;
  }
  #restart-btn {
    display: none;
    padding: 10px 25px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    background-color: #3498db;
    color: white;
  }
  #restart-btn:hover {
    background-color: #2980b9;
  }
</style>
</head>
<body>

<h1>Color Hunt</h1>
<div id="instruction">Select the colour of the word, not the word itself.</div>
<div id="color-word"></div>

<div id="buttons-container"></div>

<div id="score-timer">
  Score: <span id="score">0</span> | Time Left: <span id="timer">15</span>s
</div>
<div id="message"></div>
<button id="restart-btn">Play Again</button>

<script>
  const colors = [
    {name: "Red", hex: "#e74c3c"},
    {name: "Blue", hex: "#3498db"},
    {name: "Green", hex: "#27ae60"},
    {name: "Yellow", hex: "#f1c40f"},
    {name: "Orange", hex: "#e67e22"},
    {name: "Pink", hex: "#fd79a8"},
    {name: "Black", hex: "#2d3436"},
    {name: "white", hex:"#F0F8FF"},
    {name: "Light Green", hex:"#7FFF00"}
    
  ];

  let score = 0;
  let timeLeft = 15;
  let currentColor = null;
  let currentWord = null;
  let timerInterval;

  const colorWordDiv = document.getElementById('color-word');
  const buttonsContainer = document.getElementById('buttons-container');
  const scoreSpan = document.getElementById('score');
  const timerSpan = document.getElementById('timer');
  const messageDiv = document.getElementById('message');
  const restartBtn = document.getElementById('restart-btn');

  function startGame() {
    score = 0;
    timeLeft = 90;
    scoreSpan.textContent = score;
    timerSpan.textContent = timeLeft;
    messageDiv.textContent = '';
    restartBtn.style.display = 'none';
    createButtons();
    pickNewWordAndColor();
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerSpan.textContent = timeLeft;
      if(timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }, 1000);
  }

  function createButtons() {
    buttonsContainer.innerHTML = '';
    colors.forEach(color => {
      const btn = document.createElement('button');
      btn.classList.add('color-button');
      btn.style.backgroundColor = color.hex;
      btn.title = color.name;
      btn.setAttribute('data-color', color.name);
      btn.addEventListener('click', handleColorClick);
      buttonsContainer.appendChild(btn);
    });
  }

  function pickNewWordAndColor() {
    let wordIndex = Math.floor(Math.random() * colors.length);
    let colorIndex;
    do {
      colorIndex = Math.floor(Math.random() * colors.length);
    } while(colorIndex === wordIndex);
    
    currentWord = colors[wordIndex].name;
    currentColor = colors[colorIndex].name;

    colorWordDiv.textContent = currentWord;
    colorWordDiv.style.color = colors[colorIndex].hex;
  }

  function handleColorClick(e) {
    const clickedColor = e.target.getAttribute('data-color');
    if(clickedColor === currentColor) {
      score++;
      scoreSpan.textContent = score;
      messageDiv.style.color = 'green';
      messageDiv.textContent = 'Correct!';
      pickNewWordAndColor();
    } else {
      messageDiv.style.color = 'red';
      messageDiv.textContent = 'Wrong! Try again.';
    }
  }

  function endGame() {
    messageDiv.style.color = 'black';
    messageDiv.textContent = `Game Over! Your final score is ${score}.`;
    restartBtn.style.display = 'inline-block';
  }

  restartBtn.addEventListener('click', startGame);

  startGame();
</script>

</body>
</html>
