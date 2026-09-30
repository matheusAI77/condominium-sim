// Interface: HUD, candidatos, regras, detalhes e log. Ponto de entrada do jogo.

let state = loadState();
let selectedApt = null;

if (!state) {
  state = createInitialState();
  generateMonthCandidates(state);
}

const $ = (id) => document.getElementById(id);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatMoney(value) {
  return 'R$ ' + value.toLocaleString('pt-BR');
}

function commit() {
  saveState(state);
  renderAll();
}

function renderHud() {
  $('hud-money').textContent = formatMoney(state.money);
  $('hud-month').textContent = state.month;
  $('hud-occupied').textContent = `${occupiedCount(state)} / ${state.apartments.length}`;
}

function attributeChips(tenant) {
  const wrap = el('div', 'chips');
  wrap.appendChild(el('span', 'chip', `${INCOME_ICONS[tenant.renda]} Renda ${INCOME_LABELS[tenant.renda].toLowerCase()} (${formatMoney(CONFIG.rent[tenant.renda])})`));
  if (tenant.tem_pet) wrap.appendChild(el('span', 'chip', '🐾 Tem pet'));
  if (tenant.barulhento) wrap.appendChild(el('span', 'chip', '🔊 Barulhento'));
  if (!tenant.tem_pet && !tenant.barulhento) wrap.appendChild(el('span', 'chip chip-muted', 'Sem pet, silencioso'));
  return wrap;
}

function renderCandidates() {
  const list = $('candidates');
  list.replaceChildren();
  const hasVacancy = firstVacant(state) !== -1;

  if (state.candidates.length === 0) {
    list.appendChild(el('p', 'muted', 'Nenhum candidato este mês.'));
    return;
  }

  for (const c of state.candidates) {
    const card = el('div', 'card');
    card.appendChild(el('div', 'card-title', c.nome));
    card.appendChild(attributeChips(c));

    const actions = el('div', 'actions');
    const accept = el('button', 'btn btn-accept', 'Aceitar');
    accept.disabled = !hasVacancy;
    accept.title = hasVacancy ? '' : 'Sem apartamento vago';
    accept.addEventListener('click', () => {
      if (acceptCandidate(state, c.id)) commit();
    });
    const reject = el('button', 'btn btn-reject', 'Recusar');
    reject.addEventListener('click', () => {
      rejectCandidate(state, c.id);
      commit();
    });
    actions.append(accept, reject);
    card.appendChild(actions);
    list.appendChild(card);
  }

  if (!hasVacancy) list.appendChild(el('p', 'muted', 'Prédio cheio: não dá para aceitar ninguém.'));
}

function renderRules() {
  const list = $('rules');
  list.replaceChildren();
  for (const rule of RULES) {
    const row = el('label', 'rule');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = isRuleOn(state, rule.id);
    input.addEventListener('change', () => {
      toggleRule(state, rule.id);
      commit();
    });
    const text = el('div', 'rule-text');
    text.appendChild(el('div', 'rule-label', rule.label));
    text.appendChild(el('div', 'rule-desc', rule.description));
    row.append(input, text);
    list.appendChild(row);
  }
}

function renderDetails() {
  const box = $('details');
  box.replaceChildren();
  if (selectedApt === null) {
    box.appendChild(el('p', 'muted', 'Toque em um apartamento para ver os detalhes.'));
    return;
  }
  const tenant = state.apartments[selectedApt];
  box.appendChild(el('div', 'card-title', `Apartamento ${aptLabel(selectedApt)}`));
  if (!tenant) {
    box.appendChild(el('p', 'muted', 'Vago.'));
    return;
  }
  box.appendChild(el('div', '', `${tenant.nome}: satisfação ${tenant.satisfacao}`));
  box.appendChild(attributeChips(tenant));
  if (tenant.lastChanges.length) {
    box.appendChild(el('div', 'sub', 'Último mês:'));
    const ul = el('ul', 'changes');
    for (const c of tenant.lastChanges) {
      const li = el('li', c.amount >= 0 ? 'pos' : 'neg', `${c.amount > 0 ? '+' : ''}${c.amount} ${c.reason}`);
      ul.appendChild(li);
    }
    box.appendChild(ul);
  }
}

function renderLog() {
  const list = $('log');
  list.replaceChildren();
  if (state.log.length === 0) {
    list.appendChild(el('li', 'muted', 'Nada aconteceu ainda.'));
    return;
  }
  for (const entry of state.log) {
    list.appendChild(el('li', '', `Mês ${entry.month}: ${entry.text}`));
  }
}

function selectApt(index) {
  selectedApt = selectedApt === index ? null : index;
  renderAll();
}

function renderAll() {
  renderHud();
  renderBuilding($('building'), state, selectedApt, selectApt);
  renderCandidates();
  renderRules();
  renderDetails();
  renderLog();
}

$('btn-advance').addEventListener('click', () => {
  advanceMonth(state);
  commit();
});

$('btn-reset').addEventListener('click', () => {
  if (!confirm('Começar um jogo novo? O progresso atual será apagado.')) return;
  clearSave();
  state = createInitialState();
  generateMonthCandidates(state);
  selectedApt = null;
  commit();
});

renderAll();
