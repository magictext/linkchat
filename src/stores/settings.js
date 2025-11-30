import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      apiKey: '',
      selectedModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      persistenceMethod: 'indexeddb'
    }
  }),
  
  getters: {
    getSettings: (state) => {
      return state.settings
    }
  },
  
  actions: {
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      this.saveToStorage()
    },
    
    saveToStorage() {
      // Save settings to appropriate storage based on environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('linkchat-settings', JSON.stringify(this.settings))
      }
    },
    
    loadFromStorage() {
      // Load settings from storage when initializing
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('linkchat-settings')
        if (stored) {
          this.settings = { ...this.settings, ...JSON.parse(stored) }
        }
      }
    }
  },

  // For persistence across sessions
  persist: {
    key: 'linkchat-settings',
    storage: localStorage,
  }
})