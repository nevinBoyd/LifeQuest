import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function QuestPlanner({ task, onQuestsFinalized }) {
  const [previewQuests, setPreviewQuests] = useState([]);
  const [selectedQuestIds, setSelectedQuestIds] = useState([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    async function fetchPreviewQuests() {
      const res = await apiFetch(
        `/tasks/${task.id}/preview-quests`,
        { method: "POST" }
      );

      if (!res.ok) return;

      const quests = await res.json();
      setPreviewQuests(quests);
    }

    fetchPreviewQuests();
  }, [task.id]);

  function toggleQuest(id) {
    if (isFinalizing) return;

    setSelectedQuestIds((prev) =>
      prev.includes(id)
        ? prev.filter((qid) => qid !== id)
        : [...prev, id]
    );
  }

  async function handleFinalize() {
    if (isFinalizing) return;

    const selectedSubtasks = previewQuests
      .filter((q) => selectedQuestIds.includes(q.id))
      .map((q) => q.title);

    if (selectedSubtasks.length === 0) return;

    setIsFinalizing(true);

    const res = await apiFetch(
      `/tasks/${task.id}/finalize-quests`,
      {
        method: "POST",
        body: JSON.stringify({
          subtasks: selectedSubtasks,
          difficulty: "medium",
          estimated_time: 30,
        }),
      }
    );

    if (!res.ok) {
      console.error("Failed to finalize quests");
      setIsFinalizing(false);
      return;
    }

    const data = await res.json();

    // Allow merge animation to complete before switching view
    setTimeout(() => {
      onQuestsFinalized(data.quests);
    }, 500);
  }

  const selectedQuests = previewQuests.filter((q) =>
    selectedQuestIds.includes(q.id)
  );

  return (
    <div className="planner-stage">
      {/* Left card — available selections */}
      <div className={`planner-card left ${isFinalizing ? "merge-left" : ""}`}>
        <div className="card card-selection">
          <h3>{task.title}</h3>

          {/* Scrollable list */}
          <ul className="card-list">
            {previewQuests.map((quest) => (
              <li key={quest.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedQuestIds.includes(quest.id)}
                    onChange={() => toggleQuest(quest.id)}
                  />
                  {quest.title}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right card — selected preview */}
      <div className={`planner-card right ${isFinalizing ? "merge-right" : ""}`}>
        <div className="card card-selected">
          <h3>Selected</h3>

          {/* Scrollable list */}
          <ul className="card-list">
            {selectedQuests.length === 0 ? (
              <li>No quests selected yet</li>
            ) : (
              selectedQuests.map((quest) => (
                <li key={quest.id}>{quest.title}</li>
              ))
            )}
          </ul>

          <button onClick={handleFinalize} disabled={isFinalizing}>
            {isFinalizing ? "Finalizing..." : "Finalize"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestPlanner;
