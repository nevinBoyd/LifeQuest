import { useState } from "react";

function TaskInput({ onTaskCreated }) {
  const [title, setTitle] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const res = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
