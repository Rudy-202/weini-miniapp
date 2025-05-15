import React, { useState } from 'react';
import { Button, message, Card, Typography, Layout } from 'antd';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ImageUploadTest = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);

  // 处理文件选择
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('选择的文件:', files);
    setSelectedFiles(files);
  };

  // 处理文件上传
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      message.error('请选择至少一个文件');
      return;
    }

    console.log('准备上传文件...');
    setUploading(true);

    try {
      // 创建FormData对象
      const formData = new FormData();

      // 添加文件
      selectedFiles.forEach((file, index) => {
        console.log(`添加文件 ${index+1}: ${file.name} (${file.size} 字节)`);
        formData.append('images', file);
      });

      // 添加其他数据
      formData.append('nickname', 'test_user');
      formData.append('invite_code', 'TEST123');
      formData.append('comment', '测试上传');

      // 打印FormData内容
      console.log('FormData内容:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: 文件 - ${value.name} (${value.size} 字节)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // 发送请求 - 使用测试任务ID
      const testTaskId = 'test-task-id';
      console.log(`发送POST请求到: /api/fan/tasks/${testTaskId}/submit`);

      const response = await axios.post(
        `/api/fan/tasks/${testTaskId}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('上传成功:', response.data);
      message.success('文件上传成功');
      setResponse(response.data);
    } catch (error) {
      console.error('上传失败:', error);

      // 详细错误信息
      if (error.response) {
        console.error('服务器响应状态:', error.response.status);
        console.error('服务器响应数据:', error.response.data);
        message.error(`上传失败: ${error.response.data?.error || '服务器错误'}`);
      } else if (error.request) {
        console.error('请求已发送但没有收到响应');
        message.error('上传失败: 服务器未响应，请检查网络连接和后端服务');
      } else {
        console.error('请求配置错误:', error.message);
        message.error(`上传失败: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout style={{ padding: '20px' }}>
      <Content>
        <Card title="图片上传测试">
          <Title level={4}>简单文件上传测试</Title>
          <Paragraph>这是一个最简单的文件上传测试页面，不包含复杂的业务逻辑</Paragraph>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ marginBottom: '10px', display: 'block' }}
            />
            <div>
              已选择 {selectedFiles.length} 个文件
              {selectedFiles.length > 0 && (
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={selectedFiles.length === 0}
          >
            上传文件
          </Button>

          {response && (
            <div style={{ marginTop: '20px', border: '1px solid #e8e8e8', padding: '15px', borderRadius: '4px' }}>
              <Title level={5}>服务器响应:</Title>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default ImageUploadTest;
