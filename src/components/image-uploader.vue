<!-- components/image-uploader.vue -->
<template>
  <view class="uploader">
    <view class="uploader__list">
      <view 
        class="uploader__item" 
        v-for="(item, index) in fileList" 
        :key="index"
      >
        <image 
          class="uploader__image" 
          :src="item.url" 
          mode="aspectFill"
          @tap="previewImage(index)"
        ></image>
        <view 
          class="uploader__delete" 
          @tap.stop="removeImage(index)"
        >×</view>
      </view>
      
      <view 
        class="uploader__add" 
        v-if="fileList.length < maxCount"
        @tap="chooseImage"
      >
        <text class="uploader__icon">+</text>
        <text class="uploader__text">上传</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { uploadImage } from '@/api/upload';

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

// 监听value变化
watch(() => props.value, (newValue) => {
  fileList.value = newValue.map(url => ({ url, status: 'done' }));
});

// 选择图片
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
    
    fileList.value = [...fileList.value, ...newFiles];
    
    // 上传图片
    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = fileList.value.length - newFiles.length + i;
      await handleUpload(newFiles[i], fileIndex);
    }
  } catch (e) {
    console.error('选择图片失败', e);
  }
};

// 上传图片
const handleUpload = async (file, index) => {
  try {
    const result = await uploadImage(file.url);
    
    // 更新状态
    fileList.value[index] = {
      url: result.url,
      status: 'done'
    };
    
    emitChange();
  } catch (e) {
    // 上传失败
    fileList.value[index].status = 'error';
    uni.showToast({
      title: '上传失败',
      icon: 'none'
    });
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
}
</style> 