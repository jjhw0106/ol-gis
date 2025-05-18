import type { Coordinate } from "ol/coordinate"

export interface PopupData {
    coordinate: Coordinate
    jibun: string
    addr: string  
    jiga: string
    area: string
}