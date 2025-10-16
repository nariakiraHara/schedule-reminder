export interface Todo {
  id: string;
  title: string;
  description?: string;
  startDate: string; // 開始時間（ISO 8601形式）
  endDate?: string; // 終了時間（任意、ISO 8601形式）
  completed: boolean;
  notifiedStart: boolean; // 開始10分前通知を送ったか
  notifiedEnd: boolean; // 終了10分前通知を送ったか
  createdAt: string;
  updatedAt: string;
}

export interface TodoFormData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
}
