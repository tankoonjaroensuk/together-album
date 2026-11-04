<template>
  <!-- Always in the DOM so screen readers announce the message when it changes; sits above the phone's home indicator -->
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    role="status"
    aria-live="polite"
  >
    <Transition name="toast">
      <p
        v-if="toastMessage"
        :key="toastMessage"
        class="max-w-sm rounded-2xl bg-charcoal px-5 py-3 text-center text-sm text-ivory shadow-lg shadow-charcoal/30"
      >
        {{ toastMessage }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { toastMessage } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
