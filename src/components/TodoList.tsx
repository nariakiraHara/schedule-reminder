import { useState, useEffect } from 'react';
import { Todo } from '../types/todo';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, onToggleComplete, onDelete }: TodoListProps) {
  // リアルタイム更新のための現在時刻
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000); // 60秒

    return () => clearInterval(interval);
  }, []);

  // 完了済みで1日以上経過したものを除外
  const filteredTodos = todos.filter((todo) => {
    if (!todo.completed) {
      return true; // 未完了は表示
    }

    // 完了済みの場合、終了時間または開始時間から1日経過しているかチェック
    const referenceDate = todo.endDate ? new Date(todo.endDate) : new Date(todo.startDate);
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeSinceReference = currentTime.getTime() - referenceDate.getTime();

    return timeSinceReference < oneDayMs; // 1日未満なら表示
  });

  // 開始時間順にソート（近い順）
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = date.getTime() - currentTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timeInfo = '';
    if (diffMs < 0) {
      const absDiffMins = Math.abs(diffMins);
      const absDiffHours = Math.abs(diffHours);
      if (absDiffMins < 60) {
        timeInfo = `${absDiffMins}分経過`;
      } else if (absDiffHours < 24) {
        timeInfo = `${absDiffHours}時間経過`;
      } else {
        timeInfo = '経過';
      }
    } else if (diffMins < 60) {
      timeInfo = `あと${diffMins}分`;
    } else if (diffHours < 24) {
      timeInfo = `あと${diffHours}時間`;
    } else if (diffDays < 7) {
      timeInfo = `あと${diffDays}日`;
    }

    return {
      formatted: date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timeInfo,
      isPast: diffMs < 0,
      isUrgent: diffMs > 0 && diffMins <= 10,
    };
  };

  if (filteredTodos.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm p-16 rounded-3xl shadow-lg text-center border border-gray-100">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-gray-600 text-xl font-semibold mb-2">
          {todos.length === 0
            ? 'まだスケジュールがありません'
            : '表示できるスケジュールがありません'}
        </p>
        <p className="text-gray-400 text-sm">
          {todos.length === 0
            ? '右下の + ボタンから新しいスケジュールを追加してみましょう'
            : '完了済みのスケジュールは1日後に非表示になります'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">スケジュール一覧</h2>
        <span className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
          {filteredTodos.filter(t => !t.completed).length} / {filteredTodos.length} 件
        </span>
      </div>
      {sortedTodos.map((todo) => {
        const startInfo = formatDate(todo.startDate);
        const endInfo = todo.endDate ? formatDate(todo.endDate) : null;

        // カードのスタイルを決定
        const getCardStyle = () => {
          if (todo.completed) {
            return 'bg-white/50 backdrop-blur-sm border-l-4 border-green-500 opacity-70';
          }
          if (startInfo.isUrgent || (endInfo && endInfo.isUrgent)) {
            return 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 shadow-lg shadow-orange-200';
          }
          if (startInfo.isPast && (!endInfo || endInfo.isPast)) {
            return 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500';
          }
          return 'bg-white/80 backdrop-blur-sm border-l-4 border-indigo-500';
        };

        return (
          <div
            key={todo.id}
            className={`${getCardStyle()} p-5 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border border-gray-100`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleComplete(todo.id)}
                className="mt-1.5 w-6 h-6 rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              />

              <div className="flex-1">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {todo.title}
                </h3>

                {todo.description && (
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">{todo.description}</p>
                )}

                <div className="mt-3 space-y-2">
                  {/* 開始時間 */}
                  <div className="flex items-center gap-3 text-sm bg-white/50 rounded-lg p-2">
                    <span className="text-gray-600 min-w-[70px] font-medium">🚀 開始</span>
                    <span className="text-gray-800 font-medium">{startInfo.formatted}</span>
                    {startInfo.timeInfo && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          startInfo.isPast
                            ? 'bg-gray-100 text-gray-600'
                            : startInfo.isUrgent
                            ? 'bg-orange-100 text-orange-700 animate-pulse'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {startInfo.timeInfo}
                      </span>
                    )}
                    {todo.notifiedStart && !todo.completed && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">
                        通知済み
                      </span>
                    )}
                  </div>

                  {/* 終了時間 */}
                  {endInfo && (
                    <div className="flex items-center gap-3 text-sm bg-white/50 rounded-lg p-2">
                      <span className="text-gray-600 min-w-[70px] font-medium">⏰ 終了</span>
                      <span className="text-gray-800 font-medium">{endInfo.formatted}</span>
                      {endInfo.timeInfo && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            endInfo.isPast
                              ? 'bg-red-100 text-red-700'
                              : endInfo.isUrgent
                              ? 'bg-orange-100 text-orange-700 animate-pulse'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {endInfo.timeInfo}
                        </span>
                      )}
                      {todo.notifiedEnd && !todo.completed && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">
                          通知済み
                        </span>
                      )}
                    </div>
                  )}

                  {/* 完了バッジ */}
                  {todo.completed && (
                    <div className="inline-flex items-center gap-2 mt-2">
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                        ✓ 完了
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm(`「${todo.title}」を削除しますか？`)) {
                    onDelete(todo.id);
                  }
                }}
                className="text-red-500 hover:text-white hover:bg-red-500 transition-all p-3 rounded-xl hover:scale-110"
                title="削除"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
