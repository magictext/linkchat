<template>
  <div id="app">
    <div class="layout-container">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <h3 v-if="!isSidebarCollapsed">会话列表</h3>
            <button @click="toggleSidebar" class="collapse-btn">
              <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
            </button>
          </div>
          <ul class="session-list" :class="{ 'collapsed': isSidebarCollapsed }">
            <li
              v-for="session in sessions"
              :key="session.id"
              :class="{ 'active': currentSession && currentSession.id === session.id, 'collapsed-session': isSidebarCollapsed }"
              @click="selectSession(session)"
              :title="isSidebarCollapsed ? session.title : ''"
            >
              <i class="fas fa-comment session-icon"></i>
              <span v-if="!isSidebarCollapsed">{{ session.title }}</span>
            </li>
          </ul>
          <div class="sidebar-buttons">
            <button @click="createNewSession" class="new-session-btn" :class="{ 'collapsed': isSidebarCollapsed }">
              <i class="fas fa-plus"></i>
              <span v-if="!isSidebarCollapsed">新建会话</span>
            </button>
          </div>
        </div>
        <div class="sidebar-footer" :class="{ 'collapsed': isSidebarCollapsed }">
          <button class="settings-btn" @click="showSettings = true">
            <i class="fas fa-cog"></i>
            <span v-if="!isSidebarCollapsed">设置</span>
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
                            <!-- 嵌套节点的前插槽 -->
                            <div
                              class="node-insert-slot before"
                              @drop="handleDropInNestedSlot($event, index, 'before', nestedIndex, 'before')"
                              @dragover="handleDragOver"
                              @dragleave="handleDragLeave"
                            >
                              <span class="insert-text">拖拽节点到此处（前）</span>
                              <div class="nested-nodes">
                                <div
                                  v-for="(deepNestedNode, deepIndex) in nestedNode.beforeNodes || []"
                                  :key="deepIndex"
                                  class="nested-node"
                                  :class="{ 'collapsed': deepNestedNode.collapsed }"
                                >
                                  <div class="nested-node-header" @click="toggleNodeCollapse(deepNestedNode)">
                                    <span class="nested-node-type">{{ deepNestedNode.type.toUpperCase() }}</span>
                                    <span class="nested-node-name">{{ deepNestedNode.name || deepNestedNode.type }}</span>
                                    <span class="nested-node-toggle">{{ deepNestedNode.collapsed ? '▼' : '▲' }}</span>
                                    <span class="nested-node-delete" @click.stop="removeDeepNestedNode(index, 'before', nestedIndex, 'before', deepIndex)">×</span>
                                  </div>
                                  <div class="nested-node-content" v-if="!deepNestedNode.collapsed">
                                    <textarea
                                      v-model="deepNestedNode.content"
                                      placeholder="输入内容..."
                                      class="nested-node-textarea"
                                      @blur="updateCurrentTemplate"
                                    ></textarea>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <textarea
                              v-model="nestedNode.content"
                              placeholder="输入内容..."
                              class="nested-node-textarea"
                              @blur="updateCurrentTemplate"
                            ></textarea>

                            <!-- 嵌套节点的后插槽 -->
                            <div
                              class="node-insert-slot after"
                              @drop="handleDropInNestedSlot($event, index, 'before', nestedIndex, 'after')"
                              @dragover="handleDragOver"
                              @dragleave="handleDragLeave"
                            >
                              <span class="insert-text">拖拽节点到此处（后）</span>
                              <div class="nested-nodes">
                                <div
                                  v-for="(deepNestedNode, deepIndex) in nestedNode.afterNodes || []"
                                  :key="deepIndex"
                                  class="nested-node"
                                  :class="{ 'collapsed': deepNestedNode.collapsed }"
                                >
                                  <div class="nested-node-header" @click="toggleNodeCollapse(deepNestedNode)">
                                    <span class="nested-node-type">{{ deepNestedNode.type.toUpperCase() }}</span>
                                    <span class="nested-node-name">{{ deepNestedNode.name || deepNestedNode.type }}</span>
                                    <span class="nested-node-toggle">{{ deepNestedNode.collapsed ? '▼' : '▲' }}</span>
                                    <span class="nested-node-delete" @click.stop="removeDeepNestedNode(index, 'before', nestedIndex, 'after', deepIndex)">×</span>
                                  </div>
                                  <div class="nested-node-content" v-if="!deepNestedNode.collapsed">
                                    <textarea
                                      v-model="deepNestedNode.content"
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
                            <!-- 嵌套节点的前插槽 -->
                            <div
                              class="node-insert-slot before"
                              @drop="handleDropInNestedSlot($event, index, 'after', nestedIndex, 'before')"
                              @dragover="handleDragOver"
                              @dragleave="handleDragLeave"
                            >
                              <span class="insert-text">拖拽节点到此处（前）</span>
                              <div class="nested-nodes">
                                <div
                                  v-for="(deepNestedNode, deepIndex) in nestedNode.beforeNodes || []"
                                  :key="deepIndex"
                                  class="nested-node"
                                  :class="{ 'collapsed': deepNestedNode.collapsed }"
                                >
                                  <div class="nested-node-header" @click="toggleNodeCollapse(deepNestedNode)">
                                    <span class="nested-node-type">{{ deepNestedNode.type.toUpperCase() }}</span>
                                    <span class="nested-node-name">{{ deepNestedNode.name || deepNestedNode.type }}</span>
                                    <span class="nested-node-toggle">{{ deepNestedNode.collapsed ? '▼' : '▲' }}</span>
                                    <span class="nested-node-delete" @click.stop="removeDeepNestedNode(index, 'after', nestedIndex, 'before', deepIndex)">×</span>
                                  </div>
                                  <div class="nested-node-content" v-if="!deepNestedNode.collapsed">
                                    <textarea
                                      v-model="deepNestedNode.content"
                                      placeholder="输入内容..."
                                      class="nested-node-textarea"
                                      @blur="updateCurrentTemplate"
                                    ></textarea>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <textarea
                              v-model="nestedNode.content"
                              placeholder="输入内容..."
                              class="nested-node-textarea"
                              @blur="updateCurrentTemplate"
                            ></textarea>

                            <!-- 嵌套节点的后插槽 -->
                            <div
                              class="node-insert-slot after"
                              @drop="handleDropInNestedSlot($event, index, 'after', nestedIndex, 'after')"
                              @dragover="handleDragOver"
                              @dragleave="handleDragLeave"
                            >
                              <span class="insert-text">拖拽节点到此处（后）</span>
                              <div class="nested-nodes">
                                <div
                                  v-for="(deepNestedNode, deepIndex) in nestedNode.afterNodes || []"
                                  :key="deepIndex"
                                  class="nested-node"
                                  :class="{ 'collapsed': deepNestedNode.collapsed }"
                                >
                                  <div class="nested-node-header" @click="toggleNodeCollapse(deepNestedNode)">
                                    <span class="nested-node-type">{{ deepNestedNode.type.toUpperCase() }}</span>
                                    <span class="nested-node-name">{{ deepNestedNode.name || deepNestedNode.type }}</span>
                                    <span class="nested-node-toggle">{{ deepNestedNode.collapsed ? '▼' : '▲' }}</span>
                                    <span class="nested-node-delete" @click.stop="removeDeepNestedNode(index, 'after', nestedIndex, 'after', deepIndex)">×</span>
                                  </div>
                                  <div class="nested-node-content" v-if="!deepNestedNode.collapsed">
                                    <textarea
                                      v-model="deepNestedNode.content"
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
                class="available-node-container"
              >
                <div
                  class="available-node"
                  :class="{ 'expanded': safeExpandedNodes[nodeType.type] }"
                  draggable="true"
                  @dragstart="startDrag($event, nodeType)"
                >
                  <div class="available-node-header" @click="toggleAvailableNode(nodeType.type)">
                    <span class="available-node-type">{{ nodeType.type.toUpperCase() }}</span>
                    <span class="available-node-name">{{ nodeType.name }}</span>
                    <span class="available-node-toggle">{{ safeExpandedNodes[nodeType.type] ? '▲' : '▼' }}</span>
                  </div>
                  <div class="node-preview" v-if="safeExpandedNodes[nodeType.type]">
                    <textarea
                      class="node-textarea"
                      placeholder="节点预览内容..."
                      readonly
                    >{{ getDefaultContent(nodeType.type) }}</textarea>
                  </div>
                </div>
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
import { ref, onMounted, computed } from 'vue'
import SettingsView from './views/SettingsView.vue'
import NestedNodeComponent from './components/NestedNodeComponent.vue'
import { useChatStore } from './stores/chat'

export default {
  name: 'App',
  components: {
    SettingsView,
    NestedNodeComponent
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

    // 可用节点展开状态 - 立即初始化以避免在模板中访问时未定义
    const expandedNodes = ref({
      'system': false,
      'user': false,
      'assistant': false,
      'tool': false,
      'condition': false,
      'loop': false
    })

    // 确保expandedNodes始终可用的计算属性
    const safeExpandedNodes = computed(() => {
      return expandedNodes.value || {}
    })

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
                { type: 'system', content: 'You are a helpful assistant.', beforeNodes: [], afterNodes: [], collapsed: false },
                { type: 'user', content: '', beforeNodes: [], afterNodes: [], collapsed: false }
              ]
            }
          }
        ]
        currentSession.value = sessions.value[0]
        saveSessions()
      }

      // 初始化expandedNodes，确保每个节点类型都有对应的展开状态
      availableNodeTypes.value.forEach(nodeType => {
        if (!expandedNodes.value.hasOwnProperty(nodeType.type)) {
          expandedNodes.value[nodeType.type] = false
        }
      })
    })

    // 切换侧边栏展开/收起状态
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

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

    // 拖拽相关的响应式变量
    const isDragging = ref(false)

    // 开始拖拽 - 显示预览
    const startDrag = (event, nodeType) => {
      event.dataTransfer.setData('nodeType', JSON.stringify(nodeType))

      // 创建拖拽预览元素，模拟完整的节点（展开状态）
      const preview = document.createElement('div')
      preview.innerHTML = `
        <div style="
          width: 200px;
          border: 1px solid #d9d0b7;
          border-radius: 12px;
          overflow: hidden;
          background-color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        ">
          <div style="
            padding: 12px;
            background: linear-gradient(135deg, #e8dfca 0%, #d9d0b7 100%);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
          ">
            <span style="
              font-weight: bold;
              color: white;
              background: linear-gradient(135deg, #8b7d6b 0%, #7a6c5a 100%);
              padding: 4px 10px;
              border-radius: 15px;
              font-size: 0.8em;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">${nodeType.type.toUpperCase()}</span>
            <span style="
              flex: 1;
              margin: 0 12px;
              color: #333;
              font-weight: 500;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            ">${nodeType.name || nodeType.type}</span>
            <span style="
              margin: 0 5px;
              cursor: pointer;
              color: #8b7d6b;
              font-size: 1.2em;
            ">▲</span>
            <span style="
              cursor: pointer;
              font-size: 1.4em;
              color: #e74c3c;
              width: 24px;
              text-align: center;
            ">×</span>
          </div>
          <div style="
            padding: 12px;
          ">
            <textarea style="
              width: 100%;
              height: 60px;
              border: 1px solid #d9d0b7;
              border-radius: 8px;
              padding: 8px;
              resize: vertical;
              font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background-color: #fefbf6;
              color: #333;
              font-size: 0.95rem;
              line-height: 1.5;
            " placeholder="输入内容..."></textarea>
          </div>
        </div>
      `
      preview.style.position = 'absolute'
      preview.style.pointerEvents = 'none'
      preview.style.zIndex = '9999'
      preview.style.opacity = '0.95'
      document.body.appendChild(preview)

      // 跟随鼠标位置
      const updatePosition = (e) => {
        preview.style.left = e.pageX + 10 + 'px'
        preview.style.top = e.pageY + 10 + 'px'
      }

      document.addEventListener('mousemove', updatePosition)
      event.dataTransfer.setDragImage(preview, 0, 0)

      // 清理预览元素
      setTimeout(() => {
        if (preview.parentNode) {
          preview.parentNode.removeChild(preview)
        }
        document.removeEventListener('mousemove', updatePosition)
      }, 100)
    }

    // 切换节点折叠状态
    const toggleNodeCollapse = (node) => {
      if (!node.hasOwnProperty('collapsed')) {
        node.collapsed = false  // 默认为展开状态
      }
      node.collapsed = !node.collapsed
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

    // 拖拽结束，添加节点到嵌套节点的插槽
    const handleDropInNestedSlot = (event, parentIndex, parentSlotType, nestedIndex, nestedSlotType) => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')

      const nodeTypeData = event.dataTransfer.getData('nodeType')
      if (nodeTypeData && currentSession.value) {
        const nodeType = JSON.parse(nodeTypeData)

        // 获取目标嵌套节点
        let targetNestedNode
        if (parentSlotType === 'before') {
          targetNestedNode = currentSession.value.template.nodes[parentIndex].beforeNodes[nestedIndex]
        } else if (parentSlotType === 'after') {
          targetNestedNode = currentSession.value.template.nodes[parentIndex].afterNodes[nestedIndex]
        }

        // 创建新的深层嵌套节点
        const newDeepNode = {
          type: nodeType.type,
          name: nodeType.name,
          content: '',
          collapsed: false,
          beforeNodes: [],
          afterNodes: []
        }

        // 根据插槽类型添加节点
        if (nestedSlotType === 'before') {
          if (!targetNestedNode.beforeNodes) targetNestedNode.beforeNodes = []
          targetNestedNode.beforeNodes.push(newDeepNode)
        } else if (nestedSlotType === 'after') {
          if (!targetNestedNode.afterNodes) targetNestedNode.afterNodes = []
          targetNestedNode.afterNodes.push(newDeepNode)
        }

        saveSessions()
      }
    }

    // 移除深层嵌套节点
    const removeDeepNestedNode = (parentIndex, parentSlotType, nestedIndex, deepSlotType, deepIndex) => {
      let targetNestedNode
      if (parentSlotType === 'before') {
        targetNestedNode = currentSession.value.template.nodes[parentIndex].beforeNodes[nestedIndex]
      } else if (parentSlotType === 'after') {
        targetNestedNode = currentSession.value.template.nodes[parentIndex].afterNodes[nestedIndex]
      }

      if (deepSlotType === 'before') {
        targetNestedNode.beforeNodes.splice(deepIndex, 1)
      } else if (deepSlotType === 'after') {
        targetNestedNode.afterNodes.splice(deepIndex, 1)
      }

      saveSessions()
    }

    // 通过信息移除嵌套节点
    const removeNestedNodeByInfo = (info) => {
      const { parentIndex, slotType, nodeIndex } = info
      if (slotType === 'before') {
        currentSession.value.template.nodes[parentIndex].beforeNodes.splice(nodeIndex, 1)
      } else if (slotType === 'after') {
        currentSession.value.template.nodes[parentIndex].afterNodes.splice(nodeIndex, 1)
      }
      saveSessions()
    }

    // 切换可用节点展开状态
    const toggleAvailableNode = (nodeType) => {
      if (!expandedNodes.value.hasOwnProperty(nodeType)) {
        expandedNodes.value[nodeType] = false
      }
      expandedNodes.value[nodeType] = !expandedNodes.value[nodeType]
    }

    // 获取节点默认内容
    const getDefaultContent = (nodeType) => {
      const defaults = {
        system: "系统提示：提供系统级别的指令或上下文信息。",
        user: "用户输入：接收用户的查询或指令。",
        assistant: "助手回复：AI助手的响应内容。",
        tool: "工具调用：调用外部API或工具执行特定操作。",
        condition: "条件判断：根据条件返回不同的分支。",
        loop: "循环结构：重复执行特定操作直到满足条件。"
      }
      return defaults[nodeType] || `这是一个${nodeType}类型的节点。`
    }

    // 更新嵌套节点
    const updateNestedNode = (info) => {
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
      handleDropInNestedSlot,
      handleDropDefaultSlot,
      handleDragOver,
      handleDragLeave,
      toggleNodeCollapse,
      toggleDefaultNodeCollapse,
      toggleAvailableNode,
      toggleSidebar,
      getDefaultContent,
      removeNestedNode,
      removeDeepNestedNode,
      removeNestedNodeByInfo,
      updateNestedNode,
      updateCurrentTemplate,
      removeTemplateNode,
      closeSettings,
      safeExpandedNodes  // 添加计算属性到返回对象中
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #4a5568;
  height: 100vh;
  overflow: hidden;
  background-color: #fbf8f1; /* 更淡的背景色 */
}

.layout-container {
  display: flex;
  height: 100vh;
  background-color: #fbf8f1; /* 更淡的米色主题 */
}

.sidebar {
  width: 220px; /* 更窄 */
  background-color: #f7f3e8; /* 更淡的背景 */
  border-right: 1px solid #e5dfd0; /* 更淡的边框 */
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 50px;
}

.collapsed-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.collapsed-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #f7f3e8 0%, #eee9dd 100%);
  color: #a0a0a0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.collapsed-btn:hover {
  background: linear-gradient(135deg, #eee9dd 0%, #e4ded2 100%);
  color: #888888;
  transform: scale(1.05);
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
}

.sidebar-footer.collapsed {
  padding: 10px 0; /* 调整收缩状态下的内边距 */
  display: flex;
  justify-content: center;
  align-items: center; /* 垂直居中 */
}

.sidebar-footer.collapsed .settings-btn {
  width: 36px; /* 固定宽度 */
  height: 36px;
  min-width: 36px; /* 保持最小宽度 */
  padding: 0; /* 移除内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem; /* 保持图标大小 */
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 0; /* 重置margin */
}

.sidebar-footer.collapsed .settings-btn i {
  margin: 0; /* 移除图标边距 */
}

.sidebar-footer.collapsed .settings-btn span {
  display: none; /* 隐藏文字 */
}

.sidebar-footer.collapsed .settings-btn:hover {
  width: auto; /* 悬停时恢复原始宽度 */
  font-size: 0.9rem; /* 显示正常字体大小 */
  padding: 8px 12px; /* 添加内边距 */
  white-space: nowrap;
}

.sidebar-footer.collapsed .settings-btn:hover span {
  display: inline; /* 悬停时显示文字 */
  margin-left: 6px;
}

/* 确保收缩状态下按钮居中 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5dfd0;
  background: linear-gradient(to bottom, rgba(247, 243, 232, 0.5), rgba(238, 233, 221, 0.5));
  display: flex;
  justify-content: center; /* 确保按钮居中 */
  align-items: center; /* 垂直居中 */
}

.sidebar-content {
  flex: 1;
  padding: 16px; /* 更小的内边距 */
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sidebar-header h3 {
  margin: 0;
  color: #718096; /* 更淡的标题色 */
  font-weight: 600;
  font-size: 1.1rem; /* 更小的字体 */
}

.collapse-btn {
  background: linear-gradient(135deg, #b8b8b8 0%, #a0a0a0 100%); /* 更淡的渐变 */
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: linear-gradient(135deg, #a0a0a0 0%, #888888 100%); /* 更淡的悬停效果 */
  transform: scale(1.05);
}

.session-list {
  flex: 1; /* 让列表可以滚动 */
}

.session-list:not(.collapsed) {
  margin-bottom: 12px;
}

.session-list li {
  display: flex;
  align-items: center;
  padding: 10px 12px; /* 更小的内边距 */
  margin: 6px 0; /* 更小的间距 */
  background: linear-gradient(to right, #f7f3e8, #eee9dd); /* 更淡的渐变 */
  border-radius: 6px; /* 更小的圆角 */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03); /* 更淡的阴影 */
  font-size: 0.9rem; /* 更小的字体 */
}

.session-list li i {
  margin-right: 8px;
  color: #a0a0a0; /* 更淡的颜色 */
}

.session-list li span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 收缩状态下的会话列表项 */
.session-list.collapsed {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  margin-bottom: 12px;
}

.session-list.collapsed li {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 6px;
  justify-content: center;
  position: relative;
}

.session-list.collapsed li span {
  display: none; /* 在收缩状态隐藏文字 */
}

.session-list.collapsed li:hover {
  width: auto; /* 悬停时显示文字 */
  padding: 8px 12px;
}

.session-list.collapsed li:hover span {
  display: inline;
  margin-left: 6px;
}

.session-list.collapsed li.collapsed-session {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-content h3 {
  margin-top: 0;
  color: #718096; /* 更淡的标题色 */
  font-weight: 600;
  border-bottom: 1px solid #e2d9c5; /* 更淡的下划线 */
  padding-bottom: 6px;
  font-size: 1.1rem; /* 更小的字体 */
}

.session-list {
  list-style: none;
  padding: 0;
  margin-bottom: 12px;
}

.session-list li {
  padding: 10px 12px; /* 更小的内边距 */
  margin: 6px 0; /* 更小的间距 */
  background: linear-gradient(to right, #f7f3e8, #eee9dd); /* 更淡的渐变 */
  border-radius: 6px; /* 更小的圆角 */
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03); /* 更淡的阴影 */
  font-size: 0.9rem; /* 更小的字体 */
}

.session-list li i {
  margin-right: 8px;
  color: #a0a0a0; /* 更淡的颜色 */
}

.session-list li:hover {
  background: linear-gradient(to right, #eee9dd, #e4ded2); /* 更淡的悬停效果 */
  transform: translateX(2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
}

.session-list li.active {
  background: linear-gradient(to right, #e4ded2, #dcd5c8); /* 更淡的激活状态 */
  border-left: 3px solid #a3a3a3; /* 更淡的激活边框 */
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  transform: translateX(2px);
}

.new-session-btn {
  width: 100%;
  padding: 10px; /* 更小的内边距 */
  background: linear-gradient(135deg, #b8b8b8 0%, #a0a0a0 100%); /* 更淡的渐变 */
  color: white;
  border: none;
  border-radius: 6px; /* 更小的圆角 */
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem; /* 更小的字体 */
  margin-bottom: 12px; /* 添加底部间距 */
}

.new-session-btn:hover {
  background: linear-gradient(135deg, #a0a0a0 0%, #888888 100%); /* 更淡的悬停效果 */
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}

.new-session-btn i {
  margin-right: 6px; /* 更小的间距 */
  font-size: 0.9rem; /* 更小的图标 */
}

.new-session-btn.collapsed {
  width: 36px; /* 固定宽度 */
  height: 36px;
  padding: 0; /* 移除内边距 */
  margin: 0 auto 12px auto; /* 居中并添加底部间距 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-session-btn.collapsed span {
  display: none; /* 隐藏文字 */
}

.new-session-btn.collapsed:hover {
  width: auto; /* 悬停时恢复原始宽度 */
  padding: 8px 12px; /* 添加内边距 */
  white-space: nowrap;
}

.new-session-btn.collapsed:hover span {
  display: inline; /* 悬停时显示文字 */
  margin-left: 6px;
}

.sidebar-footer {
  padding: 16px; /* 更小的内边距 */
  border-top: 1px solid #e5dfd0; /* 更淡的边框 */
  background: linear-gradient(to bottom, rgba(247, 243, 232, 0.5), rgba(238, 233, 221, 0.5)); /* 更淡的背景 */
}

.settings-btn {
  width: 100%;
  padding: 10px; /* 更小的内边距 */
  background: linear-gradient(135deg, #b8b8b8 0%, #a0a0a0 100%); /* 更淡的渐变 */
  color: white;
  border: none;
  border-radius: 6px; /* 更小的圆角 */
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem; /* 更小的字体 */
}

.settings-btn:hover {
  background: linear-gradient(135deg, #a0a0a0 0%, #888888 100%); /* 更淡的悬停效果 */
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}

.settings-btn i {
  margin-right: 6px; /* 更小的间距 */
  font-size: 0.9rem; /* 更小的图标 */
}

.main-content {
  flex: 1;
  overflow: hidden;
  background-color: #fdfaf3; /* 更淡的背景 */
}

.view-toggle {
  padding: 10px 16px; /* 更小的内边距 */
  background: linear-gradient(135deg, #f7f3e8 0%, #eee9dd 100%); /* 更淡的渐变 */
  border-bottom: 1px solid #e5dfd0; /* 更淡的边框 */
  display: flex;
  gap: 8px; /* 更小的间隙 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.view-toggle button {
  padding: 8px 16px; /* 更小的内边距 */
  background-color: #f9f5ec; /* 更淡的背景 */
  border: none;
  border-radius: 16px; /* 更小的圆角 */
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem; /* 更小的字体 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.view-toggle button.active {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%); /* 更淡的激活渐变 */
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  margin-bottom: 12px; /* 更小的间距 */
  text-align: center;
  color: #888; /* 更淡的颜色 */
  padding: 8px;
  background: linear-gradient(to right, #fbf8f1, #f7f3e8); /* 更淡的渐变 */
  border-radius: 6px; /* 更小的圆角 */
  border: 1px dashed #e2d9c5; /* 更淡的边框 */
  font-size: 0.9rem; /* 更小的字体 */
}

.template-instructions h3 {
  margin: 0 0 4px 0; /* 更小的间距 */
  color: #718096; /* 更淡的颜色 */
  font-weight: 600;
  font-size: 1rem; /* 更小的字体 */
}

.template-instructions p {
  margin: 4px 0; /* 更小的间距 */
  font-size: 0.85rem; /* 更小的字体 */
  color: #a0a0a0; /* 更淡的颜色 */
}

.template-area.drag-over {
  background-color: #f9f5ec; /* 更淡的背景 */
  border: 2px dashed #c0c0c0; /* 更淡的虚线 */
  border-radius: 8px; /* 更小的圆角 */
  box-shadow: inset 0 0 8px rgba(128, 128, 128, 0.15); /* 更淡的阴影 */
}

.template-node {
  margin-bottom: 12px; /* 更小的间距 */
  border: 1px solid #e5dfd0; /* 更淡的边框 */
  border-radius: 8px; /* 更小的圆角 */
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 5px rgba(0,0,0,0.06); /* 更淡的阴影 */
  transition: all 0.3s ease;
}

.template-node:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); /* 更淡的悬停阴影 */
}

.node-header {
  padding: 10px; /* 更小的内边距 */
  background: linear-gradient(135deg, #f7f3e8 0%, #eee9dd 100%); /* 更淡的渐变 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem; /* 更小的字体 */
}

.node-header:hover {
  background: linear-gradient(135deg, #eee9dd 0%, #e4ded2 100%); /* 更淡的悬停效果 */
}

.node-type {
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #b8b8b8 0%, #a0a0a0 100%); /* 更淡的渐变 */
  padding: 3px 8px; /* 更小的内边距 */
  border-radius: 12px; /* 更小的圆角 */
  font-size: 0.75em; /* 更小的字体 */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-name {
  flex: 1;
  margin: 0 10px; /* 更小的间距 */
  color: #555; /* 更淡的颜色 */
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem; /* 更小的字体 */
}

.node-toggle {
  margin: 0 4px; /* 更小的间距 */
  cursor: pointer;
  color: #a0a0a0; /* 更淡的颜色 */
  font-size: 1.1em; /* 更小的字体 */
}

.node-delete {
  cursor: pointer;
  font-size: 1.2em; /* 更小的字体 */
  color: #e74c3c;
  width: 20px; /* 更小的宽度 */
  text-align: center;
  transition: transform 0.2s;
}

.node-delete:hover {
  color: #c0392b;
  transform: scale(1.1); /* 更小的缩放 */
}

.template-node.collapsed {
  height: 36px; /* 更小的高度 */
  overflow: hidden;
}

.template-node.collapsed .node-content {
  display: none;
}

.node-content {
  padding: 10px; /* 更小的内边距 */
}

.node-textarea {
  width: 100%;
  height: 80px; /* 更小的高度 */
  border: 1px solid #e5dfd0; /* 更淡的边框 */
  border-radius: 6px; /* 更小的圆角 */
  padding: 10px; /* 更小的内边距 */
  resize: vertical;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #fdfaf3; /* 更淡的背景 */
  color: #555; /* 更淡的颜色 */
  font-size: 0.9rem; /* 更小的字体 */
  line-height: 1.4; /* 更小的行高 */
  transition: border-color 0.3s, box-shadow 0.3s;
}

.node-textarea:focus {
  outline: none;
  border-color: #b8b8b8; /* 更淡的焦点边框 */
  box-shadow: 0 0 0 2px rgba(184, 184, 184, 0.2); /* 更淡的焦点阴影 */
}

/* 重复的样式定义，移除以避免冲突 */

.node-insert-slot {
  border: 1px dashed #d9d0b7;
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
  text-align: center;
  font-size: 0.85em;
  color: #8b7d6b;
  min-height: 36px;
  transition: all 0.3s ease;
  background-color: rgba(240, 235, 224, 0.3);
}

.node-insert-slot.before {
  margin-bottom: 8px;
}

.node-insert-slot.after {
  margin-top: 8px;
}

.node-insert-slot.drag-over {
  background: linear-gradient(45deg, #f0ebe0, #e8dfca);
  border: 2px dashed #8b7d6b;
  transform: scale(1.02);
}

.insert-text {
  color: #8b7d6b;
  font-style: italic;
}

.nested-nodes {
  margin-top: 10px;
  padding-left: 15px;
  border-left: 2px solid #d9d0b7;
}

.nested-node {
  margin-bottom: 10px;
  border: 1px solid #d0c7b8;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(to bottom, #fcfaf5, #f8f5f0);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.nested-node:last-child {
  margin-bottom: 0;
}

.nested-node-header {
  padding: 10px;
  background: linear-gradient(135deg, #e8dfca 0%, #d9d0b7 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
}

.nested-node-header:hover {
  background: linear-gradient(135deg, #d9d0b7 0%, #c9c0a7 100%);
}

.nested-node-type {
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #a9a194 0%, #999184 100%);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nested-node-name {
  flex: 1;
  margin: 0 8px;
  color: #555;
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nested-node-toggle {
  margin: 0 3px;
  cursor: pointer;
  color: #8b7d6b;
  font-size: 1.1em;
}

.nested-node-delete {
  cursor: pointer;
  font-size: 1.2em;
  color: #e74c3c;
  width: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.nested-node-delete:hover {
  color: #c0392b;
  transform: scale(1.1);
}

.nested-node.collapsed {
  height: 34px;
  overflow: hidden;
}

.nested-node-content {
  padding: 10px;
}

.nested-node-textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #d0c7b8;
  border-radius: 6px;
  padding: 8px;
  resize: vertical;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #fefbf6;
  font-size: 0.9em;
  color: #333;
  transition: border-color 0.3s;
}

.nested-node-textarea:focus {
  outline: none;
  border-color: #8b7d6b;
  box-shadow: 0 0 0 2px rgba(139, 125, 107, 0.2);
}

.available-node-container {
  margin-bottom: 6px; /* 更小的间距 */
}

.available-node {
  background: linear-gradient(135deg, #f7f3e8 0%, #eee9dd 100%); /* 更淡的渐变 */
  border-radius: 6px; /* 更小的圆角 */
  cursor: grab;
  user-select: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); /* 更淡的阴影 */
  overflow: hidden;
  font-size: 0.9rem; /* 更小的字体 */
}

.available-node:hover {
  background: linear-gradient(135deg, #eee9dd 0%, #e4ded2 100%); /* 更淡的悬停效果 */
  transform: translateY(-1px); /* 更小的变换 */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* 更淡的阴影 */
}

.available-node.expanded {
  box-shadow: 0 2px 8px rgba(0,0,0,0.12); /* 更淡的阴影 */
}

.available-node-header {
  padding: 10px; /* 更小的内边距 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
}

.available-node-type {
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #b8b8b8 0%, #a0a0a0 100%); /* 更淡的渐变 */
  padding: 3px 7px; /* 更小的内边距 */
  border-radius: 12px; /* 更小的圆角 */
  font-size: 0.75em; /* 更小的字体 */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.available-node-name {
  flex: 1;
  margin: 0 8px; /* 更小的间距 */
  color: #555; /* 更淡的颜色 */
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.available-node-toggle {
  margin: 0 3px; /* 更小的间距 */
  cursor: pointer;
  color: #a0a0a0; /* 更淡的颜色 */
  font-size: 1.1em; /* 更小的字体 */
}

.node-preview {
  padding: 10px; /* 更小的内边距 */
  border-top: 1px solid #e5dfd0; /* 更淡的边框 */
  background-color: #fdfaf3; /* 更淡的背景 */
}

.node-textarea {
  width: 100%;
  height: 60px; /* 更小的高度 */
  border: 1px solid #e5dfd0; /* 更淡的边框 */
  border-radius: 5px; /* 更小的圆角 */
  padding: 8px; /* 更小的内边距 */
  resize: vertical;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #fdfaf3; /* 更淡的背景 */
  color: #555; /* 更淡的颜色 */
  font-size: 0.85rem; /* 更小的字体 */
  line-height: 1.4; /* 更小的行高 */
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.node-textarea:focus {
  outline: none;
  border-color: #b8b8b8; /* 更淡的焦点边框 */
  box-shadow: 0 0 0 2px rgba(184, 184, 184, 0.2); /* 更淡的焦点阴影 */
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
