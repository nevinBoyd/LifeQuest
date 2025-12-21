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
      const res = await apiFetch(
        `/tasks/${task.id}/preview-quests`,
        { method: "POST" }
      );

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
      prev.includes(id)
        ? prev.filter((qid) => qid !== id)
        : [...prev, id]
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

    setTimeout(() => {
      onQuestsFinalized(data.quests);
    }, 500);
  }

  const selectedQuests = previewQuests.filter((q) =>
    selectedQuestIds.includes(q.id)
  );

  return (
    <div className="planner-stage">
      {/* Left card — available quests */}
      <div className={`planner-card left ${isFinalizing ? "merge-left" : ""}`}>
        <div className="card card-selection">
          <h3>{task.title}</h3>

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

          {/* Add custom quest */}
          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              value={customQuestText}
              placeholder="Add a custom quest"
              onChange={(e) => setCustomQuestText(e.target.value)}
            />

            <button
              type="button"
              onClick={handleAddCustomQuest}
              style={{ marginTop: "0.5rem", width: "100%" }}
            >
              Add Quest
            </button>

            {/* Go back to task input */}
            <button
              type="button"
              onClick={onBack}
              style={{ marginTop: "0.5rem", width: "100%" }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Right card — selected quests */}
      <div className={`planner-card right ${isFinalizing ? "merge-right" : ""}`}>
        <div className="card card-selected">
          <h3>Selected</h3>

          <ul className="card-list">
            {selectedQuests.length === 0 ? (
              <li>No quests selected yet</li>
            ) : (
              selectedQuests.map((quest) => (
                <li
                  key={quest.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{quest.title}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedQuest(quest.id)}
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>

          <button
            onClick={handleFinalize}
            disabled={isFinalizing}
            style={{ marginTop: "1rem" }}
          >
            {isFinalizing ? "Finalizing..." : "Finalize"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestPlanner;
