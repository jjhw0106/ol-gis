import type { Map } from 'ol'
import { get } from 'ol/proj'
import { defineStore } from 'pinia'

const map = shallowRef<Map>()
const projection = get('EPSG:3857')
const extent = projection?.getExtent()

export const useProjectionStore = defineStore('projection', () => {

})