// Inquilinos: geração de candidatos e helpers de exibição.

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Heitor',
  'Isabela', 'João', 'Karina', 'Lucas', 'Marina', 'Nicolas', 'Olívia', 'Pedro',
  'Rafaela', 'Samuel', 'Tatiana', 'Vinícius', 'Yasmin', 'Otávio', 'Beatriz', 'Caio',
];

const LAST_NAMES = [
  'Silva', 'Souza', 'Oliveira', 'Lima', 'Pereira', 'Costa', 'Almeida', 'Rocha',
  'Barbosa', 'Ribeiro', 'Martins', 'Carvalho', 'Gomes', 'Freitas', 'Moreira',
];

const INCOME_LABELS = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
const INCOME_ICONS = { baixa: '$', media: '$$', alta: '$$$' };

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickWeighted(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r < 0) return key;
  }
  return entries[entries.length - 1][0];
}

function generateTenant(state) {
  return {
    id: state.nextId++,
    nome: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    renda: pickWeighted(CONFIG.incomeWeights),
    tem_pet: Math.random() < CONFIG.petChance,
    barulhento: Math.random() < CONFIG.noisyChance,
    satisfacao: CONFIG.startSatisfaction,
    lastChanges: [],
  };
}

function satisfactionLevel(value) {
  if (value >= CONFIG.happyThreshold) return 'happy';
  if (value >= CONFIG.neutralThreshold) return 'neutral';
  return 'unhappy';
}

function tenantIcons(tenant) {
  const icons = [INCOME_ICONS[tenant.renda]];
  if (tenant.tem_pet) icons.push('🐾');
  if (tenant.barulhento) icons.push('🔊');
  return icons;
}
