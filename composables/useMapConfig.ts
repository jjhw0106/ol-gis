import { get } from 'ol/proj'

export function useMapConfig() {
  const projection = get('EPSG:3857')!
  const extent = projection.getExtent()!

  return { projection, extent }
}