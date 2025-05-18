## 1. 환경구축
- 프레임워크 : NuxtJS
    - 번들러 : vite(nuxt 기본 번들러)
    - 소스 구조
        - components/navigation/the-gnb.vue
        - composables/contatns.ts (일부 변수 상수로 등록하여 사용)
        - layouts/default.vue
        - pages/~.vue
        - ~~server/api/~~
    - 실행
        - npm i
        - npm run dev

- 변수명 컨벤션
    - 상수 : CONST_CONVENTION
    - 페이지 파일명 : page-convention
    - 컴포넌트 파일명 : component-convention
    - 변수명 : variableConvention

## 2. 지도 표시
- Map 인스턴스 생성
    - Map 객체는 DOM 접근이 필요하므로 onMounted() 내부에서 생성
    - 기본 레이어로 TileLayer(OSM) 삽입
    - View 설정: fromLonLat()로 중심 좌표 및 줌 설정
    - 불필요한 기본 컨트롤 제거 후 Zoom만 수동 삽입 (+,- 버튼 및 인증 마크가 지도 위에 오버랩 되어서)
- 주의점
    - Nuxt는 SSR이므로 클라이언트 이전 코드 실행 시 DOM이 없음.
    - onMounted에서 OpenLayers 객체 생성
    - Map/ol은 DOM 접근이 필요하여, shallowRef로 Map 참조(or client-only 사용)

## 3. WMS(Web Map Service) 사용
- zeroton 프록시 서버 이용해서 개발
- parameters : bbox, width, height
- TileLayer > 전체화면을 타일로 쪼개서 채우는 레이어
    - XYZ 소스를 사용하여 타일 단위로 WMS 요청 전송
        - tileUrlFunction : bbox를 구하고, image 생성을 위한 url을 반환
        - 위 url로 OL에서 GET 요청 보냄 
    - TileGrid를 통해 줌레벨 및 해상도 설정

## 4. WFS(Web Feature Service)를 사용, 토지 경계 표시
- zeroton 프록시 서버 이용해서 개발
- VectorSource, VectorLayer 사용
- 클릭한 위치를 기준으로 bbox 생성 후 WFS 요청(fetchWFSFeature)
- VectorSource의 addFeature()로 등록 -> VectorLayer에서 시각화

## 5. WFS를 사용한 지번 정보 표시
- Overlay 사용
- 팝업 HTML 생성
- 같은 위치 누르면 닫기 추가(feature 클릭된 상태면 vector 클리어로 팝업 종료)
- 초기 생성: onMounted에서 Overlay 생성 후 지도에 등록