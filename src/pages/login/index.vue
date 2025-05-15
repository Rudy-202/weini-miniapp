<template>
  <view class="container">
    <view class="login-header">
      <view class="login-title fade-in">{{ isFanLogin ? '粉丝登录' : '管理员登录' }}</view>
      <view class="login-subtitle fade-in" style="animation-delay: 0.2s">{{ isFanLogin ? '使用邀请码登录' : '请输入账号和密码' }}</view>
    </view>
    
    <!-- 粉丝登录表单 -->
    <view class="login-form fade-in" style="animation-delay: 0.3s" v-if="isFanLogin">
      <view class="form-item">
        <view class="form-label">您的昵称</view>
        <input
          class="form-input"
          type="text"
          v-model="fanForm.nickname"
          placeholder="请输入您的昵称"
          :class="{ 'input-error': fanErrors.nickname }"
        />
        <view v-if="fanErrors.nickname" class="error-text">{{ fanErrors.nickname }}</view>
      </view>
      
      <view class="form-item">
        <view class="form-label">邀请码</view>
        <input
          class="form-input"
          type="text"
          v-model="fanForm.code"
          placeholder="请输入邀请码"
          :class="{ 'input-error': fanErrors.code }"
        />
        <view v-if="fanErrors.code" class="error-text">{{ fanErrors.code }}</view>
      </view>
      
      <button class="btn btn-primary btn-login" @click="handleFanLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </view>
    
    <!-- 管理员登录表单 -->
    <view class="login-form fade-in" style="animation-delay: 0.3s" v-else>
      <view class="form-item">
        <view class="form-label">邮箱</view>
        <input
          class="form-input"
          type="text"
          v-model="adminForm.email"
          placeholder="请输入邮箱"
          :class="{ 'input-error': adminErrors.email }"
        />
        <view v-if="adminErrors.email" class="error-text">{{ adminErrors.email }}</view>
      </view>
      
      <view class="form-item">
        <view class="form-label">密码</view>
        <input
          class="form-input"
          type="password"
          v-model="adminForm.password"
          placeholder="请输入密码"
          :class="{ 'input-error': adminErrors.password }"
        />
        <view v-if="adminErrors.password" class="error-text">{{ adminErrors.password }}</view>
      </view>
      
      <button class="btn btn-primary btn-login" @click="handleAdminLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </view>
    
    <view class="switch-login-type fade-in" style="animation-delay: 0.5s" @click="switchLoginType">
      {{ isFanLogin ? '我是管理员' : '我是粉丝' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onLoad, reactive } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user';
import { adminLogin, verifyInviteCode } from '../../api/user';
import { switchTab, navigateBack } from '../../utils/navigator';

// 获取用户状态
const userStore = useUserStore();

// 登录类型
const isFanLogin = ref(true);
const isLoading = ref(false);

// 粉丝登录表单
const fanForm = ref({
  nickname: '',
  code: ''
});

// 管理员登录表单
const adminForm = ref({
  email: '',
  password: ''
});

// 表单错误信息
const fanErrors = reactive({
  nickname: '',
  code: ''
});

const adminErrors = reactive({
  email: '',
  password: ''
});

// 页面加载
onLoad((options) => {
  if (options.role === 'admin') {
    isFanLogin.value = false;
  } else {
    isFanLogin.value = true;
  }
  
  // 如果已登录，直接跳转到对应页面
  if (userStore.isLoggedIn) {
    redirectToHome();
  }
});

// 切换登录类型
const switchLoginType = () => {
  // 重置表单错误
  resetErrors();
  isFanLogin.value = !isFanLogin.value;
};

// 重定向到首页
const redirectToHome = () => {
  if (userStore.isAdmin) {
    switchTab({
      url: '/packageAdmin/pages/dashboard/index'
    });
  } else {
    switchTab({
      url: '/packageFan/pages/task-list/index'
    });
  }
};

// 重置错误信息
const resetErrors = () => {
  fanErrors.nickname = '';
  fanErrors.code = '';
  adminErrors.email = '';
  adminErrors.password = '';
};

// 验证粉丝表单
const validateFanForm = () => {
  resetErrors();
  let isValid = true;
  
  if (!fanForm.value.nickname.trim()) {
    fanErrors.nickname = '请输入昵称';
    isValid = false;
  } else if (fanForm.value.nickname.trim().length < 2) {
    fanErrors.nickname = '昵称至少需要2个字符';
    isValid = false;
  }
  
  if (!fanForm.value.code.trim()) {
    fanErrors.code = '请输入邀请码';
    isValid = false;
  }
  
  return isValid;
};

// 验证管理员表单
const validateAdminForm = () => {
  resetErrors();
  let isValid = true;
  
  if (!adminForm.value.email.trim()) {
    adminErrors.email = '请输入邮箱';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.value.email.trim())) {
    adminErrors.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  if (!adminForm.value.password) {
    adminErrors.password = '请输入密码';
    isValid = false;
  } else if (adminForm.value.password.length < 6) {
    adminErrors.password = '密码至少需要6个字符';
    isValid = false;
  }
  
  return isValid;
};

// 粉丝登录
const handleFanLogin = async () => {
  // 表单验证
  if (!validateFanForm()) return;
  
  try {
    isLoading.value = true;
    
    const res = await verifyInviteCode({
      nickname: fanForm.value.nickname.trim(),
      code: fanForm.value.code.trim()
    });
    
    // 保存token和用户信息
    userStore.setToken(res.data.token);
    userStore.setUserInfo(res.data.userInfo);
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    });
    
    // 跳转到粉丝任务列表
    setTimeout(() => {
      switchTab({
        url: '/packageFan/pages/task-list/index'
      });
    }, 1500);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};

// 管理员登录
const handleAdminLogin = async () => {
  // 表单验证
  if (!validateAdminForm()) return;
  
  try {
    isLoading.value = true;
    
    const res = await adminLogin({
      email: adminForm.value.email.trim(),
      password: adminForm.value.password
    });
    
    // 保存token和用户信息
    userStore.setToken(res.data.token);
    userStore.setUserInfo(res.data.userInfo);
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    });
    
    // 跳转到管理员控制台
    setTimeout(() => {
      switchTab({
        url: '/packageAdmin/pages/dashboard/index'
      });
    }, 1500);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  padding: 40rpx;
  height: 100vh;
  background: linear-gradient(to bottom, rgba(250, 250, 250, 0.8), rgba(240, 240, 250, 0.9));
}

.login-header {
  margin: 100rpx 0 60rpx;
  text-align: center;
}

.login-title {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 20rpx;
}

.login-subtitle {
  font-size: 32rpx;
  color: var(--text-color-light);
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: var(--text-color);
}

.form-input {
  width: 100%;
  height: 90rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.05);
  }
}

.input-error {
  border-color: #FF6B6B !important;
  background-color: rgba(255, 107, 107, 0.05);
}

.error-text {
  font-size: 24rpx;
  color: #FF6B6B;
  margin-top: 10rpx;
}

.btn-login {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  background: var(--primary-color);
  color: #fff;
  font-weight: bold;
  margin-top: 60rpx;
  transition: all 0.3s;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  
  &:active {
    transform: translateY(3rpx);
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  }
  
  &[disabled] {
    opacity: 0.7;
    background-color: #999;
  }
}

.switch-login-type {
  text-align: center;
  margin-top: 60rpx;
  font-size: 28rpx;
  color: var(--primary-color);
  text-decoration: underline;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fade-in 0.5s ease backwards;
}
</style> 