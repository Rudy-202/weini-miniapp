import { request } from '@/api/request';

// 缓存请求结果
const cache = new Map();

/**
 * 带缓存的请求函数
 * @param {Object} options 请求选项
 * @param {number} cacheTime 缓存时间，单位秒，0表示不缓存
 */
export const cachedRequest = async (options, cacheTime = 60) => {
  // 不缓存的情况
  if (cacheTime <= 0 || options.method !== 'GET') {
    return request(options);
  }
  
  // 生成缓存键
  const cacheKey = generateCacheKey(options);
  
  // 检查是否有缓存
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // 没有缓存，发起请求
  const result = await request(options);
  
  // 设置缓存
  setCache(cacheKey, result, cacheTime);
  
  return result;
};

/**
 * 生成缓存键
 */
const generateCacheKey = (options) => {
  return `${options.url}|${JSON.stringify(options.data || {})}`;
};

/**
 * 获取缓存
 */
const getCache = (key) => {
  if (!cache.has(key)) return null;
  
  const { data, expireTime } = cache.get(key);
  
  // 检查是否过期
  if (expireTime < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return data;
};

/**
 * 设置缓存
 */
const setCache = (key, data, cacheTime) => {
  const expireTime = Date.now() + cacheTime * 1000;
  cache.set(key, { data, expireTime });
};

/**
 * 清除指定URL的缓存
 */
export const clearUrlCache = (url) => {
  for (const key of cache.keys()) {
    if (key.startsWith(`${url}|`)) {
      cache.delete(key);
    }
  }
};

/**
 * 清除所有缓存
 */
export const clearAllCache = () => {
  cache.clear();
}; 