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
    <div className="planner-grid">
      {/* Left card — available quests */}
      <div className="bridge-card">
        <h3 style={{ marginTop: 0 }}>{task.title}</h3>

        <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0" }}>
          {previewQuests.map((quest) => (
            <li key={quest.id} style={{ marginBottom: "0.5rem" }}>
              <label style={{ display: "flex", gap: "0.6rem" }}>
                <input
                  type="checkbox"
                  checked={selectedQuestIds.includes(quest.id)}
                  onChange={() => toggleQuest(quest.id)}
                  disabled={isFinalizing}
                />
                <span>{quest.title}</span>
              </label>
            </li>
          ))}
        </ul>

        <div style={{ display: "grid", gap: "0.5rem" }}>
          <input
            type="text"
            value={customQuestText}
            placeholder="Add a custom quest"
            onChange={(e) => setCustomQuestText(e.target.value)}
            disabled={isFinalizing}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(0,0,0,0.2)",
              color: "inherit",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            className="bridge-button secondary"
            onClick={handleAddCustomQuest}
            disabled={isFinalizing}
          >
            Add Quest
          </button>

          <button
            type="button"
            className="bridge-button secondary"
            onClick={onBack}
            disabled={isFinalizing}
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Right card — selected quests */}
      <div className="bridge-card">
        <h3 style={{ marginTop: 0 }}>Selected</h3>

        <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0" }}>
          {selectedQuests.length === 0 ? (
            <li style={{ opacity: 0.8 }}>No quests selected yet</li>
          ) : (
            selectedQuests.map((quest) => (
              <li
                key={quest.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.6rem",
                }}
              >
                <span style={{ flex: 1 }}>{quest.title}</span>
                <button
                  type="button"
                  className="bridge-button secondary"
                  onClick={() => removeSelectedQuest(quest.id)}
                  disabled={isFinalizing}
                  style={{ width: "auto", padding: "0.4rem 0.6rem" }}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>

        <button
          className="bridge-button"
          onClick={handleFinalize}
          disabled={isFinalizing || selectedQuests.length === 0}
        >
          {isFinalizing ? "Finalizing..." : "Finalize"}
        </button>
      </div>
    </div>
  );
}

export default QuestPlanner;
