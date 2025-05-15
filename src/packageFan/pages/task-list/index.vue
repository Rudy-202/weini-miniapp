<template>
  <view class="task-list-container">
    <custom-navbar title="任务列表" />
    
    <!-- 搜索区域 (暂时移除sticky) -->
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
    
    <!-- 筛选标签 (暂时移除sticky) -->
    <scroll-view scroll-x class="filter-tags" show-scrollbar="false" enable-flex>
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
      enable-flex
      style=""
    >
      <!-- <view style="background-color: orange; color: white; padding: 10px; font-weight: bold;">
        STATIC TEST ELEMENT INSIDE SCROLL-VIEW
      </view> -->

      <template v-if="tasks.length > 0">
        <view class="task-item-wrap" v-for="(task, index) in tasks" :key="task.id">
          <TaskCard :task="task" @click="goToDetail(task.id)" />
        </view>
        <load-more :status="loadMoreStatus" />
      </template>
      <view v-else-if="!isLoading && tasks.length === 0" class="empty-tip" style="background-color: #eee;">
        <uni-icons type="info" size="50" color="#cccccc"></uni-icons>
        <text class="empty-text">暂无任务 (isLoading is false, tasks.length is 0)</text>
      </view>
      <view v-else-if="isLoading" class="empty-tip" style="background-color: #ddd;">
        <text class="empty-text">正在加载中... (isLoading is true)</text>
      </view>

    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import TaskCard from '../../../components/task-card.vue';
import { getTasks, TaskItem } from '../../../api/task';

// 定义一个更符合API实际返回和TaskCard期望的类型
interface DisplayableTask {
  id: string;
  title: string;
  description: string;
  points: number;
  status: string;
  deadline?: string; // API 返回 due_date
  isFocus?: boolean; // API 返回 is_focus_task
  // 可能还需要TaskItem中的其他字段，如果TaskCard需要的话
  startTime?: string;
  endTime?: string;
  images?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已过期', value: 'expired' }
];

// 响应式数据
const tasks = ref<DisplayableTask[]>([]);
const keyword = ref('');
const activeStatus = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(true);
const isRefreshing = ref(false);
const loadMoreStatus = ref<'more'|'loading'|'noMore'>('more');

// 获取任务列表
const fetchTasks = async (refresh = false) => {
  console.log('fetchTasks - refresh:', refresh);
  if (refresh) {
    page.value = 1;
    tasks.value = [];
    console.log('fetchTasks - tasks cleared for refresh');
  }
  
  isLoading.value = true;
  console.log('fetchTasks - isLoading set to true');

  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      status: activeStatus.value,
      keyword: keyword.value,
      orderBy: 'created_at_desc'
    };
    
    console.log('fetchTasks - 请求参数:', JSON.stringify(params));
    
    const res: any = await getTasks(params); 
    console.log('fetchTasks - 原始API响应:', JSON.stringify(res));
    
    let rawItems: any[] = []; 
    let totalCount = 0;

    if (res && typeof res === 'object' && res.data && Array.isArray(res.data.list)) {
      rawItems = res.data.list;
      totalCount = res.data.total || rawItems.length;
      console.log('fetchTasks - 成功提取原始rawItems:', JSON.stringify(rawItems));
      console.log('fetchTasks - 任务总数:', totalCount);
    } else {
      console.error('fetchTasks - API响应data.list不是数组或不存在:', res.data);
      rawItems = [];
      totalCount = 0;
    }
    
    const mappedItems: DisplayableTask[] = rawItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      points: item.points,
      status: item.status,
      deadline: item.due_date,
      isFocus: item.is_focus_task,
    }));
    console.log('fetchTasks - 转换后的mappedItems:', JSON.stringify(mappedItems));
    
    if (refresh) {
      tasks.value = mappedItems;
    } else {
      tasks.value = [...tasks.value, ...mappedItems];
    }
    console.log('fetchTasks - 更新后的tasks.value (length):', tasks.value.length);
    console.log('fetchTasks - 更新后的tasks.value (content):', JSON.stringify(tasks.value));

    total.value = totalCount;
    if (tasks.value.length >= total.value) {
      loadMoreStatus.value = 'noMore';
    } else if (rawItems.length === 0 && page.value > 1) {
      loadMoreStatus.value = 'noMore';
    } else {
      loadMoreStatus.value = 'more';
    }
    console.log('fetchTasks - loadMoreStatus:', loadMoreStatus.value);

  } catch (error) {
    console.error('fetchTasks - 获取任务列表失败:', error);
    tasks.value = [];
    total.value = 0;
    loadMoreStatus.value = 'more';
    uni.showToast({
      title: '加载任务失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
    console.log('fetchTasks - finally block, isLoading:', isLoading.value, 'isRefreshing:', isRefreshing.value);
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
  if(isRefreshing.value) return;
  console.log('onRefresh triggered');
  isRefreshing.value = true;
  fetchTasks(true);
};

// 加载更多
const loadMore = () => {
  console.log('loadMore triggered - status:', loadMoreStatus.value, 'isLoading:', isLoading.value);
  if (loadMoreStatus.value === 'noMore' || isLoading.value || isRefreshing.value) return;
  
  page.value++;
  console.log('loadMore - page incremented to:', page.value);
  fetchTasks();
};

// 跳转到详情页
const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/packageFan/pages/task-detail/index?id=${id}`
  });
};

onMounted(() => {
  console.log('onMounted - 组件已挂载, 初始调用 fetchTasks');
  fetchTasks(true);
});
</script>

<style lang="scss" scoped>
.task-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  position: relative; 
}

.search-bar {
  padding: 10px 15px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  
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
  position: sticky;
  top: 56px;
  z-index: 10;
  
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
  overflow-y: auto; 
  
  .task-item-wrap {
    padding: 0; 
  }
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 50px;
  text-align: center;
  
  .empty-text {
    font-size: 14px;
    color: #555;
    margin-top: 10px;
  }
}
</style> 