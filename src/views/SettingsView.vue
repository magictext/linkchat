<template>
  <div class="llm-settings-container">
    <div class="header">
      <h2>LLM 接口配置</h2>
      <button @click="addNewConfig" class="add-btn">+ 新建接口</button>
    </div>
    
    <div class="settings-content">
      <!-- 左侧配置列表 -->
      <div class="config-list">
        <div 
          v-for="config in configs" 
          :key="config.id" 
          class="config-item" 
          :class="{ 'active': selectedConfig && selectedConfig.id === config.id }"
          @click="selectConfig(config)"
        >
          <div class="config-name">{{ config.name }}</div>
          <div class="config-type">{{ config.type }}</div>
        </div>
      </div>
      
      <!-- 右侧配置详情 -->
      <div class="config-details" v-if="selectedConfig">
        <div class="form-group">
          <label>自定义名称</label>
          <input 
            v-model="selectedConfig.name" 
            @blur="saveConfig"
            @keyup="debounceSave"
            placeholder="为此配置命名"
          >
        </div>
        
        <div class="form-group">
          <label>接口类型</label>
          <select 
            v-model="selectedConfig.type" 
            @change="saveConfig"
          >
            <option value="openai">OpenAI</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>LLM 地址</label>
          <input 
            v-model="selectedConfig.apiUrl" 
            @blur="saveConfig"
            @keyup="debounceSave"
            placeholder="输入 LLM 接口地址"
          >
        </div>
        
        <div class="form-group">
          <label>API Key</label>
          <input 
            v-model="selectedConfig.apiKey" 
            type="password"
            @blur="saveConfig"
            @keyup="debounceSave"
            placeholder="输入 API Key"
          >
        </div>
        
        <div class="form-group">
          <label>模型名称</label>
          <input 
            v-model="selectedConfig.model" 
            @blur="saveConfig"
            @keyup="debounceSave"
            placeholder="例如: gpt-3.5-turbo"
          >
        </div>
        
        <div class="form-group">
          <label>温度系数</label>
          <input 
            v-model="selectedConfig.temperature" 
            type="range" 
            min="0" 
            max="1" 
            step="0.1"
            @change="saveConfig"
          >
          <span>{{ selectedConfig.temperature }}</span>
        </div>
        
        <button @click="deleteConfig" class="delete-btn">删除配置</button>
      </div>
      
      <div class="empty-state" v-else>
        <p>请选择一个配置或新建配置</p>
      </div>
    </div>
    
    <div class="footer">
      <button @click="closeSettings" class="close-btn">关闭</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'SettingsView',
  emits: ['close'],
  setup(props, { emit }) {
    // 配置列表
    const configs = ref([])
    const selectedConfig = ref(null)
    const saveTimeout = ref(null)
    
    // 初始化数据
    onMounted(() => {
      // 从浏览器存储加载配置
      const savedConfigs = localStorage.getItem('llm_configs')
      if (savedConfigs) {
        configs.value = JSON.parse(savedConfigs)
      } else {
        // 默认配置
        configs.value = [
          {
            id: 1,
            name: '默认 OpenAI 配置',
            type: 'openai',
            apiUrl: 'https://api.openai.com/v1/chat/completions',
            apiKey: '',
            model: 'gpt-3.5-turbo',
            temperature: 0.7
          }
        ]
      }
    })
    
    // 选择配置
    const selectConfig = (config) => {
      selectedConfig.value = { ...config } // 创建副本以允许编辑
    }
    
    // 添加新配置
    const addNewConfig = () => {
      const newId = configs.value.length > 0 
        ? Math.max(...configs.value.map(c => c.id)) + 1 
        : 1
      
      const newConfig = {
        id: newId,
        name: `配置 ${newId}`,
        type: 'openai',
        apiUrl: '',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      }
      
      configs.value.push(newConfig)
      setTimeout(() => {
        selectConfig(newConfig)
      }, 100)
    }
    
    // 保存配置（防抖）
    const debounceSave = () => {
      if (saveTimeout.value) {
        clearTimeout(saveTimeout.value)
      }
      
      saveTimeout.value = setTimeout(() => {
        saveConfig()
      }, 1000) // 1秒后自动保存
    }
    
    // 保存配置
    const saveConfig = () => {
      if (!selectedConfig.value) return
      
      // 更新 configs 数组中的对应配置
      const index = configs.value.findIndex(c => c.id === selectedConfig.value.id)
      if (index !== -1) {
        configs.value[index] = { ...selectedConfig.value }
      }
      
      // 保存到浏览器存储
      localStorage.setItem('llm_configs', JSON.stringify(configs.value))
    }
    
    // 删除配置
    const deleteConfig = () => {
      if (!selectedConfig.value || configs.value.length <= 1) return
      
      const index = configs.value.findIndex(c => c.id === selectedConfig.value.id)
      if (index !== -1) {
        configs.value.splice(index, 1)
      }
      
      selectedConfig.value = null
      
      // 保存到浏览器存储
      localStorage.setItem('llm_configs', JSON.stringify(configs.value))
    }
    
    // 关闭设置
    const closeSettings = () => {
      // 确保保存所有更改
      saveConfig()
      emit('close')
    }
    
    return {
      configs,
      selectedConfig,
      selectConfig,
      addNewConfig,
      saveConfig,
      deleteConfig,
      closeSettings,
      debounceSave
    }
  }
}
</script>

<style scoped>
.llm-settings-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f0e1; /* 米色主题 */
}

.header {
  padding: 20px;
  border-bottom: 1px solid #d9d0b7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e8dfca; /* 浅米色 */
}

.header h2 {
  margin: 0;
  color: #333;
}

.add-btn {
  padding: 8px 16px;
  background-color: #8b7d6b; /* 深米色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #7a6c5a;
}

.settings-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.config-list {
  width: 300px;
  border-right: 1px solid #d9d0b7;
  overflow-y: auto;
  background-color: #fefbf6; /* 浅米白 */
}

.config-item {
  padding: 15px;
  border-bottom: 1px solid #e8dfca;
  cursor: pointer;
  transition: background-color 0.2s;
}

.config-item:hover {
  background-color: #e8dfca;
}

.config-item.active {
  background-color: #d9d0b7;
}

.config-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.config-type {
  font-size: 0.9em;
  color: #666;
}

.config-details {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: white;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d0b7;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fefbf6;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b7d6b;
}

.form-group span {
  margin-left: 10px;
}

.delete-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.footer {
  padding: 15px 20px;
  border-top: 1px solid #d9d0b7;
  text-align: right;
  background-color: #e8dfca; /* 浅米色 */
}

.close-btn {
  padding: 8px 16px;
  background-color: #8b7d6b; /* 深米色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #7a6c5a;
}
</style>