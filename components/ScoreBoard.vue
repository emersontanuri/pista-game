<script setup lang="ts">
defineProps<{ score: number; cardsPlayed: number }>()
</script>
<template><aside class="score-card"><span class="eyebrow">PLACAR</span><div class="score-value">{{ score }} <small>pontos</small></div><div class="score-meta">{{ cardsPlayed }} {{ cardsPlayed === 1 ? 'carta' : 'cartas' }} concluída{{ cardsPlayed === 1 ? '' : 's' }}</div></aside></template>
