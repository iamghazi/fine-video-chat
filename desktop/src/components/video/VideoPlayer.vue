<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import VuePlyr from 'vue-plyr'
import 'plyr/dist/plyr.css'

interface TimeSegment {
  start: number
  end: number
}

interface Props {
  src: string
  startTime?: number
  highlightSegments?: TimeSegment[]
  autoplay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  startTime: 0,
  highlightSegments: () => [],
  autoplay: false
})

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  timeUpdate: [currentTime: number]
  error: [error: Error]
  ready: []
}>()

const playerRef = ref<InstanceType<typeof VuePlyr> | null>(null)
const isReady = ref(false)

// Plyr options
const plyrOptions = {
  controls: [
    'play-large',
    'play',
    'progress',
    'current-time',
    'duration',
    'mute',
    'volume',
    'settings',
    'fullscreen'
  ],
  keyboard: {
    focused: true,
    global: true
  },
  tooltips: {
    controls: true,
    seek: true
  },
  settings: ['quality', 'speed'],
  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
  quality: {
    default: 720,
    options: [1080, 720, 480, 360]
  }
}

// Get underlying Plyr player instance
const getPlayer = () => {
  return playerRef.value?.player
}

// Seek to specific time
const seekTo = (time: number) => {
  const player = getPlayer()
  if (player) {
    player.currentTime = time
  }
}

// Play video
const play = () => {
  const player = getPlayer()
  if (player) {
    player.play()
  }
}

// Pause video
const pause = () => {
  const player = getPlayer()
  if (player) {
    player.pause()
  }
}

// Event handlers
const onReady = () => {
  isReady.value = true
  emit('ready')

  // Seek to start time if specified
  if (props.startTime > 0) {
    nextTick(() => {
      seekTo(props.startTime)
    })
  }
}

const onPlay = () => {
  emit('play')
}

const onPause = () => {
  emit('pause')
}

const onEnded = () => {
  emit('ended')
}

const onTimeUpdate = (event: Event) => {
  const player = getPlayer()
  if (player) {
    emit('timeUpdate', player.currentTime)
  }
}

const onError = (event: Event) => {
  const error = new Error('Video playback error')
  emit('error', error)
  console.error('Video playback error:', event)
}

// Watch for src changes
watch(
  () => props.src,
  (newSrc) => {
    console.log('🎥 Video source changed:', newSrc)
    isReady.value = false
  },
  { immediate: true }
)

// Watch for startTime changes (for seeking to search result timestamps)
watch(
  () => props.startTime,
  (newTime) => {
    if (isReady.value && newTime > 0) {
      seekTo(newTime)
    }
  }
)

// Expose methods to parent components
defineExpose({
  seekTo,
  play,
  pause,
  getPlayer
})
</script>

<template>
  <div class="video-player-container">
    <vue-plyr
      ref="playerRef"
      :options="plyrOptions"
      @ready="onReady"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @error="onError"
    >
      <video :src="src" :autoplay="autoplay" />
    </vue-plyr>

    <!-- Optional: Highlight segments overlay -->
    <div v-if="highlightSegments.length > 0" class="segments-overlay">
      <!-- This could be used to show highlighted regions on the progress bar -->
      <!-- Implementation can be added later if needed -->
    </div>
  </div>
</template>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Plyr overrides for Tailwind compatibility */
:deep(.plyr) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.plyr__video-wrapper) {
  background: #000;
}

/* Custom segment highlighting (if needed later) */
.segments-overlay {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  height: 4px;
  pointer-events: none;
  z-index: 10;
}
</style>
