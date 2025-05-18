import { Feature } from 'ol';
import { MultiPolygon } from 'ol/geom'
import { getArea } from 'ol/sphere'
import type { FeatureCollection } from '~/types/feature';


export function useWFS() {
  async function fetchWFSFeature(coordinate: number[]) {
    const bbox = [...coordinate, ...coordinate]
    const url = `https://assign.zeroton.co/api/wfs?bbox=${bbox}`;

    try {
      const response = await fetch(url)
      const data: FeatureCollection = await response.json();

      if (!data) {
        return undefined;
      }

      const features = data.features.map(f => {
        return new Feature({
          ...f.properties,
          geometry: new MultiPolygon(f.geometry.coordinates)
        })
      })
      
      return features
    } catch (err) {
      console.error('WFS 요청 실패:', err);
      return undefined;
    }
  }

  return { fetchWFSFeature }

}