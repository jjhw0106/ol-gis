<template>
  <div id="map-popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer" ref="closerRef">×</a>
    <!-- <a href="#" id="popup-closer" class="ol-popup-closer" @click.prevent="emit('close')">×</a> -->
    <div id="popup-content" ref="popupContentRef">
      <p>지 번 : {{ data.jibun }}</p>
      <p>주 소 : {{ data.addr }}</p>
      <p>공시지가 : {{ data.jiga }}</p>
      <p>계산면적 : {{ data.area }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: {
    jibun: string
    addr: string
    jiga: string
    area: string
  }
}>()
// const emit = defineEmits(['close'])
</script>
