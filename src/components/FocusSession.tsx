import React, { useState, useEffect } from 'react';
import { FocusSession } from '../types';
import './FocusSession.css';

interface FocusSessionProps {
  activeFocusSession: FocusSession | null;
  onStartSession: (name: string, duration: number) => void;
  onEndSession: () => void;
}

const FocusSessionComponent: React.FC<FocusSessionProps> = ({
  activeFocusSession,
  onStartSession,
  onEndSession,
}) => {
  const [sessionName, setSessionName] = useState('');
  const [duration, setDuration] = useState(0); // No default duration selected
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [error, setError] = useState('');

  const presetDurations = [
    { label: '15 min', value: 15 },
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
    { label: '90 min', value: 90 },
  ];

  useEffect(() => {
    if (!activeFocusSession) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(activeFocusSession.endAt).getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0) {
        onEndSession();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeFocusSession, onEndSession]);

  const handleStartSession = () => {
    setError('');

    if (!sessionName.trim()) {
      setError('Please enter a session name');
      return;
    }

    if (duration < 1 || duration > 240) {
      setError('Please select a duration between 1 and 240 minutes');
      return;
    }

    onStartSession(sessionName.trim(), duration);
    setSessionName('');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!activeFocusSession) return 0;
    const totalSeconds = activeFocusSession.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  if (activeFocusSession) {
    const progress = getProgressPercentage();
    const isAlmostDone = timeRemaining < 300; // Less than 5 minutes

    return (
      <div className="focus-session active-session">
        <div className="session-active-header">
          <h2>🎯 Focus Session Active</h2>
          <p className="session-name">{activeFocusSession.name}</p>
        </div>

        <div className="timer-container">
          <div className="circular-progress">
            <svg className="progress-ring" width="200" height="200">
              <circle
                className="progress-ring-circle-bg"
                cx="100"
                cy="100"
                r="85"
              />
              <circle
                className="progress-ring-circle"
                cx="100"
                cy="100"
                r="85"
                style={{
                  strokeDasharray: `${2 * Math.PI * 85}`,
                  strokeDashoffset: `${
                    2 * Math.PI * 85 * (1 - progress / 100)
                  }`,
                }}
              />
            </svg>
            <div className="timer-display">
              <div className={`time ${isAlmostDone ? 'warning' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="time-label">remaining</div>
            </div>
          </div>
        </div>

        <div className="session-info">
          <p className="info-text">
            Started at {new Date(activeFocusSession.startedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="info-text">
            Ends at {new Date(activeFocusSession.endAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <button onClick={onEndSession} className="end-session-button">
          End Session Early
        </button>

        <div className="blocking-notice">
          <p>🚫 All blocked websites are currently restricted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="focus-session">
      <h2>Quick Focus Session</h2>
      <p className="section-description">
        Start an immediate focus block to avoid distractions right now
      </p>

      <div className="session-form">
        <div className="form-group">
          <label htmlFor="sessionName">Session Name</label>
          <input
            type="text"
            id="sessionName"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g., Study Session, Deep Work"
            className="session-input"
          />
        </div>

        <div className="form-group">
          <label>Duration</label>
          <div className="duration-presets">
            {presetDurations.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setDuration(preset.value)}
                className={`preset-button ${
                  duration === preset.value ? 'active' : ''
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="customDuration">Custom Duration (minutes)</label>
          <input
            type="number"
            id="customDuration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            max="240"
            className="duration-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleStartSession} className="start-session-button">
          Start Focus Session
        </button>
      </div>
    </div>
  );
};

export default FocusSessionComponent;
