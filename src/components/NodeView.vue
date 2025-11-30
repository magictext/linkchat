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
  border: 1px solid #ccc;
  overflow: hidden;
}

.node {
  position: absolute;
  width: 200px;
  border: 1px solid #007bff;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.node-header {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.node-content {
  padding: 15px;
}