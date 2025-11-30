<template>
  <div class="nested-node" :class="{ 'collapsed': node.collapsed }">
    <div class="nested-node-header" @click="toggleCollapse">
      <span class="nested-node-type">{{ node.type.toUpperCase() }}</span>
      <span class="nested-node-name">{{ node.name || node.type }}</span>
      <span class="nested-node-toggle">{{ node.collapsed ? '▼' : '▲' }}</span>
      <span class="nested-node-delete" @click.stop="removeCurrentNode">×</span>
    </div>
    <div class="nested-node-content" v-if="!node.collapsed">
      <!-- 前插槽 -->
      <div 
        class="node-insert-slot before"
        @drop="handleDropInSlot($event, 'before')" 
        @dragover="handleDragOver" 
        @dragleave="handleDragLeave"
      >
        <span class="insert-text">拖拽节点到此处（前）</span>
        <div class="nested-nodes">
          <NestedNodeComponent
            v-for="(nestedNode, nestedIndex) in node.beforeNodes || []" 
            :key="`before-${nestedIndex}`"
            :node="nestedNode"
            :parent-info="{ ...parentInfo, nodeType: 'before', nodeIndex: nestedIndex }"
            @update-node="$emit('update-node', $event)"
            @remove-node="$emit('remove-node', $event)"
            :level="level + 1"
          />
        </div>
      </div>
      
      <textarea 
        v-model="node.content" 
        placeholder="输入内容..."
        class="nested-node-textarea"
        @blur="updateContent"
      ></textarea>
      
      <!-- 后插槽 -->
      <div 
        class="node-insert-slot after"
        @drop="handleDropInSlot($event, 'after')" 
        @dragover="handleDragOver" 
        @dragleave="handleDragLeave"
      >
        <span class="insert-text">拖拽节点到此处（后）</span>
        <div class="nested-nodes">
          <NestedNodeComponent
            v-for="(nestedNode, nestedIndex) in node.afterNodes || []" 
            :key="`after-${nestedIndex}`"
            :node="nestedNode"
            :parent-info="{ ...parentInfo, nodeType: 'after', nodeIndex: nestedIndex }"
            @update-node="$emit('update-node', $event)"
            @remove-node="$emit('remove-node', $event)"
            :level="level + 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'NestedNodeComponent',
  props: {
    node: {
      type: Object,
      required: true
    },
    parentInfo: {
      type: Object,
      default: () => ({})
    },
    level: {
      type: Number,
      default: 0
    }
  },
  emits: ['update-node', 'remove-node'],
  setup(props, { emit }) {
    // 切换折叠状态
    const toggleCollapse = () => {
      if (!props.node.hasOwnProperty('collapsed')) {
        props.node.collapsed = true
      } else {
        props.node.collapsed = !props.node.collapsed
      }
      emit('update-node', { ...props.parentInfo, node: props.node })
    }

    // 更新内容
    const updateContent = () => {
      emit('update-node', { ...props.parentInfo, node: props.node })
    }

    // 移除当前节点
    const removeCurrentNode = () => {
      emit('remove-node', props.parentInfo)
    }

    // 拖拽事件处理
    const handleDropInSlot = (event, slotType) => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')
      
      const nodeTypeData = event.dataTransfer.getData('nodeType')
      if (nodeTypeData) {
        const nodeType = JSON.parse(nodeTypeData)
        
        // 创建新节点
        const newNode = {
          type: nodeType.type,
          name: nodeType.name,
          content: '',
          collapsed: false,
          beforeNodes: [],
          afterNodes: []
        }
        
        // 添加到指定插槽
        if (!props.node[`${slotType}Nodes`]) {
          props.node[`${slotType}Nodes`] = []
        }
        props.node[`${slotType}Nodes`].push(newNode)
        
        emit('update-node', { ...props.parentInfo, node: props.node })
      }
    }

    const handleDragOver = (event) => {
      event.preventDefault()
      event.currentTarget.classList.add('drag-over')
    }

    const handleDragLeave = (event) => {
      event.currentTarget.classList.remove('drag-over')
    }

    return {
      toggleCollapse,
      updateContent,
      removeCurrentNode,
      handleDropInSlot,
      handleDragOver,
      handleDragLeave
    }
  }
}
</script>

<style scoped>
.nested-node {
  margin-bottom: 8px; /* 更小的间距 */
  border: 1px solid #e2dcd1; /* 更淡的边框 */
  border-radius: 6px; /* 更小的圆角 */
  overflow: hidden;
  background: linear-gradient(to bottom, #fdfaf3, #fbf7ee); /* 更淡的渐变 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.04); /* 更淡的阴影 */
}

.nested-node:last-child {
  margin-bottom: 0;
}

.nested-node-header {
  padding: 9px; /* 更小的内边距 */
  background: linear-gradient(135deg, #f7f3e8 0%, #eee9dd 100%); /* 更淡的渐变 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.85rem; /* 更小的字体 */
  font-weight: 500;
}

.nested-node-header:hover {
  background: linear-gradient(135deg, #eee9dd 0%, #e4ded2 100%); /* 更淡的悬停效果 */
}

.nested-node-type {
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #c8c8c8 0%, #b0b0b0 100%); /* 更淡的渐变 */
  padding: 2px 6px; /* 更小的内边距 */
  border-radius: 10px; /* 更小的圆角 */
  font-size: 0.7em; /* 更小的字体 */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nested-node-name {
  flex: 1;
  margin: 0 6px; /* 更小的间距 */
  color: #666; /* 更淡的颜色 */
  font-size: 0.85rem; /* 更小的字体 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nested-node-toggle {
  margin: 0 2px; /* 更小的间距 */
  cursor: pointer;
  color: #a0a0a0; /* 更淡的颜色 */
  font-size: 1em; /* 更小的字体 */
}

.nested-node-delete {
  cursor: pointer;
  font-size: 1rem; /* 更小的字体 */
  color: #e74c3c;
  width: 18px; /* 更小的宽度 */
  text-align: center;
  transition: transform 0.2s;
}

.nested-node-delete:hover {
  color: #c0392b;
  transform: scale(1.1); /* 更小的缩放 */
}

.nested-node.collapsed {
  height: 30px; /* 更小的高度 */
  overflow: hidden;
}

.nested-node-content {
  padding: 8px; /* 更小的内边距 */
}

.nested-node-textarea {
  width: 100%;
  height: 50px; /* 更小的高度 */
  border: 1px solid #e2dcd1; /* 更淡的边框 */
  border-radius: 5px; /* 更小的圆角 */
  padding: 6px; /* 更小的内边距 */
  resize: vertical;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #fdfaf3; /* 更淡的背景 */
  font-size: 0.85rem; /* 更小的字体 */
  color: #555; /* 更淡的颜色 */
  transition: border-color 0.3s;
}

.nested-node-textarea:focus {
  outline: none;
  border-color: #b8b8b8; /* 更淡的焦点边框 */
  box-shadow: 0 0 0 2px rgba(184, 184, 184, 0.2); /* 更淡的焦点阴影 */
}

.node-insert-slot {
  border: 1px dashed #e5dfd0; /* 更淡的边框 */
  border-radius: 6px; /* 更小的圆角 */
  padding: 8px; /* 更小的内边距 */
  margin: 8px 0; /* 更小的间距 */
  text-align: center;
  font-size: 0.8rem; /* 更小的字体 */
  color: #a0a0a0; /* 更淡的颜色 */
  min-height: 32px; /* 更小的高度 */
  transition: all 0.3s ease;
  background-color: rgba(249, 245, 236, 0.2); /* 更淡的背景 */
}

.node-insert-slot.drag-over {
  background: linear-gradient(45deg, #f9f5ec, #f0ebe0); /* 更淡的渐变 */
  border: 2px dashed #b8b8b8; /* 更淡的虚线 */
  transform: scale(1.01); /* 更小的缩放 */
}

.insert-text {
  color: #b0b0b0; /* 更淡的颜色 */
  font-style: italic;
  font-size: 0.8rem; /* 更小的字体 */
}

.nested-nodes {
  margin-top: 8px; /* 更小的间距 */
  padding-left: 12px; /* 更小的内边距 */
  border-left: 1px solid #e5dfd0; /* 更淡的边框 */
}
</style>