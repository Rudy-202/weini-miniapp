import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Form, Input, Button, Select,
  Radio, Card, message, Space
} from 'antd';
import { CommentOutlined, HeartOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FanFeedback = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    // 从localStorage获取粉丝信息
    const fanInfo = localStorage.getItem('fanInfo');
    if (fanInfo) {
      try {
        const { nickname: storedNickname, invite_code: storedInviteCode } = JSON.parse(fanInfo);
        setNickname(storedNickname || '粉丝');
        setInviteCode(storedInviteCode || '');
      } catch (e) {
        console.error('解析粉丝信息失败:', e);
        navigate('/fan/login');
      }
    } else {
      // 如果没有存储的信息，重定向到登录页
      navigate('/fan/login');
    }
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('提交反馈:', values);

      // 添加用户信息
      values.nickname = nickname;
      values.invite_code = inviteCode;

      // 使用真实的API接口
      const response = await axios.post('/api/fan/feedback', values);

      if (response.data.success) {
        message.success('反馈提交成功，感谢您的宝贵意见！');
        form.resetFields();

        // 提交成功后返回首页
        setTimeout(() => {
          navigate('/fan/home');
        }, 1500);
      } else {
        message.error(response.data.error || '提交失败，请稍后重试');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      message.error(error.response?.data?.error || '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const logout = () => {
    localStorage.removeItem('fanInfo');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 pb-12">
      {/* 顶部导航栏 */}
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* 左侧Logo/标题 */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                <HeartOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <h1 className="ml-2 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                未你
              </h1>
            </div>

            {/* 右侧用户信息 */}
            <div className="flex items-center">
              <Button
                type="text"
                onClick={() => navigate('/fan/home')}
                className="text-sm text-gray-500 hover:text-pink-500 flex items-center mr-2"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-xl shadow-md">
          <div className="text-center mb-6">
            <CommentOutlined className="text-3xl text-pink-500" />
            <Title level={2} className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              意见反馈
            </Title>
            <Paragraph className="text-gray-600 mt-2">
              您的反馈对我们非常重要！请告诉我们您的想法、建议或遇到的问题，我们会认真倾听并不断改进。
            </Paragraph>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              feedback_type: 'suggestion'
            }}
          >
            <Form.Item
              name="feedback_type"
              label="反馈类型"
              rules={[{ required: true, message: '请选择反馈类型' }]}
            >
              <Select placeholder="选择反馈类型">
                <Option value="suggestion">功能建议</Option>
                <Option value="bug">问题报告</Option>
                <Option value="experience">使用体验</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="content"
              label="反馈内容"
              rules={[{ required: true, message: '请输入反馈内容' }]}
            >
              <TextArea
                placeholder="请详细描述您的建议或遇到的问题..."
                rows={6}
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Form.Item
              name="contact"
              label="联系方式（选填）"
              extra="留下您的联系方式，方便我们回复您"
            >
              <Input placeholder="邮箱或其他联系方式" />
            </Form.Item>

            <Form.Item className="text-center">
              <Space>
                <Button
                  type="default"
                  onClick={() => navigate('/fan/home')}
                >
                  返回首页
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 border-0"
                >
                  提交反馈
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default FanFeedback;
