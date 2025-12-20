import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function ActiveQuest({
  quest,
  questIndex,
  totalQuests,
  onQuestCompleted,
}) {
  const [isCompleting, setIsCompleting] = useState(false);

  // Reset button state when quest changes
  useEffect(() => {
    setIsCompleting(false);
  }, [quest?.id]);

  if (!quest) {
    return <div>No active quest</div>;
  }

  async function handleComplete() {
    if (isCompleting) return;

    setIsCompleting(true);

    const res = await apiFetch(
      `/quests/${quest.id}/complete`,
      { method: "POST" }
    );

    if (!res.ok) {
      console.error("Failed to complete quest");
      setIsCompleting(false);
      return;
    }

    onQuestCompleted();
  }

  return (
    <div>
      <div>
        Quest {questIndex + 1} of {totalQuests}
      </div>

      <h3>{quest.text}</h3>

      <button
        onClick={handleComplete}
        disabled={isCompleting}
      >
        {isCompleting ? "COMPLETING..." : "COMPLETE"}
      </button>
    </div>
  );
}

export default ActiveQuest;
