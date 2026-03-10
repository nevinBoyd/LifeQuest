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
    <section className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-fg))] shadow-xl">
        <div className="border-b border-[hsl(var(--border))] px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-fg))]">
            New task
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            What are we turning into a quest?
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
            Enter one real-world task and LifeQuest will break it into actionable
            steps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="flex flex-col gap-4">
            <label
              htmlFor="task-title"
              className="text-sm font-medium text-[hsl(var(--muted-fg))]"
            >
              Task title
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a task"
              className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-black/20 px-4 text-base text-[hsl(var(--fg))] outline-none transition focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/40"
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[hsl(var(--muted-fg))]">
                Keep it clear and specific for better quest generation.
              </p>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-semibold text-[hsl(var(--primary-fg))] transition hover:opacity-95 active:opacity-90"
              >
                READY UP
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default TaskInput;