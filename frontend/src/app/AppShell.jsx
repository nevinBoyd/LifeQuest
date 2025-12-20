import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import AuthForm from "../AuthForm";
import TaskInput from "./TaskInput";
import QuestPlanner from "./QuestPlanner";
import ActiveQuest from "./ActiveQuest";

const APP_STATES = {
  EMPTY: "EMPTY",
  PLANNING: "PLANNING",
  ACTIVE: "ACTIVE",
};

function AppShell() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState(APP_STATES.EMPTY);

  const [task, setTask] = useState(null);
  const [quests, setQuests] = useState([]);
  const [activeQuestIndex, setActiveQuestIndex] = useState(0);

  useEffect(() => {
    async function checkSession() {
      const res = await apiFetch("/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
      setLoading(false);
    }

    checkSession();
  }, []);

  function handleTaskCreated(createdTask) {
    setTask(createdTask);
    setAppState(APP_STATES.PLANNING);
  }

  function handleQuestsFinalized(finalizedQuests) {
    setQuests(finalizedQuests);
    setActiveQuestIndex(0);
    setAppState(APP_STATES.ACTIVE);
  }

  function handleQuestCompleted() {
    const nextIndex = activeQuestIndex + 1;

    if (nextIndex < quests.length) {
      setActiveQuestIndex(nextIndex);
    } else {
      console.warn("All quests completed");
    }
  }
  
  async function handleLogout() {
    const res = await apiFetch("/logout", { method: "POST" });

    if (!res.ok) {
      console.error("Logout failed");
      return;
  }

  setUser(null);
  setTask(null);
  setQuests([]);
  setActiveQuestIndex(0);
  setAppState(APP_STATES.EMPTY);
}

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return <AuthForm onAuth={setUser} />;
    }

  function renderCurrentState() {
    switch (appState) {
      case APP_STATES.EMPTY:
        return <TaskInput onTaskCreated={handleTaskCreated} />;

      case APP_STATES.PLANNING:
        return (
          <QuestPlanner
            task={task}
            onQuestsFinalized={handleQuestsFinalized}
          />
        );

      case APP_STATES.ACTIVE:
        return (
          <ActiveQuest
            quest={quests[activeQuestIndex]}
            questIndex={activeQuestIndex}
            totalQuests={quests.length}
            onQuestCompleted={handleQuestCompleted}
          />
        );

      default:
        return <div>Invalid state</div>;
    }
  }

  return (
  <div>
    <button onClick={handleLogout}>LOGOUT</button>
    {renderCurrentState()}
  </div>
);
}

export default AppShell;
