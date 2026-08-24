<template>
  <div v-if="enabled" class="pointer-effects" aria-hidden="true">
    <span
      class="pointer-hover-ring"
      :class="{ 'is-visible': isInteractive }"
      :style="pointerStyle"
    />
    <span
      v-for="particle in particles"
      :key="particle.id"
      class="pointer-particle"
      :style="particleStyle(particle)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Particle = {
  id: number
  x: number
  y: number
  angle: number
  distance: number
  size: number
  color: string
  rotation: number
}

const enabled = ref(false)
const isInteractive = ref(false)
const particles = ref<Particle[]>([])
const x = ref(0)
const y = ref(0)

let targetX = 0
let targetY = 0
let animationFrame = 0
let particleId = 0
let reducedMotion = false
let motionQuery: MediaQueryList | null = null

const pointerStyle = computed(() => ({ left: `${x.value}px`, top: `${y.value}px` }))

const particleStyle = (particle: Particle) => ({
  left: `${particle.x}px`,
  top: `${particle.y}px`,
  '--particle-distance-x': `${Math.cos(particle.angle) * particle.distance}px`,
  '--particle-distance-y': `${Math.sin(particle.angle) * particle.distance}px`,
  '--particle-color': particle.color,
  '--particle-rotation': `${particle.rotation}deg`,
  '--particle-size': `${particle.size}px`,
})

const animatePointer = () => {
  x.value += (targetX - x.value) * 0.32
  y.value += (targetY - y.value) * 0.32
  animationFrame = window.requestAnimationFrame(animatePointer)
}

const onPointerMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  targetX = event.clientX
  targetY = event.clientY
  if (!animationFrame) animationFrame = window.requestAnimationFrame(animatePointer)
}

const onPointerOver = (event: PointerEvent) => {
  const target = event.target instanceof Element ? event.target : null
  isInteractive.value = Boolean(target?.closest('a, button, [role="button"]'))
}

const onPointerOut = (event: PointerEvent) => {
  const nextTarget = event.relatedTarget instanceof Element ? event.relatedTarget : null
  isInteractive.value = Boolean(nextTarget?.closest('a, button, [role="button"]'))
}

const onPointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'touch' || event.button !== 0 || reducedMotion) return

  const colors = ['var(--journal-olive)', 'var(--journal-brown)', 'var(--apricot)']
  const burst = Array.from({ length: 4 }, () => ({
    id: ++particleId,
    x: event.clientX,
    y: event.clientY,
    angle: Math.random() * Math.PI * 2,
    distance: 12 + Math.random() * 10,
    size: 3 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.round(Math.random() * 90 - 45),
  }))

  particles.value = [...particles.value, ...burst].slice(-8)
  window.setTimeout(() => {
    const ids = new Set(burst.map((particle) => particle.id))
    particles.value = particles.value.filter((particle) => !ids.has(particle.id))
  }, 500)
}

const onMotionChange = (event: MediaQueryListEvent) => {
  reducedMotion = event.matches
  if (reducedMotion) particles.value = []
}

onMounted(() => {
  const pointerQuery = window.matchMedia('(pointer: fine) and (hover: hover)')
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionQuery.matches
  enabled.value = pointerQuery.matches

  if (!enabled.value) return

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerover', onPointerOver, { passive: true })
  window.addEventListener('pointerout', onPointerOut, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  animationFrame = window.requestAnimationFrame(animatePointer)

  motionQuery.addEventListener('change', onMotionChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerover', onPointerOver)
  window.removeEventListener('pointerout', onPointerOut)
  window.removeEventListener('pointerdown', onPointerDown)
  if (animationFrame) window.cancelAnimationFrame(animationFrame)
  motionQuery?.removeEventListener('change', onMotionChange)
})
</script>
