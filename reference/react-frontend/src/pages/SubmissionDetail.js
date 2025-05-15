import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Typography, Button, Space, Tag, Descriptions,
  Image, message, Spin, Result, Alert
} from 'antd';
import {
  ArrowLeftOutlined, CloseCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { Content, Header } = Layout;
const { Title, Paragraph, Text } = Typography;

// 处理图片URL的辅助函数
const formatImageUrl = (url) => {
  if (!url) return '';

  // 检查URL是否已经包含协议
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 去掉开头的斜杠（如果有）
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

  // 检查是否已经包含uploads路径
  if (cleanUrl.includes('uploads/task_submissions/')) {
    // 确保cleanUrl不包含uploads前缀
    const pathParts = cleanUrl.split('uploads/');
    const actualPath = pathParts[pathParts.length - 1];
    return `http://localhost:5000/uploads/${actualPath}`;
  } else {
    return `http://localhost:5000/${cleanUrl}`;
  }
};

const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const token = auth?.token || localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState(null);

  // 获取提交详情
  useEffect(() => {
    const fetchSubmissionDetail = async () => {
      setLoading(true);
      setError(null);

      console.log('准备获取提交详情, submissionId:', submissionId);
      console.log('认证token:', token ? '存在' : '不存在');

      if (!token) {
        setError('未获取到认证令牌，请确保已登录');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/station/submissions/${submissionId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('获取提交详情成功:', response.data);
        console.log('图片URL:', response.data.image_urls);
        setSubmission(response.data);
      } catch (err) {
        console.error('获取提交详情失败:', err);
        console.error('错误详情:', err.response?.data);

        if (err.response?.status === 401) {
          setError('认证令牌无效或已过期，请重新登录');
          // 可能需要注销并重定向到登录页
          // auth.logout();
          // navigate('/login');
        } else {
          setError('获取提交详情失败: ' + (err.response?.data?.error || err.message));
        }
        message.error('获取提交详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionDetail();
    } else {
      setError('缺少提交ID参数');
      setLoading(false);
    }
  }, [submissionId, token, navigate]);

  // 处理错误情况
  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ margin: '16px' }}>
          <Result
            status="error"
            title="获取提交详情失败"
            subTitle={error}
            extra={
              <Button type="primary" onClick={() => navigate(-1)}>
                返回
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

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
          提交详情
        </Title>
      </Header>

      <Content style={{ margin: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>加载提交详情...</p>
          </div>
        ) : submission ? (
          <>
            {/* 任务信息 */}
            <Card title="任务信息" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="任务标题">{submission.task.title}</Descriptions.Item>
                <Descriptions.Item label="任务ID">{submission.task.id}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 提交信息 */}
            <Card
              title="提交信息"
              style={{ marginBottom: 16 }}
              extra={
                submission.is_abnormal ? (
                  <Tag icon={<CloseCircleOutlined />} color="error">异常提交</Tag>
                ) : (
                  <Tag icon={<CheckCircleOutlined />} color="success">正常提交</Tag>
                )
              }
            >
              <Descriptions bordered column={1}>
                <Descriptions.Item label="提交者">{submission.participant.name}</Descriptions.Item>
                <Descriptions.Item label="提交时间">{new Date(submission.submitted_at).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="获得积分">{submission.points_earned}</Descriptions.Item>
                {submission.comment && (
                  <Descriptions.Item label="备注">{submission.comment}</Descriptions.Item>
                )}
                {submission.is_abnormal && (
                  <>
                    <Descriptions.Item label="异常原因">
                      <Alert type="error" message={submission.abnormal_reason} />
                    </Descriptions.Item>
                    <Descriptions.Item label="标记时间">
                      {submission.marked_at ? new Date(submission.marked_at).toLocaleString() : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="标记人">
                      {submission.marked_by ? submission.marked_by.username : '-'}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            {/* 提交图片 */}
            <Card title="提交图片">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {submission.image_urls && submission.image_urls.length > 0 ? (
                  submission.image_urls.map((url, index) => (
                    <Image
                      key={index}
                      src={formatImageUrl(url)}
                      alt={`提交图片 ${index + 1}`}
                      style={{ objectFit: 'contain' }}
                      width={250}
                    />
                  ))
                ) : (
                  <Text type="secondary">无图片提交</Text>
                )}
              </div>
            </Card>
          </>
        ) : (
          <Result
            status="warning"
            title="未找到提交记录"
            subTitle="找不到对应的提交记录信息"
            extra={
              <Button type="primary" onClick={() => navigate(-1)}>
                返回
              </Button>
            }
          />
        )}
      </Content>
    </Layout>
  );
};

export default SubmissionDetail;
