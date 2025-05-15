<template>
  <view class="task-list-container">
    <custom-navbar title="任务列表" />
    
    <!-- 搜索区域 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input 
          class="search-input" 
          placeholder="搜索任务" 
          v-model="keyword"
          confirm-type="search"
          @confirm="onSearch"
        />
        <uni-icons v-if="keyword" type="clear" size="18" color="#999" @click="keyword = ''"></uni-icons>
      </view>
    </view>
    
    <!-- 筛选标签 -->
    <scroll-view scroll-x class="filter-tags" show-scrollbar="false">
      <view 
        class="tag-item" 
        :class="{ active: activeStatus === status.value }"
        v-for="status in statusOptions" 
        :key="status.value"
        @tap="changeStatus(status.value)"
      >
        {{ status.label }}
      </view>
    </scroll-view>
    
    <!-- 任务列表 -->
    <scroll-view
      scroll-y
      class="task-list"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <template v-if="tasks.length > 0">
        <view class="task-item-wrap" v-for="task in tasks" :key="task.id">
          <task-card 
            :task="task"
            @tap="goToDetail(task.id)"
          />
        </view>
        <load-more :status="loadMoreStatus" />
      </template>
      <view v-else-if="!isLoading" class="empty-tip">
        <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无任务</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { getTasks, TaskItem } from '@/api/task';

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已过期', value: 'expired' }
];

// 响应式数据
const tasks = ref<TaskItem[]>([]);
const keyword = ref('');
const activeStatus = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const isRefreshing = ref(false);
const loadMoreStatus = ref<'more'|'loading'|'noMore'>('more');

// 获取任务列表
const fetchTasks = async (refresh = false) => {
  if (refresh) {
    page.value = 1;
    tasks.value = [];
  }
  
  try {
    isLoading.value = true;
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      status: activeStatus.value,
      keyword: keyword.value
    };
    
    const res = await getTasks(params);
    
    if (refresh) {
      tasks.value = res.items;
    } else {
      tasks.value = [...tasks.value, ...res.items];
    }
    
    total.value = res.total;
    
    // 更新加载更多状态
    loadMoreStatus.value = tasks.value.length >= total.value ? 'noMore' : 'more';
  } catch (error) {
    console.error('获取任务列表失败', error);
    uni.showToast({
      title: '加载任务失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

// 搜索事件
const onSearch = () => {
  fetchTasks(true);
};

// 切换状态筛选
const changeStatus = (status: string) => {
  if (activeStatus.value !== status) {
    activeStatus.value = status;
    fetchTasks(true);
  }
};

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true;
  fetchTasks(true);
};

// 加载更多
const loadMore = () => {
  if (loadMoreStatus.value === 'noMore' || isLoading.value) return;
  
  loadMoreStatus.value = 'loading';
  page.value++;
  fetchTasks();
};

// 跳转到详情页
const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/packageFan/pages/task-detail/index?id=${id}`
  });
};

onMounted(() => {
  fetchTasks();
});
</script>

<style lang="scss" scoped>
.task-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  padding: 10px 15px;
  background-color: #fff;
  
  .search-input-wrap {
    display: flex;
    align-items: center;
    padding: 0 10px;
    height: 36px;
    background-color: #f0f0f0;
    border-radius: 18px;
    
    .search-input {
      flex: 1;
      height: 36px;
      margin: 0 10px;
      font-size: 14px;
    }
  }
}

.filter-tags {
  display: flex;
  padding: 10px 15px;
  background-color: #fff;
  white-space: nowrap;
  
  .tag-item {
    display: inline-block;
    padding: 6px 12px;
    margin-right: 10px;
    border-radius: 16px;
    font-size: 12px;
    background-color: #f0f0f0;
    color: #666;
    
    &.active {
      background-color: rgba(0, 122, 255, 0.1);
      color: #007aff;
      font-weight: 500;
    }
  }
}

.task-list {
  flex: 1;
  
  .task-item-wrap {
    padding: 10px 15px;
  }
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
  
  .empty-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
  }
  
  .empty-text {
    font-size: 14px;
    color: #999;
  }
}
</style> 