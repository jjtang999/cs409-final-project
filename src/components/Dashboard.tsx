import React from 'react';
import { User, BlockedWebsite, TimeBlock } from '../types';
import BlockedWebsites from './BlockedWebsites';
import TimeBlocks from './TimeBlocks';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  blockedWebsites: BlockedWebsite[];
  timeBlocks: TimeBlock[];
  onAddWebsite: (url: string, category?: string) => void;
  onRemoveWebsite: (id: string) => void;
  onAddTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  onRemoveTimeBlock: (id: string) => void;
  onToggleTimeBlock: (id: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  blockedWebsites,
  timeBlocks,
  onAddWebsite,
  onRemoveWebsite,
  onAddTimeBlock,
  onRemoveTimeBlock,
  onToggleTimeBlock,
  onLogout,
}) => {
  const getActiveTimeBlocks = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    return timeBlocks.filter((block) => {
      if (!block.isActive) return false;
      if (!block.daysOfWeek.includes(currentDay)) return false;
      return currentTime >= block.startTime && currentTime <= block.endTime;
    });
  };

  const activeTimeBlocks = getActiveTimeBlocks();
  const hasActiveBlocks = activeTimeBlocks.length > 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">FocusBlock</h1>
            <p className="welcome-text">Welcome back, {user.username}!</p>
          </div>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Status Banner */}
        <div className={`status-banner ${hasActiveBlocks ? 'active' : 'inactive'}`}>
          {hasActiveBlocks ? (
            <div className="status-content">
              <div className="status-icon">🛡️</div>
              <div>
                <h3>Protection Active</h3>
                <p>{`${activeTimeBlocks.length} scheduled block(s) active`}</p>
              </div>
            </div>
          ) : (
            <div className="status-content">
              <div className="status-icon">😴</div>
              <div>
                <h3>No Active Blocks</h3>
                <p>Wait for your scheduled blocks to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{blockedWebsites.length}</div>
            <div className="stat-label">Blocked Sites</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{timeBlocks.length}</div>
            <div className="stat-label">Time Blocks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {timeBlocks.filter((b) => b.isActive).length}
            </div>
            <div className="stat-label">Active Schedules</div>
          </div>
        </div>

        {/* Blocked Websites */}
        <BlockedWebsites
          websites={blockedWebsites}
          onAddWebsite={onAddWebsite}
          onRemoveWebsite={onRemoveWebsite}
        />

        {/* Time Blocks */}
        <TimeBlocks
          timeBlocks={timeBlocks}
          onAddTimeBlock={onAddTimeBlock}
          onRemoveTimeBlock={onRemoveTimeBlock}
          onToggleTimeBlock={onToggleTimeBlock}
        />
      </div>
    </div>
  );
};

export default Dashboard;
