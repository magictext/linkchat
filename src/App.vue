<template>
  <div id="app">
    <div class="layout-container">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
        <div class="sidebar-content">
          <h3>会话列表</h3>
          <ul class="session-list">
            <li
              v-for="session in sessions"
              :key="session.id"
              :class="{ 'active': currentSession && currentSession.id === session.id }"
              @click="selectSession(session)"
            >
              {{ session.title }}
            </li>
          </ul>
          <button @click="createNewSession" class="new-session-btn">+ 新建会话</button>
        </div>
        <div class="sidebar-footer">
          <button class="settings-btn" @click="showSettings = true">
            设置
          </button>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 顶部视图切换按钮 -->
        <div class="view-toggle">
          <button
            :class="{ 'active': currentView === 'template' }"
            @click="switchView('template')"
          >
            模板视图
          </button>
          <button
            :class="{ 'active': currentView === 'chat' }"
            @click="switchView('chat')"
          >
            聊天视图
          </button>
        </div>

        <!-- 根据当前视图显示不同内容 -->
        <div v-if="currentView === 'template'" class="template-view">
          <div class="template-editor">
            <!-- 左侧模板区域 -->
            <div
              class="template-area"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
            >
              <div class="template-instructions">
                <h3>当前模板</h3>
                <p>从右侧拖拽节点到此处添加</p>
              </div>

              <div class="template-nodes">
                <div
                  v-for="(node, index) in currentSession?.template?.nodes || []"
                  :key="index"
                  class="template-node"
                  :class="{ 'collapsed': node.collapsed }"
                >
                  <div class="node-header" @click="toggleNodeCollapse(node)">
                    <span class="node-type">{{ node.type.toUpperCase() }}</span>
                    <span class="node-name">{{ node.name || node.type }}</span>
                    <span class="node-toggle">{{ node.collapsed ? '▼' : '▲' }}</span>
                    <span class="node-delete" @click.stop="removeTemplateNode(index)">×</span>
                  </div>
                  <div class="node-content" v-if="!node.collapsed">
                    <!-- 嵌套节点插槽 - 前插槽 -->
                    <div
                      class="node-insert-slot before"
                      @drop="handleDropInSlot($event, index, 'before')"
                      @dragover="handleDragOver"
                      @dragleave="handleDragLeave"
                    >
                      <span class="insert-text">拖拽节点到此处（前）</span>
                      <div class="nested-nodes">
                        <div
                          v-for="(nestedNode, nestedIndex) in node.beforeNodes || []"
                          :key="nestedIndex"
                          class="nested-node"
                          :class="{ 'collapsed': nestedNode.collapsed }"
                        >
                          <div class="nested-node-header" @click="toggleNodeCollapse(nestedNode)">
                            <span class="nested-node-type">{{ nestedNode.type.toUpperCase() }}</span>
                            <span class="nested-node-name">{{ nestedNode.name || nestedNode.type }}</span>
                            <span class="nested-node-toggle">{{ nestedNode.collapsed ? '▼' : '▲' }}</span>
                            <span class="nested-node-delete" @click.stop="removeNestedNode(index, 'before', nestedIndex)">×</span>
                          </div>
                          <div class="nested-node-content" v-if="!nestedNode.collapsed">
                            <textarea
                              v-model="nestedNode.content"
                              placeholder="输入内容..."
                              class="nested-node-textarea"
                              @blur="updateCurrentTemplate"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <textarea
                      v-model="node.content"
                      placeholder="输入内容..."
                      class="node-textarea"
                      @blur="updateCurrentTemplate"
                    ></textarea>

                    <!-- 嵌套节点插槽 - 后插槽 -->
                    <div
                      class="node-insert-slot after"
                      @drop="handleDropInSlot($event, index, 'after')"
                      @dragover="handleDragOver"
                      @dragleave="handleDragLeave"
                    >
                      <span class="insert-text">拖拽节点到此处（后）</span>
                      <div class="nested-nodes">
                        <div
                          v-for="(nestedNode, nestedIndex) in node.afterNodes || []"
                          :key="nestedIndex"
                          class="nested-node"
                          :class="{ 'collapsed': nestedNode.collapsed }"
                        >
                          <div class="nested-node-header" @click="toggleNodeCollapse(nestedNode)">
                            <span class="nested-node-type">{{ nestedNode.type.toUpperCase() }}</span>
                            <span class="nested-node-name">{{ nestedNode.name || nestedNode.type }}</span>
                            <span class="nested-node-toggle">{{ nestedNode.collapsed ? '▼' : '▲' }}</span>
                            <span class="nested-node-delete" @click.stop="removeNestedNode(index, 'after', nestedIndex)">×</span>
                          </div>
                          <div class="nested-node-content" v-if="!nestedNode.collapsed">
                            <textarea
                              v-model="nestedNode.content"
                              placeholder="输入内容..."
                              class="nested-node-textarea"
                              @blur="updateCurrentTemplate"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 默认系统和用户提示节点 -->
                <div v-if="!(currentSession?.template?.nodes?.length > 0)" class="template-nodes">
                  <div class="template-node" :class="{ 'collapsed': currentSession?.template?.defaultCollapsed }">
                    <div class="node-header" @click="toggleDefaultNodeCollapse">
                      <span class="node-type">SYSTEM</span>
                      <span class="node-name">System Prompt</span>
                      <span class="node-toggle">{{ currentSession?.template?.defaultCollapsed ? '▼' : '▲' }}</span>
                    </div>
                    <div class="node-content" v-if="!currentSession?.template?.defaultCollapsed">
                      <!-- 系统提示节点的嵌套插槽 -->
                      <div
                        class="node-insert-slot before"
                        @drop="handleDropDefaultSlot($event, 'system', 'before')"
                        @dragover="handleDragOver"
                        @dragleave="handleDragLeave"
                      >
                        <span class="insert-text">拖拽节点到此处（前）</span>
                      </div>

                      <textarea
                        v-model="defaultSystemPrompt"
                        placeholder="系统提示..."
                        class="node-textarea"
                        @blur="updateCurrentTemplate"
                      ></textarea>

                      <div
                        class="node-insert-slot after"
                        @drop="handleDropDefaultSlot($event, 'system', 'after')"
                        @dragover="handleDragOver"
                        @dragleave="handleDragLeave"
                      >
                        <span class="insert-text">拖拽节点到此处（后）</span>
                      </div>
                    </div>
                  </div>

                  <div class="template-node" :class="{ 'collapsed': currentSession?.template?.defaultCollapsed }">
                    <div class="node-header" @click="toggleDefaultNodeCollapse">
                      <span class="node-type">USER</span>
                      <span class="node-name">User Prompt</span>
                      <span class="node-toggle">{{ currentSession?.template?.defaultCollapsed ? '▼' : '▲' }}</span>
                    </div>
                    <div class="node-content" v-if="!currentSession?.template?.defaultCollapsed">
                      <!-- 用户提示节点的嵌套插槽 -->
                      <div
                        class="node-insert-slot before"
                        @drop="handleDropDefaultSlot($event, 'user', 'before')"
                        @dragover="handleDragOver"
                        @dragleave="handleDragLeave"
                      >
                        <span class="insert-text">拖拽节点到此处（前）</span>
                      </div>

                      <textarea
                        v-model="defaultUserPrompt"
                        placeholder="用户提示..."
                        class="node-textarea"
                        @blur="updateCurrentTemplate"
                      ></textarea>

                      <div
                        class="node-insert-slot after"
                        @drop="handleDropDefaultSlot($event, 'user', 'after')"
                        @dragover="handleDragOver"
                        @dragleave="handleDragLeave"
                      >
                        <span class="insert-text">拖拽节点到此处（后）</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧可用节点 -->
            <div class="available-nodes">
              <h3>可用节点</h3>
              <div
                v-for="nodeType in availableNodeTypes"
                :key="nodeType.type"
                class="available-node"
                draggable="true"
                @dragstart="startDrag($event, nodeType)"
              >
                {{ nodeType.name }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="chat-view">
          <router-view :session="currentSession" />
        </div>
      </div>

      <!-- 设置弹窗 -->
      <div v-if="showSettings" class="modal-overlay" @click="closeSettings">
        <div class="modal-content" @click.stop>
          <SettingsView @close="closeSettings" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import SettingsView from './views/SettingsView.vue'
import { useChatStore } from './stores/chat'

export default {
  name: 'App',
  components: {
    SettingsView
  },
  setup() {
    const isSidebarCollapsed = ref(false)
    const showSettings = ref(false)
    const sessions = ref([])
    const currentSession = ref(null)
    const currentView = ref('chat') // 默认为聊天视图
    const chatStore = useChatStore()

    // 默认提示内容
    const defaultSystemPrompt = ref('You are a helpful assistant.')
    const defaultUserPrompt = ref('')

    // 可用节点类型
    const availableNodeTypes = ref([
      { type: 'system', name: 'System Prompt' },
      { type: 'user', name: 'User Prompt' },
      { type: 'assistant', name: 'Assistant Response' },
      { type: 'tool', name: 'Tool Call' },
      { type: 'condition', name: 'Condition' },
      { type: 'loop', name: 'Loop' }
    ])

    onMounted(() => {
      // 从浏览器存储加载会话列表
      const savedSessions = localStorage.getItem('linkchat-sessions')
      if (savedSessions) {
        sessions.value = JSON.parse(savedSessions)
        if (sessions.value.length > 0) {
          currentSession.value = sessions.value[0] // 默认选择第一个会话
        }
      } else {
        // 默认会话
        sessions.value = [
          {
            id: 1,
            title: '默认会话',
            template: {
              nodes: [
                { type: 'system', content: 'You are a helpful assistant.' },
                { type: 'user', content: '' }
              ]
            }
          }
        ]
        currentSession.value = sessions.value[0]
        saveSessions()
      }
    })

    // 保存会话到浏览器存储
    const saveSessions = () => {
      localStorage.setItem('linkchat-sessions', JSON.stringify(sessions.value))
    }

    // 选择会话
    const selectSession = (session) => {
      currentSession.value = session
      // 切换到聊天视图
      currentView.value = 'chat'
    }

    // 创建新会话
    const createNewSession = () => {
      const newId = sessions.value.length > 0
        ? Math.max(...sessions.value.map(s => s.id)) + 1
        : 1

      const newSession = {
        id: newId,
        title: `会话 ${newId}`,
        template: {
          nodes: [
            { type: 'system', content: 'You are a helpful assistant.' },
            { type: 'user', content: '' }
          ]
        }
      }

      sessions.value.push(newSession)
      currentSession.value = newSession
      saveSessions()
    }

    // 切换视图
    const switchView = (view) => {
      currentView.value = view
    }

    // 开始拖拽
    const startDrag = (event, nodeType) => {
      event.dataTransfer.setData('nodeType', JSON.stringify(nodeType))
    }

    // 拖拽相关的响应式变量
    const isDragging = ref(false)

    // 切换节点折叠状态
    const toggleNodeCollapse = (node) => {
      if (!node.hasOwnProperty('collapsed')) {
        node.collapsed = true
      } else {
        node.collapsed = !node.collapsed
      }
      updateCurrentTemplate()
    }

    // 切换默认节点折叠状态
    const toggleDefaultNodeCollapse = () => {
      if (!currentSession.value.template.defaultCollapsed) {
        currentSession.value.template.defaultCollapsed = true
      } else {
        currentSession.value.template.defaultCollapsed = !currentSession.value.template.defaultCollapsed
      }
      updateCurrentTemplate()
    }

    // 拖拽结束，添加节点到模板
    const handleDrop = (event) => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')

      const nodeTypeData = event.dataTransfer.getData('nodeType')
      if (nodeTypeData && currentSession.value) {
        const nodeType = JSON.parse(nodeTypeData)

        // 添加节点到当前模板
        if (!currentSession.value.template) {
          currentSession.value.template = { nodes: [] }
        }

        currentSession.value.template.nodes.push({
          type: nodeType.type,
          name: nodeType.name,
          content: '',
          collapsed: false,
          beforeNodes: [],
          afterNodes: []
        })

        saveSessions()
      }
      isDragging.value = false
    }

    // 拖拽结束，添加节点到指定插槽
    const handleDropInSlot = (event, parentIndex, slotType) => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')

      const nodeTypeData = event.dataTransfer.getData('nodeType')
      if (nodeTypeData && currentSession.value) {
        const nodeType = JSON.parse(nodeTypeData)

        // 添加节点到指定插槽
        if (!currentSession.value.template) {
          currentSession.value.template = { nodes: [] }
        }

        // 创建节点对象
        const newNode = {
          type: nodeType.type,
          name: nodeType.name,
          content: '',
          collapsed: false,
          beforeNodes: [],
          afterNodes: []
        }

        // 根据插槽类型添加节点
        if (slotType === 'before') {
          if (!currentSession.value.template.nodes[parentIndex].beforeNodes) {
            currentSession.value.template.nodes[parentIndex].beforeNodes = []
          }
          currentSession.value.template.nodes[parentIndex].beforeNodes.push(newNode)
        } else if (slotType === 'after') {
          if (!currentSession.value.template.nodes[parentIndex].afterNodes) {
            currentSession.value.template.nodes[parentIndex].afterNodes = []
          }
          currentSession.value.template.nodes[parentIndex].afterNodes.push(newNode)
        }

        saveSessions()
      }
    }

    // 拖拽结束，添加节点到默认节点插槽
    const handleDropDefaultSlot = (event, nodeType, slotType) => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')

      const nodeTypeData = event.dataTransfer.getData('nodeType')
      if (nodeTypeData && currentSession.value) {
        const newNodeType = JSON.parse(nodeTypeData)

        // 如果模板节点为空，创建默认节点
        if (!currentSession.value.template) {
          currentSession.value.template = {
            nodes: [
              { type: 'system', name: 'System Prompt', content: defaultSystemPrompt.value,
                beforeNodes: [], afterNodes: [], collapsed: false },
              { type: 'user', name: 'User Prompt', content: defaultUserPrompt.value,
                beforeNodes: [], afterNodes: [], collapsed: false }
            ]
          }
        }

        // 创建新的嵌套节点
        const newNode = {
          type: newNodeType.type,
          name: newNodeType.name,
          content: '',
          collapsed: false,
          beforeNodes: [],
          afterNodes: []
        }

        // 根据节点类型和插槽类型添加嵌套节点
        const targetNode = nodeType === 'system'
          ? currentSession.value.template.nodes[0]
          : currentSession.value.template.nodes[1]

        if (slotType === 'before') {
          if (!targetNode.beforeNodes) targetNode.beforeNodes = []
          targetNode.beforeNodes.push(newNode)
        } else if (slotType === 'after') {
          if (!targetNode.afterNodes) targetNode.afterNodes = []
          targetNode.afterNodes.push(newNode)
        }

        saveSessions()
      }
    }

    // 移除嵌套节点
    const removeNestedNode = (parentIndex, slotType, nestedIndex) => {
      if (slotType === 'before') {
        currentSession.value.template.nodes[parentIndex].beforeNodes.splice(nestedIndex, 1)
      } else if (slotType === 'after') {
        currentSession.value.template.nodes[parentIndex].afterNodes.splice(nestedIndex, 1)
      }
      saveSessions()
    }

    // 允许拖拽放置
    const handleDragOver = (event) => {
      event.preventDefault()
      event.currentTarget.classList.add('drag-over')
    }

    // 拖拽离开
    const handleDragLeave = (event) => {
      event.currentTarget.classList.remove('drag-over')
    }

    // 更新当前模板
    const updateCurrentTemplate = () => {
      if (currentSession.value) {
        // 更新当前会话的模板
        if (!currentSession.value.template) {
          currentSession.value.template = { nodes: [] }
        }

        // 如果没有自定义节点，则使用默认节点
        if (currentSession.value.template.nodes.length === 0) {
          currentSession.value.template.nodes = [
            { type: 'system', content: defaultSystemPrompt.value },
            { type: 'user', content: defaultUserPrompt.value }
          ]
        }

        saveSessions()
      }
    }

    // 移除模板节点
    const removeTemplateNode = (index) => {
      if (currentSession.value?.template?.nodes) {
        currentSession.value.template.nodes.splice(index, 1)
        saveSessions()
      }
    }

    const closeSettings = () => {
      showSettings.value = false
    }

    return {
      isSidebarCollapsed,
      showSettings,
      sessions,
      currentSession,
      currentView,
      defaultSystemPrompt,
      defaultUserPrompt,
      availableNodeTypes,
      selectSession,
      createNewSession,
      switchView,
      startDrag,
      handleDrop,
      handleDropInSlot,
      handleDropDefaultSlot,
      handleDragOver,
      handleDragLeave,
      toggleNodeCollapse,
      toggleDefaultNodeCollapse,
      removeNestedNode,
      updateCurrentTemplate,
      removeTemplateNode,
      closeSettings
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f5f0e1; /* 米色主题 */
}

.sidebar {
  width: 250px;
  background-color: #e8dfca; /* 浅米色 */
  border-right: 1px solid #d9d0b7;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 50px;
}

.sidebar-content {
  flex: 1;
  padding: 20px;
}

.sidebar-content h3 {
  margin-top: 0;
  color: #333;
}

.session-list {
  list-style: none;
  padding: 0;
  margin-bottom: 15px;
}

.session-list li {
  padding: 10px;
  margin: 5px 0;
  background-color: #d9d0b7;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-list li:hover {
  background-color: #c9c0a7;
}

.session-list li.active {
  background-color: #c9bfa7;
  border-left: 4px solid #8b7d6b;
}

.new-session-btn {
  width: 100%;
  padding: 8px;
  background-color: #8b7d6b; /* 深米色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.new-session-btn:hover {
  background-color: #7a6c5a;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #d9d0b7;
}

.settings-btn {
  width: 100%;
  padding: 10px;
  background-color: #8b7d6b; /* 深米色 */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.settings-btn:hover {
  background-color: #7a6c5a;
}

.main-content {
  flex: 1;
  overflow: hidden;
  background-color: #fefbf6; /* 浅米白 */
}

.view-toggle {
  padding: 10px 20px;
  background-color: #e8dfca; /* 浅米色 */
  border-bottom: 1px solid #d9d0b7;
  display: flex;
  gap: 10px;
}

.view-toggle button {
  padding: 8px 16px;
  background-color: #d9d0b7;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.view-toggle button.active {
  background-color: #8b7d6b; /* 深米色 */
  color: white;
}

.template-view {
  height: calc(100% - 50px); /* 减去顶部切换按钮的高度 */
  overflow: auto;
}

.template-editor {
  display: flex;
  height: 100%;
}

.template-area {
  flex: 2;
  padding: 20px;
  border-right: 1px solid #d9d0b7;
  overflow-y: auto;
}

.available-nodes {
  flex: 1;
  padding: 20px;
  background-color: #f0ebe0; /* 较浅的米色 */
  overflow-y: auto;
}

.template-area h3, .available-nodes h3 {
  margin-top: 0;
  color: #333;
}

.template-instructions {
  margin-bottom: 15px;
  text-align: center;
  color: #666;
}

.template-instructions p {
  margin: 5px 0;
  font-size: 0.9em;
}

.template-area.drag-over {
  background-color: #f0ebe0;
  border: 2px dashed #8b7d6b;
  border-radius: 8px;
}

.template-node {
  margin-bottom: 15px;
  border: 1px solid #d9d0b7;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.node-header {
  padding: 10px;
  background-color: #e8dfca; /* 浅米色 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-type {
  font-weight: bold;
  color: #333;
}

.node-delete {
  cursor: pointer;
  font-size: 18px;
  color: #8b7d6b;
}

.node-content {
  padding: 10px;
}

.node-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #d9d0b7;
  border-radius: 4px;
  padding: 8px;
  resize: vertical;
  font-family: inherit;
  background-color: #fefbf6;
}

.node-header {
  padding: 10px;
  background-color: #e8dfca; /* 浅米色 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.node-header:hover {
  background-color: #d9d0b7;
}

.node-type {
  font-weight: bold;
  color: #333;
  background-color: #8b7d6b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.node-name {
  flex: 1;
  margin: 0 10px;
  color: #333;
  font-weight: 500;
}

.node-toggle {
  margin: 0 5px;
  cursor: pointer;
}

.node-delete {
  cursor: pointer;
  font-size: 18px;
  color: #8b7d6b;
}

.node-delete:hover {
  color: #e74c3c;
}

.template-node.collapsed {
  height: 40px;
}

.node-content {
  padding: 10px;
}

.node-insert-slot {
  border: 1px dashed #d9d0b7;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  text-align: center;
  font-size: 0.8em;
  color: #8b7d6b;
  min-height: 30px;
  transition: all 0.2s;
}

.node-insert-slot.before {
  margin-bottom: 5px;
}

.node-insert-slot.after {
  margin-top: 5px;
}

.node-insert-slot.drag-over {
  background-color: #f0ebe0;
  border: 2px dashed #8b7d6b;
}

.insert-text {
  color: #a9a194;
}

.nested-nodes {
  margin-top: 8px;
}

.nested-node {
  margin-bottom: 8px;
  border: 1px solid #d0c7b8;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fcfaf5;
}

.nested-node:last-child {
  margin-bottom: 0;
}

.nested-node-header {
  padding: 8px;
  background-color: #e8dfca;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.9em;
}

.nested-node-header:hover {
  background-color: #d9d0b7;
}

.nested-node-type {
  font-weight: bold;
  color: #5a5248;
  background-color: #c9bfa7;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.8em;
}

.nested-node-name {
  flex: 1;
  margin: 0 8px;
  color: #555;
  font-size: 0.9em;
}

.nested-node-toggle {
  margin: 0 3px;
  cursor: pointer;
}

.nested-node-delete {
  cursor: pointer;
  font-size: 16px;
  color: #8b7d6b;
}

.nested-node-delete:hover {
  color: #e74c3c;
}

.nested-node.collapsed {
  height: 30px;
}

.nested-node-content {
  padding: 8px;
}

.nested-node-textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #d0c7b8;
  border-radius: 3px;
  padding: 5px;
  resize: vertical;
  font-family: inherit;
  background-color: #fefbf6;
  font-size: 0.9em;
}

.available-node {
  padding: 10px;
  margin: 5px 0;
  background-color: #d9d0b7;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
}

.available-node:hover {
  background-color: #c9c0a7;
}

.chat-view {
  height: calc(100% - 50px); /* 减去顶部切换按钮的高度 */
  overflow: auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 1000px;
  height: 80%;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
}
</style>
