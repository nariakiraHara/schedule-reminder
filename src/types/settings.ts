export interface NotificationSettings {
  /**
   * 通知タイミング（分前）
   * 0-10分の範囲で指定
   */
  notificationMinutes: number;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  notificationMinutes: 10,
};
