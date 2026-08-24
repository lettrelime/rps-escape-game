const hands = [
  { id: "scissors", name: "가위", emoji: "✌️" },
  { id: "rock", name: "바위", emoji: "✊" },
  { id: "paper", name: "보", emoji: "✋" }
];

const TOTAL_ROUNDS = 5;
const resultNarratives = {
  win: [
    "잊고 있던 무언가가 희미하게 떠오른다.",
    "흩어진 기억들이 조금씩 제자리를 찾아간다.",
    "익숙한 장면 하나가 머릿속을 스쳐 지나간다.",
    "잊고 있던 감각이 천천히 되살아나는 것 같다.",
    "흐릿했던 기억의 윤곽이 조금 선명해진다."
  ],
  lose: [
    "머릿속이 흐려진다.",
    "중요한 것을 잊어버리는 느낌이다.",
    "떠오르려던 기억이 다시 어둠 속으로 사라진다.",
    "방금까지 붙잡고 있던 무언가를 놓친 것 같다.",
    "익숙했던 감각 하나가 조금씩 멀어진다."
  ],
  draw: [
    "아무것도 떠오르지 않는다.",
    "기억은 여전히 흐릿한 채다.",
    "머릿속에는 아무런 변화도 없다.",
    "무언가 떠오를 듯했지만, 이내 사라진다.",
    "희미한 감각만 남은 채 아무 일도 일어나지 않는다."
  ]
};

const scene = document.getElementById("scene");

let round = 1;
let record = { win: 0, draw: 0, lose: 0 };
let narrativeQueues = {};
let playerHands = [null, null];
let guardianHands = [];
let playerFinalHand = null;
let guardianFinalHand = null;
let lastResult = null;
let gamePhase = "opening";

function initializeGame() {
  round = 1;
  record = { win: 0, draw: 0, lose: 0 };
  narrativeQueues = createNarrativeQueues();
  resetRoundState();
  gamePhase = "opening";
  render();
}

function resetRoundState() {
  playerHands = [null, null];
  guardianHands = [];
  playerFinalHand = null;
  guardianFinalHand = null;
  lastResult = null;
}

function render() {
  if (gamePhase === "opening") {
    renderOpening();
  } else if (gamePhase === "ending") {
    renderEnding();
  } else {
    renderGameScene();
  }
}

function renderOpening() {
  scene.innerHTML = `
    <div class="story-layout">
      <img class="scene-image" src="assets/images/opening.png" alt="어둠 속 출구 앞에 서 있는 인물">
      <div class="story-content">
        <p class="eyebrow">UNKNOWN SPACE</p>
        <h1>탈출 : 가위바위보 하나 빼기</h1>
        <div class="story-copy">
          <p>눈을 떠보니, 정체를 알 수 없는 공간에 서 있다.</p>
          <p>내가 누구인지,<br>왜 여기에 있는지 떠오르지 않는다.</p>
          <p>눈앞에는 커다란 문이 있다.<br>문지기는 나를 바라보고 있다.</p>
          <p class="dialogue">“…….”</p>
          <p>문지기와 다섯 번의 대결을 펼치고<br>이곳에서 탈출하세요.</p>
          <p>다섯 번의 대결에서 문지기보다<br>더 많이 승리하면 탈출할 수 있습니다.</p>
        </div>
        <button class="primary-button" type="button" id="startButton">시작하기</button>
      </div>
    </div>
  `;

  document.getElementById("startButton").addEventListener("click", startGame);
}

function startGame() {
  gamePhase = "select";
  render();
}

function renderGameScene() {
  scene.innerHTML = `
    <div class="game-layout">
      <div class="game-visual">
        <img class="scene-image" src="assets/images/gatekeeper.png" alt="출구를 지키며 앉아 있는 문지기">
        <p class="keeper-caption">문지기&nbsp;&nbsp;“…….”</p>
      </div>
      <div class="game-content">
        ${renderStatusBar()}
        ${gamePhase === "select" ? renderSelectionSection() : ""}
        ${gamePhase === "reveal" ? renderRevealSection() : ""}
        ${gamePhase === "result" ? renderResultSection() : ""}
      </div>
    </div>
  `;

  bindCurrentButtons();
}

function renderStatusBar() {
  return `
    <div class="status-bar" aria-label="게임 상태">
      <div class="status-item"><span>ROUND</span><strong>${round} / ${TOTAL_ROUNDS}</strong></div>
      <div class="status-item"><span>현재 전적</span><strong>${formatRecord()}</strong></div>
    </div>
  `;
}

function renderSelectionSection() {
  const canConfirm = playerHands.every(Boolean);
  return `
    <section>
      <h2 class="phase-title">당신의 두 손을 선택하세요.</h2>
      <p class="hint">같은 패를 두 번 선택해도 됩니다.</p>
      ${renderHandSelectionRow(0, "첫 번째 손")}
      ${renderHandSelectionRow(1, "두 번째 손")}
      <button class="primary-button" type="button" id="confirmHandsButton" ${canConfirm ? "" : "disabled"}>선택 완료</button>
    </section>
  `;
}

function renderHandSelectionRow(slotIndex, label) {
  return `
    <div class="selection-group">
      <span class="selection-label">${label}</span>
      <div class="hand-row">
        ${hands.map((hand) => `
          <button class="hand-button ${playerHands[slotIndex]?.id === hand.id ? "is-selected" : ""}"
                  type="button" data-slot="${slotIndex}" data-hand="${hand.id}"
                  aria-pressed="${playerHands[slotIndex]?.id === hand.id}">
            <span class="hand-emoji">${hand.emoji}</span>
            <span class="hand-name">${hand.name}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderRevealSection() {
  return `
    <section>
      <h2 class="phase-title">서로의 두 손이 공개되었습니다.</h2>
      <p class="hint">최종 승부에 사용할 하나를 남기세요.</p>
      <div class="reveal-grid">
        ${renderHandPanel("나", playerHands)}
        <span class="vs">VS</span>
        ${renderHandPanel("문지기", guardianHands)}
      </div>
      <p class="final-prompt">내가 남길 손</p>
      <div class="final-choices">
        ${playerHands.map((hand, index) => `
          <button class="final-choice" type="button" data-final-index="${index}">
            <small>${index + 1}번째 손</small>
            <span class="hand-emoji">${hand.emoji}</span>
            <span class="hand-name">${hand.name}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderHandPanel(title, selectedHands) {
  return `
    <div class="hand-panel">
      <h3>${title}</h3>
      <div class="pair">
        ${selectedHands.map((hand) => `
          <div class="hand-tile">
            <span class="hand-emoji">${hand.emoji}</span>
            <span class="hand-name">${hand.name}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderResultSection() {
  const isFinalResult = round === TOTAL_ROUNDS;
  return `
    <section>
      <p class="eyebrow">FINAL</p>
      <div class="final-grid">
        ${renderFinalHand("나", playerFinalHand)}
        <span class="vs">VS</span>
        ${renderFinalHand("문지기", guardianFinalHand)}
      </div>
      <div class="result-copy ${lastResult.type}">
        <h2>${lastResult.title}</h2>
        <p class="memory-message">“${lastResult.narrative}”</p>
        <p class="record-label">현재 전적</p>
        <p class="score-change">${formatRecord()}</p>
      </div>
      <button class="primary-button" type="button" id="continueButton">${isFinalResult ? "최종 결과 보기" : "다음 대결"}</button>
    </section>
  `;
}

function renderFinalHand(title, hand) {
  return `
    <div class="hand-panel">
      <h3>${title}</h3>
      <span class="hand-emoji">${hand.emoji}</span>
      <span class="hand-name">${hand.name}</span>
    </div>
  `;
}

function renderEnding() {
  const isHappy = record.win > record.lose;
  scene.innerHTML = `
    <div class="story-layout">
      <img class="scene-image" src="assets/images/${isHappy ? "happy-ending.png" : "bad-ending.png"}"
           alt="${isHappy ? "열린 출구에서 빛이 쏟아지는 모습" : "문지기의 빈자리에 새로운 인물이 앉은 모습"}">
      <div class="story-content">
        <p class="eyebrow">ENDING</p>
        <div class="story-copy">
          ${isHappy ? renderHappyEndingText() : renderBadEndingText()}
        </div>
        <h1 class="ending-title">${isHappy ? "HAPPY ENDING — 탈출" : "BAD ENDING — 고립"}</h1>
        <button class="primary-button" type="button" id="restartButton">처음으로</button>
      </div>
    </div>
  `;

  document.getElementById("restartButton").addEventListener("click", initializeGame);
}

function renderHappyEndingText() {
  return `
    <p>다섯 번의 대결이 끝났습니다.</p>
    <p>흩어져 있던 기억이 하나둘 제자리로 돌아옵니다.</p>
    <p>내가 누구인지,<br>왜 이곳에 왔는지도 이제 기억납니다.</p>
    <p>문지기가 당신을 바라보다<br>조용히 출구에서 비켜섭니다.</p>
    <p>굳게 닫혀 있던 문이 열리고,<br>그 너머에서 빛이 쏟아집니다.</p>
    <p>당신은 이곳을 탈출했습니다.</p>
  `;
}

function renderBadEndingText() {
  return `
    <p>다섯 번의 대결이 끝났습니다.</p>
    <p>아무것도 기억나지 않습니다.</p>
    <p>문지기가 당신을 한동안 바라봅니다.</p>
    <p>그리고—</p>
    <p>자리에서 천천히 일어납니다.</p>
    <p>문지기가 떠난 빈자리.</p>
    <p>그곳에 당신이 앉습니다.</p>
  `;
}

function bindCurrentButtons() {
  document.querySelectorAll("[data-slot][data-hand]").forEach((button) => {
    button.addEventListener("click", () => selectPlayerHand(Number(button.dataset.slot), button.dataset.hand));
  });

  document.querySelectorAll("[data-final-index]").forEach((button) => {
    button.addEventListener("click", () => selectFinalHand(Number(button.dataset.finalIndex)));
  });

  const confirmButton = document.getElementById("confirmHandsButton");
  if (confirmButton) {
    confirmButton.addEventListener("click", confirmHands);
  }

  const continueButton = document.getElementById("continueButton");
  if (continueButton) {
    continueButton.addEventListener("click", continueAfterResult);
  }
}

function selectPlayerHand(slotIndex, handId) {
  playerHands[slotIndex] = findHand(handId);
  render();
}

function confirmHands() {
  if (!playerHands.every(Boolean)) {
    return;
  }

  guardianHands = createRandomHands();
  gamePhase = "reveal";
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

  record[resultType] += 1;
  lastResult = createResultMessage(resultType);
  gamePhase = "result";
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

function createResultMessage(resultType) {
  return {
    type: resultType,
    title: { win: "승리", draw: "무승부", lose: "패배" }[resultType],
    narrative: narrativeQueues[resultType].shift()
  };
}

function continueAfterResult() {
  if (round === TOTAL_ROUNDS) {
    gamePhase = "ending";
  } else {
    prepareNextRound();
    return;
  }

  render();
}

function prepareNextRound() {
  round += 1;
  resetRoundState();
  gamePhase = "select";
  render();
}

function formatRecord() {
  return `${record.win}승 ${record.draw}무 ${record.lose}패`;
}

function createNarrativeQueues() {
  return {
    win: shuffleArray([...resultNarratives.win]),
    draw: shuffleArray([...resultNarratives.draw]),
    lose: shuffleArray([...resultNarratives.lose])
  };
}

function shuffleArray(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;
}

function findHand(handId) {
  return hands.find((hand) => hand.id === handId);
}

initializeGame();
