// refactoring to use classes. Also need to add the real restart(not just a window reload)and actually map out the countries locations.
// on reload saving the player name to keep continuing without having to go to the your name screen, restart just goes right back to new question.
class GeoGuesserGame {
  constructor(countryCoordinates) {
    this.countryCoordinates = countryCoordinates;
    this.remainingQuestions = this.shuffleQuestions();
    this.currentQuestion = null;
    this.score = 0;
    this.timeLeft = 120; // might change to 60 if it seems too long or even 30. or can add modes in...
    this.timer = null;

    this.dom = {
      playButton: document.getElementById("play-button"),
      nameInput: document.getElementById("name"),
      guessInput: document.getElementById("guess"),
      submitButton: document.getElementById("submit-button"),
      restartButton: document.getElementById("restart-button"),
      questionBox: document.getElementById("question-box"),
      mapImage: document.getElementById("map-image"),
      guessBox: document.getElementById("guess-box"),
      title: document.getElementById("geoguesser-title"),
      timer: document.getElementById("timer"),
      playerNameBox: document.getElementById("player-name-box"),
      endingFrame: document.getElementById("ending-frame"),
      yourScoreEnding: document.getElementById("your-score-ending"),
      highScores: document.getElementById("high-scores"),
      highScoresList: document.getElementById("high-scores-ol"),
    };
    this.setupListeners();
    this.showStoredHighScores();
    window.onload = () => this.dom.nameInput.focus();
  }
  //random question alg
  shuffleQuestions() {
    return Object.entries(this.countryCoordinates)
      .sort(() => Math.random() - 0.5)
      .map(([country, coords]) => ({ country, ...coords }));
  }
  //all my key listeners click and keydown.
  setupListeners() {
    this.dom.playButton.addEventListener("click", () => this.startGame());
    this.dom.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.startGame();
    });
    this.dom.submitButton.addEventListener("click", () => this.handleGuess());
    this.dom.guessInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.handleGuess();
    });
    this.dom.restartButton.addEventListener("click", () => location.reload());
    //need to add something new for reloading the page. Like looping back to original with no input name. just straight into startGame()
    this.dom.restartButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter") location.reload();
    });
  }
  startGame() {
    const playerName = this.dom.nameInput.value.trim();
    if (!playerName) {
      alert("PLease enter a name before starting game");
      this.dom.nameInput.focus();
      return;
    }
    //hiding cards and displaying actual game cards.
    this.dom.playerNameBox.style.display = "none";
    this.dom.guessBox.style.display = "flex";
    this.dom.title.style.display = "none";
    this.dom.timer.style.display = "block";
    //starting those cards functions.
    this.startCountdown();
    this.askNextQuestion();
    this.dom.guessInput.focus();
  }
  handleGuess() {
    const guess = this.dom.guessInput.value.trim().toLowerCase();
    if (!guess) return;
    if (guess === this.currentQuestion.country.toLowerCase()) {
      this.score += 100;
    }
    this.dom.guessInput.value = "";

    if (this.remainingQuestions.length > 0) {
      this.askNextQuestion();
    } else {
      this.endGame();
    }
  }
  askNextQuestion() {
    const index = Math.floor(Math.random() * this.remainingQuestions.length);
    this.currentQuestion = this.remainingQuestions.splice(index, 1)[0];
    this.showQuestion(
      "Which country is this?",
      this.currentQuestion.x,
      this.currentQuestion.y
    );
  }
  showQuestion(text, xPercent, yPercent) {
    const mapWidth = this.dom.mapImage.clientWidth;
    const mapHeight = this.dom.mapImage.clientHeight;
    const x = mapWidth * xPercent;
    const y = mapHeight * yPercent;
    this.dom.questionBox.querySelector(".box-content").textContent = text;
    this.dom.questionBox.style.left = `${x}px`;
    this.dom.questionBox.style.top = `${y}px`;
    this.dom.questionBox.style.display = "block";
  }
  endGame() {
    this.stopCountdown();

    const playerName = this.dom.nameInput.value.trim() || "Player";
    const newEntry = { name: playerName, score: this.score };
    const scores = JSON.parse(localStorage.getItem("highScores")) || [];
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 5);
    localStorage.setItem("highScores", JSON.stringify(topScores));

    this.dom.highScoresList.innerHTML = "";
    topScores.forEach((entry, index) => {
      const li = document.createElement("li");
      li.className = "player";
      li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
      this.dom.highScoresList.appendChild(li);
    });
    this.dom.yourScoreEnding.textContent = `Your score: ${this.score}`;
    this.dom.endingFrame.style.display = "block";
    this.dom.highScores.style.display = "block";
    this.dom.questionBox.style.display = "none";
    this.dom.guessBox.style.display = "none";
  }
  //local storage so we dont lose high scores on reload
  showStoredHighScores() {
    const scores = JSON.parse(localStorage.getItem("highScores")) || [];
    this.dom.highScoresList.innerHTML = "";
    scores.forEach((entry, index) => {
      const li = document.createElement("li");
      li.className = "player";
      li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
      this.dom.highScoresList.appendChild(li);
    });
  }
  startCountdown() {
    this.dom.timer.textContent = "2:00";
    this.timer = setInterval(() => {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      this.dom.timer.textContent = `${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
      this.timeLeft--;

      if (this.timeLeft < 0) {
        clearInterval(this.timer);
        this.endGame();
      }
    }, 1000);
  }
  stopCountdown() {
    clearInterval(this.timer);
  }
}
// List of countries and their question marker positions all the positions are wrong
const countryCoordinates = {
  germany: { x: 0.677, y: 0.361 },
  //   france: { x: 0.00, y: 0.00 },
  //   brazil: { x: 0.00, y: 0.00 },
  //   australia: { x: 0.00, y: 0.00 },
  //   egypt: { x: 0.00, y: 0.00 },
  //   canada: { x: 0.00, y: 0.00 },
  //   unitedStates: { x: 0.00, y: 0.00 },
  //   mexico: { x: 0.00, y: 0.00 },
  //   argentina: { x: 0.00, y: 0.00 },
  //   southAfrica: { x: 0.00, y: 0.00 },
  //   india: { x: 0.00, y: 0.00 },
  //   china: { x: 0.00, y: 0.00 },
  //   russia: { x: 0.00, y: 0.00 },
  //   unitedKingdom: { x: 0.00, y: 0.00 },
  //   japan: { x: 0.00, y: 0.00 },
  //   indonesia: { x: 0.00, y: 0.00 },
  //   iran: { x: 0.00, y: 0.00 },
  //   turkey: { x: 0.00, y: 0.00 },
  //   saudiArabia: { x: 0.00, y: 0.00 },
  //   spain: { x: 0.00, y: 0.00 },
};

document.addEventListener("DOMContentLoaded", () => {
  new GeoGuesserGame(countryCoordinates);
});

/*
// Working code for no class simple logic. 

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
*/
