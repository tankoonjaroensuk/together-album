<template>
  <!-- Prints hang from a sagging string. Drag the string, tap a print or use the arrow keys to bring one to the centre -->
  <div
    ref="rootElement"
    class="polaroid-line relative w-full cursor-grab touch-pan-y select-none overflow-hidden focus-visible:outline-2 focus-visible:outline-gold"
    :class="{ 'cursor-grabbing': isDragging }"
    :style="{ height: `${rootHeight}px`, '--card-width': `${cardWidth}px` }"
    role="region"
    aria-roledescription="carousel"
    aria-label="รูปที่เลือกไว้และช่องเพิ่มรูป"
    tabindex="0"
    @keydown.arrow-left.prevent="showNeighbour(-1)"
    @keydown.arrow-right.prevent="showNeighbour(1)"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
  >
    <svg class="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
      <path ref="stringElement" fill="none" stroke="var(--color-silver)" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- The first print on the string is an empty one for adding photos, so picking and reviewing happen on the same line -->
    <div
      v-if="hasAddCard"
      :ref="element => setCardElement(element, 0)"
      class="polaroid-card absolute left-0 top-0"
      data-index="0"
      :data-active="activeIndex === 0"
    >
      <div class="polaroid-print mt-2.5 bg-white px-2.5 pt-2.5 shadow-lg shadow-charcoal/25">
        <slot name="add-card" />
      </div>
      <div class="polaroid-peg" />
    </div>

    <div
      v-for="(photo, photoIndex) in photos"
      :key="photo.id"
      :ref="element => setCardElement(element, photoIndex + addCardCount)"
      class="polaroid-card absolute left-0 top-0"
      :data-index="photoIndex + addCardCount"
      data-photo
      :data-active="photoIndex + addCardCount === activeIndex"
      :aria-hidden="photoIndex + addCardCount === activeIndex ? undefined : true"
    >
      <div class="polaroid-print mt-2.5 bg-white px-2.5 pt-2.5 shadow-lg shadow-charcoal/25">
        <div class="aspect-square overflow-hidden bg-silver-light">
          <img :src="photo.src" :alt="photo.alt" class="size-full object-cover" draggable="false">
        </div>
        <!-- The blank strip at the bottom of an instant print doubles as its upload status -->
        <div class="flex h-11 items-center justify-between gap-3 px-1 text-sm text-taupe">
          <div
            v-if="photo.status === 'uploading'"
            class="h-1.5 flex-1 overflow-hidden rounded-full bg-charcoal/10"
            role="progressbar"
            aria-label="กำลังอัปโหลดรูป"
            :aria-valuenow="Math.round((photo.progress ?? 0) * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="h-full rounded-full bg-gold transition-[width] duration-150" :style="{ width: `${(photo.progress ?? 0) * 100}%` }" />
          </div>
          <p v-else-if="photo.status === 'uploaded'" class="flex items-center gap-1.5">
            <check-icon class="size-4 text-gold" />
            ส่งแล้ว
          </p>
          <template v-else-if="photo.status === 'failed'">
            <p>ส่งไม่สำเร็จ</p>
            <button
              type="button"
              class="flex min-h-11 items-center px-2 font-semibold text-charcoal underline decoration-gold decoration-2 underline-offset-4"
              data-no-drag
              @click="emit('retry', photo.id)"
            >
              ลองใหม่
            </button>
          </template>
        </div>
      </div>
      <div class="polaroid-peg" />
    </div>

    <p v-if="photos.length" class="sr-only" aria-live="polite">
      {{ isAddCardActive ? 'เพิ่มรูปใหม่' : `รูปที่ ${activeIndex - addCardCount + 1} จาก ${photos.length}` }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PhotoUploadStatus } from '~/composables/use-photo-upload'
import {
  clamp,
  getNearestIndex,
  getStringY,
  stepSpring,
  stepSwing,
} from '~/utils/polaroid-line-physics'

export interface CarouselPhoto {
  id: string
  src: string
  alt: string
  /** Shown in the blank strip under the photo; photos without a status are plain prints */
  status?: PhotoUploadStatus
  /** 0 to 1 while the photo is uploading */
  progress?: number
}

const props = defineProps<{ photos: CarouselPhoto[] }>()
const emit = defineEmits<{ retry: [photoId: string] }>()

const MAX_CARD_WIDTH_PX = 260
const MIN_CARD_WIDTH_PX = 150
const CARD_WIDTH_RATIO_OF_ROOT = 0.58
const CARD_SPACING_RATIO = 1.08
const STRING_ANCHOR_Y_PX = 36
const STRING_SAG_PX = 34
const PEG_OVERLAP_PX = 6
// Room under the string for the print: its frame, photo and blank strip, plus a little air below
const PRINT_FRAME_EXTRA_PX = 90
const DRAG_START_THRESHOLD_PX = 5
// How far the release velocity carries the line before it settles on a print
const FLING_DISTANCE_MS = 180
const MAX_FRAME_SECONDS = 0.033
const MS_PER_SECOND = 1000
const IDLE_SWAY_RAD = 0.0009
// How far past the first or last print the line can be dragged, as a share of the drag distance
const OVERSCROLL_RESISTANCE = 0.35

interface DragState {
  startX: number
  startOffset: number
  lastX: number
  lastTimeStamp: number
  velocityPxPerMs: number
  hasMoved: boolean
}

const slots = useSlots()
const hasAddCard = computed(() => Boolean(slots['add-card']))
// The empty print for adding photos comes first, so the photo at position n hangs at index n + addCardCount
const addCardCount = computed(() => (hasAddCard.value ? 1 : 0))
const printCount = computed(() => props.photos.length + addCardCount.value)
// Photos arrive newest first, so the first one hangs right next to the empty print
const newestPhotoIndex = computed(() => Math.min(addCardCount.value, printCount.value - 1))

const rootElement = ref<HTMLElement | null>(null)
const stringElement = ref<SVGPathElement | null>(null)
const cardElements: (HTMLElement | null)[] = []

const rootWidth = ref(360)
const activeIndex = ref(0)
const isDragging = ref(false)
const isAddCardActive = computed(() => hasAddCard.value && activeIndex.value === 0)

const cardWidth = computed(() => Math.round(clamp(rootWidth.value * CARD_WIDTH_RATIO_OF_ROOT, MIN_CARD_WIDTH_PX, MAX_CARD_WIDTH_PX)))
const cardSpacing = computed(() => cardWidth.value * CARD_SPACING_RATIO)
const rootHeight = computed(() => STRING_ANCHOR_Y_PX + STRING_SAG_PX + cardWidth.value + PRINT_FRAME_EXTRA_PX)

// The line's position is simulated outside Vue's reactivity and written straight to the DOM every frame
const lineState = { offset: 0, velocity: 0, target: 0 }
const swingAngles: number[] = []
const swingVelocities: number[] = []
let dragState: DragState | null = null
let animationFrameId = 0

function setCardElement(element: unknown, index: number) {
  cardElements[index] = element as HTMLElement | null
}

function showPhotoAt(index: number) {
  lineState.target = clamp(index, 0, printCount.value - 1) * cardSpacing.value
}

function showNeighbour(step: number) {
  showPhotoAt(activeIndex.value + step)
}

function startDrag(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('[data-no-drag]')) return
  dragState = {
    startX: event.clientX,
    startOffset: lineState.offset,
    lastX: event.clientX,
    lastTimeStamp: event.timeStamp,
    velocityPxPerMs: 0,
    hasMoved: false,
  }
}

function moveDrag(event: PointerEvent) {
  if (!dragState) return
  const dragDistance = event.clientX - dragState.startX

  if (!dragState.hasMoved && Math.abs(dragDistance) > DRAG_START_THRESHOLD_PX) {
    dragState.hasMoved = true
    isDragging.value = true
    rootElement.value?.setPointerCapture(event.pointerId)
  }
  if (!dragState.hasMoved) return

  const elapsedMs = Math.max(1, event.timeStamp - dragState.lastTimeStamp)
  // Smoothing the velocity keeps one jittery event from throwing the line on release
  dragState.velocityPxPerMs = 0.7 * ((event.clientX - dragState.lastX) / elapsedMs) + 0.3 * dragState.velocityPxPerMs
  dragState.lastX = event.clientX
  dragState.lastTimeStamp = event.timeStamp

  const lastPrintOffset = (printCount.value - 1) * cardSpacing.value
  let offset = dragState.startOffset - dragDistance
  if (offset < 0) offset *= OVERSCROLL_RESISTANCE
  if (offset > lastPrintOffset) offset = lastPrintOffset + (offset - lastPrintOffset) * OVERSCROLL_RESISTANCE
  lineState.offset = offset
}

function endDrag(event: PointerEvent) {
  const finishedDrag = dragState
  dragState = null
  if (!finishedDrag) return

  if (finishedDrag.hasMoved) {
    isDragging.value = false
    lineState.velocity = -finishedDrag.velocityPxPerMs * MS_PER_SECOND
    showPhotoAt(getNearestIndex(lineState.offset - finishedDrag.velocityPxPerMs * FLING_DISTANCE_MS, cardSpacing.value, printCount.value))
    return
  }

  const tappedCard = (event.target as HTMLElement).closest<HTMLElement>('[data-index]')
  if (tappedCard) showPhotoAt(Number(tappedCard.dataset.index))
}

function startAnimation(prefersReducedMotion: boolean) {
  let previousTime = performance.now()

  function drawFrame(now: number) {
    const deltaSeconds = Math.min(MAX_FRAME_SECONDS, (now - previousTime) / MS_PER_SECOND)
    previousTime = now

    const width = rootWidth.value
    const spacing = cardSpacing.value
    const swingGain = prefersReducedMotion ? 0 : 1

    let lineVelocity: number
    if (dragState?.hasMoved) {
      lineVelocity = dragState.velocityPxPerMs * MS_PER_SECOND
    } else {
      const offsetBefore = lineState.offset
      ;[lineState.offset, lineState.velocity] = stepSpring(lineState.offset, lineState.velocity, lineState.target, deltaSeconds)
      lineVelocity = -(lineState.offset - offsetBefore) / Math.max(deltaSeconds, 1e-3)
    }

    const nearestIndex = getNearestIndex(lineState.offset, spacing, printCount.value)
    cardElements.forEach((card, index) => {
      if (!card) return
      const centreX = width / 2 + index * spacing - lineState.offset
      const isOffScreen = centreX < -cardWidth.value * 1.5 || centreX > width + cardWidth.value * 1.5
      card.style.visibility = isOffScreen ? 'hidden' : 'visible'
      if (isOffScreen) return

      let angle = swingAngles[index] ?? 0
      let angularVelocity = swingVelocities[index] ?? 0
      ;[angle, angularVelocity] = stepSwing(angle, angularVelocity, lineVelocity, deltaSeconds, swingGain)
      swingAngles[index] = angle
      swingVelocities[index] = angularVelocity
      // A light breeze keeps the prints swaying even when the line is at rest
      const sway = prefersReducedMotion ? 0 : Math.sin(now / 1300 + index * 1.7) * IDLE_SWAY_RAD

      const y = getStringY(centreX, width, STRING_ANCHOR_Y_PX, STRING_SAG_PX) - PEG_OVERLAP_PX
      card.style.transform = `translate(${(centreX - cardWidth.value / 2).toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(angle + sway).toFixed(4)}rad)`
      card.style.zIndex = String(index === nearestIndex ? printCount.value + 1 : printCount.value - Math.abs(index - nearestIndex))
    })

    stringElement.value?.setAttribute(
      'd',
      `M0 ${STRING_ANCHOR_Y_PX} Q${width / 2} ${STRING_ANCHOR_Y_PX + 2 * STRING_SAG_PX} ${width} ${STRING_ANCHOR_Y_PX}`,
    )

    if (nearestIndex !== activeIndex.value) activeIndex.value = nearestIndex
    animationFrameId = requestAnimationFrame(drawFrame)
  }

  animationFrameId = requestAnimationFrame(drawFrame)
}

// The line slides over to a newly added photo, which sits right beside the empty print
watch(() => props.photos.length, (photoCount, previousCount) => {
  cardElements.length = printCount.value
  swingAngles.length = printCount.value
  swingVelocities.length = printCount.value
  if (photoCount > previousCount) showPhotoAt(newestPhotoIndex.value)
})

// Keep the line on the same print when a resize changes the spacing
watch(cardSpacing, () => {
  lineState.offset = activeIndex.value * cardSpacing.value
  lineState.target = lineState.offset
})

let resizeObserver: ResizeObserver | undefined
let visibilityObserver: IntersectionObserver | undefined

onMounted(() => {
  const root = rootElement.value
  if (!root) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  rootWidth.value = root.getBoundingClientRect().width
  resizeObserver = new ResizeObserver(([entry]) => {
    rootWidth.value = entry?.contentRect.width ?? rootWidth.value
  })
  resizeObserver.observe(root)

  // Start on the empty print: it is where a guest begins, whatever is already on the string
  showPhotoAt(0)
  lineState.offset = lineState.target
  activeIndex.value = getNearestIndex(lineState.offset, cardSpacing.value, printCount.value)

  // Draws right away so the prints are already in place when scrolled into view, then pauses while out of view
  startAnimation(prefersReducedMotion)
  visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !animationFrameId) {
      startAnimation(prefersReducedMotion)
    } else if (!entry?.isIntersecting) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
  })
  visibilityObserver.observe(root)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
})
</script>

<style scoped>
.polaroid-card {
  width: var(--card-width);
  transform-origin: 50% 0;
  will-change: transform;
}

.polaroid-print {
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), filter 0.5s ease;
}

/* A photo that was just picked drops onto the string */
.polaroid-card[data-photo] .polaroid-print {
  animation: print-drop 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.2) both;
}

@keyframes print-drop {
  from {
    opacity: 0;
    translate: 0 -2.5rem;
  }
}

/* Prints that are not in the middle sit slightly back and a little faded */
.polaroid-card[data-active='false'] .polaroid-print {
  transform: scale(0.9);
  filter: saturate(0.7) brightness(0.96);
}

.polaroid-peg {
  position: absolute;
  left: 50%;
  top: 0;
  width: 10px;
  height: 26px;
  margin-left: -5px;
  border-radius: 2px;
  background: linear-gradient(90deg, #c9a67a, #e3c9a1 45%, #b8915f);
  box-shadow: 0 2px 3px rgb(0 0 0 / 0.25);
}

@media (prefers-reduced-motion: reduce) {
  .polaroid-print {
    transition: none;
  }

  .polaroid-card[data-photo] .polaroid-print {
    animation: none;
  }
}
</style>
