import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { UserOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FanLogin = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 检查是否已有保存的信息
    const fanInfo = localStorage.getItem('fanInfo');
    if (fanInfo) {
      try {
        const { nickname: savedNickname, invite_code: savedInviteCode } = JSON.parse(fanInfo);
        setNickname(savedNickname || '');
        setInviteCode(savedInviteCode || '');
      } catch (e) {
        console.error('解析粉丝信息失败:', e);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!nickname || !inviteCode) {
      setError('请填写完整信息');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 验证邀请码
      const response = await axios.post('/api/fans/verify-invite-code', {
        nickname: nickname,
        invite_code: inviteCode
      });

      // 保存粉丝信息到本地存储
      localStorage.setItem('fanInfo', JSON.stringify({
        nickname: nickname,
        invite_code: inviteCode
      }));

      // 重定向到粉丝主页
      navigate('/fan/home');
    } catch (err) {
      console.error('验证失败:', err);
      setError(err.response?.data?.message || '邀请码验证失败，请检查后重试');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">粉丝入口</h1>
          <p className="text-gray-500 mt-2">输入信息开始应援之旅</p>
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入您的昵称' }]}
            initialValue={nickname}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="请输入您的昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="邀请码"
            name="inviteCode"
            rules={[{ required: true, message: '请输入站子提供的邀请码' }]}
            initialValue={inviteCode}
          >
            <Input
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder="请输入站子提供的邀请码"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-10 bg-gradient-to-r from-pink-500 to-purple-600 border-0 rounded-lg font-medium hover:opacity-90 transition-colors shadow-md"
            >
              开始应援之旅
            </Button>
          </Form.Item>

          <div className="mt-4 text-center">
            <Button
              type="link"
              onClick={goBack}
              className="text-gray-500 hover:text-pink-500"
              icon={<ArrowLeftOutlined />}
            >
              返回主页
            </Button>
          </div>
        </Form>

        {error && (
          <Alert
            className="mt-6"
            message={error}
            type="error"
            showIcon
          />
        )}

        <style jsx>{`
          /* 添加过渡效果 */
          .min-h-screen {
            transition: background 0.5s ease;
          }

          .ant-input, .ant-btn {
            transition: all 0.3s ease;
          }

          /* 设置按钮点击效果 */
          .ant-btn {
            position: relative;
            overflow: hidden;
          }

          .ant-btn::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
            background-repeat: no-repeat;
            background-position: 50%;
            transform: scale(10, 10);
            opacity: 0;
            transition: transform 0.5s, opacity 0.5s;
          }

          .ant-btn:active::after {
            transform: scale(0, 0);
            opacity: 0.3;
            transition: 0s;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FanLogin;
