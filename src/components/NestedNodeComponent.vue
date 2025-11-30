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
</style>