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

  // Pick a completion phrase without repeating the last one
  function pickCompletionLine(lines) {
    let index;
    do {
      index = Math.floor(Math.random() * lines.length);
    } while (index === lastLineIndex && lines.length > 1);

    setLastLineIndex(index);
    return lines[index];
  }

  // Reset button state when quest changes
  useEffect(() => {
    setIsCompleting(false);
  }, [quest?.id]);

  async function handleComplete() {
    if (isCompleting) return;

    setIsCompleting(true);

    const res = await apiFetch(
      `/quests/${quest.id}/complete`,
      { method: "POST" }
    );
    
    onXpEarned(quest.base_xp, res.total_xp);
    
    if (!res.ok) {
      console.error("Failed to complete quest");
      setIsCompleting(false);
      return;
    }

    const isFinalQuest = questIndex === totalQuests - 1;
    const lines = isFinalQuest ? MAINQUEST_LINES : SUBQUEST_LINES;

    const phrase = pickCompletionLine(lines);
    onCompletionPhrase(phrase);
    onXpEarned(quest.base_xp);
    onQuestCompleted();

    setIsCompleting(false);
  }

  if (!quest) {
    return <div>No active quest</div>;
  }

  return (
    <div className="planner-stage">
      <div className="planner-card">
        <div className="card card-selected">
          <h3>
            Quest {questIndex + 1} of {totalQuests}
          </h3>

          <div
            style={{
              minHeight: "120px",
              maxHeight: "120px",
              overflowY: "auto",
              marginBottom: "1rem",
            }}
          >
            {quest.text}
          </div>

          <button onClick={handleComplete} disabled={isCompleting}>
            {isCompleting ? "COMPLETING..." : "COMPLETE"}
          </button>

          <button
            onClick={onAbandonQuest}
            style={{
              marginTop: "0.75rem",
              opacity: 0.7,
            }}
          >
            ABANDON QUEST
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActiveQuest;
