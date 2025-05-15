<template>
  <view class="virtual-list" :style="{ height: height + 'px' }">
    <view 
      class="virtual-list__content" 
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <slot 
        v-for="item in visibleItems" 
        :key="item.index" 
        :item="item.data" 
        :index="item.index"
      ></slot>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    default: 500
  },
  buffer: {
    type: Number,
    default: 5 // 上下各缓冲多少个条目
  }
});

const scrollTop = ref(0);
const visibleCount = computed(() => Math.ceil(props.height / props.itemHeight) + props.buffer * 2);

// 计算可见项
const visibleItems = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer);
  const end = Math.min(props.items.length, start + visibleCount.value);
  
  return Array.from({ length: end - start }, (_, i) => ({
    data: props.items[start + i],
    index: start + i
  }));
});

// 计算偏移量
const offsetY = computed(() => {
  if (visibleItems.value.length === 0) return 0;
  const firstIndex = visibleItems.value[0].index;
  return firstIndex * props.itemHeight;
});

// 监听滚动事件
onMounted(() => {
  const handleScroll = (e) => {
    scrollTop.value = e.detail.scrollTop;
  };
  
  uni.createSelectorQuery()
    .select('.virtual-list')
    .node()
    .exec((res) => {
      if (res[0]) {
        res[0].addEventListener('scroll', handleScroll);
      }
    });
});
</script>

<style lang="scss" scoped>
.virtual-list {
  overflow-y: auto;
  position: relative;
  
  &__content {
    position: absolute;
    width: 100%;
    will-change: transform;
  }
}
</style> 