import { useState, FormEvent } from 'react';
import { TodoFormData } from '../types/todo';

interface TodoFormProps {
  onSubmit: (formData: TodoFormData) => void;
  onCancel?: () => void;
}

export default function TodoForm({ onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !startDate) {
      alert('タイトルと開始時間を入力してください');
      return;
    }

    // 終了時間が開始時間より前の場合はエラー
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      alert('終了時間は開始時間より後に設定してください');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
    });

    // フォームをリセット
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
  };

  // 現在時刻をYYYY-MM-DDTHH:mm形式で取得
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

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
          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
            🚀 開始時間 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={getMinDateTime()}
            className="w-full max-w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border transition-all"
            required
          />
          <p className="mt-2 text-xs text-gray-500">10分前に通知します</p>
        </div>

        {/* 終了時間 */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
            ⏰ 終了時間（任意）
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || getMinDateTime()}
            className="w-full max-w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border transition-all"
          />
          <p className="mt-2 text-xs text-gray-500">10分前に通知します</p>
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
