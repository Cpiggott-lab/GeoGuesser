index.js and countries.js notes
// refactoring to use classes. Also need to add the real restart(not just a window reload)and actually map out the countries locations.
// on reload saving the player name to keep continuing without having to go to the your name screen, restart just goes right back to new question.
// after more testing need to make some serious changes...
// 1.lower game time from 2 minutes to 30 seconds as hard mode. maybe add a harder challenges bracket...
// 2. the questions are popping up again need to remove them from the question list once used...
// 3. add a lot more countries. some harder ones.
// 4. maybe add in easy mode, hard mode.
// 5. timer is showing two minutes before jumping to 30... the actual timer function. dropped to 29...

css notes
/\*
need to clean up and remove all the repeated CSS.
mostly clean now. but after refactoring for the 3rd time I added some stuff that can be further cleaned into a class..

:root works as a global scope that lets me use it in everything I want
rather then absolutely everything like using body or _ its also "Faster" lol
_/

HTML NOTES
all clean.

Original code for working model before classes.
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
const index = Math.floor(Math.random() \* remainingQuestions.length);
currentQuestion = remainingQuestions.splice(index, 1)[0];
showQuestion("Which country is this?", currentQuestion.x, currentQuestion.y);
}

// Display the question box at the correct map position
function showQuestion(text, xPercent, yPercent) {
const box = document.getElementById("question-box");
const map = document.getElementById("map-image");

const x = map.clientWidth _ xPercent;
const y = map.clientHeight _ yPercent;

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

//just for testing, adding in the countries one by one in the browser.
// window.game = new GeoGuesserGame(countryCoordinates);

Learning mode for differnet continents, no timer. just repearing through the list until it is correct.

Speed testing.
