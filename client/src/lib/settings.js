// Settings service - stores admin settings in localStorage
// In a production app, you'd want to store these in the database

const SETTINGS_KEY = 'skytrack_admin_settings'

const defaultSettings = {
  aiEnabled: true,
  notificationsEnabled: true,
  autoAssign: false,
  dailyUpdatesRequired: true,
  maintenanceMode: false,
}

export const getSettings = () => {
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
}

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch (e) {
    console.error('Failed to save settings:', e)
    return false
  }
}

export const updateSetting = (key, value) => {
  const settings = getSettings()
  settings[key] = value
  return saveSettings(settings)
}

export const resetSettings = () => {
  return saveSettings(defaultSettings)
}

export { defaultSettings }
