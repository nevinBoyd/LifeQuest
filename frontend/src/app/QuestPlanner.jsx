import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const DEFAULT_QUESTS = [
  "Break the task into smaller steps",
  "Complete the most important part",
  "Review and wrap up progress",
];

function QuestPlanner({ task, onQuestsFinalized, onBack }) {
  const [previewQuests, setPreviewQuests] = useState([]);
  const [selectedQuestIds, setSelectedQuestIds] = useState([]);
  const [customQuestText, setCustomQuestText] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    async function fetchPreviewQuests() {
      const res = await apiFetch(`/tasks/${task.id}/preview-quests`, {
        method: "POST",
      });

      if (!res.ok) {
        injectDefaults();
        return;
      }

      const quests = await res.json();

      if (!quests || quests.length === 0) {
        injectDefaults();
      } else {
        setPreviewQuests(quests);
      }
    }

    function injectDefaults() {
      const fallback = DEFAULT_QUESTS.map((title, index) => ({
        id: `default-${index}`,
        title,
      }));
      setPreviewQuests(fallback);
    }

    fetchPreviewQuests();
  }, [task.id]);

  function toggleQuest(id) {
    if (isFinalizing) return;

    setSelectedQuestIds((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
    );
  }

  function removeSelectedQuest(id) {
    setSelectedQuestIds((prev) => prev.filter((qid) => qid !== id));
  }

  function handleAddCustomQuest() {
    const trimmed = customQuestText.trim();
    if (!trimmed) return;

    const newQuest = {
      id: `custom-${crypto.randomUUID()}`,
      title: trimmed,
    };

    setPreviewQuests((prev) => [...prev, newQuest]);
    setSelectedQuestIds((prev) => [...prev, newQuest.id]);
    setCustomQuestText("");
  }

  async function handleFinalize() {
    if (isFinalizing) return;

    const selectedSubtasks = previewQuests
      .filter((q) => selectedQuestIds.includes(q.id))
      .map((q) => q.title);

    if (selectedSubtasks.length === 0) return;

    setIsFinalizing(true);

    const res = await apiFetch(`/tasks/${task.id}/finalize-quests`, {
      method: "POST",
      body: JSON.stringify({
        subtasks: selectedSubtasks,
        difficulty: "medium",
        estimated_time: 30,
      }),
    });

    if (!res.ok) {
      console.error("Failed to finalize quests");
      setIsFinalizing(false);
      return;
    }

    const data = await res.json();

    setTimeout(() => {
      onQuestsFinalized(data.quests);
    }, 500);
  }

  const selectedQuests = previewQuests.filter((q) =>
    selectedQuestIds.includes(q.id)
  );

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-fg))] shadow-xl">
          <div className="border-b border-[hsl(var(--border))] px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-fg))]">
              Quest planner
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {task.title}
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
              Select the steps you want to turn into active quests.
            </p>
          </div>

          <div className="px-6 py-6">
            <ul className="space-y-3">
              {previewQuests.map((quest) => (
                <li key={quest.id}>
                  <label className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-black/10 px-4 py-3 transition hover:bg-black/20">
                    <input
                      type="checkbox"
                      checked={selectedQuestIds.includes(quest.id)}
                      onChange={() => toggleQuest(quest.id)}
                      disabled={isFinalizing}
                      className="mt-1 h-4 w-4 rounded border-[hsl(var(--border))] bg-transparent"
                    />
                    <span className="text-sm leading-6">{quest.title}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-3">
              <input
                type="text"
                value={customQuestText}
                placeholder="Add a custom quest"
                onChange={(e) => setCustomQuestText(e.target.value)}
                disabled={isFinalizing}
                className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-black/20 px-4 text-sm text-[hsl(var(--fg))] outline-none transition focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/40 disabled:opacity-60"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddCustomQuest}
                  disabled={isFinalizing}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 text-sm font-medium text-[hsl(var(--fg))] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
                >
                  Add Quest
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  disabled={isFinalizing}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-transparent px-4 text-sm font-medium text-[hsl(var(--muted-fg))] transition hover:bg-white/5 hover:text-[hsl(var(--fg))] active:opacity-90 disabled:opacity-60"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-fg))] shadow-xl">
          <div className="border-b border-[hsl(var(--border))] px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-fg))]">
              Selected
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Quest loadout
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
              Finalize the quests you want to run.
            </p>
          </div>

          <div className="px-6 py-6">
            {selectedQuests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-black/10 px-4 py-6 text-sm text-[hsl(var(--muted-fg))]">
                No quests selected yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {selectedQuests.map((quest) => (
                  <li
                    key={quest.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-black/10 px-4 py-3"
                  >
                    <span className="flex-1 text-sm leading-6">
                      {quest.title}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeSelectedQuest(quest.id)}
                      disabled={isFinalizing}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 text-xs font-medium text-[hsl(var(--fg))] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={handleFinalize}
                disabled={isFinalizing || selectedQuests.length === 0}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-[hsl(var(--primary-fg))] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
              >
                {isFinalizing ? "Finalizing..." : "Finalize"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuestPlanner;