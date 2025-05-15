import React, { useState, useRef } from 'react';
import { Layout, Button, Card, Typography, Steps, Input, message, Alert } from 'antd';
import { HomeOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const SimpleFanTaskSubmit = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 状态
  const [currentStep, setCurrentStep] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    comment: ''
  });
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);

  // 处理邀请码提交
  const handleInviteCodeSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode) {
      message.error('请输入邀请码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('提交邀请码:', inviteCode);

      // 调用API获取该邀请码下的任务列表
      const response = await axios.get(`/api/fan/tasks`, {
        params: { invite_code: inviteCode }
      });

      console.log('获取到任务列表:', response.data);

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setTasks(response.data);
        setCurrentStep(1); // 进入任务选择步骤
      } else {
        setError('该邀请码下没有可用任务');
        setTasks([]);
      }
    } catch (err) {
      console.error('获取任务失败:', err);
      setError(err.response?.data?.error || '无法获取任务列表，请检查邀请码是否正确');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // 选择任务
  const handleTaskSelect = (task) => {
    console.log('选择任务:', task);
    setSelectedTask(task);
    setCurrentStep(2); // 进入任务提交步骤
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理文件选择
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log('选择文件:', selectedFiles);
    setFiles(selectedFiles);
  };

  // 处理任务提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    if (!formData.nickname) {
      message.error('请输入昵称');
      return;
    }

    if (files.length === 0) {
      message.error('请至少选择一张图片');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      // 构建FormData
      const formDataObj = new FormData();
      formDataObj.append('nickname', formData.nickname);
      formDataObj.append('invite_code', inviteCode);
      formDataObj.append('comment', formData.comment || '');

      // 添加所有文件
      files.forEach((file, index) => {
        console.log(`添加图片${index}:`, file.name);
        formDataObj.append('images', file);
      });

      // 打印FormData内容
      console.log('FormData内容:');
      for (let [key, value] of formDataObj.entries()) {
        if (value instanceof File) {
          console.log(`${key}: 文件 - ${value.name} (${value.size} 字节)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // 发送请求
      console.log(`提交到API: /api/fan/tasks/${selectedTask.id}/submit`);
      const response = await axios.post(`/api/fan/tasks/${selectedTask.id}/submit`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('响应数据:', response.data);
      setResult({
        success: true,
        data: response.data
      });

      // 保存用户信息到localStorage
      const fanInfo = {
        nickname: formData.nickname,
        invite_code: inviteCode
      };
      localStorage.setItem('fanInfo', JSON.stringify(fanInfo));

      // 显示成功消息
      message.success('任务提交成功！');
      setCurrentStep(3); // 进入成功步骤
    } catch (err) {
      console.error('提交任务失败:', err);
      setResult({
        success: false,
        error: err.response?.data?.error || err.message
      });
      message.error('提交失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setInviteCode('');
    setTasks([]);
    setSelectedTask(null);
    setFormData({
      nickname: '',
      comment: ''
    });
    setFiles([]);
    setResult(null);
    setCurrentStep(0);
    setError('');
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header
        style={{
          padding: '0 50px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{ marginRight: 16 }}
          >
            返回首页
          </Button>
          <Title level={3} style={{ margin: 0 }}>简化版任务提交</Title>
        </div>
      </Header>

      <Content style={{ padding: '50px', background: '#f5f5f5' }}>
        <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Steps current={currentStep} style={{ marginBottom: 30 }}>
            <Step title="填写邀请码" />
            <Step title="选择任务" />
            <Step title="提交证明" />
            <Step title="完成" />
          </Steps>

          {/* 步骤一：输入邀请码 */}
          {currentStep === 0 && (
            <div>
              <Title level={4}>请输入站点邀请码</Title>
              <Text>输入正确的邀请码以查看可用任务</Text>

              {error && (
                <Alert
                  message="错误"
                  description={error}
                  type="error"
                  showIcon
                  style={{ margin: '16px 0' }}
                />
              )}

              <form onSubmit={handleInviteCodeSubmit} style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="invite_code" style={{ display: 'block', marginBottom: '5px' }}>
                    邀请码:
                  </label>
                  <input
                    type="text"
                    id="invite_code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  获取任务列表
                </Button>
              </form>
            </div>
          )}

          {/* 步骤二：选择任务 */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Button
                  onClick={() => setCurrentStep(0)}
                  style={{ marginRight: '8px' }}
                >
                  返回
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  邀请码 "{inviteCode}" 的可用任务
                </Title>
              </div>

              <Text>请选择您要提交的任务：</Text>

              {tasks.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                  {tasks.map(task => (
                    <Card
                      key={task.id}
                      style={{ marginBottom: '10px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Title level={5}>{task.title}</Title>
                          <Text>积分: {task.points} 分</Text>
                          {task.due_date && (
                            <div>
                              <Text type="secondary">
                                截止日期: {new Date(task.due_date).toLocaleString()}
                              </Text>
                            </div>
                          )}
                          {task.is_focus_task && (
                            <Text type="danger">【焦点任务】</Text>
                          )}
                          <div style={{ marginTop: '8px' }}>
                            <Text>{task.description}</Text>
                          </div>
                        </div>
                        <Button
                          type="primary"
                          onClick={() => handleTaskSelect(task)}
                        >
                          选择此任务
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ margin: '30px 0', textAlign: 'center' }}>
                  <Text>暂无可用任务</Text>
                </div>
              )}
            </div>
          )}

          {/* 步骤三：提交任务证明 */}
          {currentStep === 2 && selectedTask && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Button
                  onClick={() => setCurrentStep(1)}
                  style={{ marginRight: '8px' }}
                >
                  返回任务列表
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  提交任务: {selectedTask.title}
                </Title>
              </div>

              <Alert
                message="任务说明"
                description={selectedTask.description}
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
              />

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="nickname" style={{ display: 'block', marginBottom: '5px' }}>
                    您的昵称:
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="images" style={{ display: 'block', marginBottom: '5px' }}>
                    上传任务完成图片: <span style={{ fontSize: '12px', color: '#888' }}>(最多5张图片，每张不超过5MB)</span>
                  </label>
                  <input
                    type="file"
                    id="images"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: '#f9f9f9'
                    }}
                  />
                  <div style={{ marginTop: '5px' }}>
                    {files.length > 0 ? (
                      <Text>已选择 {files.length} 个文件</Text>
                    ) : (
                      <Text type="secondary">未选择文件</Text>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="comment" style={{ display: 'block', marginBottom: '5px' }}>
                    留言(选填):
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      minHeight: '80px'
                    }}
                    placeholder="请输入留言"
                  />
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<UploadOutlined />}
                  loading={submitting}
                  disabled={files.length === 0 || submitting}
                >
                  提交任务
                </Button>
              </form>

              {result && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: result.success ? '#f6ffed' : '#fff2f0',
                  borderRadius: '4px'
                }}>
                  <Title level={4}>{result.success ? '上传成功' : '上传失败'}</Title>
                  <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                    {JSON.stringify(result.success ? result.data : { error: result.error }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 步骤四：提交成功 */}
          {currentStep === 3 && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <CheckCircleOutlined
                style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }}
              />
              <Title level={3}>任务提交成功!</Title>
              <Text>您的任务提交已成功，管理员会尽快审核您的提交。</Text>

              {result && result.success && (
                <div style={{ margin: '20px 0' }}>
                  <pre style={{
                    textAlign: 'left',
                    backgroundColor: '#f6ffed',
                    padding: '15px',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <Button type="primary" onClick={resetForm} style={{ marginRight: '10px' }}>
                  提交新任务
                </Button>
                <Button onClick={() => navigate('/')}>
                  返回首页
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        未你任务管理系统 ©{new Date().getFullYear()} 版权所有
      </Footer>
    </Layout>
  );
};

export default SimpleFanTaskSubmit;
