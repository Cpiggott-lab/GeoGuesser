// List of countries and their question marker positions
const countryCoordinates = {
  germany: { x: 0.677, y: 0.361 },
  //   france: { x: 0.645, y: 0.4 },
  //   brazil: { x: 0.579, y: 0.762 },
  //   australia: { x: 1.094, y: 0.918 },
  //   egypt: { x: 0.716, y: 0.459 },
  //   canada: { x: 0.339, y: 0.254 },
  //   unitedStates: { x: 0.397, y: 0.43 },
  //   mexico: { x: 0.391, y: 0.518 },
  //   argentina: { x: 0.553, y: 1.006 },
  //   southAfrica: { x: 0.736, y: 1.025 },
  //   india: { x: 0.892, y: 0.537 },
  //   china: { x: 0.944, y: 0.449 },
  //   russia: { x: 0.814, y: 0.293 },
  //   unitedKingdom: { x: 0.638, y: 0.322 },
  //   japan: { x: 1.074, y: 0.391 },
  //   indonesia: { x: 1.042, y: 0.732 },
  //   iran: { x: 0.788, y: 0.479 },
  //   turkey: { x: 0.742, y: 0.42 },
  //   saudiArabia: { x: 0.762, y: 0.537 },
  //   spain: { x: 0.612, y: 0.42 },
};

// Questions array
const questions = Object.entries(countryCoordinates).map(
  ([country, coords]) => ({
    country,
    x: coords.x,
    y: coords.y,
  })
);

// Game state variables
let currentQuestion = null;
let score = 0;
let timer = null;
let timeLeft = 120;
let remainingQuestions = [...questions];

// DOM
const playButton = document.getElementById("play-button");
const nameInput = document.getElementById("name");
const guessInput = document.getElementById("guess");
const submitButton = document.getElementById("submit-button");
const restartButton = document.getElementById("restart-button");

window.onload = () => {
  document.getElementById("name").focus();
};

// play button
playButton.addEventListener("click", startGame);
document.addEventListener("keydown", function (event) {
  if (
    document.getElementById("player-name-box").style.display !== "none" &&
    event.key === "Enter"
  ) {
    startGame();
  }
});
nameInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    startGame();
  }
});
//Dont like this solution try to find something better
function startGame() {
  const playerName = nameInput.value.trim();
  if (!playerName) {
    alert("Please enter your name before starting the game.");
    nameInput.focus();
    return;
  }

  // Hide windows at start
  document.getElementById("player-name-box").style.display = "none";
  document.getElementById("guess-box").style.display = "flex";
  document.getElementById("geoguesser-title").style.display = "none";
  document.getElementById("timer").style.display = "block";

  startCountdown();
  askNextQuestion();
  guessInput.focus();
}

// Handle guess submission
submitButton.addEventListener("click", handleGuess);
guessInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleGuess();
  }
});

function handleGuess() {
  const guess = guessInput.value.trim().toLowerCase();
  if (!guess) return;

  // Check answer
  if (guess === currentQuestion.country.toLowerCase()) {
    score += 100;
    console.log("Correct!");
  } else {
    console.log(`Wrong! Correct was: ${currentQuestion.country}`);
  }

  guessInput.value = ""; // Clear input

  if (remainingQuestions.length > 0) {
    askNextQuestion();
  } else {
    endGame(score);
  }
}

// Pick and show the next country
function askNextQuestion() {
  const index = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions.splice(index, 1)[0];
  showQuestion("Which country is this?", currentQuestion.x, currentQuestion.y);
}

// Display the question box at the correct map position
function showQuestion(text, xPercent, yPercent) {
  const box = document.getElementById("question-box");
  const map = document.getElementById("map-image");

  const x = map.clientWidth * xPercent;
  const y = map.clientHeight * yPercent;

  box.querySelector(".box-content").textContent = text;
  box.style.left = x + "px";
  box.style.top = y + "px";
  box.style.display = "block";
}

// Handle game over
function endGame(score) {
  stopCountdown(); // Stop the timer

  const playerName = nameInput.value.trim() || "Player";
  const newEntry = { name: playerName, score: score };

  // Save high score to localStorage
  const scores = JSON.parse(localStorage.getItem("highScores")) || [];
  scores.push(newEntry);
  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 5);
  localStorage.setItem("highScores", JSON.stringify(topScores));

  // Updating high score
  const list = document.getElementById("high-scores-ol");
  list.innerHTML = "";
  topScores.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "player";
    li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
    list.appendChild(li);
  });

  // Hide game elements and show ending screen
  document.getElementById(
    "your-score-ending"
  ).textContent = `Your score: ${score}`;
  document.getElementById("ending-frame").style.display = "block";
  document.getElementById("high-scores").style.display = "block";
  document.getElementById("timer").style.display = "none";
  document.getElementById("question-box").style.display = "none";
  document.getElementById("guess-box").style.display = "none";
}

// Restart button, need to change it to a real restart
restartButton.addEventListener("click", () => {
  window.location.reload();
});

//high scores loading
function showStoredHighScores() {
  const scores = JSON.parse(localStorage.getItem("highScores")) || [];
  const list = document.getElementById("high-scores-ol");

  list.innerHTML = "";
  scores.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "player";
    li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
    list.appendChild(li);
  });
}
showStoredHighScores();

// countdown
function startCountdown() {
  const timerDisplay = document.getElementById("timer");
  timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    if (timeLeft === 0) {
      clearInterval(timer);
      endGame(score);
    }

    timeLeft--;
  }, 1000);
}

function stopCountdown() {
  clearInterval(timer);
}
