<template>
  <view class="ranking-container">
    <custom-navbar title="排行榜" />
    
    <!-- 排行榜类型切换 -->
    <view class="ranking-tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeType === type.value }"
        v-for="type in rankingTypes" 
        :key="type.value"
        @tap="changeRankingType(type.value)"
      >
        {{ type.label }}
      </view>
    </view>
    
    <!-- 排行榜内容 -->
    <scroll-view
      scroll-y
      class="ranking-content"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <template v-if="rankings.length > 0">
        <!-- 前三名展示 -->
        <view class="top-three" v-if="activeType !== 'personal'">
          <view class="rank-second" v-if="rankings.length > 1">
            <view class="avatar-wrap">
              <image class="avatar" :src="rankings[1].avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
              <view class="rank-tag rank-2">2</view>
            </view>
            <view class="username">{{ rankings[1].nickname }}</view>
            <view class="score">{{ rankings[1].points }} 积分</view>
          </view>
          
          <view class="rank-first" v-if="rankings.length > 0">
            <view class="crown-icon">👑</view>
            <view class="avatar-wrap">
              <image class="avatar" :src="rankings[0].avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
              <view class="rank-tag rank-1">1</view>
            </view>
            <view class="username">{{ rankings[0].nickname }}</view>
            <view class="score">{{ rankings[0].points }} 积分</view>
          </view>
          
          <view class="rank-third" v-if="rankings.length > 2">
            <view class="avatar-wrap">
              <image class="avatar" :src="rankings[2].avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
              <view class="rank-tag rank-3">3</view>
            </view>
            <view class="username">{{ rankings[2].nickname }}</view>
            <view class="score">{{ rankings[2].points }} 积分</view>
          </view>
        </view>
        
        <!-- 排行榜列表 -->
        <view class="ranking-list">
          <template v-if="activeType !== 'personal'">
            <rank-item
              v-for="(item, index) in rankings.slice(3)"
              :key="item.id"
              :rank="index + 4"
              :nickname="item.nickname"
              :avatar="item.avatar"
              :points="item.points"
              :is-self="item.isSelf"
            />
          </template>
          <template v-else>
            <rank-item
              v-for="(item, index) in rankings"
              :key="item.id"
              :rank="index + 1"
              :nickname="item.nickname"
              :avatar="item.avatar"
              :points="item.points"
              :is-self="item.isSelf"
            />
          </template>
        </view>
        
        <view class="ranking-footer">
          <text>数据每日更新，截至 {{ updateTime }}</text>
        </view>
      </template>
      
      <view v-else-if="!isLoading" class="empty-tip">
        <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无排行数据</text>
      </view>
      
      <view v-else class="loading-container">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRankings } from '@/api/task';

// 排行榜类型
const rankingTypes = [
  { label: '本周排行', value: 'weekly' },
  { label: '本月排行', value: 'monthly' },
  { label: '总榜', value: 'all' },
  { label: '我的排名', value: 'personal' }
];

// 响应式数据
const rankings = ref<any[]>([]);
const activeType = ref('weekly');
const isLoading = ref(false);
const isRefreshing = ref(false);
const updateTime = ref(formatDate(new Date()));

// 格式化日期
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 获取排行榜数据
const fetchRankings = async () => {
  try {
    isLoading.value = true;
    const res = await getRankings(activeType.value);
    rankings.value = res.rankings || [];
    updateTime.value = formatDate(new Date());
  } catch (error) {
    console.error('获取排行榜失败', error);
    uni.showToast({
      title: '加载排行榜失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

// 切换排行榜类型
const changeRankingType = (type: string) => {
  if (activeType.value !== type) {
    activeType.value = type;
    fetchRankings();
  }
};

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true;
  fetchRankings();
};

onMounted(() => {
  fetchRankings();
});
</script>

<style lang="scss" scoped>
.ranking-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.ranking-tabs {
  display: flex;
  background-color: #fff;
  padding: 0 15px;
  border-bottom: 1px solid #f0f0f0;
  
  .tab-item {
    position: relative;
    padding: 15px 0;
    margin-right: 20px;
    font-size: 15px;
    color: #666;
    
    &.active {
      color: #007aff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background-color: #007aff;
        border-radius: 2px;
      }
    }
  }
}

.ranking-content {
  flex: 1;
}

.top-three {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 30px 15px 20px;
  background-color: #fff;
  
  .rank-first,
  .rank-second,
  .rank-third {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 10px;
    
    .avatar-wrap {
      position: relative;
      margin-bottom: 8px;
      
      .avatar {
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .rank-tag {
        position: absolute;
        right: -5px;
        bottom: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: #fff;
        
        &.rank-1 {
          background-color: #ffca28;
        }
        
        &.rank-2 {
          background-color: #9e9e9e;
        }
        
        &.rank-3 {
          background-color: #bf8970;
        }
      }
    }
    
    .username {
      font-size: 13px;
      color: #333;
      margin-bottom: 4px;
      font-weight: 500;
      width: 100%;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .score {
      font-size: 12px;
      color: #ff6b00;
    }
  }
  
  .rank-first {
    position: relative;
    z-index: 2;
    
    .crown-icon {
      font-size: 24px;
      margin-bottom: -5px;
    }
    
    .avatar-wrap .avatar {
      width: 80px;
      height: 80px;
      border-color: #ffca28;
    }
  }
  
  .rank-second,
  .rank-third {
    z-index: 1;
    
    .avatar-wrap .avatar {
      width: 60px;
      height: 60px;
    }
  }
}

.ranking-list {
  margin-top: 10px;
  padding: 0 15px;
  background-color: #fff;
}

.ranking-footer {
  padding: 15px;
  text-align: center;
  font-size: 12px;
  color: #999;
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

.loading-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  font-size: 14px;
  color: #999;
}
</style> 