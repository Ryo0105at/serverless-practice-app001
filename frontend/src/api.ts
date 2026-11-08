// APIのベースURLを環境変数から取得し、存在しない場合はデフォルト値を使用
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3000";

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// 共通のリクエスト関数を定義
const request = async (
  path: string,
  options?: RequestInit,
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response;
};

// 一覧取得
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await request(`/tasks`);
  return response.json();
};

// 新規作成
export const createTask = async (title: string): Promise<Task> => {
  const response = await request(`/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return response.json();
};

// 更新
export const updateTask = async (
  id: string,
  updates: Partial<Pick<Task, "title" | "completed">>,
): Promise<Task> => {
  const response = await request(`/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return response.json();
};

// 削除
export const deleteTask = async (id: string): Promise<void> => {
  await request(`/tasks/${id}`, { method: "DELETE" });
};
