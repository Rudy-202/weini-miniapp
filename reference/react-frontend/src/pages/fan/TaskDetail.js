import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Form, Input, Button, Upload, Space, Spin,
  Alert, Card, Tag, Typography, Modal, message
} from 'antd';
import {
  UploadOutlined, DeleteOutlined,
  FireOutlined, ClockCircleOutlined,
  PictureOutlined, CommentOutlined,
  StarOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TaskDetail = () => {
  console.log("---- TaskDetail COMPONENT SCRIPT EXECUTING (vNext) ----");
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState('');

  // 表单数据
  const [submission, setSubmission] = useState({
    nickname: '',
    images: [],
    comment: ''
  });

  // 对话框状态
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // 鼓励弹窗状态
  const [showEncouragementModal, setShowEncouragementModal] = useState(false);
  const [globalEncouragement, setGlobalEncouragement] = useState({
    image_url: null,
    message: ''
  });

  // 文件上传引用
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTaskDetails();

    // 从localStorage获取用户信息
    const fanInfo = localStorage.getItem('fanInfo');
    if (fanInfo) {
      try {
        const { nickname: savedNickname } = JSON.parse(fanInfo);
        setNickname(savedNickname || '');
        setSubmission(prev => ({ ...prev, nickname: savedNickname || '' }));
      } catch (e) {
        console.error('解析粉丝信息失败:', e);
      }
    }
  }, [taskId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    };
    try {
      return new Date(dateString).toLocaleString('zh-CN', options);
    } catch (e) {
      console.warn('Error formatting date:', e, dateString);
      return dateString; // Fallback
    }
  };

  const getCountdown = (dueDateString) => {
    if (!task || !dueDateString) return { text: 'N/A', expired: true, timestamp: 0 };

    const now = new Date().getTime();
    const dueDate = new Date(dueDateString).getTime();
    const diff = dueDate - now;

    if (diff <= 0) {
      return { text: '已截止', expired: true, timestamp: diff };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let text = '';
    if (days > 0) text += `${days}天 `;
    if (hours > 0 || days > 0) text += `${hours}小时 `;
    if (minutes > 0 || hours > 0 || days > 0) text += `${minutes}分 `;
    text += `${seconds}秒`;

    return { text: text.trim(), expired: false, timestamp: diff };
  };

  const showErrorDialog = (message) => {
    setDialogMessage(message);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setDialogMessage('');
  };

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);

    // 从localStorage获取粉丝信息
    const fanInfo = localStorage.getItem('fanInfo');
    if (!fanInfo) {
      setError('无法获取用户信息，请确保已正确登录。');
      setLoading(false);
      return;
    }

    const { invite_code: fanInviteCode, nickname: fanNickname } = JSON.parse(fanInfo);
    // 预填表单
    setSubmission(prev => ({ ...prev, nickname: fanNickname || '' }));

    if (!fanInviteCode) {
      setError('无法获取邀请码，请确保已正确登录。');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/api/fan/tasks/${taskId}`, {
        params: {
          nickname: fanNickname || '',
          invite_code: fanInviteCode
        }
      });
      setTask(response.data);
    } catch (err) {
      console.error('获取任务详情失败:', err);
      setError(err.response?.data?.error || '获取任务详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (submission.images.length >= 5) {
      showErrorDialog('最多只能选择5张图片。');
      return;
    }
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = null;

    if (files.length === 0) return;

    const totalAfterAdd = submission.images.length + files.length;
    if (totalAfterAdd > 5) {
      showErrorDialog(`您最多还能选择 ${5 - submission.images.length} 张图片。本次选择 ${files.length} 张已超出限制。`);
      return;
    }

    const newImages = [...submission.images];
    files.forEach(file => {
      newImages.push({
        file: file,
        previewUrl: URL.createObjectURL(file)
      });
    });

    setSubmission(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const removeImage = (index) => {
    if (submission.images[index]) {
      URL.revokeObjectURL(submission.images[index].previewUrl);
      const newImages = [...submission.images];
      newImages.splice(index, 1);
      setSubmission(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const submitTask = async () => {
    console.log('---- DEBUG: TaskDetail.js submitTask CALLED ----');
    setSubmitting(true);
    setError(null);
    setShowDialog(false);

    // 从localStorage获取粉丝信息
    const fanInfo = localStorage.getItem('fanInfo');
    if (!fanInfo) {
      showErrorDialog('用户信息丢失，无法提交任务。请重新登录。');
      setSubmitting(false);
      return;
    }

    const { invite_code: fanInviteCode, nickname: savedNickname } = JSON.parse(fanInfo);

    // 使用保存的昵称或表单中的昵称
    if (!submission.nickname) {
      setSubmission(prev => ({
        ...prev,
        nickname: savedNickname || ''
      }));
    }

    if (!submission.nickname) {
      showErrorDialog('请输入您的昵称。');
      setSubmitting(false);
      return;
    }
    if (submission.images.length === 0) {
      showErrorDialog('请至少上传一张图片。');
      setSubmitting(false);
      return;
    }

    // 准备上传文件 - 使用与UploadTest.js相同的逻辑
    const formData = new FormData();
    formData.append('nickname', submission.nickname);
    formData.append('comment', submission.comment);
    formData.append('invite_code', fanInviteCode);

    // 调试信息
    console.log('准备上传图片数量:', submission.images.length);

    // 添加图片到FormData - 直接使用File对象
    submission.images.forEach((imageObject, index) => {
      console.log(`添加图片${index}:`, imageObject.file.name, `(${imageObject.file.size} 字节)`);
      formData.append('images', imageObject.file);
      console.log(`---- DEBUG: Appended file to FormData: ${imageObject.file.name} ----`);
    });

    // 打印FormData内容，确认文件附加成功
    console.log('---- DEBUG: FormData content BEFORE axios.post ----');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`FormData ${key}: 文件 - ${value.name} (${value.size} 字节)`);
      } else {
        console.log(`FormData ${key}: ${value}`);
      }
    }

    try {
      console.log(`提交到API: /api/fan/tasks/${taskId}/submit`);
      const response = await axios.post(`/api/fan/tasks/${taskId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('任务提交成功:', response.data);

      // 更新粉丝信息到localStorage
      const updatedFanInfo = {
        nickname: submission.nickname,
        invite_code: fanInviteCode
      };
      localStorage.setItem('fanInfo', JSON.stringify(updatedFanInfo));

      // 获取任务积分
      const taskPoints = task?.points || 0;

      // 使用查询参数重定向到粉丝主页，并触发鼓励弹窗，同时添加刷新排行榜标记和用户昵称
      navigate({
        pathname: '/fan/home',
        search: `?taskCompleted=true&taskId=${taskId}&points=${taskPoints}&forceRefresh=true&nickname=${encodeURIComponent(submission.nickname)}`
      });
    } catch (err) {
      console.error('提交任务失败:', err);
      if (err.response) {
        console.error('错误状态码:', err.response.status);
        console.error('错误响应数据:', err.response.data);
      }
      if (err.response?.status === 413) {
        showErrorDialog('图片文件太大，请压缩后重试');
      } else if (err.response?.status === 415) {
        showErrorDialog('只支持 JPG、PNG 和 GIF 格式的图片');
      } else {
        showErrorDialog(err.response?.data?.error || '提交失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fetchAndShowEncouragement = async () => {
    try {
      const response = await axios.get('/api/fan/global-encouragement-settings');
      if (response.data) {
        setGlobalEncouragement({
          image_url: response.data.default_encouragement_image_url || null,
          message: response.data.default_encouragement_message || '任务成功完成！太棒了！'
        });
      }
    } catch (err) {
      console.error('获取全局鼓励设置失败:', err);
      setGlobalEncouragement({
        message: '任务成功完成！太棒了！',
        image_url: null
      });
    } finally {
      setShowEncouragementModal(true);
      setSubmitting(false);
    }
  };

  const getEncouragementImageUrl = (relativePath) => {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    const baseUrl = axios.defaults.baseURL || '';
    return `${baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
  };

  const closeEncouragementAndNavigate = () => {
    setShowEncouragementModal(false);
    navigate(`/task/${taskId}/leaderboard`, {
      search: `?invite_code=${localStorage.getItem('fanInviteCode')}&fan_nickname=${submission.nickname}`
    });
  };

  const onFormFinishFailed = (errorInfo) => {
    console.log('---- DEBUG: AntD Form onFinishFailed triggered ----');
    console.log('AntD Form Validation Failed:', errorInfo);
    errorInfo.errorFields.forEach((field) => {
      console.log(`Field: ${field.name.join('.')}, Errors: ${field.errors.join(', ')}`);
    });
    // Optionally, display a generic message or the first error to the user
    if (errorInfo.errorFields.length > 0) {
        // Using existing showErrorDialog or a new mechanism if preferred
        // For now, just logging, as showErrorDialog might conflict with AntD's own field highlighting
        message.error(`表单校验失败: ${errorInfo.errorFields[0].errors.join(', ')}`);
    }
  };

  const handleNicknameChange = (e) => {
    setSubmission(prev => ({
      ...prev,
      nickname: e.target.value
    }));
  };

  const handleCommentChange = (e) => {
    setSubmission(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Title level={4} style={{ margin: 0 }}>任务详情</Title>
          {task && (
            <div className="flex items-center space-x-2">
              {task.is_focus_task && <Tag color="gold" icon={<StarOutlined />}>焦点任务</Tag>}
              {task.flame_mode_enabled && <Tag color="orange" icon={<FireOutlined />}>浴火模式</Tag>}
              {task.time_limit_mode && <Tag color="blue" icon={<ClockCircleOutlined />}>限时模式</Tag>}
            </div>
          )}
        </div>
        <Button
          type="default"
          onClick={() => navigate('/fan/home')}
        >
          返回
        </Button>
      </div>

      {loading && (
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      )}

      {error && !loading && (
        <Alert message={error} type="error" showIcon />
      )}

      {!loading && !error && task && (
        <>
          {/* 任务信息 */}
          <Card
            className={`mb-6 ${
              task.flame_mode_enabled
                ? 'border-orange-500 bg-gradient-to-br from-white to-orange-50'
                : task.time_limit_mode
                ? 'border-blue-500 bg-gradient-to-br from-white to-blue-50'
                : ''
            }`}
            style={{ borderWidth: task.flame_mode_enabled || task.time_limit_mode ? '2px' : '1px' }}
          >
            <Title level={4}>
              {task.title}
              {task.display_focus_icon && (
                <span className="ml-2 text-yellow-500" title="焦点任务">{task.display_focus_icon}</span>
              )}
            </Title>
            <Paragraph className="text-gray-600 mb-4">{task.description}</Paragraph>

            {/* 新增：限时任务的详细信息展示 */}
            {task.time_limit_mode && (
              <Alert
                message={
                  <div>
                    <p className="font-semibold text-blue-700 flex items-center">
                      <ClockCircleOutlined className="mr-2" />
                      类型: 限时任务
                    </p>
                    <p><span className="font-medium">截止时间:</span> {formatDate(task.due_date)}</p>
                    {task.status === 'active' && !getCountdown(task.due_date).expired ? (
                      <p>
                        <span className="font-medium">剩余时间:</span> <span className="text-blue-600 font-semibold">{getCountdown(task.due_date).text}</span>
                      </p>
                    ) : getCountdown(task.due_date).expired ? (
                      <p>
                        <span className="font-medium text-red-600">状态: 已截止</span>
                      </p>
                    ) : null}
                    {task.bonus_points > 0 && <p><span className="font-medium">按时奖励:</span> +{task.bonus_points} 积分</p>}
                    <p className="mt-1 text-xs text-gray-600">请注意：这是一个限时任务，请在规定时间内完成以获得额外奖励。</p>
                  </div>
                }
                type="info"
                className="mb-4"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-gray-600">任务积分</Text>
                <Paragraph className="font-medium">
                  {task.is_focus_task ? (
                    <span>
                      ({task.points}
                      {task.bonus_points > 0 && <>+{task.bonus_points}</>})
                      ×2 = <span className="text-pink-500">{(Number(task.points) + Number(task.bonus_points || 0)) * 2}</span> 分
                      <span className="text-xs text-pink-500 ml-1">（<StarOutlined /> 焦点任务双倍积分）</span>
                    </span>
                  ) : (
                    <span>
                      {task.points}
                      {task.bonus_points > 0 && <>+<span className="text-orange-500 flex items-center inline-flex">
                        <span role="img" aria-label="gift" className="mr-1">🎁</span>
                        {task.bonus_points}
                      </span></>}
                      = <span className="text-blue-500">{Number(task.points) + Number(task.bonus_points || 0)}</span> 分
                      {task.bonus_points > 0 && <span className="text-xs text-blue-500 ml-1">（含限时奖励）</span>}
                    </span>
                  )}
                </Paragraph>
              </div>
              <div>
                <Text className="text-gray-600">创建时间</Text>
                <Paragraph className="font-medium">{formatDate(task.created_at)}</Paragraph>
              </div>
            </div>
          </Card>

          {/* 提交表单 */}
          <Card title="提交任务">
            {task.flame_mode_enabled && (
              <Alert
                message={
                  <div className="flex items-center">
                    <FireOutlined className="mr-2 text-orange-500" />
                    <span>浴火模式已开启：您可以多次提交此任务</span>
                  </div>
                }
                type="warning"
                className="mb-4"
              />
            )}

            <Form layout="vertical" onFinish={submitTask} onFinishFailed={onFormFinishFailed}>
              <Form.Item
                label="您的昵称"
                name="nickname"
                rules={[{ required: true, message: '请输入您的昵称' }]}
              >
                <Input
                  placeholder="请输入您的昵称"
                  value={submission.nickname}
                  onChange={handleNicknameChange}
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    上传截图 <span className="text-xs font-normal text-gray-500">(最多5张图片)</span>
                  </span>
                }
              >
                <>
                  {/* 隐藏的文件上传输入框 */}
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    multiple
                  />

                  <Button
                    onClick={triggerFileInput}
                    icon={<UploadOutlined />}
                    disabled={submission.images.length >= 5 || submitting}
                    className="mb-2"
                  >
                    {submission.images.length >= 5 ? '已达数量上限' : '添加图片'} ({submission.images.length}/5)
                  </Button>

                  {/* 图片预览 */}
                  {submission.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {submission.images.map((imageObject, index) => (
                        <div key={index} className="relative group">
                          <div className="w-full h-24 rounded-lg border overflow-hidden">
                            <img
                              src={imageObject.previewUrl}
                              alt={`预览 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            onClick={() => removeImage(index)}
                            type="danger"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            size="small"
                            className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={submitting}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              </Form.Item>

              <Form.Item
                label="备注说明"
                name="comment"
              >
                <TextArea
                  rows={3}
                  placeholder="请输入备注说明（选填）"
                  value={submission.comment}
                  onChange={handleCommentChange}
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={
                    submitting ||
                    submission.images.length === 0 ||
                    (task.time_limit_mode && getCountdown(task.due_date).expired)
                  }
                  className="rounded-lg text-base font-medium"
                >
                  {submitting
                    ? '提交中...'
                    : (task.time_limit_mode && getCountdown(task.due_date).expired)
                    ? '已截止'
                    : '提交任务'
                  }
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}

      {/* 提示对话框 */}
      <Modal
        title="提示"
        open={showDialog}
        onCancel={closeDialog}
        footer={[
          <Button key="ok" type="primary" onClick={closeDialog}>
            确定
          </Button>
        ]}
      >
        <p>{dialogMessage}</p>
      </Modal>

      {/* 鼓励弹窗 */}
      <Modal
        open={showEncouragementModal}
        closable={false}
        footer={null}
        centered
        className="encouragement-modal"
        styles={{ body: { padding: 0 } }}
      >
        {globalEncouragement.image_url && (
          <img
            src={getEncouragementImageUrl(globalEncouragement.image_url)}
            alt="鼓励图片"
            className="max-h-60 w-auto object-contain mx-auto mb-4 rounded-md"
          />
        )}
        <p className="text-xl font-semibold text-gray-700 mb-4 text-center">
          {globalEncouragement.message || '任务完成！'}
        </p>
        <Button
          type="primary"
          block
          onClick={closeEncouragementAndNavigate}
          className="h-auto py-3 text-lg rounded-lg bg-gradient-to-r from-green-500 to-green-600 border-0"
        >
          太棒了！查看排行
        </Button>
      </Modal>

      <style>{`
        .flame-mode {
          border-color: #f59e0b;
          background: linear-gradient(to bottom right, #fff, #fff5f0);
        }

        .time-limit-mode {
          border-color: #3b82f6;
          background: linear-gradient(to bottom right, #fff, #f0f5ff);
        }

        .encouragement-modal {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default TaskDetail;
