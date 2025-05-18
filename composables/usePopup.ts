import Overlay from 'ol/Overlay'
import { shallowRef, ref } from 'vue'
import type { PopupData } from '~/types/popup_data'

const popupData = ref<PopupData | null>(null)
// 팝업
const popupRef = ref<HTMLElement | null>(null)
const popupContentRef = ref<HTMLElement | null>(null)
const closerRef = ref<HTMLElement | null>(null)
const overlay = shallowRef<Overlay>()

export function usePopup() {
  onMounted(() => {
    overlay.value = new Overlay({
      element: document.getElementById('map-popup')!,
      autoPan: true,
    })
  })

  function setPopupData(data: PopupData) {
    popupData.value = data
    overlay.value?.setPosition(data.coordinate)
  }

  function closePopup() {
    overlay.value?.setPosition(undefined)
    return false
  }
  return {
    popupRef,
    popupContentRef,
    closerRef,
    closePopup,
    overlay,
    // popupData,
    // setPopupData,
    // closePopup
  }
}