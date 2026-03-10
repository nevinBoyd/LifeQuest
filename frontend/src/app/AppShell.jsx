import { useEffect, useState } from "react";
import { apiFetch } from "../api";

import LandingGate from "./LandingGate";
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

  // Check session on app load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await apiFetch("/me");

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  // Handle task created
  function handleTaskCreated(createdTask) {
    setTask(createdTask);
    setAppState(APP_STATES.PLANNING);
  }

  // Handle quests finalized
  function handleQuestsFinalized(finalizedQuests) {
    setQuests(finalizedQuests);
    setActiveQuestIndex(0);
    setAppState(APP_STATES.ACTIVE);
  }

  // Handle quest completed
  function handleQuestCompleted() {
    const nextIndex = activeQuestIndex + 1;

    if (nextIndex < quests.length) {
      setActiveQuestIndex(nextIndex);
    } else {
      setTask(null);
      setQuests([]);
      setActiveQuestIndex(0);
      setAppState(APP_STATES.EMPTY);
    }
  }

  // Handle abandon quest
  function handleAbandonQuest() {
    setTask(null);
    setQuests([]);
    setActiveQuestIndex(0);
    setAppState(APP_STATES.EMPTY);
  }

  // Handle XP earned
  function handleXpEarned(amount, authoritativeTotalXp) {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      if (typeof authoritativeTotalXp === "number") {
        return { ...prevUser, total_xp: authoritativeTotalXp };
      }

      return { ...prevUser, total_xp: (prevUser.total_xp ?? 0) + amount };
    });

    setXpFloatAmount(amount);
  }

  // Handle completion phrase
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

  // Auto-expire completion phrases
  useEffect(() => {
    if (completionFeed.length === 0) return;

    const timers = completionFeed.map((entry) =>
      setTimeout(() => {
        setCompletionFeed((prev) => prev.filter((e) => e.id !== entry.id));
      }, 30000)
    );

    return () => timers.forEach(clearTimeout);
  }, [completionFeed]);

  // Handle logout
  async function handleLogout() {
    try {
      const res = await apiFetch("/logout", { method: "POST" });

      if (!res.ok) {
        console.error("Logout failed");
        return;
      }
    } catch (error) {
      console.error("Logout failed:", error);
      return;
    }

    setUser(null);
    setTask(null);
    setQuests([]);
    setActiveQuestIndex(0);
    setCompletionFeed([]);
    setXpFloatAmount(null);
    setAppState(APP_STATES.EMPTY);
  }

  // Render state layout
  function renderStateLayout() {
    switch (appState) {
      case APP_STATES.EMPTY:
        return <TaskInput onTaskCreated={handleTaskCreated} />;

      case APP_STATES.PLANNING:
        return (
          <QuestPlanner
            task={task}
            onQuestsFinalized={handleQuestsFinalized}
            onBack={handleAbandonQuest}
          />
        );

      case APP_STATES.ACTIVE:
        return (
          <ActiveQuest
            quest={quests[activeQuestIndex]}
            questIndex={activeQuestIndex}
            totalQuests={quests.length}
            onQuestCompleted={handleQuestCompleted}
            onAbandonQuest={handleAbandonQuest}
            onXpEarned={handleXpEarned}
            onCompletionPhrase={handleCompletionPhrase}
          />
        );

      default:
        return <div>Invalid state</div>;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LandingGate onAuth={setUser} />;
  }

  return (
    <div className="app-root min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="text-lg font-semibold tracking-wide">LifeQuest</div>

        <div className="flex items-center gap-6">
          <div className="text-sm text-slate-300">
            XP:{" "}
            <span className="font-semibold text-amber-400">
              {user?.total_xp ?? 0}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-300 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="app-main flex-1 pt-20 px-4">
        <div className="max-w-3xl mx-auto w-full">{renderStateLayout()}</div>
      </main>

      {xpFloatAmount && (
        <div
          className="xp-float"
          onAnimationEnd={() => setXpFloatAmount(null)}
        >
          +{xpFloatAmount} XP
        </div>
      )}

      {completionFeed.length > 0 && (
        <div className="px-6 pb-4">
          {completionFeed.map((entry) => (
            <div key={entry.id}>{entry.text}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppShell;