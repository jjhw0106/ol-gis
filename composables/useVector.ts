import { Overlay, type Feature } from "ol";
import type { Coordinate } from "ol/coordinate";
import type { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { getArea } from "ol/sphere";

export function useVector() {
    const vectorSource = new VectorSource()
    const vectorLayer = new VectorLayer({
        source: vectorSource
    })

    // 팝업
    const popupRef = ref<HTMLElement | null>(null)
    const popupContentRef = ref<HTMLElement | null>(null)
    const closerRef = ref<HTMLElement | null>(null)
    const overlay = shallowRef<Overlay>()

    function clearVectorSource() {
        vectorSource.clear()
    }

    function setVectorLayer(feature: Feature<Geometry>) {
        vectorSource.clear()
        vectorSource.addFeature(feature)
    }
    return { vectorLayer, setVectorLayer, clearVectorSource }
}