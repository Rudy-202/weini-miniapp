import React, { useState, useRef } from 'react';
import { Button, message, Card, Space, Typography } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const UploadTest = () => {
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      if (files.length === 0) {
        message.error('请至少选择一个文件');
        setSubmitting(false);
        return;
      }

      // 构建FormData
      const formData = new FormData();
      formData.append('nickname', 'testuser');
      formData.append('invite_code', 'TEST123');
      formData.append('comment', '测试上传');

      // 添加所有文件
      files.forEach((file, index) => {
        console.log(`添加图片${index}:`, file.name);
        formData.append('images', file);
      });

      // 打印FormData内容
      console.log('FormData内容:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: 文件 - ${value.name} (${value.size} 字节)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // 发送请求
      console.log('提交数据到测试API...');
      const response = await axios.post('/api/fan/tasks/test-task-id/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('响应数据:', response.data);
      setResult({
        success: true,
        data: response.data
      });
      message.success('上传成功！');
    } catch (err) {
      console.error('上传失败:', err);
      setResult({
        success: false,
        error: err.response?.data?.error || err.message
      });
      message.error('上传失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <Card>
        <Title level={2}>图片上传测试</Title>
        <Text>使用此页面测试图片上传功能的基本实现</Text>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ marginBottom: '10px' }}
            />
            <div>
              {files.length > 0 ? (
                <Text>已选择 {files.length} 个文件</Text>
              ) : (
                <Text type="secondary">未选择文件</Text>
              )}
            </div>
          </div>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={files.length === 0}
            >
              上传图片
            </Button>
            <Button
              onClick={() => {
                setFiles([]);
                fileInputRef.current.value = '';
                setResult(null);
              }}
            >
              重置
            </Button>
          </Space>
        </form>

        {result && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: result.success ? '#f6ffed' : '#fff2f0', borderRadius: '4px' }}>
            <Title level={4}>{result.success ? '上传成功' : '上传失败'}</Title>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
              {JSON.stringify(result.success ? result.data : { error: result.error }, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadTest;
