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
  border: 1px solid #d9d0b7;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fefbf6;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-image:
    radial-gradient(circle, #d9d0b7 1px, transparent 1px);
  background-size: 20px 20px;
}

.node {
  position: absolute;
  width: 200px;
  border: 1px solid #d9d0b7;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.node:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.node-header {
  padding: 10px;
  background: linear-gradient(135deg, #8b7d6b 0%, #7a6c5a 100%);
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-content {
  padding: 15px;
  font-size: 0.9rem;
  line-height: 1.5;
}