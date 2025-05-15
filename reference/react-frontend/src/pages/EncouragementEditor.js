import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Typography, Input, Button, Upload,
  message, Spin, Alert, Space, Divider, Image
} from 'antd';
import {
  UploadOutlined, SaveOutlined, DeleteOutlined,
  ArrowLeftOutlined, PictureOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const EncouragementEditor = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const token = auth?.token || localStorage.getItem('token');

  // 状态
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    default_encouragement_message: '',
    default_encouragement_image_url: null
  });
  const [error, setError] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 获取全局鼓励设置
  useEffect(() => {
    const fetchGlobalSettings = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('未获取到认证令牌，请确保已登录');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/fan/global-encouragement-settings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('获取全局鼓励设置成功:', response.data);
        setGlobalSettings({
          default_encouragement_message: response.data.default_encouragement_message || '',
          default_encouragement_image_url: response.data.default_encouragement_image_url
        });
      } catch (err) {
        console.error('获取全局鼓励设置失败:', err);
        setError('获取全局鼓励设置失败: ' + (err.response?.data?.error || err.message));
        message.error('获取全局鼓励设置失败');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalSettings();
  }, [token]);

  // 处理图片URL
  const getImageFullUrl = (url) => {
    if (!url) return '';

    // 检查URL是否已经包含协议
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // 去掉开头的斜杠（如果有）
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

    // 检查是否已经包含uploads路径
    if (cleanUrl.includes('uploads/')) {
      // 确保cleanUrl不包含uploads前缀
      const pathParts = cleanUrl.split('uploads/');
      const actualPath = pathParts[pathParts.length - 1];
      return `http://localhost:5000/uploads/${actualPath}`;
    } else {
      return `http://localhost:5000/${cleanUrl}`;
    }
  };

  // 保存鼓励设置
  const saveSettings = async () => {
    setSaving(true);
    setError(null);

    if (!token) {
      setError('未获取到认证令牌，请确保已登录');
      setSaving(false);
      return;
    }

    try {
      const response = await axios.put('/api/admin/global-encouragement-settings', globalSettings, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      message.success('鼓励设置保存成功');
      console.log('保存鼓励设置成功:', response.data);
    } catch (err) {
      console.error('保存鼓励设置失败:', err);
      setError('保存鼓励设置失败: ' + (err.response?.data?.error || err.message));
      message.error('保存鼓励设置失败');
    } finally {
      setSaving(false);
    }
  };

  // 清除图片
  const clearImage = () => {
    setGlobalSettings(prev => ({
      ...prev,
      default_encouragement_image_url: null
    }));
  };

  // 处理图片上传
  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    setUploadLoading(true);
    setError(null);

    // 创建FormData对象
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/admin/upload-encouragement-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('图片上传成功:', response.data);

      if (response.data && response.data.image_url) {
        setGlobalSettings(prev => ({
          ...prev,
          default_encouragement_image_url: response.data.image_url
        }));
        onSuccess('上传成功', file);
        message.success('图片上传成功');
      } else {
        throw new Error('上传图片返回的图片URL为空');
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      setError('图片上传失败: ' + (err.response?.data?.error || err.message));
      onError(err);
      message.error('图片上传失败');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          鼓励内容管理
        </Title>
      </Header>

      <Content style={{ margin: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>加载鼓励设置...</p>
          </div>
        ) : (
          <>
            {error && (
              <Alert
                type="error"
                message="错误"
                description={error}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Card title="全局鼓励设置" bordered={false}>
              <Paragraph>
                设置全局鼓励内容，当粉丝完成任务时将看到这些鼓励信息。您也可以在创建或编辑任务时为特定任务设置单独的鼓励内容。
              </Paragraph>

              <Divider orientation="left">鼓励图片</Divider>
              <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
                <Text>上传新的鼓励图片:</Text>
                <Upload
                  customRequest={handleUpload}
                  showUploadList={false}
                  accept="image/*"
                  disabled={uploadLoading}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploadLoading}
                    type="primary"
                    ghost
                  >
                    {uploadLoading ? '上传中...' : '上传图片'}
                  </Button>
                </Upload>

                {globalSettings.default_encouragement_image_url && (
                  <div style={{ marginTop: 16 }}>
                    <Text>当前图片预览:</Text>
                    <div style={{ marginTop: 8, marginBottom: 16 }}>
                      <Image
                        src={getImageFullUrl(globalSettings.default_encouragement_image_url)}
                        alt="鼓励图片预览"
                        style={{ maxHeight: 200, maxWidth: '100%' }}
                      />
                    </div>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={clearImage}
                    >
                      移除图片
                    </Button>
                  </div>
                )}

                {!globalSettings.default_encouragement_image_url && (
                  <Alert
                    type="info"
                    message="当前未设置鼓励图片"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </Space>

              <Divider orientation="left">鼓励文字</Divider>
              <div style={{ marginBottom: 24 }}>
                <Text>鼓励文字内容:</Text>
                <TextArea
                  value={globalSettings.default_encouragement_message}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    default_encouragement_message: e.target.value
                  }))}
                  placeholder="例如: 恭喜你完成了任务！感谢你的付出和努力~"
                  rows={4}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={saveSettings}
                >
                  保存设置
                </Button>
              </div>
            </Card>

            <Card title="预览效果" style={{ marginTop: 16 }}>
              <div style={{
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                padding: 16,
                backgroundColor: '#fafafa',
                textAlign: 'center'
              }}>
                <Title level={4}>
                  任务完成！
                </Title>

                {globalSettings.default_encouragement_image_url && (
                  <div style={{ margin: '16px 0' }}>
                    <Image
                      src={getImageFullUrl(globalSettings.default_encouragement_image_url)}
                      alt="鼓励图片"
                      style={{ maxHeight: 150, maxWidth: '100%' }}
                    />
                  </div>
                )}

                <Paragraph>
                  {globalSettings.default_encouragement_message || '恭喜你成功完成任务！感谢你的付出和努力~'}
                </Paragraph>

                <div style={{
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'space-around',
                  backgroundColor: '#f0f0f0',
                  padding: '12px',
                  borderRadius: 8
                }}>
                  <div>
                    <Text type="secondary">获得积分</Text>
                    <div><Text strong>10</Text> 分</div>
                  </div>
                  <div>
                    <Text type="secondary">当前排名</Text>
                    <div><Text strong>1</Text></div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </Content>
    </Layout>
  );
};

export default EncouragementEditor;
