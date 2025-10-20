import { NotificationSettings, DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_KEY = 'notification-settings';

export const settingsStorage = {
  /**
   * 設定を取得
   */
  getSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        const settings = JSON.parse(data);
        // 範囲チェック
        if (settings.notificationMinutes >= 0 && settings.notificationMinutes <= 10) {
          return settings;
        }
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings from localStorage:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * 設定を保存
   */
  saveSettings(settings: NotificationSettings): void {
    try {
      // 範囲チェック
      if (settings.notificationMinutes < 0 || settings.notificationMinutes > 10) {
        throw new Error('通知タイミングは0-10分の範囲で指定してください');
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw error;
    }
  },

  /**
   * 設定をリセット
   */
  resetSettings(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  },
};
