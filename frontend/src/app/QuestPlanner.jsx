import { useState } from "react";

function QuestPlanner({ task, onQuestsFinalized }) {
  // Stub preview data until API wiring
  const [previewQuests] = useState([
    { id: 1, title: "Break task into steps" },
    { id: 2, title: "Estimate time needed" },
    { id: 3, title: "Start first action" },
  ]);

  const [selectedQuestIds, setSelectedQuestIds] = useState([]);

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
