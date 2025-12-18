function ActiveQuest({
  quest,
  questIndex,
  totalQuests,
  onQuestCompleted,
}) {
  if (!quest) {
    return <div>No active quest</div>;
  }

  function handleComplete() {
    onQuestCompleted();
  }

  return (
    <div>
      <div>
        Quest {questIndex + 1} of {totalQuests}
      </div>

      <h3>{quest.title}</h3>

      <button onClick={handleComplete}>Complete</button>
    </div>
  );
}

export default ActiveQuest;
