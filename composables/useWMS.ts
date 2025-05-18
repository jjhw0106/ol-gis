import type { Extent } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import { Projection } from "ol/proj";
import { XYZ } from "ol/source";
import { TileGrid } from "ol/tilegrid";
import { useMapConfig } from "./useMapConfig";

export function useWMS() {

    const isWmsVisible = ref(false)
    const wmsLayer = new TileLayer({})
    const {projection, extent} = useMapConfig()

    const tileGrid = new TileGrid({
        extent,
        tileSize: TILE_SIZE,
        // 지도의 넓이(extent)를 타일 사이즈로 나누고, 2의 zoom승 나눈다.
        // extent : [서쪽 경계, 남쪽 경계, 동쪽 경계, 북쪽 경계]
        // resolution은 한 픽셀 당 몇 미터를 나타내느냐를 나타낸다
        resolutions: Array.from({ length: MAX_ZOOM + 1 }, (_, z) =>
            (extent[2] - extent[0]) / TILE_SIZE / Math.pow(2, z)
        )
    })

    wmsLayer.setVisible(isWmsVisible.value)
    wmsLayer.setSource(
        new XYZ({
            projection: projection,
            tileGrid,
            tileSize: TILE_SIZE,
            crossOrigin: 'anonymous',
            tileUrlFunction: ([z, x, y]) => {
                const tileExtent = tileGrid.getTileCoordExtent([z, x, y])
                const bbox = tileExtent.map(v => v.toFixed(6)).join(',')

                const url = `${WMS_URL}?width=${TILE_SIZE}&height=${TILE_SIZE}&bbox=${bbox}`
                return url
            }
        })
    )

    // 베이스 지도 위에 오버레이 되도록
    function toggleWMSLayer() {
        isWmsVisible.value = !isWmsVisible.value
        wmsLayer.setVisible(isWmsVisible.value)
    }

    return {
        isWmsVisible,
        wmsLayer,
        toggleLayer: toggleWMSLayer
    }
}