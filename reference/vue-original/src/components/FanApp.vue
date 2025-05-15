<template>
  <div>
    <h1>粉丝端・任务领取</h1>
    <div v-for="(task, index) in tasks" :key="index" style="margin-bottom: 10px;">
      <div>{{ task.title }} - {{ task.description }} (积分: {{ task.reward }})</div>
      <button @click="claimTask(index)" :disabled="task.claimed">
        {{ task.claimed ? '已领取' : '领取任务' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [
        {
          title: '任务示例',
          description: '描述示例',
          reward: 10,
          claimed: false,
        },
      ],
    };
  },
  methods: {
    claimTask(index) {
      this.tasks[index].claimed = true;
      alert('任务已领取！');
    },
  },
};
</script>

<style>
div {
  margin-bottom: 10px;
}
</style>
