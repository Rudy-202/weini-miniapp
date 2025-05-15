/**
 * 页面导航工具
 */

/**
 * 定义页面导航动画类型
 */
type AnimationType = 'slide-in-right' | 'slide-in-left' | 'slide-in-top' | 'slide-in-bottom' | 'pop-in' | 'fade-in' | 'zoom-out' | 'none' | 'auto' | 'zoom-fade-out';

/**
 * 导航参数
 */
interface NavigateOptions {
  url: string;
  animationType?: AnimationType;
  animationDuration?: number;
  events?: Record<string, Function>;
}

/**
 * 页面跳转
 */
export function navigateTo(options: NavigateOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.navigateTo({
      url: options.url,
      animationType: options.animationType || 'pop-in',
      animationDuration: options.animationDuration || 300,
      events: options.events,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 页面重定向（关闭当前页面）
 */
export function redirectTo(options: NavigateOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.redirectTo({
      url: options.url,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 关闭当前页面并返回
 * @param delta 返回的页面数
 */
export function navigateBack(delta = 1): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.navigateBack({
      delta,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 关闭所有页面，打开到应用内的某个页面
 */
export function reLaunch(options: NavigateOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.reLaunch({
      url: options.url,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 切换到 tabbar 页面
 */
export function switchTab(options: { url: string }): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.redirectTo({
      url: options.url,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 带参数导航并使用适当动画
 * @param url 目标页面路径
 * @param params 页面参数
 * @param animationType 动画类型
 */
export function navigateWithParams(url: string, params?: Record<string, any>, animationType?: AnimationType): Promise<any> {
  // 构建带参数的URL
  let targetUrl = url;
  if (params && Object.keys(params).length > 0) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    targetUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
  }

  return navigateTo({
    url: targetUrl,
    animationType: animationType || 'pop-in'
  });
}

/**
 * 平滑返回上一页并可选择是否传递数据
 */
export function smoothBack(data?: any): Promise<any> {
  // 如果有数据需要传递给上一页
  if (data) {
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      const prevPage = pages[pages.length - 2];
      // 设置数据到上一页
      if (prevPage.$vm) {
        prevPage.$vm.backData = data;
        // 触发自定义事件
        prevPage.$vm.$emit('page-back-data', data);
      }
    }
  }
  
  return navigateBack();
} 