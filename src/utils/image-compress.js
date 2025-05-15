/**
 * 压缩图片
 * @param {string} path 图片路径
 * @param {number} quality 压缩质量 0-100
 * @returns {Promise<string>} 压缩后的图片路径
 */
export const compressImage = (path, quality = 80) => {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: path,
      quality,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (err) => {
        console.error('图片压缩失败', err);
        // 压缩失败时返回原图
        resolve(path);
      }
    });
  });
};

/**
 * 批量压缩图片
 * @param {Array<string>} paths 图片路径数组
 * @param {number} quality 压缩质量 0-100
 * @returns {Promise<Array<string>>} 压缩后的图片路径数组
 */
export const compressImages = async (paths, quality = 80) => {
  const results = [];
  
  for (const path of paths) {
    const compressed = await compressImage(path, quality);
    results.push(compressed);
  }
  
  return results;
}; 