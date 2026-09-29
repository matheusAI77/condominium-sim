// Lógica do mês: candidatos, aceitar/recusar, aluguel, satisfação e saídas.

function generateMonthCandidates(state) {
  const count = randInt(CONFIG.candidatesMin, CONFIG.candidatesMax);
  const candidates = [];
  for (let i = 0; i < count; i++) {
    const c = generateTenant(state);
    if (candidateAllowed(state, c)) candidates.push(c);
  }
  state.candidates = candidates;
}

function firstVacant(state) {
  return state.apartments.findIndex((a) => a === null);
}

function occupiedCount(state) {
  return state.apartments.filter((a) => a !== null).length;
}

function acceptCandidate(state, candidateId) {
  const idx = state.candidates.findIndex((c) => c.id === candidateId);
  if (idx === -1) return false;
  const apt = firstVacant(state);
  if (apt === -1) return false;
  const [tenant] = state.candidates.splice(idx, 1);
  state.apartments[apt] = tenant;
  addLog(state, `${tenant.nome} entrou no ${aptLabel(apt)}.`);
  return true;
}

function rejectCandidate(state, candidateId) {
  state.candidates = state.candidates.filter((c) => c.id !== candidateId);
}

function noiseEffects(state, index) {
  const effects = [];
  const { wall, vertical } = getNeighbors(index);
  for (const n of wall) {
    const neighbor = state.apartments[n];
    if (neighbor && neighbor.barulhento) {
      effects.push({ amount: -CONFIG.noisyWallPenalty, reason: `Barulho do ${aptLabel(n)} (parede)` });
    }
  }
  for (const n of vertical) {
    const neighbor = state.apartments[n];
    if (neighbor && neighbor.barulhento) {
      const where = aptFloor(n) > aptFloor(index) ? 'de cima' : 'de baixo';
      effects.push({ amount: -CONFIG.noisyFloorPenalty, reason: `Barulho do ${aptLabel(n)} (${where})` });
    }
  }
  return effects;
}

function advanceMonth(state) {
  // 1. Aluguel
  let income = 0;
  for (const tenant of state.apartments) {
    if (tenant) income += CONFIG.rent[tenant.renda];
  }
  state.money += income;
  if (income > 0) addLog(state, `Aluguel recebido: R$ ${income.toLocaleString('pt-BR')}.`);

  // 2. Satisfação: calcula todas as variações a partir do mesmo estado, depois aplica.
  const changes = state.apartments.map((tenant, index) => {
    if (!tenant) return null;
    return [
      { amount: CONFIG.baseMonthlyChange, reason: 'Mês tranquilo' },
      ...ruleEffects(state, index, tenant),
      ...noiseEffects(state, index),
    ];
  });

  state.apartments.forEach((tenant, index) => {
    if (!tenant) return;
    const total = changes[index].reduce((sum, c) => sum + c.amount, 0);
    tenant.satisfacao = Math.max(0, Math.min(100, tenant.satisfacao + total));
    tenant.lastChanges = changes[index];
  });

  // 3. Saídas
  state.apartments.forEach((tenant, index) => {
    if (tenant && tenant.satisfacao < CONFIG.leaveThreshold) {
      const worst = tenant.lastChanges
        .filter((c) => c.amount < 0)
        .sort((a, b) => a.amount - b.amount)[0];
      const why = worst ? ` Motivo principal: ${worst.reason.toLowerCase()}.` : '';
      addLog(state, `${tenant.nome} saiu do ${aptLabel(index)} (satisfação ${tenant.satisfacao}).${why}`);
      state.apartments[index] = null;
    }
  });

  // 4. Próximo mês
  state.month += 1;
  generateMonthCandidates(state);
}
