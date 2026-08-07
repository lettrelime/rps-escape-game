const hands = [
  { id: "scissors", name: "가위", emoji: "✌️" },
  { id: "rock", name: "바위", emoji: "✊" },
  { id: "paper", name: "보", emoji: "✋" }
];

const roundText = document.getElementById("roundText");
const memoryText = document.getElementById("memoryText");
const gameArea = document.getElementById("gameArea");

let round = 1;
let memoryPieces = 0;
let playerHands = [];
let guardianHands = [];
let playerFinalHand = null;
let guardianFinalHand = null;
let lastResult = null;
let gamePhase = "select";

function initializeGame() {
  round = 1;
  memoryPieces = 0;
  resetRoundState();
  render();
}

function resetRoundState() {
  playerHands = [];
  guardianHands = [];
  playerFinalHand = null;
  guardianFinalHand = null;
  lastResult = null;
  gamePhase = "select";
}

function render() {
  roundText.textContent = round;
  memoryText.textContent = memoryPieces;

  if (gamePhase === "ending") {
    renderEnding();
    return;
  }

  gameArea.innerHTML = `
    ${renderSelectionSection()}
    ${guardianHands.length === 2 ? renderRevealSection() : ""}
    ${guardianHands.length === 2 && !lastResult ? renderFinalChoiceSection() : ""}
    ${lastResult ? renderResultSection() : ""}
  `;

  bindCurrentButtons();
}

function renderSelectionSection() {
  const isSelectionDone = playerHands.length >= 2;

  return `
    <section>
      <h2 class="section-title">두 개의 손 선택하기</h2>
      <p class="hint">같은 손을 두 번 선택할 수 있습니다. 첫 번째 선택은 빨간색, 두 번째 선택은 파란색으로 표시됩니다.</p>
      <div class="hand-grid">
        ${hands.map((hand) => `
          <button class="hand-button" type="button" data-hand="${hand.id}" ${isSelectionDone ? "disabled" : ""}>
            <span class="emoji">${hand.emoji}</span>
            <span class="hand-name">${hand.name}</span>
            <span class="marker-row">${renderMarkersForHand(hand.id)}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMarkersForHand(handId) {
  return playerHands.map((hand, index) => {
    if (hand.id !== handId) {
      return "";
    }

    const markerClass = index === 0 ? "first" : "second";
    const markerText = index === 0 ? "1" : "2";
    return `<span class="marker ${markerClass}" aria-label="${index + 1}번째 선택">${markerText}</span>`;
  }).join("");
}

function renderRevealSection() {
  return `
    <section>
      <h2 class="section-title">공개된 두 손</h2>
      <div class="reveal-grid">
        ${renderSidePanel("나", playerHands)}
        ${renderSidePanel("문지기", guardianHands)}
      </div>
    </section>
  `;
}

function renderSidePanel(title, selectedHands) {
  return `
    <div class="side-panel">
      <h3>${title}</h3>
      <div class="selected-list">
        ${selectedHands.map((hand, index) => renderSelectedHand(hand, index)).join("")}
      </div>
    </div>
  `;
}

function renderSelectedHand(hand, index) {
  const markerClass = index === 0 ? "first" : "second";
  const markerText = index === 0 ? "1" : "2";

  return `
    <div class="selected-hand">
      <span class="marker ${markerClass}">${markerText}</span>
      <span class="emoji">${hand.emoji}</span>
      <strong>${hand.name}</strong>
    </div>
  `;
}

function renderFinalChoiceSection() {
  if (playerFinalHand) {
    return renderFinalSection();
  }

  return `
    <section>
      <h2 class="section-title">하나를 남겨주세요.</h2>
      <div class="choice-list">
        ${playerHands.map((hand, index) => `
          <button class="choice-button" type="button" data-final-index="${index}">
            ${renderSelectedHand(hand, index)}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFinalSection() {
  return `
    <section>
      <h2 class="final-title">FINAL</h2>
      <div class="final-grid">
        ${renderFinalHand("나", playerFinalHand)}
        <div class="vs">VS</div>
        ${renderFinalHand("문지기", guardianFinalHand)}
      </div>
    </section>
  `;
}

function renderFinalHand(title, hand) {
  return `
    <div class="side-panel final-hand">
      <h3>${title}</h3>
      <span class="emoji">${hand.emoji}</span>
      <span>${hand.name}</span>
    </div>
  `;
}

function renderResultSection() {
  const resultClass = lastResult.type;
  const nextButton = gamePhase === "result"
    ? `<button class="main-button" type="button" id="nextRoundButton">다음 대결</button>`
    : "";

  return `
    ${renderFinalSection()}
    <section class="result-panel ${resultClass}">
      <h2>${lastResult.title}</h2>
      <p>${lastResult.message}</p>
      <p>현재 기억 조각: <strong>${memoryPieces}</strong></p>
      ${nextButton}
    </section>
  `;
}

function renderEnding() {
  const isHappy = memoryPieces >= 5;
  gameArea.innerHTML = `
    <section class="ending-panel ${isHappy ? "happy" : "bad"}">
      <h2>${isHappy ? "HAPPY ENDING" : "BAD ENDING"}</h2>
      ${isHappy ? renderHappyEndingText() : renderBadEndingText()}
      <button class="main-button" type="button" id="restartButton">다시 시작</button>
    </section>
  `;

  document.getElementById("restartButton").addEventListener("click", initializeGame);
}

function renderHappyEndingText() {
  return `
    <p>기억 조각을 되찾았습니다.</p>
    <p>문지기가 조용히 손을 내립니다.</p>
    <p>굳게 닫혀 있던 출구에서<br>희미한 빛이 새어 나오기 시작합니다.</p>
    <p>문이 열렸습니다.</p>
    <p>당신은 이곳에서 탈출했습니다.</p>
  `;
}

function renderBadEndingText() {
  return `
    <p>마지막 기억 조각이 사라졌습니다.</p>
    <p>자신의 이름조차 기억나지 않습니다.</p>
    <p>문지기가 자리에서 천천히 일어납니다.</p>
    <p>그리고 빈자리에<br>당신이 앉습니다.</p>
  `;
}

function bindCurrentButtons() {
  document.querySelectorAll("[data-hand]").forEach((button) => {
    button.addEventListener("click", () => selectPlayerHand(button.dataset.hand));
  });

  document.querySelectorAll("[data-final-index]").forEach((button) => {
    button.addEventListener("click", () => selectFinalHand(Number(button.dataset.finalIndex)));
  });

  const nextRoundButton = document.getElementById("nextRoundButton");
  if (nextRoundButton) {
    nextRoundButton.addEventListener("click", prepareNextRound);
  }
}

function selectPlayerHand(handId) {
  if (playerHands.length >= 2) {
    return;
  }

  playerHands.push(findHand(handId));

  if (playerHands.length === 2) {
    guardianHands = createRandomHands();
  }

  render();
}

function createRandomHands() {
  return [getRandomHand(), getRandomHand()];
}

function getRandomHand() {
  const randomIndex = Math.floor(Math.random() * hands.length);
  return hands[randomIndex];
}

function selectFinalHand(playerHandIndex) {
  if (playerFinalHand || playerHands.length < 2) {
    return;
  }

  playerFinalHand = playerHands[playerHandIndex];
  guardianFinalHand = guardianHands[Math.floor(Math.random() * guardianHands.length)];
  resolveRound();
}

function resolveRound() {
  const resultType = judgeWinner(playerFinalHand, guardianFinalHand);
  const scoreChange = getScoreChange(resultType);

  memoryPieces += scoreChange;
  lastResult = createResultMessage(resultType, scoreChange);

  // 점수 변경 직후 엔딩 조건을 확인한다.
  gamePhase = checkEndingCondition() ? "ending" : "result";
  render();
}

function judgeWinner(playerHand, guardianHand) {
  if (playerHand.id === guardianHand.id) {
    return "draw";
  }

  const winMap = {
    scissors: "paper",
    rock: "scissors",
    paper: "rock"
  };

  return winMap[playerHand.id] === guardianHand.id ? "win" : "lose";
}

function getScoreChange(resultType) {
  if (resultType === "win") {
    return 2;
  }

  if (resultType === "lose") {
    return -1;
  }

  return 0;
}

function createResultMessage(resultType, scoreChange) {
  if (resultType === "win") {
    return { type: "win", title: "승리!", message: `기억 조각 +${scoreChange}` };
  }

  if (resultType === "lose") {
    return { type: "lose", title: "패배...", message: `기억 조각 ${scoreChange}` };
  }

  return { type: "draw", title: "무승부", message: "기억 조각 변화 없음" };
}

function checkEndingCondition() {
  return memoryPieces >= 5 || memoryPieces <= -3;
}

function prepareNextRound() {
  round += 1;
  resetRoundState();
  render();
}

function findHand(handId) {
  return hands.find((hand) => hand.id === handId);
}

initializeGame();
