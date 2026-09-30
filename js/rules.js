// Regras do condomínio: definição, filtro de candidatos e efeito mensal.

const RULES = [
  {
    id: 'noPets',
    label: 'Proibido pets',
    description:
      'Ligada: candidatos com pet não aparecem e moradores com pet perdem satisfação todo mês. ' +
      'Desligada: vizinhos de quem tem pet perdem um pouco de satisfação.',
  },
];

function isRuleOn(state, id) {
  return Boolean(state.rules[id]);
}

function toggleRule(state, id) {
  state.rules[id] = !state.rules[id];
  addLog(state, `Regra "${RULES.find((r) => r.id === id).label}" ${state.rules[id] ? 'ligada' : 'desligada'}.`);
  // Candidatos pendentes que a regra passa a barrar somem da fila.
  state.candidates = state.candidates.filter((c) => candidateAllowed(state, c));
}

function candidateAllowed(state, candidate) {
  if (isRuleOn(state, 'noPets') && candidate.tem_pet) return false;
  return true;
}

// Retorna a lista de variações de satisfação causadas pelas regras para o inquilino no apartamento `index`.
function ruleEffects(state, index, tenant) {
  const effects = [];
  if (isRuleOn(state, 'noPets')) {
    if (tenant.tem_pet) {
      effects.push({ amount: -CONFIG.petBanOwnerPenalty, reason: 'Proibição de pets' });
    }
  } else if (!tenant.tem_pet) {
    const { wall, vertical } = getNeighbors(index);
    for (const n of [...wall, ...vertical]) {
      const neighbor = state.apartments[n];
      if (neighbor && neighbor.tem_pet) {
        effects.push({ amount: -CONFIG.petNeighborPenalty, reason: `Pet do ${aptLabel(n)}` });
      }
    }
  }
  return effects;
}
