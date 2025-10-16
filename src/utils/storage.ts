import { Todo } from '../types/todo';

const STORAGE_KEY = 'todos';

export const storage = {
  /**
   * すべてのTodoを取得
   */
  getTodos(): Todo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get todos from localStorage:', error);
      return [];
    }
  },

  /**
   * Todoを保存
   */
  saveTodos(todos: Todo[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
    }
  },

  /**
   * Todoを追加
   */
  addTodo(todo: Todo): void {
    const todos = this.getTodos();
    todos.push(todo);
    this.saveTodos(todos);
  },

  /**
   * Todoを更新
   */
  updateTodo(id: string, updates: Partial<Todo>): void {
    const todos = this.getTodos();
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveTodos(todos);
    }
  },

  /**
   * Todoを削除
   */
  deleteTodo(id: string): void {
    const todos = this.getTodos();
    const filtered = todos.filter(todo => todo.id !== id);
    this.saveTodos(filtered);
  },

  /**
   * 完了状態を切り替え
   */
  toggleComplete(id: string): void {
    const todos = this.getTodos();
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index].completed = !todos[index].completed;
      todos[index].updatedAt = new Date().toISOString();
      this.saveTodos(todos);
    }
  },
};
