<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from './store/user';
import { measureStartupTime, setupNavigationTiming } from './utils/performance';

const userStore = useUserStore();
// 性能计时器
const startupTimer = measureStartupTime();

onLaunch(() => {
  console.log('App Launch');
  
  // 设置性能监测
  setupNavigationTiming();
  
  // 设置页面转场动画
  setupPageAnimation();
  
  // 检查登录状态
  checkLoginStatus();
  
  // TODO: DEBUG - 应用启动时偶现 vendor.js TypeError: e.index.preloadSubpackages is not a function 报错，导致预加载失败。
  // 需要后续排查 uni.preloadSubpackages API 的可用性或兼容性问题。
  preloadSubpackages();
  
  // 初始化应用
  initApp();
  
  // 记录启动时间
  setTimeout(() => {
    const duration = startupTimer.end();
    console.log(`应用启动完成，耗时: ${duration}ms`);
  }, 1000);
});

onShow(() => {
  console.log('App Show');
  
  // 如果需要刷新登录状态，则在应用前台显示时检查
  if (userStore.isLoggedIn && userStore.needRefreshAuth) {
    userStore.checkAndUpdateAuth();
  }
  
  // 清理过期缓存
  cleanExpiredCache();
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

// 预加载分包
function preloadSubpackages() {
  // 根据登录状态预加载不同分包
  if (userStore.isLoggedIn) {
    if (userStore.isAdmin) {
      // 预加载管理员分包
      uni.preDownloadSubpackage({
        packages: ['packageAdmin'],
        success: () => {
          console.log('管理员分包预加载成功');
        },
        fail: (err) => {
          console.error('管理员分包预加载失败', err);
        }
      });
    } else {
      // 预加载粉丝分包
      uni.preDownloadSubpackage({
        packages: ['packageFan'],
        success: () => {
          console.log('粉丝分包预加载成功');
        },
        fail: (err) => {
          console.error('粉丝分包预加载失败', err);
        }
      });
    }
  }
}

// 初始化应用
function initApp() {
  // 设置网络请求拦截器
  setupNetworkInterceptor();
  
  // 初始化缓存系统
  initCacheSystem();
}

// 设置网络请求拦截器
function setupNetworkInterceptor() {
  uni.addInterceptor('request', {
    invoke(args) {
      // 请求前处理
      const token = uni.getStorageSync('token');
      if (token) {
        args.header = {
          ...args.header,
          'Authorization': `Bearer ${token}`
        };
      }
      return args;
    },
    success(res) {
      // 请求成功处理
      return res;
    },
    fail(err) {
      // 请求失败处理
      console.error('请求失败', err);
      uni.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
      return err;
    }
  });
}

// 初始化缓存系统
function initCacheSystem() {
  // 全局缓存管理器
  const cacheManager = {
    // 设置带过期时间的缓存
    set(key: string, value: any, expiresIn = 3600) {
      const data = {
        value,
        expires: Date.now() + expiresIn * 1000
      };
      uni.setStorageSync(key, JSON.stringify(data));
    },
    // 获取缓存，如果过期返回null
    get(key: string) {
      const dataStr = uni.getStorageSync(key);
      if (!dataStr) return null;
      
      try {
        const data = JSON.parse(dataStr);
        if (data.expires < Date.now()) {
          uni.removeStorageSync(key);
          return null;
        }
        return data.value;
      } catch (e) {
        return null;
      }
    },
    // 清除指定缓存
    remove(key: string) {
      uni.removeStorageSync(key);
    },
    // 清除所有缓存
    clear() {
      uni.clearStorageSync();
    }
  };
  
  // 挂载到全局
  // @ts-ignore
  uni.cacheManager = cacheManager;
}

// 清理过期缓存
function cleanExpiredCache() {
  try {
    const keys = uni.getStorageInfoSync().keys;
    keys.forEach(key => {
      // 跳过非JSON格式的存储项
      try {
        const dataStr = uni.getStorageSync(key);
        if (!dataStr) return;
        
        const data = JSON.parse(dataStr);
        if (data && data.expires && data.expires < Date.now()) {
          uni.removeStorageSync(key);
          console.log(`已清理过期缓存: ${key}`);
        }
      } catch (e) {
        // 非JSON格式，忽略
      }
    });
  } catch (e) {
    console.error('清理缓存失败', e);
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