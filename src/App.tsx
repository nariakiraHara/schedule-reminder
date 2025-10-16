import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FloatingActionButton from './components/FloatingActionButton';
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
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            スケジュール管理
          </h1>
          <p className="text-gray-600 text-lg">
            開始・終了時間の10分前に通知が届きます ✨
          </p>
        </header>

        {/* スケジュール一覧 */}
        <TodoList
          todos={todos}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
        />

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setIsModalOpen(true)} />

        {/* モーダル */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <TodoForm
            onSubmit={handleAddTodo}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  );
}

export default App;