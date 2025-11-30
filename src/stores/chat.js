import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    connected: false,
    connectionInfo: {},
    nodes: [
      {
        id: 1,
        title: '输入节点',
        content: '你好',
        response: '',
        position: { x: 100, y: 100 }
      }
    ],
    connections: [],
    selectedNode: null
  }),
  
  getters: {
    getMessages: (state) => {
      return state.messages
    },
    isConnected: (state) => {
      return state.connected
    },
    getNodes: (state) => {
      return state.nodes
    },
    getConnections: (state) => {
      return state.connections
    }
  },
  
  actions: {
    addMessage(message) {
      this.messages.push(message)
      this.saveToStorage()
    },
    
    clearMessages() {
      this.messages = []
      this.saveToStorage()
    },
    
    setConnected(status, info = {}) {
      this.connected = status
      this.connectionInfo = info
    },
    
    addNode(node) {
      this.nodes.push(node)
      this.saveToStorage()
    },
    
    updateNode(updatedNode) {
      const index = this.nodes.findIndex(n => n.id === updatedNode.id)
      if (index !== -1) {
        this.nodes[index] = updatedNode
        this.saveToStorage()
      }
    },
    
    deleteNode(nodeId) {
      this.nodes = this.nodes.filter(node => node.id !== nodeId)
      // 删除相关的连接
      this.connections = this.connections.filter(
        conn => conn.from !== nodeId && conn.to !== nodeId
      )
      this.saveToStorage()
    },
    
    addConnection(connection) {
      this.connections.push(connection)
      this.saveToStorage()
    },
    
    deleteConnection(connId) {
      this.connections = this.connections.filter(conn => conn.id !== connId)
      this.saveToStorage()
    },
    
    setSelectedNode(nodeId) {
      this.selectedNode = nodeId
    },
    
    saveToStorage() {
      // 为浏览器环境使用IndexedDB或localStorage
      if (typeof window !== 'undefined') {
        // 保存到localStorage
        localStorage.setItem('linkchat-nodes', JSON.stringify(this.nodes))
        localStorage.setItem('linkchat-connections', JSON.stringify(this.connections))
        localStorage.setItem('linkchat-messages', JSON.stringify(this.messages))
      }
    },
    
    loadFromStorage() {
      // 从存储加载数据
      if (typeof window !== 'undefined') {
        const storedNodes = localStorage.getItem('linkchat-nodes')
        const storedConnections = localStorage.getItem('linkchat-connections')
        const storedMessages = localStorage.getItem('linkchat-messages')
        
        if (storedNodes) {
          this.nodes = JSON.parse(storedNodes)
        }
        if (storedConnections) {
          this.connections = JSON.parse(storedConnections)
        }
        if (storedMessages) {
          this.messages = JSON.parse(storedMessages)
        }
      }
    }
  },

  // 持久化配置
  persist: {
    key: 'linkchat-chat',
    storage: localStorage,
  }
})