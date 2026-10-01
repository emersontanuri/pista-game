# Guia de Design — Qual é a palavra?

Este documento é a fonte de verdade para decisões visuais e de experiência do produto. Consulte-o antes de alterar layout, componentes, estilos, textos de interface, ilustrações, cores, tipografia ou comportamento responsivo.

## 1. Essência do produto

`Qual é a palavra?` é um jogo de dicas curto, amigável e inteligente. A interface deve fazer o jogador sentir que está diante de uma carta de jogo bem cuidada: clara o bastante para jogar sem esforço, mas com personalidade suficiente para ser memorável.

### Personalidade

- **Acolhedora:** usa linguagem simples, humana e convidativa.
- **Curiosa:** cria expectativa ao revelar dicas aos poucos.
- **Leve:** tem cor, ritmo e pequenos detalhes gráficos sem parecer infantil.
- **Confiante:** apresenta informação e ações com hierarquia visual firme.
- **Editorial:** combina aparência de papel, tipografia expressiva e composição arejada.

### Sensação desejada

O produto deve parecer um caderno de desafios moderno, ensolarado e bem organizado — mais próximo de uma mesa de jogo criativa do que de um painel administrativo.

## 2. Princípios de design

1. **A palavra é o centro.** O enigma, as dicas e a ação da rodada têm prioridade sobre elementos auxiliares.
2. **Revelação progressiva.** A interface deve tornar evidente o que está disponível, o que já foi revelado e qual é o próximo passo.
3. **Clareza antes de decoração.** Ornamentos apoiam a experiência; nunca competem com conteúdo ou controles.
4. **Contraste com gentileza.** Use azul-marinho para estrutura e ações principais, reservando cores fortes para estados, destaque e recompensa.
5. **Ritmo de carta.** Prefira blocos arredondados, espaços generosos, bordas suaves e agrupamentos fáceis de escanear.
6. **Mobile é uma experiência completa.** No celular, ações essenciais devem permanecer acessíveis sem exigir navegação lateral ou precisão excessiva.

## 3. Direção visual

- Fundo geral quente, com leves manchas radiais creme/amarelas e verde-água.
- Superfícies principais claras, próximas de papel, com borda azul translúcida e sombra suave.
- Azul-marinho para títulos, estrutura, pontuação e ação primária.
- Coral para energia, atenção, carregamento e pequenos acentos.
- Amarelo para faíscas, expectativa e detalhes decorativos.
- Verde-menta para acerto, sucesso e recompensa.
- Lavanda para áreas de resposta e informação em foco.
- Formas arredondadas e ícones/ornamentos simples, sem excesso de contorno.

### Composição ornamental

- No desktop, o fundo combina o recorte amarelo no cabeçalho, o blob coral entrando pela lateral esquerda e a onda multicolorida ancorada no fim da página.
- A composição de fundo é ancorada à viewport: textura, padrões, gradientes, blobs e onda permanecem fixos enquanto apenas o conteúdo da frente acompanha a rolagem.
- Os sparks acompanham pontos de atenção do jogo: amarelo e coral no título, amarelo na pontuação, coral nos filtros, amarelo no histórico e menta/navy junto aos controles.
- Sparks usam raios orgânicos e afunilados: leques de três raios nos acentos principais e versões curtas de dois raios junto a badges e ações. Não usar barras retangulares rotacionadas.
- Ornamentos podem ultrapassar parcialmente os limites dos cartões e da viewport, mas permanecem atrás do conteúdo e nunca bloqueiam interação ou leitura.
- No mobile, reduzir a composição: manter os acentos próximos ao título, pontuação e controles, usar blobs periféricos e ocultar a onda inferior quando ela competir com a barra fixa.

## 4. Tokens visuais

Os valores abaixo correspondem aos tokens usados em `assets/css/main.css`. Ao precisar de uma nova cor, procure primeiro um token existente e só crie outro quando houver uma necessidade semântica real.

### Cores

| Token | Valor | Uso |
| --- | --- | --- |
| `--navy` | `#10274d` | Texto principal, títulos, botões primários, estrutura |
| `--navy-soft` | `#29456f` | Azul de apoio |
| `--cream` | `#fff8ea` | Fundo global |
| `--paper` | `#fffdf8` | Cartões e superfícies |
| `--coral` | `#f4514b` | Atenção, carregamento, acentos e hover expressivo |
| `--yellow` | `#f6c445` | Faíscas e destaque decorativo |
| `--mint` | `#56b89f` | Sucesso, acerto e recompensa |
| `--muted` | `#7785a2` | Texto secundário e metadados |
| `--line` | `#dfe5ef` | Linhas e separadores |
| `--lavender` | `#f0f2f8` | Painel de resposta e estados informativos |

Cores semânticas adicionais devem manter o mesmo espírito: saturação moderada, boa legibilidade sobre a superfície escolhida e função clara.

### Tipografia

- **DM Sans:** corpo, rótulos, botões, dicas e texto de apoio.
- **Space Grotesk:** títulos, nome da resposta, pontuação e cabeçalhos com personalidade.
- Pesos disponíveis: 400, 500, 600 e 700.
- Títulos devem ser fortes e compactos, com `letter-spacing` levemente negativo quando necessário.
- Metadados usam tamanho menor, peso semibold/bold e cor suavizada; nunca devem parecer mais importantes que o conteúdo principal.

### Forma e profundidade

- Raio padrão: `22px` para cartões grandes.
- Controles e badges: entre `12px` e `18px`; pills podem usar `999px`.
- Sombra padrão: `0 18px 45px rgba(16, 39, 77, .09)`.
- Bordas: finas, claras e discretas; use borda para separar superfícies, não para desenhar cada elemento.
- Evite sombras duras, gradientes pesados e cantos quadrados em novos elementos sem justificativa.

## 5. Composição e hierarquia

### Cabeçalho

O cabeçalho deve manter a marca à esquerda e a ação “Novo jogo” à direita. A marca combina arte simples com nome em Space Grotesk. O cabeçalho é leve, com fundo translúcido e separador inferior sutil.

### Área principal

No desktop, a composição usa uma coluna principal ampla para a rodada e uma barra lateral estreita para filtros, histórico e controles. A rodada sempre recebe mais espaço visual que a barra lateral.

### Carta do jogo

A carta deve apresentar, nesta ordem:

1. título e dificuldade;
2. pontuação disponível;
3. painel da resposta;
4. lista de dicas;
5. ações da rodada.

O jogador precisa reconhecer o estado atual sem ler toda a tela. Estados de carregamento, erro e início devem manter o mesmo enquadramento e a mesma linguagem visual.

O contorno da carta principal é mais presente que os cartões auxiliares: usa borda navy de `6px`, a mesma superfície de papel levemente translúcida dos filtros (`rgba(255, 253, 248, .96)`) e quatro cantos com arredondamento regular de `30px`. A borda superior sobe cerca de `17px` do lado esquerdo até o canto direito; laterais e base permanecem nas posições originais. O traçado é calculado nas dimensões reais da carta para preservar os raios, sem rotacionar a moldura ou o conteúdo. No mobile, usar borda de `5px`, raio de `22px` e elevação superior de cerca de `10px`.

### Dicas

Dicas não reveladas devem ser visivelmente disponíveis, mas secundárias. Dicas reveladas recebem cor de texto principal; a numeração deve continuar sendo um marcador compacto e consistente. O hover pode usar amarelo-claro, sem mudar a geometria da lista.

### Pontuação e histórico

Pontuação é recompensa e deve usar verde ou azul, nunca coral. O histórico é auxiliar: deve ser fácil de consultar, mas não pode competir com a carta atual.

## 6. Componentes e estados

Preserve os componentes existentes como unidades de intenção:

- `BrandLockup`: identidade e nome do produto.
- `DecorativeSpark`: acento visual contextual, sem carregar informação essencial.
- `GameCard`: conteúdo principal da rodada.
- `ClueList`: progressão e revelação das dicas.
- `ScoreBoard`: pontuação e resumo da rodada.
- `FilterSettings`: filtros compactos e selecionáveis.
- `HistoryPanel`: histórico secundário.
- `GameControls`: ações primárias da rodada.

Todo componente interativo precisa ter estados identificáveis para repouso, hover, foco, desabilitado, carregando, sucesso e erro quando aplicável. O estado deve ser comunicado por mais de uma forma quando necessário: cor mais texto, ícone, posição ou rótulo.

## 7. Responsividade

### Desktop — a partir de 761px

- Usar composição de duas colunas.
- Manter filtros, histórico e controles na barra lateral.
- Preservar largura confortável para a carta e leitura das dicas.
- Usar posicionamento sticky apenas para informação auxiliar e controles que realmente beneficiem a consulta.

### Mobile — até 760px

- Transformar filtros em painel recolhível no topo do conteúdo.
- Ocultar o painel de histórico lateral e expô-lo pelo botão flutuante.
- Fixar controles essenciais no rodapé, respeitando `safe-area-inset-bottom`.
- Manter alvos de toque grandes, com altura mínima aproximada de `56px` para ações principais.
- Reduzir ornamentos antes de reduzir legibilidade.
- Evitar que títulos, respostas ou dicas criem overflow horizontal.

## 8. Linguagem de interface

- Preferir frases curtas, diretas e acolhedoras.
- Usar português natural e consistente.
- Ações devem começar com verbo: “Começar partida”, “Novo jogo”, “Tentar novamente”, “Mostrar resposta”.
- Estados de erro devem explicar o que aconteceu e oferecer uma ação de recuperação.
- O texto deve incentivar curiosidade, sem infantilizar o jogador.

## 9. Regras para alterações

Antes de alterar uma tela ou componente visual:

1. consultar este guia e identificar quais princípios e tokens se aplicam;
2. reutilizar tokens e componentes existentes;
3. verificar desktop e mobile;
4. revisar contraste, foco, estados de interação e overflow;
5. atualizar este documento quando a alteração introduzir uma decisão visual permanente ou um novo token;
6. registrar no resumo da alteração qual parte do guia foi aplicada ou atualizada.

Uma alteração de design está concluída quando mantém a hierarquia da rodada, respeita a paleta e tipografia, funciona nos dois breakpoints principais e não cria um padrão visual isolado sem justificativa.

## 10. Referências do repositório

- Tokens e layout global: `assets/css/main.css`
- Composição da experiência: `pages/index.vue`
- Componentes visuais: `components/`
- Biblioteca SVG reutilizável: `public/design/`
- Ícones funcionais: `public/design/icons/`
- Ornamentos e faíscas: `public/design/ornaments/`
- Formas de fundo e textura: `public/design/backgrounds/`
- Marca vetorizada: `public/design/brand/`
- Conceitos visuais: `design/pista-dashboard-concept.png`, `design/pista-mobile-concept.png` e `design/pista-mobile-revised.png`
