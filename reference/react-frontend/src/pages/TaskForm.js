import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Menu, Typography, Card, Form, Input,
  Button, DatePicker, InputNumber, Switch, Select,
  Spin, message, Space, Tag, Alert, Modal
} from 'antd';
import {
  SaveOutlined, CloseOutlined, RocketOutlined, LinkOutlined,
  ReloadOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTask, getTaskDetail, updateTask, getInviteCodes, checkInviteCodeFocusTaskStatus } from '../api/auth';
import api from '../api/auth'; // 直接导入api实例
import moment from 'moment';
import SideMenu from '../components/SideMenu';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TaskForm = () => {
  // 获取用户上下文和路由信息
  const { user, stations: authStations } = useAuth();
  console.log('TaskForm 组件初始化：');
  console.log('user数据:', user);
  console.log('stations数据:', authStations);
  console.log('stations类型:', typeof authStations, Array.isArray(authStations));
  console.log('user.stations数据:', user?.stations);
  console.log('user.stations类型:', typeof user?.stations, Array.isArray(user?.stations));

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [form] = Form.useForm();

  // 判断是否是编辑模式
  const isEditMode = !!params.id || !!params.taskId;
  const taskId = params.id || params.taskId;

  // 调试路由参数
  console.log('TaskForm路由参数:', params);
  console.log('是否编辑模式:', isEditMode);
  console.log('任务ID:', taskId);

  // 组件状态
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [initComplete, setInitComplete] = useState(false);

  // 邀请码相关状态
  const [inviteCodes, setInviteCodes] = useState([]);
  const [selectedInviteCode, setSelectedInviteCode] = useState(null);
  const [inviteCodesLoading, setInviteCodesLoading] = useState(false);
  const [inviteCodesError, setInviteCodesError] = useState('');

  // 添加状态
  const [focusTaskStatus, setFocusTaskStatus] = useState(null);
  const [checkingFocusStatus, setCheckingFocusStatus] = useState(false);

  // 监听时间限制模式状态
  const [timeLimitMode, setTimeLimitMode] = useState(false);

  // 用于强制更新组件的state
  const [, forceUpdate] = useState({});

  // 表单值变化时的处理函数
  const handleValuesChange = (changedValues) => {
    if ('time_limit_mode' in changedValues) {
      const newTimeLimitMode = changedValues.time_limit_mode;
      console.log('时间限制模式切换为:', newTimeLimitMode);
      setTimeLimitMode(newTimeLimitMode);

      // 如果关闭了时间限制模式，清空相关字段
      if (!newTimeLimitMode) {
        form.setFieldsValue({
          due_date: null,
          bonus_points: 0
        });
      }

      // 强制重新渲染
      forceUpdate({});
    }
  };

  // 加载邀请码列表的方法
  const loadInviteCodes = async (stationId) => {
    if (!stationId) {
      console.warn('加载邀请码失败: 没有提供站点ID');
      setInviteCodesError('请先选择一个站点');
      setInviteCodes([]);
      // 即使没有站点ID，也不应该阻止整个表单的使用
      return [];
    }

    try {
      setInviteCodesLoading(true);
      setInviteCodesError('');
      console.log('正在加载站点ID为', stationId, '的邀请码...');

      // 直接使用axios调用，避免使用getInviteCodes可能存在的问题
      const response = await api.get('/api/station/invite-codes', {
        params: { station_id: stationId }
      });

      console.log('邀请码接口原始响应:', response);

      const codes = response.data;
      console.log('获取到邀请码列表类型:', typeof codes, Array.isArray(codes));
      console.log('获取到邀请码列表数据:', codes);

      if (!codes || !Array.isArray(codes) || codes.length === 0) {
        console.warn('该站点下没有邀请码');
        setInviteCodesError('该站点下没有可用的邀请码，请先创建邀请码');
        setInviteCodes([]);
        form.setFieldsValue({ invite_code_id: undefined });
        setSelectedInviteCode(null);
        return [];
      }

      // 按创建时间排序，最新的在前面
      const sortedCodes = codes.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      setInviteCodes(sortedCodes);
      console.log('邀请码列表已更新:', sortedCodes);

      // 如果是编辑模式并且任务已关联邀请码，尝试找到匹配的
      const currentTaskInviteCodeId = form.getFieldValue('invite_code_id');
      console.log('当前表单邀请码ID:', currentTaskInviteCodeId);

      if (currentTaskInviteCodeId) {
        const matchingCode = sortedCodes.find(c => c.id === currentTaskInviteCodeId);
        if (matchingCode) {
          console.log('找到匹配的邀请码:', matchingCode);
          setSelectedInviteCode(matchingCode);
          return sortedCodes;
        }
      }

      // 如果没有预选的邀请码或找不到匹配的，默认选最新的
      if (sortedCodes.length > 0) {
        console.log('默认选择最新邀请码:', sortedCodes[0]);
        setSelectedInviteCode(sortedCodes[0]);
        form.setFieldsValue({ invite_code_id: sortedCodes[0].id });
        console.log('已设置默认邀请码到表单:', sortedCodes[0].id, sortedCodes[0].code);
      }

      return sortedCodes;
    } catch (error) {
      console.error('加载邀请码失败:', error);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误响应数据:', error.response.data);
      }

      // 改为只在控制台显示错误，不弹窗
      setInviteCodesError('加载邀请码失败，请检查网络连接或稍后重试');
      setInviteCodes([]);
      form.setFieldsValue({ invite_code_id: undefined });
      return [];
    } finally {
      setInviteCodesLoading(false);
      console.log('邀请码加载状态已结束');
    }
  };

  // 加载任务详情函数
  const loadTaskDetail = async () => {
    try {
      setLoading(true);
      console.log('加载任务详情，任务ID:', taskId);

      const taskData = await getTaskDetail(taskId);
      console.log('获取到任务详情:', taskData);

      if (!taskData) {
        message.error('无法获取任务详情');
        return;
      }

      // 设置所选站点
      const station = authStations.find(s => s.id === taskData.station_id);
      if (station) {
        setSelectedStation(station);

        // 加载该站点的邀请码
        console.log('加载站点邀请码:', station.id);
        const codes = await loadInviteCodes(station.id);

        // 准备表单值
        const formValues = {
          ...taskData,
          station_id: station.id,
          invite_code_id: taskData.invite_code_id,
          // 处理时间限制模式相关字段
          time_limit_mode: !!taskData.due_date, // 根据是否有截止日期决定时间限制模式
          due_date: taskData.due_date ? moment(taskData.due_date) : null,
          // 如果没有时间限制模式，确保奖励积分为0
          bonus_points: taskData.due_date ? (taskData.bonus_points || 0) : 0
        };

        console.log('设置表单值:', formValues);
        form.setFieldsValue(formValues);

        // 确认表单值已设置
        setTimeout(() => {
          console.log('表单当前值:', form.getFieldsValue());
        }, 100);

        // 如果有邀请码ID且邀请码列表已加载，设置选中的邀请码
        if (taskData.invite_code_id && codes.length > 0) {
          const matchingCode = codes.find(c => c.id === taskData.invite_code_id);
          if (matchingCode) {
            console.log('找到匹配的邀请码:', matchingCode);
            setSelectedInviteCode(matchingCode);

            // 检查焦点任务状态
            if (taskData.invite_code) {
              await checkFocusTaskStatus(taskData.invite_code);
            }
          }
        }
      } else {
        message.error('找不到任务关联的站点，可能数据已被删除');
      }
    } catch (error) {
      console.error('加载任务详情失败:', error);
      message.error(error.error || '加载任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化表单
  useEffect(() => {
    const initForm = async () => {
      try {
        // 设置初始状态
        setLoading(true);
        setInitComplete(false);

        // 添加调试日志
        console.log('TaskForm 初始化表单，模式:', isEditMode ? '编辑' : '创建');
        console.log('任务ID:', taskId);
        console.log('用户站点数据:', authStations);

        // 检查用户数据
        if (!user || !authStations || authStations.length === 0) {
          console.warn('没有可用站点数据');
          message.warning('没有可用站点，请先创建站点');
          setInitComplete(true);
          setLoading(false);
          return;
        }

        // 设置站点列表
        setStations(authStations);

        // 编辑模式：加载任务详情
        if (isEditMode && taskId) {
          console.log('编辑模式，加载任务ID:', taskId);
          await loadTaskDetail();
        }
        // 创建模式
        else {
          let selectedStationId = null;

          // 1. 优先使用URL中的stationId
          if (location.state?.stationId) {
            selectedStationId = location.state.stationId;
            console.log('使用URL传递的站点ID:', selectedStationId);
          }
          // 2. 其次使用localStorage中保存的站点
          else {
            const savedStationId = localStorage.getItem('selectedStationId');
            if (savedStationId) {
              selectedStationId = savedStationId;
              console.log('使用localStorage保存的站点ID:', selectedStationId);
            }
          }

          // 3. 查找对应的站点对象
          let station = null;
          if (selectedStationId) {
            station = authStations.find(s => s.id === selectedStationId);
          }

          // 4. 如果没找到，则使用第一个站点
          if (!station && authStations.length > 0) {
            station = authStations[0];
            console.log('未找到指定站点，使用默认站点:', station.name);
          }

          // 5. 设置选中的站点
          if (station) {
            console.log('设置选中站点:', station.name);
            setSelectedStation(station);
            form.setFieldsValue({ station_id: station.id });

            // 更新localStorage
            localStorage.setItem('selectedStationId', station.id);
            localStorage.setItem('selectedStationName', station.name);

            // 6. 加载该站点的邀请码
            console.log('加载站点邀请码:', station.id);
            await loadInviteCodes(station.id);
          }
        }
      } catch (err) {
        console.error('初始化表单时出错:', err);
        message.error('加载数据失败，请刷新页面重试');
      } finally {
        // 确保状态更新
        setLoading(false);
        console.log('初始化完成，解除禁用状态');
        setTimeout(() => setInitComplete(true), 100);
      }
    };

    initForm();
  }, [user, isEditMode, taskId]);

  // 处理站点变更
  const handleStationChange = (stationId) => {
    console.log('站点变更为:', stationId);
    const station = stations.find(s => s.id === stationId);
    if (station) {
      // 重置邀请码相关状态
      setSelectedStation(station);
      setInviteCodesLoading(true);
      setInviteCodes([]);
      setSelectedInviteCode(null);
      setInviteCodesError('');
      setFocusTaskStatus(null); // 重置焦点任务状态

      // 更新localStorage中的站点
      localStorage.setItem('selectedStationId', station.id);
      localStorage.setItem('selectedStationName', station.name);

      form.setFieldsValue({
        station_id: stationId,
        invite_code_id: undefined, // 清空邀请码
        is_focus_task: false, // 重置焦点任务选项
        time_limit_mode: false, // 重置时间限制模式
        due_date: null, // 清空截止日期
        bonus_points: 0 // 清空奖励积分
      });

      // 刷新邀请码列表
      setTimeout(async () => {
        try {
          console.log('加载站点邀请码:', stationId);
          const response = await api.get('/api/station/invite-codes', {
            params: { station_id: stationId }
          });

          const codes = response.data;
          console.log('站点变更后获取邀请码:', codes);

          if (codes && Array.isArray(codes) && codes.length > 0) {
            // 排序 - 最新在前
            const sortedCodes = codes.sort((a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
            );

            setInviteCodes(sortedCodes);

            // 默认选第一个
            const defaultCode = sortedCodes[0];
            setSelectedInviteCode(defaultCode);
            form.setFieldsValue({ invite_code_id: defaultCode.id });
            console.log('站点变更后设置默认邀请码:', defaultCode.id);

            // 检查默认邀请码的焦点任务状态
            if (defaultCode.code) {
              await checkFocusTaskStatus(defaultCode.code);
            }
          } else {
            setInviteCodesError('该站点下没有可用邀请码，请先创建邀请码');
          }
        } catch (error) {
          console.error('站点变更后加载邀请码失败:', error);
          setInviteCodesError('加载邀请码失败，请重试或刷新页面');
        } finally {
          setInviteCodesLoading(false);
        }
      }, 100);
    }
  };

  // 刷新邀请码列表
  const refreshInviteCodes = () => {
    if (selectedStation) {
      setInviteCodesLoading(true);
      setInviteCodes([]);
      setInviteCodesError('');
      console.log('刷新站点邀请码:', selectedStation.id);

      setTimeout(async () => {
        try {
          const response = await api.get('/api/station/invite-codes', {
            params: { station_id: selectedStation.id }
          });

          const codes = response.data;
          console.log('刷新获取邀请码:', codes);

          if (codes && Array.isArray(codes) && codes.length > 0) {
            // 排序 - 最新在前
            const sortedCodes = codes.sort((a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
            );

            setInviteCodes(sortedCodes);

            // 保留当前选择，如果找不到则选第一个
            const currentInviteCodeId = form.getFieldValue('invite_code_id');
            if (currentInviteCodeId) {
              const matchingCode = sortedCodes.find(c => c.id === currentInviteCodeId);
              if (matchingCode) {
                setSelectedInviteCode(matchingCode);
                console.log('刷新后保留当前选择邀请码:', matchingCode.id);
                return;
              }
            }

            // 默认选第一个
            const defaultCode = sortedCodes[0];
            setSelectedInviteCode(defaultCode);
            form.setFieldsValue({ invite_code_id: defaultCode.id });
            console.log('刷新后设置默认邀请码:', defaultCode.id);
          } else {
            setInviteCodesError('该站点下没有可用邀请码，请先创建邀请码');
          }
        } catch (error) {
          console.error('刷新邀请码失败:', error);
          setInviteCodesError('刷新邀请码失败，请重试或刷新页面');
        } finally {
          setInviteCodesLoading(false);
        }
      }, 100);
    } else {
      message.warn('请先选择站点才能加载邀请码');
    }
  };

  // 检查焦点任务状态的函数
  const checkFocusTaskStatus = async (inviteCode) => {
    if (!inviteCode) {
      console.warn('无法检查焦点任务状态: 邀请码为空');
      return null;
    }

    try {
      setCheckingFocusStatus(true);
      console.log('开始检查邀请码焦点任务状态:', inviteCode);

      // 使用导入的API函数，确保直接调用checkInviteCodeFocusTaskStatus而不是api.get
      const statusData = await checkInviteCodeFocusTaskStatus(inviteCode);

      // 详细输出调试信息
      console.log('焦点任务状态响应:', statusData);

      setFocusTaskStatus(statusData);
      return statusData;
    } catch (error) {
      console.error('检查焦点任务状态失败:', error);

      // 优化错误提示
      let errorMessage = '检查焦点任务状态失败';
      if (error.error) {
        if (error.error.includes('no property "is_active"')) {
          errorMessage = '系统配置错误，请联系管理员修复邀请码状态问题';
        } else if (error.error.includes('邀请码不存在')) {
          errorMessage = '邀请码不存在或已失效';
        } else {
          errorMessage = error.error;
        }
      } else if (error.message) {
        errorMessage = `服务器错误: ${error.message}`;
      }

      message.error(errorMessage);
      return null;
    } finally {
      setCheckingFocusStatus(false);
    }
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      console.log('提交表单数据:', values);
      console.log('当前选中的邀请码:', selectedInviteCode);

      // 处理日期格式
      if (values.due_date) {
        values.due_date = values.due_date.toISOString();
      }

      // 根据时间限制模式设置截止日期和奖励积分
      if (!values.time_limit_mode) {
        // 如果时间限制模式未开启，确保截止日期和奖励积分被清空
        values.due_date = null;
        values.bonus_points = 0;
      } else if (!values.due_date) {
        // 如果时间限制模式开启但没有设置截止日期
        message.error('开启时间限制模式时，必须设置截止日期');
        setSubmitting(false);
        return;
      }

      // 默认时间配置
      if (!values.time_config) {
        values.time_config = {
          limit_hours: null,
          bonus_points_on_time: 0,
          fixed_start_time: null,
          fixed_end_time: null
        };
      }

      // 确保有站点ID
      if (!values.station_id && selectedStation) {
        values.station_id = selectedStation.id;
      }

      // 确保有邀请码ID
      if (!values.invite_code_id && selectedInviteCode) {
        console.log('从selectedInviteCode获取邀请码ID:', selectedInviteCode.id);
        values.invite_code_id = selectedInviteCode.id;
      }

      console.log('最终提交数据:', values);

      if (!values.station_id) {
        message.error('请选择站点');
        return;
      }

      if (!values.invite_code_id) {
        message.error('请选择邀请码');
        return;
      }

      // 检查如果要设置焦点任务，是否符合条件
      if (values.is_focus_task && selectedInviteCode && selectedInviteCode.code) {
        console.log('表单提交时检查焦点任务状态:', selectedInviteCode.code);

        try {
          const status = await checkFocusTaskStatus(selectedInviteCode.code);
          console.log('提交前获取的焦点任务状态:', status);

          if (!status) {
            console.error('无法获取焦点任务状态');
            message.error('无法获取焦点任务状态，请刷新页面重试');
            setSubmitting(false);
            return;
          }

          // 如果已有焦点任务或在冷却期内，且不是编辑当前焦点任务，则不允许提交
          if (status.has_focus_task && !isEditMode) {
            console.log('检测到已有焦点任务，阻止提交');
            message.error(`该邀请码下已存在焦点任务: ${status.focus_task?.title || '未知任务'}。每个邀请码下同时只能有一个焦点任务。`);
            setSubmitting(false);
            return;
          } else if (status.is_in_cooldown && (!isEditMode || !taskId)) {
            console.log('检测到冷却期限制，阻止提交');
            const cooldownUntil = status.cooldown_until_time ? new Date(status.cooldown_until_time) : null;
            const formattedTime = cooldownUntil ?
              `${cooldownUntil.toLocaleDateString()} ${cooldownUntil.toLocaleTimeString()}` :
              '未知时间';

            message.error(`焦点任务状态在24小时内只能修改一次。您可以在 ${formattedTime} 后再次设置焦点任务。`);
            setSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('提交前检查焦点任务状态失败:', error);
          message.error('检查焦点任务状态失败，请稍后重试');
          setSubmitting(false);
          return;
        }
      }

      // 提交表单
      let result;
      try {
        if (isEditMode) {
          result = await updateTask(taskId, values);
          message.success('任务更新成功');
        } else {
          result = await createTask(values);
          console.log('创建任务成功，返回结果:', result);
          message.success('任务创建成功');
        }

        // 返回任务列表页并传递参数，指示需要刷新和使用哪个站点的数据
        console.log('导航回任务列表页，传递刷新参数和站点ID:', values.station_id);
        navigate('/tasks', {
          state: {
            refresh: true,
            stationId: values.station_id,
            timestamp: new Date().getTime() // 添加时间戳确保state变化
          }
        });
      } catch (error) {
        console.error('提交表单失败:', error);

        // 处理取消焦点任务被拒绝的情况
        if (error.error && error.error.includes('焦点任务状态在24小时内不能取消')) {
          Modal.error({
            title: '无法取消焦点任务',
            content: error.error,
            okText: '我知道了'
          });

          // 如果正在尝试取消焦点任务但被拒绝，则重置表单中的焦点任务状态为启用
          if (isEditMode && !values.is_focus_task) {
            form.setFieldsValue({ is_focus_task: true });
          }
        } else {
          message.error(error.error || (isEditMode ? '更新任务失败' : '创建任务失败'));
        }
      }
    } catch (error) {
      console.error('提交表单失败:', error);
      message.error(error.error || (isEditMode ? '更新任务失败' : '创建任务失败'));
    } finally {
      setSubmitting(false);
    }
  };

  // 渲染邀请码选项标签
  const renderInviteCodeOption = (code) => (
    <Select.Option key={code.id} value={code.id}>
      <Space>
        <span>{code.code}</span>
        <Tag color={code.status === 'active' ? 'green' : 'red'}>
          {code.status === 'active' ? '激活' : '禁用'}
        </Tag>
        <span style={{ color: '#888', fontSize: '12px' }}>
          {code.description ? (code.description.length > 10 ? code.description.slice(0, 10) + '...' : code.description) : ''}
        </span>
      </Space>
    </Select.Option>
  );

  // 监听表单焦点任务值变化
  useEffect(() => {
    if (!initComplete) return;

    // 使用form.getFieldValue获取当前表单值
    const isFocusTask = form.getFieldValue('is_focus_task');
    console.log('检测到焦点任务状态变化:', isFocusTask);

    // 如果是编辑模式且任务是焦点任务，获取焦点任务状态
    if (isEditMode && isFocusTask && selectedInviteCode?.code) {
      console.log('编辑模式焦点任务，检查状态:', selectedInviteCode.code);
      checkFocusTaskStatus(selectedInviteCode.code);
    }
  }, [form.getFieldValue('is_focus_task'), initComplete]);

  // 监听时间限制模式变化
  useEffect(() => {
    if (!initComplete) return;

    const timeLimitMode = form.getFieldValue('time_limit_mode');
    console.log('检测到时间限制模式变化:', timeLimitMode);

    // 当时间限制模式变化时，更新表单字段
    form.validateFields(['due_date']); // 重新验证截止日期字段

    // 如果关闭了时间限制模式，清空截止日期和奖励积分
    if (!timeLimitMode) {
      form.setFieldsValue({
        due_date: null,
        bonus_points: 0
      });
    }
  }, [form.getFieldValue('time_limit_mode'), initComplete]);

  // 添加一个表单字段监听器组件
  const FormWatch = ({ children }) => {
    const [timeLimitMode, setTimeLimitMode] = useState(form.getFieldValue('time_limit_mode') || false);

    // 当表单值变化时更新状态
    const onValuesChange = (_, allValues) => {
      if (allValues.time_limit_mode !== timeLimitMode) {
        console.log('时间限制模式变更为:', allValues.time_limit_mode);
        setTimeLimitMode(allValues.time_limit_mode);
      }
    };

    return (
      <Form.Provider>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={onValuesChange}
          initialValues={{
            points: 1,
            bonus_points: 0,
            flame_mode_enabled: true,
            is_focus_task: false,
            time_limit_mode: false,
            due_date: null
          }}
        >
          {React.cloneElement(children, { timeLimitMode })}
        </Form>
      </Form.Provider>
    );
  };

  // 分离表单内容为一个组件，可以访问timeLimitMode状态
  const FormContent = ({ timeLimitMode }) => {
    // 使用这个钩子获取当前实例
    const formInstance = Form.useFormInstance();

    // 确保实时获取timeLimitMode而不仅依赖props
    const currentTimeLimitMode = formInstance.getFieldValue('time_limit_mode') || timeLimitMode;

    return (
      <>
        <Form.Item
          name="station_id"
          label="所属站点"
          rules={[{ required: true, message: '请选择站点' }]}
        >
          <Select
            placeholder="选择站点"
            onChange={handleStationChange}
            loading={!initComplete}
            disabled={!initComplete}
          >
            {stations.map(station => (
              <Option key={station.id} value={station.id}>{station.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="invite_code_id"
          label={
            <Space>
              邀请码
              <Button
                type="text"
                icon={<ReloadOutlined />}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  refreshInviteCodes();
                }}
                disabled={!selectedStation || inviteCodesLoading}
              />
            </Space>
          }
          tooltip="任务将与此邀请码关联，默认使用最新创建的邀请码"
          rules={[{ required: true, message: '请选择邀请码' }]}
          help={inviteCodesError}
          validateStatus={inviteCodesError ? 'error' : ''}
        >
          <Select
            placeholder={inviteCodesLoading ? '加载邀请码中...' : '选择邀请码'}
            onChange={async (value) => {
              console.log('选择的邀请码ID:', value);
              const code = inviteCodes.find(c => c.id === value);
              if (code) {
                console.log('选择邀请码:', code.id, code.code);
                setSelectedInviteCode(code);

                // 重置焦点任务状态
                formInstance.setFieldsValue({ is_focus_task: false });

                // 检查新选择的邀请码的焦点任务状态
                if (code.code) {
                  await checkFocusTaskStatus(code.code);
                }
              }
            }}
            loading={inviteCodesLoading}
            disabled={inviteCodesLoading || !selectedStation || !initComplete}
            notFoundContent={
              inviteCodesLoading ? (
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <Spin size="small" />
                  <div>加载邀请码中...</div>
                </div>
              ) : (
                inviteCodes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '8px' }}>
                    {selectedStation ? '暂无可用邀请码' : '请先选择站点'}
                  </div>
                )
              )
            }
            dropdownRender={menu => (
              <div>
                {menu}
                {selectedStation && inviteCodes.length === 0 && !inviteCodesLoading && (
                  <div style={{ padding: '8px', textAlign: 'center' }}>
                    <Button
                      type="link"
                      onClick={() => navigate('/invite-codes')}
                    >
                      没有邀请码，点击前往创建
                    </Button>
                  </div>
                )}
              </div>
            )}
            style={{ width: '100%' }}
            optionFilterProp="children"
            showSearch={false}
            value={formInstance.getFieldValue('invite_code_id')}
          >
            {inviteCodes.map((code) => (
              <Option key={code.id} value={code.id}>
                <Space>
                  <span>{code.code}</span>
                  <Tag color={code.status === 'active' ? 'green' : 'red'}>
                    {code.status === 'active' ? '激活' : '禁用'}
                  </Tag>
                  <span style={{ color: '#888', fontSize: '12px' }}>
                    {code.description ? (code.description.length > 10 ? `${code.description.slice(0, 10)}...` : code.description) : ''}
                  </span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="任务标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        >
          <Input placeholder="输入任务标题" disabled={!initComplete} />
        </Form.Item>

        <Form.Item
          name="description"
          label="任务描述"
          rules={[{ required: true, message: '请输入任务描述' }]}
        >
          <TextArea rows={4} placeholder="输入任务描述" disabled={!initComplete} />
        </Form.Item>

        <Form.Item
          name="points"
          label="任务积分"
          rules={[{ required: true, message: '请输入任务积分' }]}
        >
          <InputNumber min={1} placeholder="积分值" style={{ width: '100%' }} disabled={!initComplete} />
        </Form.Item>

        <Form.Item
          name="time_limit_mode"
          label="时间限制模式"
          valuePropName="checked"
          extra="开启后需要设置截止日期，并可以设置按时完成的奖励积分"
        >
          <Switch
            disabled={!initComplete}
            onChange={(checked) => {
              console.log("时间限制模式切换:", checked);
              // 强制更新Form中的字段，确保界面刷新
              formInstance.setFieldsValue({
                time_limit_mode: checked,
                due_date: checked ? formInstance.getFieldValue('due_date') : null,
                bonus_points: checked ? formInstance.getFieldValue('bonus_points') || 0 : 0
              });
            }}
          />
        </Form.Item>

        {currentTimeLimitMode && (
          <>
            <Form.Item
              name="due_date"
              label="截止日期"
              rules={[
                { required: true, message: '开启时间限制模式时，请设置截止日期' }
              ]}
            >
              <DatePicker
                showTime
                placeholder="选择截止日期和时间"
                style={{ width: '100%' }}
                disabled={!initComplete}
              />
            </Form.Item>

            <Form.Item
              name="bonus_points"
              label="限时奖励积分"
              tooltip="限时模式下的奖励积分，用于鼓励粉丝在截止日期前完成任务"
            >
              <InputNumber
                min={0}
                placeholder="限时奖励积分"
                style={{ width: '100%' }}
                disabled={!initComplete}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="flame_mode_enabled"
          label="火焰模式"
          valuePropName="checked"
        >
          <Switch disabled={!initComplete} />
        </Form.Item>

        <Form.Item
          name="is_focus_task"
          label="焦点任务"
          valuePropName="checked"
          tooltip={
            isEditMode && form.getFieldValue('is_focus_task') ?
            "焦点任务已开启，24小时内不能取消。设为焦点任务后，该站点下的其他焦点任务将被取消。" :
            "设为焦点任务后，该站点下的其他焦点任务将被取消。24小时内只能修改一次焦点任务状态。"
          }
        >
          <Switch
            disabled={
              // 编辑模式下已设置焦点任务时禁用开关
              (isEditMode && initComplete && form.getFieldValue('is_focus_task')) ||
              !initComplete ||
              checkingFocusStatus
            }
            onChange={async (checked) => {
              // 当开关被禁用时，不执行任何操作
              if (isEditMode && form.getFieldValue('is_focus_task') && !checked) {
                message.info('焦点任务已启用，24小时内不能取消');
                // 确保开关保持开启状态
                form.setFieldsValue({ is_focus_task: true });
                return;
              }

              if (!checked) return; // 关闭焦点任务时不进行检查

              console.log('焦点任务开关被切换为:', checked);

              // 先检查是否有邀请码
              if (!selectedInviteCode || !selectedInviteCode.code) {
                console.error('尝试设置焦点任务但邀请码为空');
                message.error('请先选择邀请码');
                form.setFieldsValue({ is_focus_task: false });
                return;
              }

              try {
                // 检查焦点任务状态
                const status = await checkFocusTaskStatus(selectedInviteCode.code);
                console.log('焦点任务状态检查结果:', status);

                if (!status) {
                  message.error('无法检查焦点任务状态，请稍后重试');
                  form.setFieldsValue({ is_focus_task: false });
                  return;
                }

                // 如果已有焦点任务，显示提示
                if (status.has_focus_task) {
                  // 显示提示弹窗
                  Modal.warning({
                    title: '焦点任务已存在',
                    content: status.focus_task ?
                      `当前邀请码下已经设置了焦点任务:"${status.focus_task.title}"。同一邀请码下同时只能有一个焦点任务。` :
                      '当前邀请码下已经设置了焦点任务。同一邀请码下同时只能有一个焦点任务。',
                    okText: '了解',
                    onOk: () => {
                      form.setFieldsValue({ is_focus_task: false });
                    }
                  });
                  return;
                }

                // 如果在冷却期内，显示提示
                if (status.is_in_cooldown) {
                  // 计算冷却结束时间
                  const cooldownUntil = status.cooldown_until_time ? new Date(status.cooldown_until_time) : null;
                  const formattedTime = cooldownUntil ?
                    `${cooldownUntil.toLocaleDateString()} ${cooldownUntil.toLocaleTimeString()}` :
                    '未知时间';

                  // 显示提示弹窗
                  Modal.warning({
                    title: '焦点任务冷却中',
                    content: `焦点任务状态在24小时内只能修改一次。您可以在 ${formattedTime} 后再次设置焦点任务。`,
                    okText: '了解',
                    onOk: () => {
                      form.setFieldsValue({ is_focus_task: false });
                    }
                  });
                  return;
                }

                // 一切正常，显示焦点任务信息
                Modal.info({
                  title: '即将设置焦点任务',
                  content: '焦点任务会受到特别关注，同一邀请码下只能有一个焦点任务。设置后，24小时内无法更改焦点任务状态。确认要设置此任务为焦点任务吗？',
                  okText: '确认',
                  cancelText: '取消',
                  onCancel: () => {
                    form.setFieldsValue({ is_focus_task: false });
                  }
                });
              } catch (error) {
                console.error('焦点任务状态检查失败:', error);
                message.error('检查焦点任务状态失败，请稍后重试');
                form.setFieldsValue({ is_focus_task: false });
              }
            }}
          />
        </Form.Item>

        {!isEditMode && (
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={!initComplete}>
              创建任务
            </Button>
          </Form.Item>
        )}
      </>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>
            {isEditMode ? '编辑任务' : '创建任务'}
          </Title>
          <Space>
            {isEditMode && (
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  if (isEditMode && taskId) {
                    console.log('点击重新加载按钮，任务ID:', taskId);
                    message.info('正在重新加载任务数据...');
                    loadTaskDetail();
                  }
                }}
                loading={loading}
                disabled={!initComplete}
              />
            )}
            <Button icon={<CloseOutlined />} onClick={() => navigate('/tasks')}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={() => form.submit()}
            >
              保存
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Title level={2}>
              {isEditMode ? '编辑任务' : '创建新任务'}
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={handleValuesChange}
              initialValues={{
                points: 1,
                bonus_points: 0,
                flame_mode_enabled: true,
                is_focus_task: false,
                time_limit_mode: false,
                due_date: null
              }}
            >
              <Form.Item
                name="station_id"
                label="所属站点"
                rules={[{ required: true, message: '请选择站点' }]}
              >
                <Select
                  placeholder="选择站点"
                  onChange={handleStationChange}
                  loading={!initComplete}
                  disabled={!initComplete}
                >
                  {stations.map(station => (
                    <Option key={station.id} value={station.id}>{station.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="invite_code_id"
                label={
                  <Space>
                    邀请码
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        refreshInviteCodes();
                      }}
                      disabled={!selectedStation || inviteCodesLoading}
                    />
                  </Space>
                }
                tooltip="任务将与此邀请码关联，默认使用最新创建的邀请码"
                rules={[{ required: true, message: '请选择邀请码' }]}
                help={inviteCodesError}
                validateStatus={inviteCodesError ? 'error' : ''}
              >
                <Select
                  placeholder={inviteCodesLoading ? '加载邀请码中...' : '选择邀请码'}
                  onChange={async (value) => {
                    console.log('选择的邀请码ID:', value);
                    const code = inviteCodes.find(c => c.id === value);
                    if (code) {
                      console.log('选择邀请码:', code.id, code.code);
                      setSelectedInviteCode(code);

                      // 重置焦点任务状态
                      form.setFieldsValue({ is_focus_task: false });

                      // 检查新选择的邀请码的焦点任务状态
                      if (code.code) {
                        await checkFocusTaskStatus(code.code);
                      }
                    }
                  }}
                  loading={inviteCodesLoading}
                  disabled={inviteCodesLoading || !selectedStation || !initComplete}
                  notFoundContent={
                    inviteCodesLoading ? (
                      <div style={{ textAlign: 'center', padding: '8px' }}>
                        <Spin size="small" />
                        <div>加载邀请码中...</div>
                      </div>
                    ) : (
                      inviteCodes.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '8px' }}>
                          {selectedStation ? '暂无可用邀请码' : '请先选择站点'}
                        </div>
                      )
                    )
                  }
                  dropdownRender={menu => (
                    <div>
                      {menu}
                      {selectedStation && inviteCodes.length === 0 && !inviteCodesLoading && (
                        <div style={{ padding: '8px', textAlign: 'center' }}>
                          <Button
                            type="link"
                            onClick={() => navigate('/invite-codes')}
                          >
                            没有邀请码，点击前往创建
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  showSearch={false}
                  value={form.getFieldValue('invite_code_id')}
                >
                  {inviteCodes.map((code) => (
                    <Option key={code.id} value={code.id}>
                      <Space>
                        <span>{code.code}</span>
                        <Tag color={code.status === 'active' ? 'green' : 'red'}>
                          {code.status === 'active' ? '激活' : '禁用'}
                        </Tag>
                        <span style={{ color: '#888', fontSize: '12px' }}>
                          {code.description ? (code.description.length > 10 ? `${code.description.slice(0, 10)}...` : code.description) : ''}
                        </span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="title"
                label="任务标题"
                rules={[{ required: true, message: '请输入任务标题' }]}
              >
                <Input placeholder="输入任务标题" disabled={!initComplete} />
              </Form.Item>

              <Form.Item
                name="description"
                label="任务描述"
                rules={[{ required: true, message: '请输入任务描述' }]}
              >
                <TextArea rows={4} placeholder="输入任务描述" disabled={!initComplete} />
              </Form.Item>

              <Form.Item
                name="points"
                label="任务积分"
                rules={[{ required: true, message: '请输入任务积分' }]}
              >
                <InputNumber min={1} placeholder="积分值" style={{ width: '100%' }} disabled={!initComplete} />
              </Form.Item>

              <Form.Item
                name="time_limit_mode"
                label="时间限制模式"
                valuePropName="checked"
                extra="开启后需要设置截止日期，并可以设置按时完成的奖励积分"
              >
                <Switch
                  disabled={!initComplete}
                  onChange={(checked) => {
                    console.log("时间限制模式切换:", checked);
                    // 强制更新Form中的字段，确保界面刷新
                    form.setFieldsValue({
                      time_limit_mode: checked,
                      due_date: checked ? form.getFieldValue('due_date') : null,
                      bonus_points: checked ? form.getFieldValue('bonus_points') || 0 : 0
                    });
                  }}
                />
              </Form.Item>

              {timeLimitMode && (
                <>
                  <Form.Item
                    name="due_date"
                    label="截止日期"
                    rules={[
                      { required: true, message: '开启时间限制模式时，请设置截止日期' }
                    ]}
                  >
                    <DatePicker
                      showTime
                      placeholder="选择截止日期和时间"
                      style={{ width: '100%' }}
                      disabled={!initComplete}
                    />
                  </Form.Item>

                  <Form.Item
                    name="bonus_points"
                    label="限时奖励积分"
                    tooltip="限时模式下的奖励积分，用于鼓励粉丝在截止日期前完成任务"
                  >
                    <InputNumber
                      min={0}
                      placeholder="限时奖励积分"
                      style={{ width: '100%' }}
                      disabled={!initComplete}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="flame_mode_enabled"
                label="火焰模式"
                valuePropName="checked"
              >
                <Switch disabled={!initComplete} />
              </Form.Item>

              <Form.Item
                name="is_focus_task"
                label="焦点任务"
                valuePropName="checked"
                tooltip={
                  isEditMode && form.getFieldValue('is_focus_task') ?
                  "焦点任务已开启，24小时内不能取消。设为焦点任务后，该站点下的其他焦点任务将被取消。" :
                  "设为焦点任务后，该站点下的其他焦点任务将被取消。24小时内只能修改一次焦点任务状态。"
                }
              >
                <Switch
                  disabled={
                    // 编辑模式下已设置焦点任务时禁用开关
                    (isEditMode && initComplete && form.getFieldValue('is_focus_task')) ||
                    !initComplete ||
                    checkingFocusStatus
                  }
                  onChange={async (checked) => {
                    // 当开关被禁用时，不执行任何操作
                    if (isEditMode && form.getFieldValue('is_focus_task') && !checked) {
                      message.info('焦点任务已启用，24小时内不能取消');
                      // 确保开关保持开启状态
                      form.setFieldsValue({ is_focus_task: true });
                      return;
                    }

                    if (!checked) return; // 关闭焦点任务时不进行检查

                    console.log('焦点任务开关被切换为:', checked);

                    // 先检查是否有邀请码
                    if (!selectedInviteCode || !selectedInviteCode.code) {
                      console.error('尝试设置焦点任务但邀请码为空');
                      message.error('请先选择邀请码');
                      form.setFieldsValue({ is_focus_task: false });
                      return;
                    }

                    try {
                      // 检查焦点任务状态
                      const status = await checkFocusTaskStatus(selectedInviteCode.code);
                      console.log('焦点任务状态检查结果:', status);

                      if (!status) {
                        message.error('无法检查焦点任务状态，请稍后重试');
                        form.setFieldsValue({ is_focus_task: false });
                        return;
                      }

                      // 如果已有焦点任务，显示提示
                      if (status.has_focus_task) {
                        // 显示提示弹窗
                        Modal.warning({
                          title: '焦点任务已存在',
                          content: status.focus_task ?
                            `当前邀请码下已经设置了焦点任务:"${status.focus_task.title}"。同一邀请码下同时只能有一个焦点任务。` :
                            '当前邀请码下已经设置了焦点任务。同一邀请码下同时只能有一个焦点任务。',
                          okText: '了解',
                          onOk: () => {
                            form.setFieldsValue({ is_focus_task: false });
                          }
                        });
                        return;
                      }

                      // 如果在冷却期内，显示提示
                      if (status.is_in_cooldown) {
                        // 计算冷却结束时间
                        const cooldownUntil = status.cooldown_until_time ? new Date(status.cooldown_until_time) : null;
                        const formattedTime = cooldownUntil ?
                          `${cooldownUntil.toLocaleDateString()} ${cooldownUntil.toLocaleTimeString()}` :
                          '未知时间';

                        // 显示提示弹窗
                        Modal.warning({
                          title: '焦点任务冷却中',
                          content: `焦点任务状态在24小时内只能修改一次。您可以在 ${formattedTime} 后再次设置焦点任务。`,
                          okText: '了解',
                          onOk: () => {
                            form.setFieldsValue({ is_focus_task: false });
                          }
                        });
                        return;
                      }

                      // 一切正常，显示焦点任务信息
                      Modal.info({
                        title: '即将设置焦点任务',
                        content: '焦点任务会受到特别关注，同一邀请码下只能有一个焦点任务。设置后，24小时内无法更改焦点任务状态。确认要设置此任务为焦点任务吗？',
                        okText: '确认',
                        cancelText: '取消',
                        onCancel: () => {
                          form.setFieldsValue({ is_focus_task: false });
                        }
                      });
                    } catch (error) {
                      console.error('焦点任务状态检查失败:', error);
                      message.error('检查焦点任务状态失败，请稍后重试');
                      form.setFieldsValue({ is_focus_task: false });
                    }
                  }}
                />
              </Form.Item>

              {!isEditMode && (
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={!initComplete}>
                    创建任务
                  </Button>
                </Form.Item>
              )}
            </Form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TaskForm;
