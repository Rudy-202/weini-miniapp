<template>
  <div class="flame-container" :class="{ 'active': isActive }">
    <div class="flame" v-for="n in 3" :key="n" :style="{ animationDelay: `${n * 0.2}s` }"></div>
  </div>
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.flame-container {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flame {
  position: absolute;
  width: 20px;
  height: 20px;
  background: linear-gradient(to top, #ff4d4d, #ff8533);
  border-radius: 50% 50% 20% 20%;
  transform-origin: bottom center;
  opacity: 0;
  animation: flame 1.5s ease-in-out infinite;
}

.flame:nth-child(1) {
  transform: scale(1) rotate(-5deg);
}

.flame:nth-child(2) {
  transform: scale(0.8) rotate(5deg);
}

.flame:nth-child(3) {
  transform: scale(0.6) rotate(-2deg);
}

@keyframes flame {
  0%, 100% {
    transform: scale(1) translateY(0);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2) translateY(-5px);
    opacity: 1;
  }
}

.active .flame {
  opacity: 0.8;
}
</style>
