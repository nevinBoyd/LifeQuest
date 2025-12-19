import { useState } from "react";
import { apiFetch } from "../api";

function TaskInput({ onTaskCreated }) {
  const [title, setTitle] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const res = await apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: trimmedTitle }),
    });

    if (!res.ok) return;

    const task = await res.json();
    onTaskCreated(task);
    setTitle("");
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a task"
      />
      <button type="submit">Start</button>
    </form>
  );
}

export default TaskInput;
