import { useState, useEffect } from 'react';
import { NotificationSettings } from '../types/settings';
import { settingsStorage } from '../utils/settings-storage';
import { showNotification, requestNotificationPermission } from '../utils/notification';

interface SettingsProps {
  onClose: () => void;
}

const Settings = ({ onClose }: SettingsProps) => {
  const [settings, setSettings] = useState<NotificationSettings>(
    settingsStorage.getSettings()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

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

  const handleTestNotification = async () => {
    setIsTesting(true);

    try {
      // 通知の許可を確認
      const permission = await requestNotificationPermission();

      if (permission !== 'granted') {
        alert('通知が許可されていません。ブラウザの設定から通知を許可してください。');
        setIsTesting(false);
        return;
      }

      // テスト通知を表示
      showNotification(
        '🔔 テスト通知',
        `これはテスト通知です。実際の通知は${settings.notificationMinutes}分前に届きます。`
      );

      // フィードバック表示
      setTimeout(() => {
        setIsTesting(false);
      }, 1000);
    } catch (error) {
      console.error('テスト通知の送信に失敗しました:', error);
      alert('テスト通知の送信に失敗しました');
      setIsTesting(false);
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

        {/* 通知テストボタン */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            通知のテスト
          </label>
          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                送信中...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                テスト通知を送信
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            クリックすると実際の通知がどのように表示されるかテストできます
          </p>
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
