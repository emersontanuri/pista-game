<script setup lang="ts">
import type { GameCard as Card } from '~/shared/types/game'

defineProps<{ card: Card; revealed: number; revealedIndexes: number[]; answerVisible: boolean; points: number }>()
const emit = defineEmits<{ toggleAnswer: []; revealClue: [index: number] }>()

const cardElement = ref<HTMLElement | null>(null)
const cardSize = ref({ width: 0, height: 0 })
const isMobile = ref(false)
let cardObserver: ResizeObserver | undefined
const outlinePath = computed(() => {
  const { width, height } = cardSize.value
  if (!width || !height) return ''

  const inset = isMobile.value ? 2.5 : 3
  const radius = isMobile.value ? 22 : 30
  const leftTop = isMobile.value ? 12 : 20
  const rightTop = inset
  const left = inset
  const right = width - inset
  const bottom = height - inset
  const k = radius * 0.55228475
  const slope = (rightTop - leftTop) / (width - 2 * inset - 2 * radius)
  const topLeft = left + radius
  const topRight = right - radius

  return [
    `M ${topLeft} ${leftTop}`,
    `L ${topRight} ${rightTop}`,
    `C ${topRight + k} ${rightTop + slope * k} ${right} ${rightTop + radius - k} ${right} ${rightTop + radius}`,
    `L ${right} ${bottom - radius}`,
    `C ${right} ${bottom - radius + k} ${right - radius + k} ${bottom} ${right - radius} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `C ${left + radius - k} ${bottom} ${left} ${bottom - radius + k} ${left} ${bottom - radius}`,
    `L ${left} ${leftTop + radius}`,
    `C ${left} ${leftTop + radius - k} ${topLeft - k} ${leftTop - slope * k} ${topLeft} ${leftTop}`,
    'Z',
  ].join(' ')
})

onMounted(() => {
  const element = cardElement.value
  if (!element) return

  cardObserver = new ResizeObserver(([entry]) => {
    if (!entry) return
    cardSize.value = {
      width: entry.borderBoxSize?.[0]?.inlineSize ?? entry.target.getBoundingClientRect().width,
      height: entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height,
    }
    isMobile.value = window.matchMedia('(max-width: 760px)').matches
  })
  cardObserver.observe(element)
})
onUnmounted(() => cardObserver?.disconnect())
</script>
<template>
  <section ref="cardElement" class="game-card" :class="{ 'game-card--outlined': outlinePath }">
    <svg
      v-if="outlinePath"
      class="game-card-outline"
      :viewBox="`0 0 ${cardSize.width} ${cardSize.height}`"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path :d="outlinePath" />
    </svg>
    <div class="card-heading">
      <div>
        <span class="eyebrow">CATEGORIA</span>
        <h1>{{ card.category }}</h1>
        <span class="difficulty-label">Dificuldade {{ card.difficulty }}/10</span>
      </div>
      <span class="points-badge"><span>{{ points }}</span> pts</span>
    </div>
    <div class="answer-panel">
      <span class="eyebrow">PALAVRA</span>
      <strong :class="{ obscured: !answerVisible }">{{ answerVisible ? card.answer : 'Resposta escondida' }}</strong>
      <button class="text-button" @click="emit('toggleAnswer')">
        <img :src="`/design/icons/${answerVisible ? 'eye-off' : 'eye'}.svg`" alt="" />
        {{ answerVisible ? 'Ocultar palavra' : 'Mostrar palavra' }}
      </button>
    </div>
    <div class="clue-header">
      <div>
        <span class="eyebrow">DICAS</span>
        <strong>{{ revealed }}/20 reveladas</strong>
      </div>
      <span class="hint">Clique em qualquer dica para revelar</span>
    </div>
    <ClueList :clues="card.clues" :revealed-indexes="revealedIndexes" @reveal="emit('revealClue', $event)" />
  </section>
</template>
