<template>
  <div class="chat-container">
    <div class="chat-header">
      <h3>{{ session?.title || '聊天会话' }}</h3>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message"
        :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }"
      >
        <div class="message-content">
          {{ message.content }}
        </div>
        <div class="message-timestamp">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea
        v-model="inputMessage"
        @keydown.enter="sendMessage"
        placeholder="输入消息..."
        class="message-input"
        ref="messageInputRef"
      ></textarea>
      <button @click="sendMessage" class="send-button">发送</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue'

export default {
  name: 'ChatView',
  props: {
    session: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const inputMessage = ref('')
    const messages = ref([])
    const messagesContainer = ref(null)
    const messageInputRef = ref(null)

    // 当会话变化时，加载对应的消息
    watch(() => props.session?.id, () => {
      loadSessionMessages()
    })

    onMounted(() => {
      loadSessionMessages()
    })

    // 加载会话消息
    const loadSessionMessages = () => {
      if (props.session?.id) {
        const sessionMessages = localStorage.getItem(`session_${props.session.id}_messages`)
        if (sessionMessages) {
          messages.value = JSON.parse(sessionMessages)
        } else {
          messages.value = [
            {
              role: 'assistant',
              content: '你好！我是AI助手，有什么可以帮你的吗？',
              timestamp: new Date()
            }
          ]
        }
      }
    }

    // 发送消息
    const sendMessage = async (event) => {
      if (event?.shiftKey) {
        // 如果按下了Shift+Enter，不发送消息，而是添加换行
        return
      }

      event?.preventDefault()

      if (!inputMessage.value.trim()) return

      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: inputMessage.value,
        timestamp: new Date()
      }

      messages.value.push(userMessage)
      saveMessages()

      // 清空输入框
      inputMessage.value = ''

      // 滚动到底部
      await nextTick()
      scrollToBottom()

      // 模拟AI回复（实际应用中会调用API）
      setTimeout(() => {
        const aiMessage = {
          role: 'assistant',
          content: `收到: "${userMessage.content}"。这是AI的回复。`,
          timestamp: new Date()
        }

        messages.value.push(aiMessage)
        saveMessages()

        // 滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
      }, 1000)
    }

    // 保存消息到本地存储
    const saveMessages = () => {
      if (props.session?.id) {
        localStorage.setItem(`session_${props.session.id}_messages`, JSON.stringify(messages.value))
      }
    }

    // 滚动到底部
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return {
      inputMessage,
      messages,
      messagesContainer,
      messageInputRef,
      sendMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fdfaf3; /* 更淡的背景 */
  font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.chat-header {
  padding: 12px 16px; /* 更小的内边距 */
  background: linear-gradient(135deg, #f7f3e8 0%, #eee9dd 100%); /* 更淡的渐变 */
  border-bottom: 1px solid #e5dfd0; /* 更淡的边框 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.03); /* 更淡的阴影 */
}

.chat-header h3 {
  margin: 0;
  color: #555; /* 更淡的颜色 */
  font-weight: 600;
  font-size: 1.1rem; /* 更小的字体 */
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  align-self: flex-end;
  background-color: #8b7d6b; /* 深米色 */
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant-message {
  align-self: flex-start;
  background-color: #e8dfca; /* 浅米色 */
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-content {
  margin-bottom: 5px;
}

.message-timestamp {
  font-size: 0.7em;
  opacity: 0.7;
  text-align: right;
}

.chat-input-area {
  padding: 15px 20px;
  background-color: #e8dfca; /* 浅米色 */
  border-top: 1px solid #d9d0b7;
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #d9d0b7;
  border-radius: 20px;
  resize: none;
  height: 60px;
  font-family: inherit;
  background-color: #fefbf6;
}

.message-input:focus {
  outline: none;
  border-color: #8b7d6b;
}

.send-button {
  padding: 0 20px;
  background-color: #8b7d6b; /* 深米色 */
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  align-self: flex-end;
}

.send-button:hover {
  background-color: #7a6c5a;
}
</style>