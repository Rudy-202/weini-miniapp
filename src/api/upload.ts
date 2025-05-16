// src/api/upload.ts
interface UploadResult {
  url: string;
  // 根据实际API返回结果可能还有其他字段
}

/**
 * 模拟图片上传函数
 * @param filePath 图片的本地临时路径
 * @returns Promise<UploadResult> 包含图片URL的结果
 */
export const uploadImage = (filePath: string): Promise<UploadResult> => {
  console.log(`[uploadImage] 模拟上传文件: ${filePath}`);
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 实际场景中，这里会调用 uni.uploadFile 或其他HTTP请求库
      // 并根据服务器返回结果调用 resolve 或 reject
      
      // 模拟成功
      const mockImageUrl = `https://mock.server.com/images/${Date.now()}.jpg`;
      console.log(`[uploadImage] 模拟上传成功，返回URL: ${mockImageUrl}`);
      resolve({ url: mockImageUrl });

      // 模拟失败：
      // console.error('[uploadImage] 模拟上传失败');
      // reject(new Error('模拟上传失败'));
    }, 1500);
  });
}; 