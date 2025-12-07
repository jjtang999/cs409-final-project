import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { User, BlockedWebsite, TimeBlock, FocusSession, AppState } from './types';
import './App.css';

function App() {
  const [appState, setAppState] = useState<AppState>({
    user: null,
    blockedWebsites: [],
    timeBlocks: [],
    activeFocusSession: null,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('focusBlockAppState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Convert date strings back to Date objects
      if (parsed.activeFocusSession) {
        parsed.activeFocusSession.startedAt = new Date(parsed.activeFocusSession.startedAt);
        parsed.activeFocusSession.endAt = new Date(parsed.activeFocusSession.endAt);
      }
      if (parsed.blockedWebsites) {
        parsed.blockedWebsites = parsed.blockedWebsites.map((site: any) => ({
          ...site,
          addedAt: new Date(site.addedAt),
        }));
      }
      setAppState(parsed);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('focusBlockAppState', JSON.stringify(appState));
  }, [appState]);

  // Authentication handlers
  const handleLogin = (email: string, password: string) => {
    // In a real app, this would call an API
    // For now, we'll just create a mock user
    const user: User = {
      id: '1',
      email,
      username: email.split('@')[0],
    };
    setAppState((prev) => ({ ...prev, user }));
  };

  const handleRegister = (email: string, username: string, password: string) => {
    // In a real app, this would call an API
    const user: User = {
      id: Date.now().toString(),
      email,
      username,
    };
    setAppState((prev) => ({ ...prev, user }));
  };

  const handleLogout = () => {
    setAppState({
      user: null,
      blockedWebsites: [],
      timeBlocks: [],
      activeFocusSession: null,
    });
    localStorage.removeItem('focusBlockAppState');
  };

  // Blocked websites handlers
  const handleAddWebsite = (url: string, category?: string) => {
    const newWebsite: BlockedWebsite = {
      id: Date.now().toString(),
      url,
      category,
      addedAt: new Date(),
    };
    setAppState((prev) => ({
      ...prev,
      blockedWebsites: [...prev.blockedWebsites, newWebsite],
    }));
  };

  const handleRemoveWebsite = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      blockedWebsites: prev.blockedWebsites.filter((site) => site.id !== id),
    }));
  };

  // Time blocks handlers
  const handleAddTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    const newTimeBlock: TimeBlock = {
      ...timeBlock,
      id: Date.now().toString(),
    };
    setAppState((prev) => ({
      ...prev,
      timeBlocks: [...prev.timeBlocks, newTimeBlock],
    }));
  };

  const handleRemoveTimeBlock = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter((block) => block.id !== id),
    }));
  };

  const handleToggleTimeBlock = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((block) =>
        block.id === id ? { ...block, isActive: !block.isActive } : block
      ),
    }));
  };

  // Focus session handlers
  const handleStartSession = (name: string, duration: number) => {
    const now = new Date();
    const endAt = new Date(now.getTime() + duration * 60 * 1000);

    const newSession: FocusSession = {
      id: Date.now().toString(),
      name,
      duration,
      startedAt: now,
      endAt,
      isActive: true,
    };

    setAppState((prev) => ({
      ...prev,
      activeFocusSession: newSession,
    }));
  };

  const handleEndSession = () => {
    setAppState((prev) => ({
      ...prev,
      activeFocusSession: null,
    }));
  };

  if (!appState.user) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <Dashboard
      user={appState.user}
      blockedWebsites={appState.blockedWebsites}
      timeBlocks={appState.timeBlocks}
      activeFocusSession={appState.activeFocusSession}
      onAddWebsite={handleAddWebsite}
      onRemoveWebsite={handleRemoveWebsite}
      onAddTimeBlock={handleAddTimeBlock}
      onRemoveTimeBlock={handleRemoveTimeBlock}
      onToggleTimeBlock={handleToggleTimeBlock}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
      onLogout={handleLogout}
    />
  );
}

export default App;
