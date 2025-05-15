import React, { useState } from 'react';
import {
  Layout, Typography, Form, Input, Button, Select,
  Card, message, Space, Radio
} from 'antd';
import { SendOutlined, CommentOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/auth';
import SideMenu from '../components/SideMenu';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Feedback = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('提交反馈:', values);

      // 使用真实的API接口
      const response = await api.post('/api/feedback', values);

      if (response.data.success) {
        message.success('反馈提交成功，感谢您的宝贵意见！');
        form.resetFields();
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>意见反馈</Title>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <Card title="提交您的建议或问题" bordered={false}>
            <Paragraph>
              您的反馈对我们非常重要！请告诉我们您的想法、建议或遇到的问题，我们会认真倾听并不断改进。
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                feedback_type: 'suggestion',
                user_type: user?.role === 'admin' ? 'admin' : 'fan'
              }}
            >
              <Form.Item
                name="user_type"
                label="您的身份"
              >
                <Radio.Group>
                  <Radio.Button value="admin">站子管理员</Radio.Button>
                  <Radio.Button value="fan">粉丝</Radio.Button>
                </Radio.Group>
              </Form.Item>

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

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={loading}
                >
                  提交反馈
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Feedback;
