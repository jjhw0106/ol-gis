export interface FeatureCollection {
  features: Feature[];
}

export interface Feature {
  bbox: number[];
  geometry: Geometry;
  geometry_name: string;
  id: string;
  properties: FeatureProperties;
  type: "Feature";
}

export interface Geometry {
  type: "MultiPolygon";
  coordinates: number[][][][]; 
}

export interface FeatureProperties {
  addr: string;
  bchk: string;
  bonbun: string;
  bubun: string;
  ctp_nm: string;
  emd_nm: string;
  gosi_month: string;
  gosi_year: string;
  jibun: string;
  jiga: string;
  li_nm: string;
  pnu: string;
  sig_nm: string;
  std_sggcd: string;
}
