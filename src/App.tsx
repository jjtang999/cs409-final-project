import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { User, BlockedWebsite, TimeBlock, AppState } from './types';
import { api, AuthResponse } from './api';
import './App.css';

const initialState: AppState = {
  user: null,
  blockedWebsites: [],
  timeBlocks: [],
};

const normalizeBlockedWebsites = (websites: BlockedWebsite[]) =>
  websites.map((site) => ({ ...site, addedAt: new Date(site.addedAt) }));

function App() {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isHydratingUser, setIsHydratingUser] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const updateStateFromPayload = (payload: AuthResponse) => {
    setAppState((prev) => ({
      ...prev,
      user: payload.user,
      blockedWebsites: normalizeBlockedWebsites(payload.blockedWebsites || []),
      timeBlocks: payload.timeBlocks || [],
    }));
  };

  const currentUserId = appState.user?.id;

  useEffect(() => {
    const savedUser = localStorage.getItem('focusBlockUser');
    if (savedUser) {
      const parsedUser: User = JSON.parse(savedUser);
      setAppState((prev) => ({ ...prev, user: parsedUser }));
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setIsHydratingUser(false);
      return;
    }

    let isMounted = true;
    setIsHydratingUser(true);
    setServerError(null);

    api
      .fetchUserData(currentUserId)
      .then((payload) => {
        if (!isMounted) return;
        updateStateFromPayload(payload);
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Failed to load user data';
        setServerError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsHydratingUser(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (appState.user) {
      localStorage.setItem('focusBlockUser', JSON.stringify(appState.user));
    } else {
      localStorage.removeItem('focusBlockUser');
    }
  }, [appState.user]);

  const handleLogin = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setServerError(null);
    try {
      const payload = await api.login(email, password);
      updateStateFromPayload(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to log in';
      setServerError(message);
      throw new Error(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, username: string, password: string) => {
    setIsAuthLoading(true);
    setServerError(null);
    try {
      const payload = await api.register(email, username, password);
      updateStateFromPayload(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to register';
      setServerError(message);
      throw new Error(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAppState(initialState);
    localStorage.removeItem('focusBlockUser');
  };

  const handleAddWebsite = (url: string, category?: string) => {
    if (!appState.user) return;
    setServerError(null);
    api
      .addBlockedSite(appState.user.id, url, category)
      .then((newSite) => {
        setAppState((prev) => ({
          ...prev,
          blockedWebsites: [...prev.blockedWebsites, { ...newSite, addedAt: new Date(newSite.addedAt) }],
        }));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to add website';
        setServerError(message);
      });
  };

  const handleRemoveWebsite = (id: string) => {
    if (!appState.user) return;
    setServerError(null);
    api
      .removeBlockedSite(appState.user.id, id)
      .then(() => {
        setAppState((prev) => ({
          ...prev,
          blockedWebsites: prev.blockedWebsites.filter((site) => site.id !== id),
        }));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to remove website';
        setServerError(message);
      });
  };

  const handleAddTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    if (!appState.user) return;
    setServerError(null);
    api
      .addTimeBlock(appState.user.id, timeBlock)
      .then((newBlock) => {
        setAppState((prev) => ({
          ...prev,
          timeBlocks: [...prev.timeBlocks, newBlock],
        }));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to add time block';
        setServerError(message);
      });
  };

  const handleRemoveTimeBlock = (id: string) => {
    if (!appState.user) return;
    setServerError(null);
    api
      .removeTimeBlock(appState.user.id, id)
      .then(() => {
        setAppState((prev) => ({
          ...prev,
          timeBlocks: prev.timeBlocks.filter((block) => block.id !== id),
        }));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to remove time block';
        setServerError(message);
      });
  };

  const handleToggleTimeBlock = (id: string) => {
    if (!appState.user) return;
    const targetBlock = appState.timeBlocks.find((block) => block.id === id);
    if (!targetBlock) return;
    setServerError(null);
    api
      .updateTimeBlock(appState.user.id, id, { isActive: !targetBlock.isActive })
      .then((updatedBlock) => {
        setAppState((prev) => ({
          ...prev,
          timeBlocks: prev.timeBlocks.map((block) => (block.id === id ? updatedBlock : block)),
        }));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to update time block';
        setServerError(message);
      });
  };

  if (!initialized) {
    return null;
  }

  if (!appState.user) {
    return (
      <Auth
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isAuthLoading}
        serverError={serverError}
      />
    );
  }

  return (
    <div className="app-shell">
      {serverError && <div className="app-error">{serverError}</div>}
      {isHydratingUser && <div className="app-info">Refreshing your schedule...</div>}
      <Dashboard
        user={appState.user}
        blockedWebsites={appState.blockedWebsites}
        timeBlocks={appState.timeBlocks}
        onAddWebsite={handleAddWebsite}
        onRemoveWebsite={handleRemoveWebsite}
        onAddTimeBlock={handleAddTimeBlock}
        onRemoveTimeBlock={handleRemoveTimeBlock}
        onToggleTimeBlock={handleToggleTimeBlock}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
