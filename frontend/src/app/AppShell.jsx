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
  const [xpFloatAmount, setXpFloatAmount] = useState(null);
  const [completionFeed, setCompletionFeed] = useState([]);
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
      /* All quests completed reset flow */
      setTask(null);
      setQuests([]);
      setActiveQuestIndex(0);
      setAppState(APP_STATES.EMPTY);
    }
  }

  function handleXpEarned(amount) {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        total_xp: prevUser.total_xp + amount,
      };
    });

    /* Trigger XP float */
    setXpFloatAmount(amount);
  }

  function handleCompletionPhrase(text) {
    const entry = {
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now(),
    };

    setCompletionFeed((prev) => {
      const next = [entry, ...prev];
      return next.slice(0, 5);
    });
  }

  /* Auto-expire completion phrases */
  useEffect(() => {
    if (completionFeed.length === 0) return;

    const timers = completionFeed.map((entry) =>
      setTimeout(() => {
        setCompletionFeed((prev) =>
          prev.filter((e) => e.id !== entry.id)
        );
      }, 30000)
    );

    return () => timers.forEach(clearTimeout);
  }, [completionFeed]);

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
    setCompletionFeed([]);
    setAppState(APP_STATES.EMPTY);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  /* Auth is conditionally rendered inside AppShell */
  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  /* State-owned layout wrappers */
  function renderStateLayout() {
    switch (appState) {
      case APP_STATES.EMPTY:
        return (
          <div className="empty-layout">
            <div className="task-input-zone">
              <TaskInput onTaskCreated={handleTaskCreated} />
            </div>
          </div>
        );

      case APP_STATES.PLANNING:
        return (
          <div className="planner-layout">
            <QuestPlanner
              task={task}
              onQuestsFinalized={handleQuestsFinalized}
            />
          </div>
        );

      case APP_STATES.ACTIVE:
        return (
          <div className="active-layout">
            <ActiveQuest
              quest={quests[activeQuestIndex]}
              questIndex={activeQuestIndex}
              totalQuests={quests.length}
              onQuestCompleted={handleQuestCompleted}
              onXpEarned={handleXpEarned}
              onCompletionPhrase={handleCompletionPhrase}
            />
          </div>
        );

      default:
        return <div>Invalid state</div>;
    }
  }

  return (
    <div>
      {/* Logout — top left */}
      <button className="logout-button" onClick={handleLogout}>
        LOGOUT
      </button>

      {/* XP total — bottom right */}
      <div className="xp-ledger">
        XP: {user.total_xp}
      </div>

      {/* XP float */}
      {xpFloatAmount && (
        <div
          className="xp-float"
          onAnimationEnd={() => setXpFloatAmount(null)}
        >
          +{xpFloatAmount} XP
        </div>
      )}

      {/* Completion feed */}
      <div className="completion-feed">
        {completionFeed.map((entry) => (
          <div key={entry.id} className="completion-line">
            {entry.text}
          </div>
        ))}
      </div>

      {/* Stage — sole viewport owner */}
      <div className="stage">
        {renderStateLayout()}
      </div>
    </div>
  );
}

export default AppShell;
