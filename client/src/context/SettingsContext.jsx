import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

const SETTINGS_KEY = 'skytrack_admin_settings'

const defaultSettings = {
  aiEnabled: true,
  notificationsEnabled: true,
  autoAssign: false,
  dailyUpdatesRequired: true,
  maintenanceMode: false,
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) }
      }
      return defaultSettings
    } catch (e) {
      console.error('Failed to load settings:', e)
      return defaultSettings
    }
  })

  // Save settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }, [settings])

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === SETTINGS_KEY && e.newValue) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(e.newValue) })
        } catch (err) {
          console.error('Failed to parse settings from storage event:', err)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  // Helper functions to check settings
  const isAIEnabled = () => settings.aiEnabled
  const isNotificationsEnabled = () => settings.notificationsEnabled
  const isMaintenanceMode = () => settings.maintenanceMode
  const isAutoAssignEnabled = () => settings.autoAssign
  const isDailyUpdatesRequired = () => settings.dailyUpdatesRequired

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      isAIEnabled,
      isNotificationsEnabled,
      isMaintenanceMode,
      isAutoAssignEnabled,
      isDailyUpdatesRequired,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}
