import { countryCoordinates } from "./countries.js";
class GeoGuesserGame {
  constructor(countryCoordinates) {
    this.countryCoordinates = countryCoordinates;
    this.remainingQuestions = this.shuffleQuestions();
    this.currentQuestion = null;
    this.score = 0;
    this.timeLeft = 29;
    this.timer = null;
    this.feedbackTimeout = null;

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
      feedback: document.getElementById("feedback"),
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
    this.dom.restartButton.addEventListener("click", () => this.startGame());
  }
  // startgame hides the menu, resets everything, and asks the first question. Also does the restart
  startGame() {
    const playerName = this.dom.nameInput.value.trim();
    if (!playerName) {
      alert("Please enter a name before starting game");
      this.dom.nameInput.focus();
      return;
    }
    //hiding cards and displaying actual game cards.
    this.dom.playerNameBox.style.display = "none";
    this.dom.guessBox.style.display = "flex";
    this.dom.title.style.display = "none";
    this.dom.timer.style.display = "block";
    document.getElementById("instruction-card").style.display = "none";
    this.dom.endingFrame.style.display = "none";
    this.dom.highScores.style.display = "none";

    this.remainingQuestions = this.shuffleQuestions();
    this.score = 0;
    this.timeLeft = 29;
    this.dom.guessInput.value = "";

    this.startCountdown();
    this.askNextQuestion();
    this.dom.guessInput.focus();
  }
  handleGuess() {
    const guess = this.dom.guessInput.value.trim().toLowerCase();
    if (!guess) return;

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = null;
    }

    this.dom.feedback.classList.remove("correct", "wrong", "visible");
    this.dom.feedback.style.display = "block";

    if (guess === this.currentQuestion.country.toLowerCase()) {
      this.score += 100;
      this.dom.feedback.textContent = "CORRECT!";
      this.dom.feedback.classList.add("correct");
    } else {
      this.dom.feedback.textContent = `Wrong... it was ${this.countryReturnAnswer(
        this.currentQuestion.country
      )}`;
      this.dom.feedback.classList.add("wrong");
    }

    this.dom.feedback.classList.add("visible");

    setTimeout(() => {
      this.dom.feedback.classList.remove("visible");
    }, 1500);

    this.dom.guessInput.value = "";

    if (this.remainingQuestions.length > 0) {
      this.askNextQuestion();
    } else {
      this.endGame();
    }
  }
  countryReturnAnswer(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
    this.dom.timer.textContent = "0:30";
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

document.addEventListener("DOMContentLoaded", () => {
  new GeoGuesserGame(countryCoordinates);
});
