import { View } from 'ol'
import Map from 'ol/Map'
import Zoom from 'ol/control/Zoom'
import type { Extent } from 'ol/extent'
import TileLayer from 'ol/layer/Tile'
import { fromLonLat, get } from 'ol/proj'
import { OSM } from 'ol/source'
import { TileGrid } from 'ol/tilegrid'


export function useBaseLayer() {

  const baseLayer = new TileLayer({source: new OSM()})

  return {
    baseLayer,
  }
}