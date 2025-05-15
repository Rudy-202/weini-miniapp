import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Button, Typography, Space, Divider, Input, Form, message } from 'antd';
import {
  UserOutlined, TeamOutlined, HeartOutlined, StarOutlined,
  FireOutlined, RocketOutlined, TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 背景图效果
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const backgrounds = [
    'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(135deg, #ffafbd 0%, #ffc3a0 100%)',
    'linear-gradient(to top, #cd9cf2 0%, #f6f3ff 100%)'
  ];

  // 定时更换背景
  useEffect(() => {
    const timer = setInterval(() => {
      setBackgroundIndex(prev => (prev + 1) % backgrounds.length);
    }, 8000); // 每8秒切换一次

    return () => clearInterval(timer);
  }, []);

  // 处理粉丝入口表单提交
  const handleFanSubmit = (values) => {
    setSubmitting(true);
    console.log('粉丝入口表单提交:', values);

    // 保存邀请码和昵称到localStorage
    localStorage.setItem('fanInviteCode', values.inviteCode);
    localStorage.setItem('fanNickname', values.nickname);

    // 延迟跳转，给用户一点反馈时间
    setTimeout(() => {
      setSubmitting(false);
      navigate('/fan/home', {
        state: {
          inviteCode: values.inviteCode,
          nickname: values.nickname
        }
      });
    }, 500);
  };

  return (
    <Layout className="homepage-layout" style={{
      minHeight: '100vh',
      background: backgrounds[backgroundIndex],
      transition: 'background 3s ease'
    }}>
      <Header
        style={{
          padding: '0 50px',
          background: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <HeartOutlined style={{ fontSize: 28, color: '#ff7875', marginRight: 12 }} />
          <Title level={3} style={{ margin: 0, color: '#ff7875' }}>未你</Title>
        </div>
      </Header>

      <Content style={{ padding: '40px 20px' }}>
        <Row justify="center" align="middle" gutter={[0, 40]}>
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <div className="welcome-banner" style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              marginBottom: 40
            }}>
              <Space direction="vertical" size="large">
                <HeartOutlined style={{ fontSize: 54, color: '#ff7875' }} />
                <Title level={1} style={{
                  margin: 0,
                  marginBottom: 24,
                  background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  欢迎来到未你
                </Title>
                <Title level={4} style={{ fontWeight: 'normal', marginTop: 0 }}>
                  一起为爱豆打榜，完成应援任务，展现粉丝力量！
                </Title>
                <Text style={{ fontSize: 16 }}>
                  加入我们，一起为爱豆创造奇迹！✨
                </Text>
              </Space>
            </div>
          </Col>

          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Row gutter={[24, 24]}>
              {/* 粉丝入口 */}
              <Col xs={24} sm={24} md={14}>
                <Card
                  className="fan-entrance"
                  style={{
                    borderRadius: 12,
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(255, 105, 180, 0.15)',
                    border: '1px solid rgba(255, 182, 193, 0.3)',
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 241, 245, 0.9))'
                  }}
                  headStyle={{ borderBottom: '1px solid rgba(255, 182, 193, 0.3)' }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <StarOutlined style={{ color: '#ff85c0', fontSize: 20, marginRight: 8 }} />
                      <span style={{ fontSize: 18, color: '#ff85c0' }}>粉丝专区</span>
                    </div>
                  }
                >
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <TeamOutlined style={{ fontSize: 60, color: '#ff85c0', marginBottom: 24 }} />
                    <Title level={3} style={{ marginBottom: 24, color: '#ff85c0' }}>
                      加入应援，为爱豆助力
                    </Title>

                    <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
                      输入邀请码和您的昵称，开始完成应援任务，赢取积分，登上排行榜！
                    </Paragraph>

                    <Form
                      form={form}
                      layout="vertical"
                      style={{ width: '100%', maxWidth: 400 }}
                      onFinish={handleFanSubmit}
                    >
                      <Form.Item
                        name="inviteCode"
                        rules={[
                          { required: true, message: '请输入邀请码' },
                          { min: 4, max: 8, message: '邀请码长度为4-8位' }
                        ]}
                      >
                        <Input
                          prefix={<RocketOutlined />}
                          placeholder="输入邀请码"
                          size="large"
                          style={{ borderRadius: 8 }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="nickname"
                        rules={[
                          { required: true, message: '请输入您的昵称' },
                          { max: 15, message: '昵称不能超过15个字符' }
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="输入您的昵称"
                          size="large"
                          style={{ borderRadius: 8 }}
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          block
                          icon={<HeartOutlined />}
                          loading={submitting}
                          style={{
                            borderRadius: 8,
                            height: 50,
                            background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
                            border: 'none',
                            fontSize: 16
                          }}
                        >
                          开始应援
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                </Card>
              </Col>

              {/* 站子管理入口 */}
              <Col xs={24} sm={24} md={10}>
                <Card
                  className="admin-entrance"
                  style={{
                    borderRadius: 12,
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(24, 144, 255, 0.15)',
                    border: '1px solid rgba(24, 144, 255, 0.3)',
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(240, 248, 255, 0.9))'
                  }}
                  headStyle={{ borderBottom: '1px solid rgba(24, 144, 255, 0.3)' }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FireOutlined style={{ color: '#1890ff', fontSize: 20, marginRight: 8 }} />
                      <span style={{ fontSize: 18, color: '#1890ff' }}>站子管理</span>
                    </div>
                  }
                >
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <UserOutlined style={{ fontSize: 60, color: '#1890ff', marginBottom: 24 }} />
                    <Title level={3} style={{ marginBottom: 24, color: '#1890ff' }}>
                      管理您的应援任务
                    </Title>

                    <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
                      创建和管理应援任务、查看粉丝排行榜、设置应援鼓励、生成邀请码
                    </Paragraph>

                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<UserOutlined />}
                        onClick={() => navigate('/login')}
                        style={{
                          borderRadius: 8,
                          height: 50,
                          fontSize: 16
                        }}
                      >
                        管理员登录
                      </Button>

                      <Button
                        type="link"
                        block
                        onClick={() => navigate('/register')}
                      >
                        还没有账号？注册新站子
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Divider>
              <Space>
                <TrophyOutlined style={{ color: '#ffc53d' }} />
                <span>平台特色</span>
              </Space>
            </Divider>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} sm={8}>
                <Card
                  style={{
                    borderRadius: 12,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 182, 193, 0.3)'
                  }}
                >
                  <StarOutlined style={{ fontSize: 36, color: '#ff85c0', marginBottom: 16 }} />
                  <Title level={4} style={{ color: '#ff85c0' }}>多样化应援任务</Title>
                  <Paragraph>
                    微博转评赞、视频观看、投票打榜、超话签到等多种应援形式
                  </Paragraph>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  style={{
                    borderRadius: 12,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(24, 144, 255, 0.3)'
                  }}
                >
                  <TrophyOutlined style={{ fontSize: 36, color: '#ffc53d', marginBottom: 16 }} />
                  <Title level={4} style={{ color: '#ffc53d' }}>实时排行榜</Title>
                  <Paragraph>
                    查看积分排名、任务榜单、当日榜单，为爱豆应援不落人后
                  </Paragraph>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  style={{
                    borderRadius: 12,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(82, 196, 26, 0.3)'
                  }}
                >
                  <HeartOutlined style={{ fontSize: 36, color: '#ff7875', marginBottom: 16 }} />
                  <Title level={4} style={{ color: '#ff7875' }}>鼓励机制</Title>
                  <Paragraph>
                    完成任务获得鼓励和积分，点亮爱豆应援之路
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>

      <Footer style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '15px'
      }}>
        未你 ©{new Date().getFullYear()} 用爱成就梦想
      </Footer>
    </Layout>
  );
};

export default HomePage;
