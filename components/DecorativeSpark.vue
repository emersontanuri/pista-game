<script setup lang="ts">
const props = withDefaults(defineProps<{
  tone?: 'coral' | 'yellow' | 'mint' | 'navy'
  variant?: 'fan' | 'duo'
}>(), {
  tone: 'yellow',
})

const source = computed(() => {
  const variant = props.variant ?? (props.tone === 'coral' ? 'duo' : 'fan')
  const suffix = variant === 'duo' ? '-duo' : ''
  return `/design/ornaments/spark-${props.tone}${suffix}.svg`
})
</script>

<template><img class="decorative-spark" :src="source" alt="" aria-hidden="true" /></template>
