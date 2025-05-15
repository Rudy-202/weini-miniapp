<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-xl text-gray-600 dark:text-gray-400">正在加载任务详情...</p>
      <!-- 可以添加一个加载动画 -->
    </div>

    <div v-if="errorMessage" class="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
      <p class="font-semibold">加载错误</p>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-if="!isLoading && !errorMessage && milestoneTaskDetails">
      <!-- 页面标题和返回按钮 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">里程碑任务详情: {{ milestoneTaskDetails.title }}</h1>
        <router-link
          :to="{ name: 'AdminMilestoneTaskManager' }"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-150">
          &larr; 返回列表
        </router-link>
      </div>

      <!-- 里程碑任务核心信息 -->
      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">核心信息</h2>
          <button v-if="!isEditMode" @click="enterEditMode" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm">
            编辑任务信息
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <strong class="block text-gray-600 dark:text-gray-400 mb-1">任务标题:</strong>
            <span v-if="!isEditMode" class="text-gray-800 dark:text-gray-200">{{ milestoneTaskDetails.title }}</span>
            <input v-else type="text" v-model="editableTitle" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <!-- <div>
            <strong class="text-gray-600 dark:text-gray-400">ID:</strong>
            <span class="text-gray-800 dark:text-gray-200">{{ milestoneTaskDetails.milestone_id }}</span>
          </div> -->
          <div>
            <strong class="text-gray-600 dark:text-gray-400">状态:</strong>
            <span :class="getStatusClass(milestoneTaskDetails.status)" class="px-2 py-0.5 rounded-full text-xs font-semibold">
              {{ getStatusText(milestoneTaskDetails.status) }}
            </span>
          </div>
          <div class="col-span-1 md:col-span-2">
            <strong class="block text-gray-600 dark:text-gray-400 mb-1">描述:</strong>
            <p v-if="!isEditMode" class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ milestoneTaskDetails.description }}</p>
            <textarea v-else v-model="editableDescription" rows="4" required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white whitespace-pre-wrap"></textarea>
          </div>
          <div>
            <strong class="text-gray-600 dark:text-gray-400">关联邀请码:</strong>
            <span class="text-gray-800 dark:text-gray-200">{{ milestoneTaskDetails.invite_code }}</span>
          </div>
          <div>
            <strong class="block text-gray-600 dark:text-gray-400 mb-1">目标进度:</strong>
            <!-- Display current/target unit. Current value has its own update section -->
            <span v-if="!isEditMode" class="text-gray-800 dark:text-gray-200">
              {{ milestoneTaskDetails.current_value }} / {{ milestoneTaskDetails.target_value }} {{ milestoneTaskDetails.unit_of_measure }}
            </span>
            <!-- Add inputs for target_value and unit_of_measure for edit mode here -->
             <div v-if="isEditMode" class="space-y-2">
                <div>
                    <label for="editableTargetValue" class="block text-sm font-medium text-gray-700 dark:text-gray-300">目标数值</label>
                    <input type="number" id="editableTargetValue" v-model.number="editableTargetValue" min="1" required
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>
                <div>
                    <label for="editableUnitOfMeasure" class="block text-sm font-medium text-gray-700 dark:text-gray-300">计量单位</label>
                    <input type="text" id="editableUnitOfMeasure" v-model="editableUnitOfMeasure" required
                           class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>
            </div>
            <div v-else class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
              <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: Math.min((milestoneTaskDetails.current_value / milestoneTaskDetails.target_value) * 100, 100) + '%' }"></div>
            </div>
          </div>
          <div>
            <strong class="block text-gray-600 dark:text-gray-400 mb-1">预计开始时间:</strong>
            <span v-if="!isEditMode" class="text-gray-800 dark:text-gray-200">{{ formatDisplayDate(milestoneTaskDetails.start_date) }}</span>
            <input v-else type="datetime-local" v-model="editableStartDate" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <strong class="block text-gray-600 dark:text-gray-400 mb-1">截止日期:</strong>
            <span v-if="!isEditMode" class="text-gray-800 dark:text-gray-200">{{ formatDisplayDate(milestoneTaskDetails.due_date) }}</span>
            <input v-else type="datetime-local" v-model="editableDueDate" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <strong class="text-gray-600 dark:text-gray-400">创建日期:</strong>
            <span class="text-gray-800 dark:text-gray-200">{{ formatDisplayDate(milestoneTaskDetails.creation_date) }}</span>
          </div>
          <div>
            <strong class="text-gray-600 dark:text-gray-400">最后更新:</strong>
            <span class="text-gray-800 dark:text-gray-200">{{ formatDisplayDate(milestoneTaskDetails.last_updated) }}</span>
          </div>
          <div v-if="milestoneTaskDetails.achieved_date">
            <strong class="text-gray-600 dark:text-gray-400">目标达成日期:</strong>
            <span class="text-green-600 dark:text-green-400">{{ formatDisplayDate(milestoneTaskDetails.achieved_date) }}</span>
          </div>
           <div v-if="milestoneTaskDetails.completion_date">
            <strong class="text-gray-600 dark:text-gray-400">任务完成日期:</strong>
            <span class="text-purple-600 dark:text-purple-400">{{ formatDisplayDate(milestoneTaskDetails.completion_date) }}</span>
          </div>
        </div>

        <!-- Save/Cancel buttons for Edit Mode -->
        <div v-if="isEditMode" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="cancelEditMode" :disabled="isUpdating" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            取消编辑
          </button>
          <button @click="handleSaveTaskDetails" :disabled="isUpdating" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50">
            <span v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-1"></span>
            {{ isUpdating ? '保存中...' : '保存更改' }}
          </button>
        </div>

        <!-- Success/Error messages for general updates -->
        <div v-if="!isEditMode" class="mt-2">
            <p v-if="updateSuccessMessage" class="text-sm text-green-600 dark:text-green-400">{{ updateSuccessMessage }}</p>
            <p v-if="updateErrorMessage" class="text-sm text-red-600 dark:text-red-400">{{ updateErrorMessage }}</p>
        </div>

        <!-- 状态操作按钮 -->
        <div class="col-span-1 md:col-span-2 mt-2 mb-4 py-2">
          <div v-if="!isEditMode && milestoneTaskDetails.status === 'PLANNED'" class="flex space-x-2">
            <button @click="handleUpdateStatus('ACTIVE')" :disabled="isUpdating" class="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50">启动任务</button>
            <button @click="handleUpdateStatus('CANCELLED')" :disabled="isUpdating" class="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50">取消任务</button>
          </div>
          <div v-else-if="!isEditMode && milestoneTaskDetails.status === 'ACTIVE'" class="flex space-x-2">
            <button @click="handleUpdateStatus('COMPLETED')" :disabled="isUpdating" class="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50">标记为已完成</button>
            <button @click="handleUpdateStatus('CANCELLED')" :disabled="isUpdating" class="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50">取消任务</button>
          </div>
          <div v-else-if="!isEditMode && milestoneTaskDetails.status === 'TARGET_MET'" class="flex space-x-2">
            <button @click="handleUpdateStatus('TARGET_MET_ACTIVE')" :disabled="isUpdating" class="px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md shadow-sm disabled:opacity-50">允许继续贡献</button>
            <button @click="handleUpdateStatus('COMPLETED')" :disabled="isUpdating" class="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50">正式完成任务</button>
          </div>
          <div v-else-if="!isEditMode && milestoneTaskDetails.status === 'TARGET_MET_ACTIVE'" class="flex space-x-2">
            <button @click="handleUpdateStatus('COMPLETED')" :disabled="isUpdating" class="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md shadow-sm disabled:opacity-50">正式完成任务</button>
          </div>
           <!-- COMPLETED and CANCELLED states have no actions -->
        </div>
      </div>

      <!-- 手动修改当前值 -->
      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">手动更新当前进度</h3>
        <div class="flex items-center space-x-3">
          <div>
            <label for="editableCurrentValue" class="sr-only">当前值</label>
            <input type="number" id="editableCurrentValue" v-model.number="editableCurrentValue" min="0"
                   class="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   :disabled="isUpdating">
          </div>
          <button @click="handleUpdateCurrentValue" :disabled="isUpdating"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:disabled:bg-indigo-400">
            <span v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-1"></span>
            {{ isUpdating ? '更新中...' : '更新当前值' }}
          </button>
        </div>
        <p v-if="updateSuccessMessage" class="mt-2 text-sm text-green-600 dark:text-green-400">{{ updateSuccessMessage }}</p>
        <p v-if="updateErrorMessage" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ updateErrorMessage }}</p>
      </div>

      <!-- 阶段任务列表 -->
      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">阶段任务列表</h2>
        <div v-if="milestoneTaskDetails.sub_tasks && milestoneTaskDetails.sub_tasks.length > 0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="subtask in milestoneTaskDetails.sub_tasks" :key="subtask.sub_task_id"
                 class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-1">
                <h3 class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{{ subtask.title }}</h3>
                <button @click="openEditStageTaskModal(subtask)"
                        class="ml-auto px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm">
                  编辑
                </button>
              </div>
              <!-- <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">ID: {{ subtask.sub_task_id }}</p> -->
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong class="dark:text-gray-400">类型:</strong> {{ getSubTaskTypeText(subtask.type) }}</p>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong class="dark:text-gray-400">状态:</strong> <span :class="getSubTaskStatusClass(subtask.status)">{{ getSubTaskStatusText(subtask.status) }}</span></p>
              <p v-if="subtask.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ subtask.description }}</p>
              <p v-if="subtask.target_value" class="text-sm text-gray-700 dark:text-gray-300">
                <strong class="dark:text-gray-400">目标:</strong> {{ subtask.current_value }} / {{ subtask.target_value }} {{ subtask.unit_of_measure }}
              </p>
              <p v-if="subtask.release_date" class="text-sm text-gray-700 dark:text-gray-300">
                <strong class="dark:text-gray-400">发布日期:</strong> {{ formatDisplayDate(subtask.release_date) }}
              </p>
              <!-- 阶段任务管理按钮 -->
              <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                <!-- 删除按钮将后续添加 -->
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="text-gray-600 dark:text-gray-400">此里程碑任务当前没有阶段任务。</p>
        </div>
        <!-- 添加阶段任务按钮 -->
        <div class="mt-6 text-right">
          <button @click="openAddStageTaskModal" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加阶段任务
          </button>
        </div>
      </div>
    </div>

    <!-- 添加阶段任务模态框 -->
    <div v-if="isAddStageTaskModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-scale-in overflow-y-auto max-h-[90vh]">
        <div class="flex justify-between items-center pb-3 border-b dark:border-gray-700">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white">创建新阶段任务</h3>
          <button @click="closeAddStageTaskModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">&times;</button>
        </div>
        <form @submit.prevent="handleAddStageTask" class="mt-4 space-y-4">
          <div>
            <label for="newStageTaskTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">标题 <span class="text-red-500">*</span></label>
            <input type="text" id="newStageTaskTitle" v-model="newStageTaskData.title" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="newStageTaskDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
            <textarea id="newStageTaskDescription" v-model="newStageTaskData.description" rows="3"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
          </div>
          <div>
            <label for="newStageTaskType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">类型 <span class="text-red-500">*</span></label>
            <select id="newStageTaskType" v-model="newStageTaskData.type" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option v-for="(label, key) in SUB_TASK_TYPES_CHINESE" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label for="newStageTaskTargetValue" class="block text-sm font-medium text-gray-700 dark:text-gray-300">目标数值</label>
            <input type="number" id="newStageTaskTargetValue" v-model.number="newStageTaskData.target_value" min="0"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="newStageTaskUnit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">计量单位</label>
            <input type="text" id="newStageTaskUnit" v-model="newStageTaskData.unit_of_measure"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="newStageTaskAssignee" class="block text-sm font-medium text-gray-700 dark:text-gray-300">负责人</label>
            <input type="text" id="newStageTaskAssignee" v-model="newStageTaskData.assignee"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="newStageTaskDueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">截止日期</label>
            <input type="datetime-local" id="newStageTaskDueDate" v-model="newStageTaskData.due_date"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>

          <div class="pt-4 border-t dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" @click="closeAddStageTaskModal" :disabled="isUpdating"
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              取消
            </button>
            <button type="submit" :disabled="isUpdating"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50">
              <span v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-1"></span>
              {{ isUpdating ? '创建中...' : '创建阶段任务' }}
            </button>
          </div>
          <p v-if="addStageTaskErrorMessage" class="text-sm text-red-500 dark:text-red-400 mt-2"></p>
        </form>
      </div>
    </div>

    <!-- 编辑阶段任务模态框 -->
    <div v-if="isEditStageTaskModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-scale-in overflow-y-auto max-h-[90vh]">
        <div class="flex justify-between items-center pb-3 border-b dark:border-gray-700">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white">编辑阶段任务</h3>
          <button @click="closeEditStageTaskModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">&times;</button>
        </div>
        <form @submit.prevent="handleUpdateStageTask" class="mt-4 space-y-4">
          <div>
            <label for="editStageTaskTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">标题 <span class="text-red-500">*</span></label>
            <input type="text" id="editStageTaskTitle" v-model="editingStageTaskData.title" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="editStageTaskDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
            <textarea id="editStageTaskDescription" v-model="editingStageTaskData.description" rows="3"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
          </div>
          <div>
            <label for="editStageTaskType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">类型 <span class="text-red-500">*</span></label>
            <select id="editStageTaskType" v-model="editingStageTaskData.type" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option v-for="(label, key) in SUB_TASK_TYPES_CHINESE" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label for="editStageTaskTargetValue" class="block text-sm font-medium text-gray-700 dark:text-gray-300">目标数值</label>
            <input type="number" id="editStageTaskTargetValue" v-model.number="editingStageTaskData.target_value" min="0"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="editStageTaskUnit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">计量单位</label>
            <input type="text" id="editStageTaskUnit" v-model="editingStageTaskData.unit_of_measure"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="editStageTaskAssignee" class="block text-sm font-medium text-gray-700 dark:text-gray-300">负责人</label>
            <input type="text" id="editStageTaskAssignee" v-model="editingStageTaskData.assignee"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="editStageTaskDueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">截止日期</label>
            <input type="datetime-local" id="editStageTaskDueDate" v-model="editingStageTaskData.due_date"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <!-- 阶段任务的状态 (status) -->
          <div>
            <label for="editStageTaskStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300">状态 <span class="text-red-500">*</span></label>
            <select id="editStageTaskStatus" v-model="editingStageTaskData.status" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option v-for="(label, key) in availableStageTaskStatuses" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>

          <div class="pt-4 border-t dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" @click="closeEditStageTaskModal" :disabled="isUpdating"
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              取消
            </button>
            <button type="submit" :disabled="isUpdating"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50">
              <span v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-1"></span>
              {{ isUpdating ? '保存中...' : '保存更改' }}
            </button>
          </div>
          <p v-if="editStageTaskErrorMessage" class="text-sm text-red-500 dark:text-red-400 mt-2"></p>
        </form>
      </div>
    </div>

    <div v-if="!isLoading && !milestoneTaskDetails && !errorMessage" class="text-center py-10">
        <p class="text-xl text-gray-500 dark:text-gray-400">未找到指定的里程碑任务。</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const milestoneTaskDetails = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const updateErrorMessage = ref('');
const updateSuccessMessage = ref('');
const isUpdating = ref(false);

// For adding a new stage task
const isAddStageTaskModalVisible = ref(false);
const newStageTaskData = ref({
  title: '',
  description: '',
  type: 'Execution', // Default type, ensure this is a valid key from SUB_TASK_TYPES_CHINESE / backend
  target_value: null,
  unit_of_measure: '',
  assignee: '',
  due_date: ''
});
const addStageTaskErrorMessage = ref('');

// For editing core task details
const isEditMode = ref(false);
const editableTitle = ref('');
const editableDescription = ref('');
const editableUnitOfMeasure = ref('');
const editableTargetValue = ref(null);
const editableStartDate = ref('');
const editableDueDate = ref('');
// editableCurrentValue is already defined for its specific update functionality
const editableCurrentValue = ref(0);

const milestoneId = computed(() => route.params.milestoneId);

// --- Miltestone Task Status Display ---
const statusTextMap = {
  PLANNED: '计划中',
  ACTIVE: '进行中',
  TARGET_MET: '目标已达成',
  TARGET_MET_ACTIVE: '目标达成 (可继续)',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
};

const statusClassMap = {
  PLANNED: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
  ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100',
  TARGET_MET: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100',
  TARGET_MET_ACTIVE: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100',
};

const getStatusText = (status) => statusTextMap[status] || status;
const getStatusClass = (status) => statusClassMap[status] || 'bg-gray-100 text-gray-600';


// --- Sub Task Type and Status Display ---
const SUB_TASK_TYPES_CHINESE = {
  'Execution': '执行类',
  'Quantifiable': '量化类',
  'Review': '审核类',
  'Communication': '沟通类'
};

const SUB_TASK_STATUSES_CHINESE = {
  'PLANNED': '计划中',
  'IN_PROGRESS': '进行中',
  'COMPLETED': '已完成',
  'CANCELLED': '已取消',
  'BLOCKED': '已阻塞'
};

const getSubTaskTypeText = (type) => SUB_TASK_TYPES_CHINESE[type] || type;
const getSubTaskStatusText = (status) => SUB_TASK_STATUSES_CHINESE[status] || status;

const subTaskStatusClassMap = {
  PLANNED: 'text-gray-500 dark:text-gray-400',
  IN_PROGRESS: 'text-blue-500 dark:text-blue-400',
  COMPLETED: 'text-green-500 dark:text-green-400',
  CANCELLED: 'text-red-500 dark:text-red-400',
  BLOCKED: 'text-yellow-500 dark:text-yellow-400',
};
const getSubTaskStatusClass = (status) => subTaskStatusClassMap[status] || 'text-gray-500 dark:text-gray-500';

// NEW: Computed property for available stage task statuses based on parent milestone status
const availableStageTaskStatuses = computed(() => {
  if (milestoneTaskDetails.value?.status === 'PLANNED') {
    // Filter out COMPLETED status if parent is PLANNED
    const filteredStatuses = { ...SUB_TASK_STATUSES_CHINESE };
    delete filteredStatuses['COMPLETED'];
    return filteredStatuses;
  } else {
    // Return all statuses otherwise
    return SUB_TASK_STATUSES_CHINESE;
  }
});

// Helper to convert ISO date string to yyyy-MM-ddTHH:mm format for datetime-local input
const formatISODateForInput = (isoDate) => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    // Pad month, day, hours, minutes with leading zeros if necessary
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date for input:", e);
    return ''; // Or handle error appropriately
  }
};

const enterEditMode = () => {
  if (milestoneTaskDetails.value) {
    editableTitle.value = milestoneTaskDetails.value.title;
    editableDescription.value = milestoneTaskDetails.value.description;
    editableUnitOfMeasure.value = milestoneTaskDetails.value.unit_of_measure;
    editableTargetValue.value = milestoneTaskDetails.value.target_value;
    editableStartDate.value = formatISODateForInput(milestoneTaskDetails.value.start_date);
    editableDueDate.value = formatISODateForInput(milestoneTaskDetails.value.due_date);
    isEditMode.value = true;
    updateErrorMessage.value = ''; // Clear previous messages
    updateSuccessMessage.value = '';
  }
};

const cancelEditMode = () => {
  isEditMode.value = false;
  // Optionally, reset editable fields to original values if needed, though re-entering edit mode will refresh them.
};

const handleSaveTaskDetails = async () => {
  // Client-side validation
  if (!editableTitle.value || !editableDescription.value || !editableUnitOfMeasure.value || editableTargetValue.value === null || editableTargetValue.value <= 0 || !editableStartDate.value || !editableDueDate.value) {
    updateErrorMessage.value = '所有核心任务字段均为必填项，且目标数值必须大于0。';
    return;
  }
  const localStartDate = new Date(editableStartDate.value);
  const localDueDate = new Date(editableDueDate.value);
  if (localStartDate >= localDueDate) {
    updateErrorMessage.value = '截止日期必须晚于预计开始时间。';
    return;
  }
  // Basic check for 7 days, more precise check should be on backend or with a date library
  const diffTime = Math.abs(localDueDate - localStartDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    updateErrorMessage.value = '预计开始时间与截止日期之间至少需要7天。';
    return;
  }

  isUpdating.value = true;
  updateErrorMessage.value = '';
  updateSuccessMessage.value = '';
  const token = localStorage.getItem('admin_token');

  if (!token) {
    updateErrorMessage.value = '管理员未登录或登录已过期。';
    isUpdating.value = false;
    return;
  }

  const payload = {
    title: editableTitle.value,
    description: editableDescription.value,
    unit_of_measure: editableUnitOfMeasure.value,
    target_value: Number(editableTargetValue.value),
    start_date: new Date(editableStartDate.value).toISOString(),
    due_date: new Date(editableDueDate.value).toISOString(),
    // We are not updating current_value or status here, those have dedicated functions
  };

  try {
    const response = await fetch(`/api/admin/milestone-tasks/${milestoneId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `更新任务详情失败 (状态码: ${response.status})`);
    }
    milestoneTaskDetails.value = responseData;
    isEditMode.value = false;
    updateSuccessMessage.value = '任务核心信息更新成功！';
    setTimeout(() => updateSuccessMessage.value = '', 3000);
  } catch (error) {
    console.error('更新里程碑任务详情失败:', error);
    updateErrorMessage.value = error.message || '更新任务详情时发生网络错误。';
  } finally {
    isUpdating.value = false;
  }
};

const fetchTaskDetails = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  milestoneTaskDetails.value = null;
  isEditMode.value = false; // Ensure not in edit mode on fresh load

  if (!milestoneId.value) {
    errorMessage.value = '未提供里程碑任务ID。';
    isLoading.value = false;
    return;
  }

  const token = localStorage.getItem('admin_token');
  if (!token) {
    errorMessage.value = '管理员未登录或登录已过期。';
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/admin/milestone-tasks/${milestoneId.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `获取任务详情失败 (状态码: ${response.status})`);
    }
    milestoneTaskDetails.value = await response.json();
    if (milestoneTaskDetails.value) {
      editableCurrentValue.value = milestoneTaskDetails.value.current_value;
      // Do NOT initialize other editable fields here, enterEditMode does that.
    }
  } catch (error) {
    console.error('获取里程碑任务详情失败:', error);
    errorMessage.value = error.message || '获取任务详情时发生网络错误。';
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateCurrentValue = async () => {
  if (editableCurrentValue.value === null || editableCurrentValue.value < 0) {
    updateErrorMessage.value = '当前值不能为空且必须为非负数。';
    return;
  }
  isUpdating.value = true;
  updateErrorMessage.value = '';
  updateSuccessMessage.value = '';
  const token = localStorage.getItem('admin_token');

  if (!token) {
    updateErrorMessage.value = '管理员未登录或登录已过期。';
    isUpdating.value = false;
    return;
  }

  if (!milestoneId.value) {
    updateErrorMessage.value = '任务ID缺失，无法更新。';
    isUpdating.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/admin/milestone-tasks/${milestoneId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ current_value: Number(editableCurrentValue.value) }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `更新当前值失败 (状态码: ${response.status})`);
    }

    milestoneTaskDetails.value = responseData;
    if (milestoneTaskDetails.value) {
      editableCurrentValue.value = milestoneTaskDetails.value.current_value;
    }
    updateSuccessMessage.value = '当前值更新成功！';
    setTimeout(() => updateSuccessMessage.value = '', 3000);

  } catch (error) {
    console.error('更新里程碑任务当前值失败:', error);
    updateErrorMessage.value = error.message || '更新当前值时发生网络错误。';
  } finally {
    isUpdating.value = false;
  }
};

const handleUpdateStatus = async (newStatus) => {
  const confirmMessageMap = {
    ACTIVE: '您确定要启动此里程碑任务吗？',
    CANCELLED: '您确定要取消此里程碑任务吗？此操作通常不可逆。',
    COMPLETED: '您确定要将此里程碑任务标记为已完成吗？',
    TARGET_MET_ACTIVE: '您确定要允许此任务在目标达成后继续贡献吗？'
  };
  const defaultConfirmMessage = `您确定要将任务状态更新为 ${getStatusText(newStatus)}吗？`;
  const confirmation = confirm(confirmMessageMap[newStatus] || defaultConfirmMessage);

  if (!confirmation) {
    return;
  }

  isUpdating.value = true;
  updateErrorMessage.value = '';
  updateSuccessMessage.value = '';
  const token = localStorage.getItem('admin_token');

  if (!token) {
    updateErrorMessage.value = '管理员未登录或登录已过期。';
    isUpdating.value = false;
    return;
  }

  if (!milestoneId.value) {
    updateErrorMessage.value = '任务ID缺失，无法更新状态。';
    isUpdating.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/admin/milestone-tasks/${milestoneId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `更新任务状态失败 (状态码: ${response.status})`);
    }

    milestoneTaskDetails.value = responseData;
    if (milestoneTaskDetails.value) {
       editableCurrentValue.value = milestoneTaskDetails.value.current_value;
    }
    updateSuccessMessage.value = `任务状态已成功更新为: ${getStatusText(newStatus)}！`;
    setTimeout(() => updateSuccessMessage.value = '', 3000);

  } catch (error) {
    console.error('更新里程碑任务状态失败:', error);
    updateErrorMessage.value = error.message || '更新任务状态时发生网络错误。';
  } finally {
    isUpdating.value = false;
  }
};

const formatDisplayDate = (isoDateString) => {
  if (!isoDateString) return 'N/A';
  try {
    const date = new Date(isoDateString);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-');
  } catch (e) {
    return isoDateString;
  }
};

// --- Stage Task Modal Functions ---
const openAddStageTaskModal = () => {
  newStageTaskData.value = {
    title: '',
    description: '',
    type: 'Execution', // Reset to default
    target_value: null,
    unit_of_measure: '',
    assignee: '',
    due_date: ''
  };
  addStageTaskErrorMessage.value = ''; // Clear previous error messages
  isAddStageTaskModalVisible.value = true;
};

const closeAddStageTaskModal = () => {
  isAddStageTaskModalVisible.value = false;
};

const handleAddStageTask = async () => {
  // Basic client-side validation
  if (!newStageTaskData.value.title || !newStageTaskData.value.type) {
    addStageTaskErrorMessage.value = '阶段任务标题和类型为必填项。';
    return;
  }
  // Additional validation for target_value if unit_of_measure is provided or vice-versa can be added here
  if (newStageTaskData.value.target_value !== null && newStageTaskData.value.target_value < 0) {
    addStageTaskErrorMessage.value = '目标数值不能为负数。';
    return;
  }

  isUpdating.value = true;
  addStageTaskErrorMessage.value = '';
  const token = localStorage.getItem('admin_token');

  if (!token) {
    addStageTaskErrorMessage.value = '管理员未登录或登录已过期。';
    isUpdating.value = false;
    return;
  }

  const payload = { ...newStageTaskData.value };
  // Ensure target_value is a number if provided, or null if empty
  if (payload.target_value === '') payload.target_value = null;
  else if (payload.target_value !== null) payload.target_value = Number(payload.target_value);

  // Convert due_date to ISO string if present
  if (payload.due_date) {
    try {
      payload.due_date = new Date(payload.due_date).toISOString();
    } catch (e) {
      addStageTaskErrorMessage.value = '截止日期格式无效。';
      isUpdating.value = false;
      return;
    }
  }

  try {
    const response = await fetch(`/api/admin/milestone-tasks/${milestoneId.value}/sub-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `创建阶段任务失败 (状态码: ${response.status})`);
    }
    // Success: close modal, refresh parent task details to show new sub-task
    closeAddStageTaskModal();
    await fetchTaskDetails(); // Re-fetch the main milestone task to update the sub_tasks list
    // Optionally, show a global success notification if you have one

  } catch (error) {
    console.error('创建阶段任务失败:', error);
    addStageTaskErrorMessage.value = error.message || '创建阶段任务时发生网络错误。';
  } finally {
    isUpdating.value = false;
  }
};

// --- Edit Stage Task Modal Functions ---
const isEditStageTaskModalVisible = ref(false);
const editingStageTaskData = ref({
  sub_task_id: null,
  title: '',
  description: '',
  type: 'Execution',
  status: 'PLANNED', // Initialize status
  target_value: null,
  unit_of_measure: '',
  assignee: '',
  due_date: ''
});
const editStageTaskErrorMessage = ref('');

const openEditStageTaskModal = (subtask) => {
  editingStageTaskData.value = {
    sub_task_id: subtask.sub_task_id,
    title: subtask.title,
    description: subtask.description || '',
    type: subtask.type,
    status: subtask.status || 'PLANNED', // Ensure status is copied or defaults
    target_value: subtask.target_value === undefined ? null : subtask.target_value,
    unit_of_measure: subtask.unit_of_measure || '',
    assignee: subtask.assignee || '',
    due_date: formatISODateForInput(subtask.due_date) // Format due_date for input
  };
  editStageTaskErrorMessage.value = '';
  isEditStageTaskModalVisible.value = true;
};

const closeEditStageTaskModal = () => {
  isEditStageTaskModalVisible.value = false;
};

const handleUpdateStageTask = async () => {
  // Basic client-side validation
  if (!editingStageTaskData.value.title || !editingStageTaskData.value.type) {
    editStageTaskErrorMessage.value = '阶段任务标题和类型为必填项。';
    return;
  }
  // Additional validation for target_value if unit_of_measure is provided or vice-versa can be added here
  if (editingStageTaskData.value.target_value !== null && editingStageTaskData.value.target_value < 0) {
    editStageTaskErrorMessage.value = '目标数值不能为负数。';
    return;
  }

  isUpdating.value = true;
  editStageTaskErrorMessage.value = '';
  const token = localStorage.getItem('admin_token');

  if (!token) {
    editStageTaskErrorMessage.value = '管理员未登录或登录已过期。';
    isUpdating.value = false;
    return;
  }

  const payload = { ...editingStageTaskData.value };
  // Ensure target_value is a number if provided, or null if empty
  if (payload.target_value === '') payload.target_value = null;
  else if (payload.target_value !== null) payload.target_value = Number(payload.target_value);

  // Convert due_date to ISO string if present
  if (payload.due_date) {
    try {
      payload.due_date = new Date(payload.due_date).toISOString();
    } catch (e) {
      editStageTaskErrorMessage.value = '截止日期格式无效。';
      isUpdating.value = false;
      return;
    }
  }

  try {
    const response = await fetch(`/api/admin/milestone-tasks/${milestoneId.value}/sub-tasks/${payload.sub_task_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || `更新阶段任务失败 (状态码: ${response.status})`);
    }
    // Success: close modal, refresh parent task details to show updated sub-task
    closeEditStageTaskModal();
    await fetchTaskDetails(); // Re-fetch the main milestone task to update the sub_tasks list
    // Optionally, show a global success notification if you have one

  } catch (error) {
    console.error('更新阶段任务失败:', error);
    editStageTaskErrorMessage.value = error.message || '更新阶段任务时发生网络错误。';
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => {
  fetchTaskDetails();
});

</script>

<style scoped>
/* 可选的特定页面样式 */
.whitespace-pre-wrap {
  white-space: pre-wrap; /* 保持换行和空格 */
}
</style>
