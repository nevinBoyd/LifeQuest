import { useState } from "react";

function TaskInput({ onTaskCreated }) {
  const [title, setTitle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) return;

    // Temporary stub until API wiring
    const task = {
      id: Date.now(),
      title: title.trim(),
    };

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
