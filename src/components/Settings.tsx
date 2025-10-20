import { useState, useEffect } from 'react';
import { NotificationSettings } from '../types/settings';
import { settingsStorage } from '../utils/settings-storage';

interface SettingsProps {
  onClose: () => void;
}

const Settings = ({ onClose }: SettingsProps) => {
  const [settings, setSettings] = useState<NotificationSettings>(
    settingsStorage.getSettings()
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 設定を読み込む
    setSettings(settingsStorage.getSettings());
  }, []);

  const handleSave = () => {
    try {
      setIsSaving(true);
      settingsStorage.saveSettings(settings);

      // 保存成功のフィードバック
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 300);
    } catch (error) {
      setIsSaving(false);
      alert('設定の保存に失敗しました');
    }
  };

  const handleReset = () => {
    if (window.confirm('設定を初期値にリセットしますか?')) {
      settingsStorage.resetSettings();
      setSettings(settingsStorage.getSettings());
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        通知設定
      </h2>

      <div className="space-y-6">
        {/* 通知タイミング設定 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            通知タイミング
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">スケジュールの</span>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.notificationMinutes}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 0 && value <= 10) {
                    setSettings({ ...settings, notificationMinutes: value });
                  }
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-semibold"
              />
              <span className="text-gray-600">分前に通知</span>
            </div>

            {/* スライダー */}
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="10"
                value={settings.notificationMinutes}
                onChange={(e) => {
                  setSettings({ ...settings, notificationMinutes: parseInt(e.target.value) });
                }}
                className="w-full h-2 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0分</span>
                <span>5分</span>
                <span>10分</span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              <p className="text-sm text-indigo-700">
                {settings.notificationMinutes === 0
                  ? '⚡ スケジュールの開始・終了時刻ちょうどに通知します'
                  : `📢 スケジュールの開始・終了時刻の${settings.notificationMinutes}分前に通知します`}
              </p>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            リセット
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
