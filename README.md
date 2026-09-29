# condominium-sim

Protótipo de simulação de gestão de condomínio. HTML + CSS + JS puro, sem build.

## Rodar

Abra `index.html` no navegador (funciona direto via `file://`), ou sirva a pasta:

```
python3 -m http.server 8000
```

e acesse `http://localhost:8000` (no celular, use o IP do PC na mesma rede).

## Estrutura

- `js/state.js`: `CONFIG` (todo o balanceamento), estado inicial, save/load em localStorage, geometria do prédio.
- `js/tenants.js`: geração de candidatos e helpers de exibição.
- `js/rules.js`: regras do condomínio e seus efeitos.
- `js/simulation.js`: aceitar/recusar, avançar mês (aluguel, satisfação, saídas).
- `js/render.js`: desenho do prédio em SVG.
- `js/ui.js`: HUD, painéis e ponto de entrada.

Os scripts são clássicos (não ES modules) para funcionar abrindo o arquivo direto, sem servidor.
