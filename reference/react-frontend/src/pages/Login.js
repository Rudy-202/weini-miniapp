import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Alert, Tabs, Typography, Spin, Space, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { register, sendVerificationCode } from '../api/auth';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [verificationSent, setVerificationSent] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const [registerForm] = Form.useForm();

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 如果已经登录，重定向到首页
  if (isAuthenticated) {
    navigate('/tasks');
    return null;
  }

  // 处理登录
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError('');
      await login(values.email, values.password);
      navigate('/tasks');
    } catch (err) {
      setError(err.error || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  // 处理发送验证码
  const handleSendCode = async () => {
    try {
      const email = registerForm.getFieldValue('email');
      if (!email) {
        setError('请输入邮箱地址');
        return;
      }

      setCodeSending(true);
      setError('');
      await sendVerificationCode(email);
      setVerificationSent(true);
      startCountdown();
    } catch (err) {
      setError(err.error || '验证码发送失败，请稍后再试');
    } finally {
      setCodeSending(false);
    }
  };

  // 开始倒计时
  const startCountdown = () => {
    let seconds = 60;
    setCountdown(seconds);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      if (seconds <= 0) {
        clearInterval(timerRef.current);
      }
    }, 1000);
  };

  // 处理注册
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      setError('');
      await register(values.email, values.password, values.username, values.code);
      setActiveTab('login');  // 注册成功后切换到登录页
      alert('注册成功，请登录');
    } catch (err) {
      setError(err.error || '注册失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Spin spinning={loading}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>未你平台</Title>
            <Title level={4} style={{ fontWeight: 'normal', marginTop: -8 }}>多用户任务管理系统</Title>
          </div>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

          <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
            <TabPane tab="登录" key="login">
              <Form name="login" onFinish={handleLogin} layout="vertical">
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="邮箱" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="注册" key="register">
              <Form name="register" form={registerForm} onFinish={handleRegister} layout="vertical">
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="邮箱" />
                </Form.Item>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度至少6位' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
                </Form.Item>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: '请输入验证码' },
                    { len: 6, message: '验证码为6位数字' }
                  ]}
                >
                  <Row gutter={8}>
                    <Col span={16}>
                      <Input
                        prefix={<SafetyOutlined />}
                        placeholder="验证码"
                        maxLength={6}
                      />
                    </Col>
                    <Col span={8}>
                      <Button
                        onClick={handleSendCode}
                        disabled={countdown > 0}
                        loading={codeSending}
                        style={{ width: '100%' }}
                      >
                        {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/">
              <Space>
                <HomeOutlined />
                <Text>返回主页</Text>
              </Space>
            </Link>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;
