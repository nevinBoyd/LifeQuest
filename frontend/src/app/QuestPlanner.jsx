import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function QuestPlanner({ task, onQuestsFinalized }) {
  const [previewQuests, setPreviewQuests] = useState([]);
  const [selectedQuestIds, setSelectedQuestIds] = useState([]);

  useEffect(() => {
    async function fetchPreviewQuests() {
      const res = await apiFetch(
        `/tasks/${task.id}/preview-quests`,
        {
          method: "POST",
        }
      );

      if (!res.ok) return;

      const quests = await res.json();
      setPreviewQuests(quests);
    }

    fetchPreviewQuests();
  }, [task.id]);

  function toggleQuest(id) {
    setSelectedQuestIds((prev) =>
      prev.includes(id)
        ? prev.filter((qid) => qid !== id)
        : [...prev, id]
    );
  }

  function handleFinalize() {
    const finalizedQuests = previewQuests.filter((q) =>
      selectedQuestIds.includes(q.id)
    );

    if (finalizedQuests.length === 0) return;

    onQuestsFinalized(finalizedQuests);
  }

  return (
    <div>
      <h2>{task.title}</h2>

      <ul>
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

      <button onClick={handleFinalize}>Finalize</button>
    </div>
  );
}

export default QuestPlanner;
