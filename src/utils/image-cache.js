/**
 * 下载并缓存图片
 * @param {string} url 图片URL
 * @returns {Promise<string>} 本地图片路径
 */
export const cacheImage = (url) => {
  return new Promise((resolve, reject) => {
    // 生成缓存key
    const key = `img_cache_${md5(url)}`;
    
    // 检查缓存
    const cachedPath = uni.getStorageSync(key);
    if (cachedPath) {
      // 检查文件是否存在
      uni.getSavedFileInfo({
        filePath: cachedPath,
        success: () => {
          resolve(cachedPath);
        },
        fail: () => {
          // 文件不存在，重新下载
          downloadAndSave(url, key).then(resolve).catch(reject);
        }
      });
    } else {
      // 没有缓存，下载并保存
      downloadAndSave(url, key).then(resolve).catch(reject);
    }
  });
};

/**
 * 下载并保存图片
 */
const downloadAndSave = (url, key) => {
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存到本地
          uni.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              // 保存缓存信息
              uni.setStorageSync(key, saveRes.savedFilePath);
              resolve(saveRes.savedFilePath);
            },
            fail: (err) => {
              console.error('保存文件失败', err);
              resolve(res.tempFilePath);
            }
          });
        } else {
          reject(new Error('下载图片失败'));
        }
      },
      fail: reject
    });
  });
};

/**
 * 生成MD5
 */
function md5(string) {
  // 简化版MD5，实际项目中可使用完整MD5库
  return string.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(16);
}

/**
 * 清理过期图片缓存
 * @param {number} maxAge 最大缓存时间(毫秒)
 */
export const cleanImageCache = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const now = Date.now();
  
  // 获取所有已保存的文件
  uni.getSavedFileList({
    success: (res) => {
      res.fileList.forEach(file => {
        if (now - file.createTime > maxAge) {
          uni.removeSavedFile({
            filePath: file.filePath
          });
        }
      });
    }
  });
}; 