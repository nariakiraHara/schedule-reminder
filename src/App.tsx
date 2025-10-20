import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FloatingActionButton from './components/FloatingActionButton';
import Settings from './components/Settings';
import { Todo, TodoFormData } from './types/todo';
import { storage } from './utils/storage';
import {
  requestNotificationPermission,
  startNotificationCheck,
  stopNotificationCheck,
  checkAndNotify,
} from './utils/notification';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 初期化：ローカルストレージからTodoを読み込み
  useEffect(() => {
    const loadedTodos = storage.getTodos();
    setTodos(loadedTodos);

    // 通知許可をリクエスト
    requestNotificationPermission();

    // 通知チェックを開始
    const intervalId = startNotificationCheck();

    // クリーンアップ
    return () => {
      stopNotificationCheck(intervalId);
    };
  }, []);

  // Todoを追加
  const handleAddTodo = (formData: TodoFormData) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      completed: false,
      notifiedStart: false,
      notifiedEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.addTodo(newTodo);
    setTodos(storage.getTodos());

    // 追加直後に通知チェックを実行
    checkAndNotify();

    // モーダルを閉じる
    setIsModalOpen(false);
  };

  // 完了状態を切り替え
  const handleToggleComplete = (id: string) => {
    storage.toggleComplete(id);
    setTodos(storage.getTodos());
  };

  // Todoを削除
  const handleDeleteTodo = (id: string) => {
    storage.deleteTodo(id);
    setTodos(storage.getTodos());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8 px-8">
      <div className="w-full mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-12 relative">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            スケジュール管理
          </h1>
          <p className="text-gray-600 text-lg">
            開始・終了時間の設定した時間前に通知が届きます ✨
          </p>
          {/* 設定ボタン */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-0 right-0 p-3 text-gray-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-white/50"
            title="設定"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </header>

        {/* スケジュール一覧 */}
        <TodoList
          todos={todos}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
        />

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setIsModalOpen(true)} />

        {/* スケジュール追加モーダル */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <TodoForm
            onSubmit={handleAddTodo}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>

        {/* 設定モーダル */}
        <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
          <Settings onClose={() => setIsSettingsOpen(false)} />
        </Modal>
      </div>
    </div>
  );
}

export default App;