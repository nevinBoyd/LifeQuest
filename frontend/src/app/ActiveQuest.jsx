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
    return <div>No active quest</div>;
  }

  return (
    <div className="bridge-card" style={{ width: "100%", maxWidth: "640px" }}>
      <h3 style={{ marginTop: 0 }}>
        Quest {questIndex + 1} of {totalQuests}
      </h3>

      <div
        style={{
          marginTop: "1rem",
          marginBottom: "1rem",
          minHeight: "120px",
          maxHeight: "120px",
          overflow: "hidden",
          opacity: 0.95,
        }}
      >
        {quest.text}
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <button className="bridge-button" onClick={handleComplete} disabled={isCompleting}>
          {isCompleting ? "COMPLETING..." : "COMPLETE"}
        </button>

        <button
          className="bridge-button secondary"
          onClick={onAbandonQuest}
          disabled={isCompleting}
        >
          ABANDON QUEST
        </button>
      </div>
    </div>
  );
}

export default ActiveQuest;
