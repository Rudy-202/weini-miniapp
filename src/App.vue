<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from './store/user';

const userStore = useUserStore();

onLaunch(() => {
  console.log('App Launch');
  
  // 设置页面转场动画
  setupPageAnimation();
  
  // 检查登录状态
  checkLoginStatus();
});

onShow(() => {
  console.log('App Show');
  
  // 如果需要刷新登录状态，则在应用前台显示时检查
  if (userStore.isLoggedIn && userStore.needRefreshAuth) {
    userStore.checkAndUpdateAuth();
  }
});

onHide(() => {
  console.log('App Hide');
});

// 设置页面转场动画
function setupPageAnimation() {
  uni.setNavigationBarColor({
    frontColor: '#000000',
    backgroundColor: '#f8f8f8'
  });
  
  // 全局设置页面转场动画
  uni.$on('navigation-page-animation', (params: any) => {
    if (params?.animation) {
      const animation = params.animation;
      // 根据不同场景应用不同动画
      uni.navigateTo({
        url: params.url,
        animationType: animation.type || 'pop-in',
        animationDuration: animation.duration || 300
      });
    }
  });
}

// 检查登录状态
async function checkLoginStatus() {
  if (userStore.isLoggedIn) {
    try {
      await userStore.checkAndUpdateAuth();
      console.log('用户已登录，角色:', userStore.isAdmin ? '管理员' : '粉丝');
    } catch (error) {
      console.error('登录状态检查失败:', error);
    }
  } else {
    console.log('用户未登录');
  }
}
</script>

<style lang="scss">
@import './styles/index.scss';

// 全局过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s;
}

.slide-left-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter {
  transform: translateX(-100%);
}

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style> 