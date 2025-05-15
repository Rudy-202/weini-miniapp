/**
 * 测量启动时间
 * @returns {Object} 计时器对象
 */
export const measureStartupTime = () => {
  const startTime = Date.now();
  
  return {
    end: () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`首屏加载时间: ${duration}ms`);
      return duration;
    }
  };
};

/**
 * 测量页面跳转时间
 * 在App.vue中调用setupNavigationTiming()进行初始化
 */
export const setupNavigationTiming = () => {
  let pageStartTime = 0;
  
  uni.addInterceptor('navigateTo', {
    invoke(args) {
      pageStartTime = Date.now();
      return args;
    },
    success() {
      const duration = Date.now() - pageStartTime;
      console.log(`页面切换时间: ${duration}ms`);
    }
  });
  
  uni.addInterceptor('redirectTo', {
    invoke(args) {
      pageStartTime = Date.now();
      return args;
    },
    success() {
      const duration = Date.now() - pageStartTime;
      console.log(`页面重定向时间: ${duration}ms`);
    }
  });
  
  uni.addInterceptor('reLaunch', {
    invoke(args) {
      pageStartTime = Date.now();
      return args;
    },
    success() {
      const duration = Date.now() - pageStartTime;
      console.log(`页面重启时间: ${duration}ms`);
    }
  });
};

/**
 * 组件渲染时间 Hook
 * @param {string} componentName 组件名称
 */
export const useRenderTime = (componentName) => {
  let startTime = 0;
  
  // 在Vue Composition API中使用
  const onBeforeMount = () => {
    startTime = Date.now();
  };
  
  const onMounted = () => {
    const duration = Date.now() - startTime;
    console.log(`${componentName} 渲染时间: ${duration}ms`);
    return duration;
  };
  
  return {
    onBeforeMount,
    onMounted
  };
};

/**
 * 测量函数执行时间
 * @param {Function} fn 要测量的函数
 * @param {string} name 函数名称
 * @returns {Function} 包装后的函数
 */
export const measureExecutionTime = (fn, name) => {
  return (...args) => {
    const startTime = Date.now();
    const result = fn(...args);
    
    // 处理 Promise
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Date.now() - startTime;
        console.log(`${name || fn.name || 'Anonymous'} 执行时间: ${duration}ms`);
      });
    }
    
    const duration = Date.now() - startTime;
    console.log(`${name || fn.name || 'Anonymous'} 执行时间: ${duration}ms`);
    return result;
  };
};

/**
 * 创建性能报告
 * @param {Object} metrics 性能指标对象
 */
export const createPerformanceReport = (metrics) => {
  const report = {
    timestamp: Date.now(),
    metrics,
    device: {
      platform: uni.getSystemInfoSync().platform,
      model: uni.getSystemInfoSync().model,
      system: uni.getSystemInfoSync().system,
      version: uni.getSystemInfoSync().version
    }
  };
  
  console.log('性能报告:', report);
  
  // 这里可以添加性能数据上报逻辑
  // e.g. 发送到服务器或存储到本地
  
  return report;
}; 