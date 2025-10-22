import { useState, FormEvent } from 'react';
import { TodoFormData } from '../types/todo';

interface TodoFormProps {
  onSubmit: (formData: TodoFormData) => void;
  onCancel?: () => void;
}

export default function TodoForm({ onSubmit, onCancel }: TodoFormProps) {
  // 現在時刻を15分単位に丸める
  const getInitialDateTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    // 15分単位に切り上げ
    const roundedMinutes = Math.ceil(minutes / 15) * 15;

    if (roundedMinutes === 60) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
    } else {
      now.setMinutes(roundedMinutes);
    }

    return {
      date: now.toISOString().slice(0, 10),
      hour: now.getHours().toString(),
      minute: now.getMinutes().toString().padStart(2, '0'),
    };
  };

  const initialDateTime = getInitialDateTime();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 開始時間の分離された入力用（初期値を現在時刻に設定）
  const [startDateOnly, setStartDateOnly] = useState(initialDateTime.date);
  const [startHour, setStartHour] = useState(initialDateTime.hour);
  const [startMinute, setStartMinute] = useState(initialDateTime.minute);

  // 終了時間の分離された入力用
  const [endDateOnly, setEndDateOnly] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('00');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !startDateOnly || !startHour) {
      alert('タイトルと開始時間を入力してください');
      return;
    }

    // 開始時間を組み立て
    const startDateTime = `${startDateOnly}T${startHour.padStart(2, '0')}:${startMinute}`;

    // 終了時間を組み立て（設定されている場合）
    let endDateTime: string | undefined;
    if (endDateOnly && endHour) {
      endDateTime = `${endDateOnly}T${endHour.padStart(2, '0')}:${endMinute}`;

      // 終了時間が開始時間より前の場合はエラー
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        alert('終了時間は開始時間より後に設定してください');
        return;
      }
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: startDateTime,
      endDate: endDateTime,
    });

    // フォームをリセット（開始時刻は現在時刻に戻す）
    const newInitialDateTime = getInitialDateTime();
    setTitle('');
    setDescription('');
    setStartDateOnly(newInitialDateTime.date);
    setStartHour(newInitialDateTime.hour);
    setStartMinute(newInitialDateTime.minute);
    setEndDateOnly('');
    setEndHour('');
    setEndMinute('00');
  };

  // 現在の日付をYYYY-MM-DD形式で取得
  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  };

  // 時間の選択肢（0-23）
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 分の選択肢（15分単位）
  const minutes = ['00', '15', '30', '45'];

  return (
    <form onSubmit={handleSubmit} className="p-8 w-full box-border">
      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">新しいスケジュール</h2>
        <p className="text-sm text-gray-500 mt-1">スケジュールの詳細を入力してください</p>
      </div>

      {/* タイトル */}
      <div className="mb-5">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: レポート提出"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border transition-all"
          required
        />
      </div>

      {/* 説明 */}
      <div className="mb-5">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          説明（任意）
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細な説明を入力..."
          rows={3}
          className="w-full max-w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border resize-none transition-all"
        />
      </div>

      {/* 時間設定のグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* 開始時間 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🚀 開始時間 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={startDateOnly}
              onChange={(e) => setStartDateOnly(e.target.value)}
              min={getMinDate()}
              className="w-full max-w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border transition-all"
              required
            />
            <div className="flex gap-2">
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="">時</option>
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}時
                  </option>
                ))}
              </select>
              <select
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {minutes.map((min) => (
                  <option key={min} value={min}>
                    {min}分
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">設定した時間前に通知します（15分単位）</p>
        </div>

        {/* 終了時間 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ⏰ 終了時間（任意）
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={endDateOnly}
              onChange={(e) => setEndDateOnly(e.target.value)}
              onFocus={() => {
                // 終了日付が未設定で開始日付が設定されている場合、開始日付をデフォルト値にする
                if (!endDateOnly && startDateOnly) {
                  setEndDateOnly(startDateOnly);
                }
              }}
              min={startDateOnly || getMinDate()}
              className="w-full max-w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border transition-all"
            />
            <div className="flex gap-2">
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                onFocus={() => {
                  // 終了時刻が未設定で開始時刻が設定されている場合、開始時刻をデフォルト値にする
                  if (!endHour && startHour) {
                    setEndHour(startHour);
                    setEndMinute(startMinute);
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">時</option>
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}時
                  </option>
                ))}
              </select>
              <select
                value={endMinute}
                onChange={(e) => setEndMinute(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {minutes.map((min) => (
                  <option key={min} value={min}>
                    {min}分
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">設定した時間前に通知します（15分単位）</p>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-indigo-500/30"
        >
          追加する
        </button>
      </div>
    </form>
  );
}
