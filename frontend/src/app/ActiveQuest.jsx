import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const SUBQUEST_LINES = [
  "This quest is resolved. Stay the course — the next task will guide you.",
  "The work is complete. Remain steady on the path.",
  "This stage is finished. What comes next will show itself.",
  "Resolved. Continue.",
];

const MAINQUEST_LINES = [
  "The seal is closed. The work stands.",
  "This path is complete. What was undertaken has been carried through.",
  "The circuit is finished. You may begin again when ready.",
  "The work has returned to stillness.",
];

function ActiveQuest({
  quest,
  questIndex,
  totalQuests,
  onQuestCompleted,
  onXpEarned,
  onCompletionPhrase,
  onAbandonQuest,
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastLineIndex, setLastLineIndex] = useState(null);

  function pickCompletionLine(lines) {
    let index;
    do {
      index = Math.floor(Math.random() * lines.length);
    } while (index === lastLineIndex && lines.length > 1);

    setLastLineIndex(index);
    return lines[index];
  }

  useEffect(() => {
    setIsCompleting(false);
  }, [quest?.id]);

  async function handleComplete() {
    if (isCompleting) return;

    setIsCompleting(true);

    try {
      const res = await apiFetch(`/quests/${quest.id}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        console.error("Failed to complete quest");
        return;
      }

      const data = await res.json();

      const isFinalQuest = questIndex === totalQuests - 1;
      const lines = isFinalQuest ? MAINQUEST_LINES : SUBQUEST_LINES;

      const phrase = pickCompletionLine(lines);
      onCompletionPhrase(phrase);

      onXpEarned(quest.base_xp, data.total_xp);
      onQuestCompleted();
    } catch (err) {
      console.error("Failed to complete quest", err);
    } finally {
      setIsCompleting(false);
    }
  }

  if (!quest) {
    return (
      <section className="w-full max-w-3xl mx-auto">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-8 text-[hsl(var(--muted-fg))] shadow-xl">
          No active quest
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-fg))] shadow-xl">
        <div className="border-b border-[hsl(var(--border))] px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-fg))]">
            Active quest
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Quest {questIndex + 1} of {totalQuests}
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
            Complete the current step to advance your run.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-black/10 px-4 py-5">
            <div className="min-h-[120px] text-base leading-7 text-[hsl(var(--fg))] opacity-95">
              {quest.text}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleting}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-[hsl(var(--primary-fg))] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
            >
              {isCompleting ? "COMPLETING..." : "COMPLETE"}
            </button>

            <button
              type="button"
              onClick={onAbandonQuest}
              disabled={isCompleting}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 text-sm font-medium text-[hsl(var(--fg))] transition hover:opacity-95 active:opacity-90 disabled:opacity-60"
            >
              ABANDON QUEST
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ActiveQuest;