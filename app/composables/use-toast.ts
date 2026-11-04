const DEFAULT_TOAST_DURATION_MS = 4500

let hideTimer: ReturnType<typeof setTimeout> | undefined

export function useToast() {
  const toastMessage = useState('toast-message', () => '')

  function showToast(message: string, durationMs = DEFAULT_TOAST_DURATION_MS) {
    clearTimeout(hideTimer)
    toastMessage.value = message
    hideTimer = setTimeout(() => {
      toastMessage.value = ''
    }, durationMs)
  }

  return { toastMessage, showToast }
}
