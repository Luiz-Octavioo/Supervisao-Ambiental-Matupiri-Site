# Supervisão Ambiental Rodoviária — Consórcio Matupiri

Experiência digital institucional (storytelling em scroll) que substitui a apresentação
em PowerPoint da supervisão ambiental do Consórcio Matupiri, em apoio à fiscalização do DNIT.

Site **100% estático** (HTML + CSS + JS puro, sem build, sem dependências externas em
tempo de execução). Funciona **offline** — ideal para reuniões presenciais em notebook,
tablet ou celular — e pode ser publicado para acesso via **QR Code**.

## Como executar localmente

Basta abrir `index.html` no navegador. Para garantir que tudo (fontes, QR Code) carregue
como em produção, sirva por HTTP:

```bash
python3 -m http.server 8766
# abra http://localhost:8766
```

## Direção visual

**Relatório Digital Institucional com Alma Amazônica** — predominantemente claro
(off-white `#F8F6F2`), com o **roxo Matupiri `#5A006E` como assinatura** (não fundo
dominante) e acentos verde `#1F8F6A` / dourado `#C59A3A`. Tipografia: **Sora** (títulos),
**Inter** (corpo) e **IBM Plex Mono** (índices, coordenadas, legendas — linguagem técnica/GIS).
Ritmo claro→escuro: hero cinematográfico → 4 seções claras → Painel escuro premium →
3 seções claras → encerramento roxo profundo.

## Estrutura

```
index.html                 → marcação e conteúdo de todas as seções
assets/css/style.css       → design system completo (cores, tipografia, animações)
assets/js/main.js          → loader, reveals, parallax, contadores, painel, mapa, QR Code
assets/js/qrcode.min.js    → gerador de QR Code (offline, MIT — Kazuhiko Arase)
assets/img/logo-matupiri.jpeg → logomarca oficial
assets/img/generated/      → imagens institucionais geradas via Higgsfield MCP (substituíveis)
```

Seções, na ordem de scroll: **Hero · Indicadores · O Desafio · Ecossistema de
Governança · PROFAS · Painel Ambiental · Ações em Campo · Mapa · Biblioteca Digital ·
Encerramento (QR)**.

## Personalização rápida

| O que mudar | Onde |
|---|---|
| **Números dos indicadores** | `index.html`, atributos `data-count` / `data-suffix` na seção `#indicadores` |
| **Textos de qualquer seção** | `index.html` |
| **Cor protagonista (roxo)** | `assets/css/style.css`, variável `--roxo` (e derivados `--roxo-*`) |
| **Acento ambiental (verde)** | variável `--eco` |
| **URL do QR Code** | `assets/js/main.js`, objeto `CONFIG.url` |

### QR Code
Em ambiente publicado (http/https), o QR aponta automaticamente para a própria página
(`...#biblioteca`). Ao definir o domínio final, ajuste `CONFIG.url` em `main.js` para a
URL definitiva.

### Imagens geradas (Higgsfield) e o que substituir por material real
O Hero, o fundo do PROFAS, a textura do Mapa e o fundo do Encerramento usam imagens
cinematográficas **geradas via Higgsfield MCP** (`assets/img/generated/`), sem texto,
para servir de apoio institucional. Elas são **substituíveis** a qualquer momento.

Ainda dependem de **material real do Consórcio**:

- **Ações em Campo:** cada `.tile[data-scene="..."]` usa um placeholder em gradiente
  (`.tile__ph`) com o selo "Inserir foto real". Para usar fotos reais, troque o
  `.tile__ph` por uma `<img>` (ou aplique `background-image` no `.tile__ph`).
- **Capa real do PROFAS / documentos da Biblioteca:** trocar as capas e ligar o botão
  "Acessar documento PROFAS" ao PDF definitivo.
- **Screenshots reais do Painel Ambiental:** há área reservada na seção `#painel`.
- **QR Code, contatos e data da apresentação:** ajustar em `main.js` e no `#encerramento`.

> Para gerar novos assets é preciso o **Higgsfield MCP autenticado** (`claude mcp list`
> deve mostrar `higgsfield ✔ Connected`) e **créditos** na conta (plano Free tem poucos).

## Publicação

Por ser estático, pode ser hospedado em qualquer lugar: GitHub Pages, Netlify, Vercel,
servidor próprio ou até rodando do pen drive na apresentação. Basta enviar a pasta inteira.

## Acessibilidade & desempenho

- Respeita `prefers-reduced-motion` (desliga animações para quem precisa).
- Navegação por âncoras, contraste alto, marcação semântica.
- Sem requisições externas além das fontes Google (com fallback de sistema).
