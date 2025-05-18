<template>
  <div>
    <div id="map" :style="{ width: MAP_WIDTH + 'px', height: MAP_HEIGHT + 'px' }"></div>
    <div id="map-controls"></div>
    <button @click="toggleLayer" class="px-4 py-2 bg-blue-600 text-white rounded">
      {{ isWmsVisible ? '일반 지도 보기' : 'WMS 보기' }}
    </button>
    <!-- <OpenLayerMapPopup v-if="popupData" :data="popupData"></OpenLayerMapPopup> -->
  </div>
  <div id="map-popup" class="ol-popup" ref="popupRef">
    <a href="#" id="popup-closer" class="ol-popup-closer" ref="closerRef">닫기</a>
    <div id="popup-content" ref="popupContentRef"></div>
  </div>
</template>

<script setup lang="ts">
import { Overlay } from 'ol';
import { getArea } from 'ol/sphere';
import { useWMS } from '~/composables/useWMS';

const { baseLayer } = useBaseLayer()
const { wmsLayer, toggleLayer, isWmsVisible } = useWMS()
const { vectorLayer, setVectorLayer, clearVectorSource } = useVector()
// const { popupData, setPopupData, overlay } = usePopup()
const { map } = useMapInit([baseLayer, wmsLayer, vectorLayer])


// 팝업
const popupRef = ref<HTMLElement | null>(null)
const popupContentRef = ref<HTMLElement | null>(null)
const closerRef = ref<HTMLElement | null>(null)
const overlay = shallowRef<Overlay>()

onMounted(() => {
  // 오버레이 생성 & 등록
  overlay.value = new Overlay({
    element: popupRef.value!,
    autoPan: true,
  })

  map.value?.on('singleclick', async (e) => {
    const features = await useWFS().fetchWFSFeature(e.coordinate)
    const feature = features![0]
    const featureProperties = feature.getProperties()
    const isClicked = map.value!.getFeaturesAtPixel(e.pixel).length != 0 ? true : false

    const geometry = feature.getGeometry()
    const area = getArea(geometry!)

    if (isClicked) {
      clearVectorSource()
      overlay.value?.setPosition(undefined)
      console.log(isClicked)
      return
    }
    setVectorLayer(feature)

    map.value?.addOverlay(overlay.value!)
    // 닫기 버튼
    closerRef.value!.onclick = function () {
      overlay.value!.setPosition(undefined)
      return false
    }
    // 팝업 표시 내용
    popupContentRef.value!.innerHTML = `
      <p>지 번 : ${featureProperties.jibun || '데이터 없음'}</strong></p>
      <p>주 소 : ${featureProperties.addr || '데이터 없음'} </p>
      <p>공시지가 : ${featureProperties.jiga || '데이터 없음'} </p>
      <p>계산면적 : ${area.toFixed(2) || '데이터 없음'} </p>
    `
    overlay.value!.setPosition(e.coordinate)
  })
})
</script>

<style scoped>
#toggle {
  margin-top: 16px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  min-width: 200px;
  bottom: 12px;
  left: -50px;
  z-index: 100;
}

.ol-popup-closer {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 18px;
  color: #999;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  z-index: 1001;
}
</style>
