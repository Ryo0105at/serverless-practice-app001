import { useEffect, useState } from "react";
import {
  type Task,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./api";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");

  // タスクの一覧取得
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setTasks(await fetchTasks());
      } catch {
        setError("タスクの取得に失敗しました");
      }
    };
    loadTasks();
  }, []);

  // タスクの新規作成
  const handleCreate = async () => {
    if (newTitle.trim() === "") {
      return;
    }
    try {
      const created = await createTask(newTitle.trim());
      // APIを再取得せずに、作成したタスクを追加する
      setTasks([...tasks, created]);
      setNewTitle("");
    } catch {
      setError("タスクの作成に失敗しました");
    }
  };

  // タスクの更新（完了/未完了の切り替え）
  const handleToggle = async (task: Task) => {
    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      // APIを再取得せずに、更新したタスクを置き換える
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      setError("タスクの更新に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      // APIを再取得せずに、削除したタスクを除外する
      setTasks(tasks.filter((t) => t.id !== id));
    } catch {
      setError("タスクの削除に失敗しました");
    }
  };

  return (
    <div
      style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}
    >
      <h1>タスク管理</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しいタスク"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleCreate}>追加</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 4,
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.title}
            </span>
            <button onClick={() => handleDelete(task.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
