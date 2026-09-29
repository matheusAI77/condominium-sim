// Estado do jogo, balanceamento e persistência.
// Todos os números de balanceamento ficam em CONFIG.

const CONFIG = {
  saveKey: 'condominio-save-v1',
  saveVersion: 1,

  // Prédio
  floors: 2,
  aptsPerFloor: 2,

  // Economia
  startMoney: 5000,
  rent: { baixa: 800, media: 1400, alta: 2200 },

  // Geração de candidatos
  candidatesMin: 1,
  candidatesMax: 3,
  incomeWeights: { baixa: 0.4, media: 0.4, alta: 0.2 },
  petChance: 0.35,
  noisyChance: 0.25,

  // Satisfação
  startSatisfaction: 60,
  baseMonthlyChange: 3,      // todo inquilino ganha isso por mês sem problemas
  petBanOwnerPenalty: 10,    // regra ligada: dono de pet perde por mês
  petNeighborPenalty: 2,     // regra desligada: vizinho sem pet perde por mês, por vizinho com pet
  noisyWallPenalty: 8,       // vizinho de parede de um barulhento
  noisyFloorPenalty: 6,      // vizinho de cima/baixo de um barulhento
  leaveThreshold: 20,        // abaixo disso o inquilino sai
  happyThreshold: 70,        // >= verde
  neutralThreshold: 40,      // >= amarelo, abaixo é vermelho

  logSize: 12,
};

function createInitialState() {
  return {
    version: CONFIG.saveVersion,
    month: 1,
    money: CONFIG.startMoney,
    apartments: new Array(CONFIG.floors * CONFIG.aptsPerFloor).fill(null),
    candidates: [],
    rules: { noPets: false },
    log: [],
    nextId: 1,
  };
}

function saveState(state) {
  try {
    localStorage.setItem(CONFIG.saveKey, JSON.stringify(state));
  } catch (e) {
    // localStorage indisponível (modo privado etc.): o jogo segue sem salvar.
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.saveKey);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || state.version !== CONFIG.saveVersion) return null;
    return state;
  } catch (e) {
    return null;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(CONFIG.saveKey);
  } catch (e) {}
}

// Geometria do prédio. Índice = andar * aptsPerFloor + coluna; andar 0 é o térreo.
function aptFloor(index) {
  return Math.floor(index / CONFIG.aptsPerFloor);
}

function aptCol(index) {
  return index % CONFIG.aptsPerFloor;
}

function aptIndex(floor, col) {
  return floor * CONFIG.aptsPerFloor + col;
}

function aptLabel(index) {
  return `${aptFloor(index) + 1}0${aptCol(index) + 1}`;
}

// Vizinhos de parede (mesmo andar, coluna adjacente) e de piso (mesma coluna, andar adjacente).
function getNeighbors(index) {
  const floor = aptFloor(index);
  const col = aptCol(index);
  const wall = [];
  const vertical = [];
  if (col > 0) wall.push(aptIndex(floor, col - 1));
  if (col < CONFIG.aptsPerFloor - 1) wall.push(aptIndex(floor, col + 1));
  if (floor > 0) vertical.push(aptIndex(floor - 1, col));
  if (floor < CONFIG.floors - 1) vertical.push(aptIndex(floor + 1, col));
  return { wall, vertical };
}

function addLog(state, text) {
  state.log.unshift({ month: state.month, text });
  if (state.log.length > CONFIG.logSize) state.log.length = CONFIG.logSize;
}
