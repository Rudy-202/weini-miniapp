<template>
  <view class="create-task-container">
    <uni-forms ref="formRef" :modelValue="formData" :rules="rules" label-position="top">
      <uni-forms-item label="所属站点" name="siteId" required>
        <uni-data-select
          v-model="formData.siteId"
          :localdata="siteOptions"
          placeholder="请选择站点"
        />
      </uni-forms-item>

      <uni-forms-item label="邀请码" name="inviteCodeId" required>
        <!-- TODO: 替换为真实的邀请码选择逻辑，可能需要异步加载 -->
        <uni-data-select
          v-model="formData.inviteCodeId"
          :localdata="inviteCodeOptions"
          placeholder="请选择邀请码 (默认最新)"
        />
      </uni-forms-item>

      <uni-forms-item label="任务标题" name="title" required>
        <uni-easyinput type="text" v-model="formData.title" placeholder="请输入任务标题" />
      </uni-forms-item>

      <uni-forms-item label="任务描述" name="description" required>
        <uni-easyinput type="textarea" v-model="formData.description" placeholder="请输入任务描述" />
      </uni-forms-item>

      <uni-forms-item label="任务积分" name="points" required>
        <uni-number-box v-model="formData.points" :min="1" />
      </uni-forms-item>

      <uni-forms-item label="浴火模式 (允许重复提交)" name="isFlameMode">
        <switch :checked="formData.isFlameMode" @change="onFlameModeChange" color="#FFCC33" style="transform:scale(0.9)"/>
      </uni-forms-item>

      <uni-forms-item label="焦点任务" name="isFocusTask">
        <switch :checked="formData.isFocusTask" @change="onFocusTaskChange" color="#007AFF" style="transform:scale(0.9)"/>
      </uni-forms-item>
      
      <uni-forms-item label="限时模式" name="isTimeLimited">
        <switch :checked="formData.isTimeLimited" @change="onTimeLimitedChange" color="#4CD964" style="transform:scale(0.9)"/>
      </uni-forms-item>

      <uni-forms-item v-if="formData.isTimeLimited" label="任务截止日期" name="dueDate" required>
        <uni-datetime-picker
          type="datetime"
          v-model="formData.dueDate"
          placeholder="请选择截止日期"
        />
      </uni-forms-item>

      <uni-forms-item v-if="formData.isTimeLimited" label="限时奖励积分" name="timeLimitedBonusPoints">
        <uni-number-box v-model="formData.timeLimitedBonusPoints" :min="0" :max="formData.points" />
         <view class="tip-text">额外奖励积分不能超过任务基础分值 ({{ formData.points }})</view>
      </uni-forms-item>

    </uni-forms>

    <button type="primary" @click="submitForm" class="submit-button">创建任务</button>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/store/user'; // 假设有用户store获取管理员信息或站点信息
// import { createTaskApi } from '@/api/task'; // 假设的创建任务API

const userStore = useUserStore();

const formRef = ref<any>(null); // 用于表单校验

const formData = reactive({
  siteId: null,
  inviteCodeId: null, // 初始可以根据逻辑设为最新邀请码的ID
  title: '',
  description: '',
  points: 10, // 默认积分
  isFlameMode: true, // 火焰模式默认开启
  isFocusTask: false, // 焦点任务默认关闭
  isTimeLimited: false, // 限时模式默认关闭
  dueDate: '', // 任务截止日期
  timeLimitedBonusPoints: 0, // 限时奖励积分
});

// 模拟站点选项 - TODO: 替换为从API获取
const siteOptions = ref([
  { value: 'site1', text: '测试站长的站点' },
  { value: 'site2', text: '站点B' },
]);

// 模拟邀请码选项 - TODO: 替换为从API获取，并实现默认选择最新
const inviteCodeOptions = ref([
  { value: 'code1', text: '邀请码A (最新)' },
  { value: 'code2', text: '邀请码B' },
]);

const rules = {
  siteId: {
    rules: [{ required: true, errorMessage: '请选择所属站点' }],
  },
  inviteCodeId: {
    rules: [{ required: true, errorMessage: '请选择邀请码' }],
  },
  title: {
    rules: [{ required: true, errorMessage: '请输入任务标题' }, { minLength: 3, maxLength: 50, errorMessage: '标题长度在 3 到 50 个字符' }],
  },
  description: {
    rules: [{ required: true, errorMessage: '请输入任务描述' }],
  },
  points: {
    rules: [{ required: true, errorMessage: '请输入任务积分' }],
  },
  dueDate: {
    rules: [
      {
        validator: (rule:any, value:string, data:any, callback:Function) => {
          if (data.isTimeLimited && !value) {
            callback('请选择任务截止日期');
          }
          return true;
        },
      },
    ],
  },
  timeLimitedBonusPoints: {
     rules: [
      {
        validator: (rule:any, value:number, data:any, callback:Function) => {
          if (data.isTimeLimited && value > data.points) {
            callback('额外奖励积分不能超过任务基础分值');
          }
          return true;
        },
      },
    ],
  }
};

const onFlameModeChange = (e: any) => {
  formData.isFlameMode = e.detail.value;
};

const onFocusTaskChange = (e: any) => {
  formData.isFocusTask = e.detail.value;
  // TODO: 添加焦点任务相关逻辑，如检查邀请码下是否已有焦点任务
  if (formData.isFocusTask) {
    uni.showModal({
      title: '提示',
      content: '请确保当前邀请码下没有其他焦点任务。24小时内一个邀请码只能有一个焦点任务。',
      showCancel: false,
    });
  }
};

const onTimeLimitedChange = (e: any) => {
  formData.isTimeLimited = e.detail.value;
  if (!formData.isTimeLimited) {
    formData.dueDate = ''; // 关闭限时模式时清空截止日期
    formData.timeLimitedBonusPoints = 0; // 清空限时奖励积分
  }
};

const submitForm = () => {
  formRef.value.validate().then(async (res: any) => {
    console.log('表单数据: ', formData);
    uni.showLoading({ title: '创建中...' });
    try {
      // TODO: 调用真实创建任务的API
      // const apiResponse = await createTaskApi(formData);
      // console.log('API Response:', apiResponse);

      // 模拟API调用成功
      await new Promise(resolve => setTimeout(resolve, 1500));

      uni.hideLoading();
      uni.showToast({
        title: '任务创建成功',
        icon: 'success',
      });

      // 跳转到管理员任务列表页 - 确保路径正确
      setTimeout(() => {
        uni.redirectTo({ // 或者 uni.navigateTo，根据需求
          url: '/packageAdmin/pages/task/list', // 假设的任务列表页路径
        });
      }, 1000);

    } catch (error: any) {
      uni.hideLoading();
      console.error('创建任务失败: ', error);
      uni.showToast({
        title: error.message || '创建失败，请稍后再试',
        icon: 'none',
      });
    }
  }).catch((err: any) => {
    console.log('表单校验失败: ', err);
  });
};

onMounted(() => {
  // TODO: 获取管理员默认站点，并设置为formData.siteId
  // TODO: 获取最新邀请码，并设置为formData.inviteCodeId
  if (siteOptions.value.length > 0) {
      // formData.siteId = siteOptions.value[0].value; // 示例：默认选中第一个站点
  }
  if (inviteCodeOptions.value.length > 0) {
      // formData.inviteCodeId = inviteCodeOptions.value[0].value; // 示例：默认选中第一个邀请码
  }
});

</script>

<style lang="scss" scoped>
.create-task-container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

// 对齐 uni-forms-item 内部的 label 和 switch/input
::v-deep .uni-forms-item__content {
  display: flex;
  align-items: center;
  // justify-content: space-between; /* 如果希望 switch 在最右边 */
}
::v-deep .uni-forms-item__label {
  // width: auto !important; /* 覆盖默认宽度 */
  // margin-right: 20rpx;
  padding-bottom: 0; // 移除label下方的padding
  line-height: 36px; // 与 switch 等组件对齐
}

.tip-text {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.submit-button {
  margin-top: 40rpx;
  background-color: #007aff; // 主题色
}
</style> 