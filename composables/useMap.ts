import { View } from 'ol'
import Map from 'ol/Map'
import Zoom from 'ol/control/Zoom'
import TileLayer from 'ol/layer/Tile'
import { fromLonLat, get } from 'ol/proj'
import { OSM } from 'ol/source'
import { TileGrid } from 'ol/tilegrid'
import type BaseLayer from 'ol/layer/Base'
import { useMapConfig } from './useMapConfig'
// import { useBaseLayer } from '../composables/useBaseLayer'

export function useMapInit(layers: any[]) {
    // Map은 Dom 접근이 필요해서 new Map() 불가
    // ref로 감싸지 않은 이유 > ref는 내부까지 감시를 하는데, 
    // OL의 경우 자체적으로 상태를 관리하기 때문에, ref 사용 시 불필요한 자원이 낭비될 수 있다.
    const map = shallowRef<Map>()
    const {projection, extent} = useMapConfig()

    onMounted(()=>{
        map.value = new Map({
            target: 'map',
            layers: [...layers],
            view: new View({
                projection,
                center: fromLonLat([LONGITUDE, LATITUDE]),
                zoom: DEFALT_ZOOM
            }),
            controls: []
        })

        map.value.addControl(
            new Zoom({ target: document.getElementById('map-controls')! })
        )
    })

    return {
        map,
    }
}