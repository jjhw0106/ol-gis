<template>
  <div>
    <div id="map" :style="{ width: MAP_WIDTH + 'px', height: MAP_HEIGHT + 'px' }"></div>
    <div id="map-controls"></div>
    <button @click="toggleLayer" class="px-4 py-2 bg-blue-600 text-white rounded">
      {{ isWmsVisible ? '일반 지도 보기' : 'WMS 보기' }}
    </button>
  </div>
  <div id="map-popup" class="ol-popup" ref="popupRef">
    <a href="#" id="popup-closer" class="ol-popup-closer" ref="closerRef">닫기</a>
    <div id="popup-content" ref="popupContentRef"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import Zoom from 'ol/control/Zoom'
import { get, fromLonLat } from 'ol/proj'
import { ImageWMS, TileWMS, XYZ } from 'ol/source'
import { LATITUDE, LONGITUDE, MAX_ZOOM, DEFALT_ZOOM, TILE_SIZE, MAP_HEIGHT, MAP_WIDTH } from '../composables/consants'
import ImageLayer from 'ol/layer/Image'
import { TileGrid } from 'ol/tilegrid'
import { Feature, Overlay } from 'ol'
import { Geometry, MultiPolygon } from 'ol/geom'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { Style } from '#components'
import { getArea } from 'ol/sphere'

// Map은 Dom 접근이 필요해서 new Map() 불가
// ref로 감싸지 않은 이유 > ref는 내부까지 감시를 하는데, 
// OL의 경우 자체적으로 상태를 관리하기 때문에, ref 사용 시 불필요한 자원이 낭비될 수 있다.
const map = shallowRef<Map>()
const baseLayer = new TileLayer({})

const isWmsVisible = ref(false)
const wmsLayer = new TileLayer({})

// 벡터 소스와 레이어
const vectorSource = new VectorSource()
const vectorLayer = new VectorLayer({
  source: vectorSource,
})

// 팝업
const popupRef = ref<HTMLElement | null>(null)
const popupContentRef = ref<HTMLElement | null>(null)
const closerRef = ref<HTMLElement | null>(null)
const overlay = shallowRef<Overlay>()

onMounted(async () => {
  // 베이스 OSM 레이어
  baseLayer.setSource(new OSM())

  // projection & full-extent 정의
  const projection = get('EPSG:3857')!
  const extent = projection.getExtent()!

  // 타일 그리드: 줌에 따른 해상도
  const tileGrid = new TileGrid({
    extent,
    tileSize: TILE_SIZE,
    resolutions: Array.from({ length: MAX_ZOOM + 1 }, (_, z) =>
      (extent[2] - extent[0]) / TILE_SIZE / Math.pow(2, z)
    )
  })
  // 맵 초기화, 지도 위에 버튼 및 인증 마크 삭제 위해 controls도 초기화
  map.value = new Map({
    target: 'map',
    layers: [baseLayer, wmsLayer, vectorLayer],
    view: new View({
      projection: projection,
      center: fromLonLat([LONGITUDE, LATITUDE]),
      zoom: DEFALT_ZOOM
    }),
    controls: []
  })


  // WMS용 타일 레이어
  wmsLayer.setVisible(isWmsVisible.value)
  wmsLayer.setSource(
    new XYZ({
      projection: projection,
      tileGrid,
      tileSize: TILE_SIZE,
      crossOrigin: 'anonymous',
      tileUrlFunction: ([z, x, y]) => {
        // 해당 타일의 bbox
        // z,x,y좌표의 extent(지도상 범위)를 배열로 반환한다.
        const extent = tileGrid.getTileCoordExtent([z, x, y])
        // 위의 extent를 돌면서 소수점 6자리로 반환한다. 
        const bbox = extent.map(v => v.toFixed(6)).join(',')

        const url = `${WMS_URL}?width=${TILE_SIZE}&height=${TILE_SIZE}&bbox=${bbox}`
        return url
      }
    }))

  // 줌 컨트롤 추가
  map.value.addControl(
    new Zoom({ target: document.getElementById('map-controls')! })
  )

  // 지도 클릭이벤트 추가
  map.value.on('singleclick', async (event) => {

    // 이미 클릭 되어 있을 경우 영역 제거 / 오버레이 포지션 제거
    if (map.value!.getFeaturesAtPixel(event.pixel).length != 0) {
      vectorSource.clear();
      overlay.value?.setPosition(undefined)

      return;
    }

    const coordinate = event.coordinate;
    const bbox = [...coordinate, ...coordinate];
    const wfsFeature = await fetchWFSFeature(bbox);
    const feature = new Feature({
      ...wfsFeature.properties,
      geometry: new MultiPolygon(wfsFeature.geometry.coordinates)
    })


    const geometry = feature.getGeometry()
    const area = getArea(geometry)
    console.log(geometry)

    vectorSource.clear()
    vectorSource.addFeature(feature)


    // 팝업 /////////////////////////////////////////////////////////////////////
    // 오버레이 생성 & 등록
    overlay.value = new Overlay({
      element: popupRef.value!,
      autoPan: true,
    })
    map.value?.addOverlay(overlay.value!)
    // 닫기 버튼
    closerRef.value!.onclick = function () {
      overlay.value!.setPosition(undefined)
      return false
    }
    // 팝업 표시 내용
    popupContentRef.value!.innerHTML = `
      <p>지 번 : ${wfsFeature.properties.jibun || '데이터 없음'}</strong></p>
      <p>주 소 : ${wfsFeature.properties.addr || '데이터 없음'} </p>
      <p>공시지가 : ${wfsFeature.properties.jiga || '데이터 없음'} </p>
      <p>계산면적 : ${area.toFixed(2) || '데이터 없음'} </p>
    `
    overlay.value!.setPosition(coordinate)
  });
})

async function fetchWFSFeature(
  bbox: number[],
) {
  const url = `https://assign.zeroton.co/api/wfs?bbox=${bbox}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(response)
    console.log(data)

    if (data.features.length > 0) {
      return data.features[0];
    } else {
      return undefined;
    }
  } catch (err) {
    console.error('WFS 요청 실패:', err);
    return undefined;
  }
}

// 베이스 지도 위에 오버레이 되도록
function toggleLayer() {
  isWmsVisible.value = !isWmsVisible.value
  wmsLayer.setVisible(isWmsVisible.value)
}
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