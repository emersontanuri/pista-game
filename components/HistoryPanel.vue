<script setup lang="ts">
import type { GameHistoryEntry } from '~/shared/types/game'
defineProps<{ history: GameHistoryEntry[] }>()
</script>
<template>
  <section class="history-panel"><div class="history-heading"><div><span class="history-title"><img src="/design/icons/trophy.svg" alt="" /><span class="eyebrow">HISTÓRICO</span></span><h3>Palavras acertadas</h3></div><span class="history-count">{{ history.length }}</span></div>
    <div v-if="!history.length" class="history-empty">As palavras acertadas aparecerão aqui.</div>
    <ol v-else class="history-list"><li v-for="(item, index) in history" :key="`${item.answer}-${index}`"><div class="history-item-main"><span class="history-index">{{ history.length - index }}</span><div><strong>{{ item.answer }}</strong><span>{{ item.category }} · Dificuldade {{ item.difficulty }}/10</span></div></div><b>{{ item.points }} pts</b></li></ol>
  </section>
</template>
