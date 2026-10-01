<script setup lang="ts">
import { CARD_CATEGORIES, CARD_DIFFICULTIES } from '~/shared/types/game'
const { state } = useGame()
const isOpen = ref(false)
const toggle = <T,>(items: T[], item: T) => items.includes(item) ? items.filter((value) => value !== item) : [...items, item]
const syncOpen = (event: Event) => { isOpen.value = (event.currentTarget as HTMLDetailsElement).open }
onMounted(() => { isOpen.value = false })
</script>
<template>
  <details class="filters-card" :open="isOpen" @toggle="syncOpen">
    <summary class="filter-summary"><img class="filter-icon" src="/design/icons/sliders.svg" alt="" /><span class="filter-copy"><span class="eyebrow">PERSONALIZE A RODADA</span><p class="filter-title">Escolha as categorias e dificuldades</p></span></summary>
    <div class="filter-group"><span class="filter-label">Categorias</span><div class="badge-list"><button v-for="category in CARD_CATEGORIES" :key="category" class="filter-badge" :class="{ selected: state.selectedCategories.includes(category) }" @click="state.selectedCategories = toggle(state.selectedCategories, category)">{{ category }}</button></div></div>
    <div class="filter-group"><span class="filter-label">Dificuldade</span><div class="badge-list"><button v-for="difficulty in CARD_DIFFICULTIES" :key="difficulty" class="filter-badge" :class="{ selected: state.selectedDifficulties.includes(difficulty) }" @click="state.selectedDifficulties = toggle(state.selectedDifficulties, difficulty)">{{ difficulty === 'facil' ? 'Fácil · 1–4' : difficulty === 'medio' ? 'Média · 5–8' : 'Difícil · 9–10' }}</button></div></div>
    <small class="filter-hint">Nada selecionado inclui todas as opções.</small>
  </details>
</template>
