import _ from "lodash";

// define types
type Coordinate = [number, number];

type GridEntity = {
  x: number;
  y: number;
};

interface Player extends GridEntity {
  controls: {
    lastKeyPressed: string | null;
    movement: { left: string; up: string; right: string; down: string };
  };
}
type Players = Player[];

interface Enemy extends GridEntity {}
type Enemies = Enemy[];

interface Coin extends GridEntity {}
type Coins = Coin[];

type Predicate<T> = (element1: T, element2: T) => boolean;

// utility functions
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function randomCoordinate(xRange: number, yRange: number): Coordinate {
  return [getRandomInt(xRange), getRandomInt(yRange)];
}

function coordToId([x, y]: Coordinate): string {
  return `xy_${x}-${y}`;
}

function idToCoord(id: string): Coordinate {
  return id.replace("xy_", "").split("-").map(Number) as Coordinate;
}

function removeChildren(element: Element) {
  while (element.lastElementChild) {
    element.removeChild(element.lastElementChild);
  }
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function setDefaultInputs(element: HTMLInputElement, gameParam: Number) {
  element.value = gameParam.toString();
}

function updateInput(element: HTMLInputElement, gameParam: Number) {
  element.addEventListener("input", () => {
    gameParam = Number(element.value);
    console.log(gameParam);
    initGame();
    console.log(players, enemies, defaultDelay);
  });
}

// set config & state
const rows: number = 20;
const columns: number = rows;
const grid = document.querySelector("#game-grid") as HTMLElement;
const noPlayersInput = document.querySelector("#noPlayers") as HTMLInputElement;
const noEnemiesInput = document.querySelector("#noEnemies") as HTMLInputElement;
const defaultDelayInput = document.querySelector(
  "#defaultDelay"
) as HTMLInputElement;
const scoreDisplay = document.querySelector("#score") as HTMLElement;

const defaultDelay: number = 400; // ms
let minEnemyDist = 5;
let noPlayers: number = 1;
let noEnemies: number = 5;
let noCoins: number = 2;
let players: Players = [];
let enemies: Enemies = [];
let coins: Coins = [];
let allEntities = [players, enemies, coins];
let controlPlayerMap: Record<string, number> = {};
let score = 0;
let delay = defaultDelay;

setDefaultInputs(noPlayersInput, noPlayers);
setDefaultInputs(noEnemiesInput, noEnemies);
setDefaultInputs(defaultDelayInput, defaultDelay);

updateInput(noPlayersInput, noPlayers);
updateInput(noEnemiesInput, noEnemies);
updateInput(defaultDelayInput, defaultDelay);

const playerColor: string = "bg-red-500";
const enemyColor: string = "bg-blue-500";
const coinColor: string = "bg-yellow-500";
const bgColor: string = "bg-zinc-300";

function setGrid() {
  for (let y = 0; y < columns; y++) {
    for (let x = 0; x < rows; x++) {
      const gridSquare: HTMLElement = document.createElement("div");
      gridSquare.id = coordToId([x, y]);
      gridSquare.classList.add(
        "border-[1px]",
        "border-black",
        "w-[30px]",
        "h-[30px]"
      );
      grid.appendChild(gridSquare);
    }
  }
}

// define predicate
function collisionPred<T extends GridEntity>(entity1: T, entity2: T) {
  return entity1.x == entity2.x && entity1.y == entity2.y;
}

function minDistPred<T extends GridEntity>(entity1: T, entity2: T) {
  // console.log("mindDist pred: ", entity1, entity2);
  return dist2([entity1.x, entity1.y], [entity2.x, entity2.y]) >= minEnemyDist;
}

function generateEntities<T extends GridEntity>(
  quantity: number,
  predicates: Predicate<T>[],
  entityArrays: Array<T[]>
) {
  const newEntities = [] as T[];

  let combinedEntities = [] as T[];
  for (const entityArray of entityArrays) {
    combinedEntities = [...combinedEntities, ...entityArray];
  }

  while (newEntities.length < quantity) {
    const [x, y] = randomCoordinate(rows, columns);
    const entity = { x, y } as T;

    let flag = true;
    for (const predicate of predicates) {
      flag = flag && !combinedEntities.some(predicate.bind({}, entity));
    }

    if (flag) {
      newEntities.push(entity);
    }
  }
  return newEntities;
}

function colorSquare(id: string, color: string) {
  const square = document.getElementById(id) as HTMLElement;
  square.classList.toggle(color);
}

function applyEntityColor<T extends GridEntity>(color: string, entities: T[]) {
  for (const entity of entities) {
    const entityId = coordToId([entity.x, entity.y]);
    colorSquare(entityId, color);
  }
}

// init player controls
const directionActions = {
  left: (player: Player) => {
    applyEntityColor(playerColor, [player]);
    player.x = mod(player.x - 1, columns);
    checkIfScored();
    applyEntityColor(playerColor, [player]);
  },
  right: (player: Player) => {
    applyEntityColor(playerColor, [player]);
    player.x = mod(player.x + 1, columns);
    checkIfScored();
    applyEntityColor(playerColor, [player]);
  },
  up: (player: Player) => {
    applyEntityColor(playerColor, [player]);
    player.y = mod(player.y - 1, rows);
    checkIfScored();
    applyEntityColor(playerColor, [player]);
  },
  down: (player: Player) => {
    applyEntityColor(playerColor, [player]);
    player.y = mod(player.y + 1, rows);
    checkIfScored();
    applyEntityColor(playerColor, [player]);
  },
};

type Directions = keyof typeof directionActions;

const player1Default = {
  left: "ArrowLeft",
  up: "ArrowUp",
  right: "ArrowRight",
  down: "ArrowDown",
};
const player2Default = {
  left: "a",
  up: "w",
  right: "d",
  down: "s",
};

const playerDefaults = [player1Default, player2Default];

function initEntities() {
  players = [];
  coins = [];
  enemies = [];
  allEntities = [players, coins, enemies];

  const playerLocations = generateEntities(
    noPlayers,
    [collisionPred],
    allEntities
  ) as Players;
  players = playerLocations.map((player, i) => {
    player.controls = {
      lastKeyPressed: null,
      movement: playerDefaults[i],
    };
    return player;
  });

  controlPlayerMap = players.reduce((acc, player, ind) => {
    Object.values(player.controls.movement).forEach((key) => {
      acc[key] = ind;
    });

    return acc;
  }, {} as Record<string, number>);

  coins = generateEntities(noCoins, [collisionPred], allEntities);

  enemies = generateEntities(
    noEnemies,
    [collisionPred, minDistPred],
    allEntities
  );

  applyEntityColor(playerColor, players);
  applyEntityColor(enemyColor, enemies);
  applyEntityColor(coinColor, coins);
}

// init the score
function displayScore() {
  scoreDisplay.innerText = String(score);
}

function initGame() {
  score = 0;
  displayScore();
  removeChildren(grid);
  setGrid();
  initEntities();
}

function checkIfScored() {
  for (const player of players) {
    for (const [index, coin] of coins.entries()) {
      if (collisionPred(player, coin)) {
        applyEntityColor(coinColor, [coin]);
        // remove the coin
        coins.splice(index, 1);
        // add new coin
        const newCoins = generateEntities(1, [collisionPred], allEntities);
        coins.push(...newCoins);
        applyEntityColor(coinColor, newCoins);
        score++;
        displayScore();
      }
    }
  }
}

// register the last key pressed during the animation frame
let lastKeyPressed: string | null = null;

document.addEventListener("keydown", (event) => {
  const playerIndex = controlPlayerMap[event.key];
  gameStarted = true;
  if (typeof playerIndex == "number") {
    const player = players[playerIndex];
    player.controls.lastKeyPressed = event.key;
  }
});

// move the player with arrow keys
function movePlayers(players: Players) {
  for (const player of players) {
    const moveKey = player.controls.lastKeyPressed;
    if (moveKey === null) {
      continue;
    }
    const moveDirection = _.invert(Object(player.controls.movement))[moveKey] as Directions;

    const moveFunc = directionActions[moveDirection];
    moveFunc(player);
    player.controls.lastKeyPressed = null;
  }
}

function vec2Add([x1, y1]: Coordinate, [x2, y2]: Coordinate): Coordinate {
  return [x1 + x2, y1 + y2];
}

function vec2Sub([x1, y1]: Coordinate, [x2, y2]: Coordinate): Coordinate {
  return [x2 - x1, y2 - y1];
}

function dist2([x1, y1]: Coordinate, [x2, y2]: Coordinate) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function moveEnemies(enemies: Enemies, players: Players) {
  for (const enemy of enemies) {
    const playersSorted = [...players].sort((player1, player2) => {
      return (
        dist2([player1.x, player1.y], [enemy.x, enemy.y]) -
        dist2([player2.x, player2.y], [enemy.x, enemy.y])
      );
    });

    const nearestPlayer = playersSorted[0];
    const diffVec = vec2Sub(
      [nearestPlayer.x, nearestPlayer.y],
      [enemy.x, enemy.y]
    );

    const diffX = diffVec[0];
    const diffY = diffVec[1];

    if (diffX == 0 && diffY == 0) {
      continue;
    } else if (Math.abs(diffY) >= Math.abs(diffX)) {
      applyEntityColor(enemyColor, [enemy]);
      enemy.y = mod(
        enemy.y - Math.sign(diffY) * 1 * Math.round(Math.random()),
        rows
      );
      applyEntityColor(enemyColor, [enemy]);
    } else {
      applyEntityColor(enemyColor, [enemy]);
      enemy.x = mod(
        enemy.x - Math.sign(diffX) * 1 * Math.round(Math.random()),
        columns
      );
      applyEntityColor(enemyColor, [enemy]);
    }
  }
}

initGame();

// put inside game loop
let gameOver = false;
let gameStarted = false;

function gameLoop() {
  if (!gameOver) {
    if (gameStarted) updateGameState();
    setTimeout(() => {
      window.requestAnimationFrame(gameLoop);
    }, delay);
  }
}

function updateGameState() {
  movePlayers(players);
  moveEnemies(enemies, players);
}

gameLoop();

// convert from arrays to single object where keys are coordinates and values are entities
// don't have entity.x and entity.y, instead make an entity.position
// make end game
// make re-init
// make variables editable on page
