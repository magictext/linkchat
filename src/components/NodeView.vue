<template>
  <div class="node-container">
    <div 
      v-for="node in nodes" 
      :key="node.id" 
      class="node" 
      :style="{ top: node.position.y + 'px', left: node.position.x + 'px' }"
    >
      <div class="node-header">{{ node.title }}</div>
      <div class="node-content">{{ node.content }}</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'NodeView',
  setup() {
    const nodes = ref([
      {
        id: 1,
        title: 'User Input',
        content: 'Hello, how are you?',
        position: { x: 100, y: 100 }
      },
      {
        id: 2,
        title: 'AI Response',
        content: 'I am doing well, thank you for asking!',
        position: { x: 300, y: 200 }
      },
      {
        id: 3,
        title: 'Follow-up',
        content: 'What can you help me with today?',
        position: { x: 500, y: 100 }
      }
    ])

    return {
      nodes
    }
  }
}
</script>

<style scoped>
.node-container {
  position: relative;
  width: 100%;
  height: 500px;
  border: 1px solid #e5dfd0; /* 更淡的边框 */
  border-radius: 6px; /* 更小的圆角 */
  overflow: hidden;
  background-color: #fdfaf3; /* 更淡的背景 */
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-image:
    radial-gradient(circle, #e2d9c5 1px, transparent 1px); /* 更淡的网格 */
  background-size: 20px 20px;
}

.node {
  position: absolute;
  width: 180px; /* 更小的宽度 */
  border: 1px solid #e5dfd0; /* 更淡的边框 */
  border-radius: 6px; /* 更小的圆角 */
  background-color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08); /* 更淡的阴影 */
  transition: all 0.3s ease;
  font-size: 0.9rem; /* 更小的字体 */
}

.node:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.12); /* 更淡的阴影 */
  transform: translateY(-1px); /* 更小的变换 */
}

.node-header {
  padding: 8px; /* 更小的内边距 */
  background: linear-gradient(135deg, #b8b8b8 0%, #a0a0a0 100%); /* 更淡的渐变 */
  color: white;
  border-top-left-radius: 6px; /* 更小的圆角 */
  border-top-right-radius: 6px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem; /* 更小的字体 */
}

.node-content {
  padding: 12px; /* 更小的内边距 */
  font-size: 0.85rem; /* 更小的字体 */
  line-height: 1.4; /* 更小的行高 */
}