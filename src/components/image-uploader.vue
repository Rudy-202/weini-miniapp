<!-- components/image-uploader.vue -->
<template>
  <view class="uploader">
    <view class="uploader__list">
      <template v-for="(item, index) in fileList" :key="index">
        <view class="uploader__item">
          <image 
            class="uploader__image" 
            :src="item.url" 
            mode="aspectFill"
            @tap="previewImage(index)"
            :lazy-load="true"
          ></image>
          <view 
            class="uploader__delete" 
            @tap.stop="removeImage(index)"
          >×</view>
          <view v-if="item.status === 'uploading'" class="uploader__loading">
            <view class="uploader__spinner"></view>
          </view>
          <view v-if="item.status === 'error'" class="uploader__error">!</view>
        </view>
      </template>
      
      <view 
        v-if="showAddButton"
        class="uploader__add" 
        @tap="chooseImage"
      >
        <text class="uploader__icon">+</text>
        <text class="uploader__text">上传</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { uploadImage } from '../api/upload';

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 9
  }
});

const emit = defineEmits(['update:value', 'change']);

const fileList = ref(props.value.map(url => ({ url, status: 'done' })));
console.log('[image-uploader] Initial props.value:', JSON.stringify(props.value));
console.log('[image-uploader] Initial props.maxCount:', props.maxCount);
console.log('[image-uploader] Initial fileList.value (from props.value):', JSON.stringify(fileList.value));

// 计算属性，控制是否显示上传按钮
const showAddButton = computed(() => {
  const shouldShow = fileList.value.length < props.maxCount;
  console.log(`[image-uploader] showAddButton computed: fileList.length (${fileList.value.length}) < props.maxCount (${props.maxCount}) = ${shouldShow}`);
  return shouldShow;
});

// 监听外部v-model (props.value) 的变化
watch(() => props.value, (newValue) => {
  console.log('[image-uploader] props.value watcher triggered. newValue:', JSON.stringify(newValue));
  // Check if internal fileList (only done items) is already in sync
  const currentDoneUrls = fileList.value.filter(f => f.status === 'done').map(f => f.url);
  if (JSON.stringify(newValue) !== JSON.stringify(currentDoneUrls)) {
    console.log('[image-uploader] props.value changed and is different from current done URLs. Resetting fileList.');
    fileList.value = newValue.map(url => ({ url, status: 'done' }));
  } else {
    console.log('[image-uploader] props.value changed but seems in sync with done URLs. No change to fileList.');
  }
}, { deep: true });

// 选择图片优化，使用Promise.all并行上传
const chooseImage = async () => {
  try {
    const res = await uni.chooseImage({
      count: props.maxCount - fileList.value.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    });
    
    // 添加到文件列表
    const newFiles = res.tempFilePaths.map(path => ({
      url: path,
      status: 'uploading'
    }));
    
    const startIndex = fileList.value.length;
    fileList.value = [...fileList.value, ...newFiles];
    
    // 并行上传图片
    await Promise.all(newFiles.map((file, i) => 
      handleUpload(file, startIndex + i)
    ));
  } catch (e) {
    console.error('选择图片失败', e);
  }
};

// 上传图片
const handleUpload = async (file, index) => {
  try {
    // 图片压缩（如果有需要）
    // const compressedUrl = await compressImage(file.url);
    
    const result = await uploadImage(file.url);
    
    // 更新状态
    if (fileList.value[index]) {
      fileList.value[index] = {
        url: result.url,
        status: 'done'
      };
      
      emitChange();
    }
  } catch (e) {
    // 上传失败
    if (fileList.value[index]) {
      fileList.value[index].status = 'error';
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      });
    }
    console.error('上传失败', e);
  }
};

// 删除图片
const removeImage = (index) => {
  fileList.value.splice(index, 1);
  emitChange();
};

// 预览图片
const previewImage = (index) => {
  const urls = fileList.value.map(file => file.url);
  uni.previewImage({
    urls,
    current: urls[index]
  });
};

// 触发change事件
const emitChange = () => {
  const urls = fileList.value
    .filter(file => file.status === 'done')
    .map(file => file.url);
  
  emit('update:value', urls);
  emit('change', urls);
};

// Example of using onMounted for a log that runs once when component is ready
onMounted(() => {
  console.log('[image-uploader] Component mounted. Initial fileList length:', fileList.value.length, 'maxCount:', props.maxCount);
  // This will also trigger showAddButton computation log
});
</script>

<style lang="scss" scoped>
.uploader {
  &__list {
    display: flex;
    flex-wrap: wrap;
  }
  
  &__item, &__add {
    width: 200rpx;
    height: 200rpx;
    margin-right: 20rpx;
    margin-bottom: 20rpx;
    position: relative;
  }
  
  &__image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
  }
  
  &__delete {
    position: absolute;
    top: -20rpx;
    right: -20rpx;
    width: 40rpx;
    height: 40rpx;
    line-height: 40rpx;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 50%;
    font-size: 32rpx;
    z-index: 10;
  }
  
  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8rpx;
    z-index: 5;
  }
  
  &__error {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40rpx;
    height: 40rpx;
    line-height: 40rpx;
    text-align: center;
    background-color: #ff4d4f;
    color: #fff;
    border-radius: 50%;
    font-size: 24rpx;
    z-index: 5;
  }
  
  &__spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  &__add {
    border: 2rpx dashed #ddd;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  &__icon {
    font-size: 60rpx;
    color: #ddd;
    line-height: 1;
    margin-bottom: 10rpx;
  }
  
  &__text {
    font-size: 24rpx;
    color: #999;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style> 