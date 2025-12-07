import React, { useState } from 'react';
import { TimeBlock } from '../types';
import './TimeBlocks.css';

interface TimeBlocksProps {
  timeBlocks: TimeBlock[];
  onAddTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  onRemoveTimeBlock: (id: string) => void;
  onToggleTimeBlock: (id: string) => void;
}

const TimeBlocks: React.FC<TimeBlocksProps> = ({
  timeBlocks,
  onAddTimeBlock,
  onRemoveTimeBlock,
  onToggleTimeBlock,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // No days selected by default
  const [error, setError] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const handleToggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name for this time block');
      return;
    }

    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    // Validate times
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (startMinutes >= endMinutes) {
      setError('End time must be after start time');
      return;
    }

    onAddTimeBlock({
      name: name.trim(),
      startTime,
      endTime,
      daysOfWeek: selectedDays,
      isActive: true,
    });

    // Reset form
    setName('');
    setStartTime('09:00');
    setEndTime('17:00');
    setSelectedDays([]);
    setShowForm(false);
  };

  const formatDays = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => daysOfWeek[d].label).join(', ');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="time-blocks">
      <div className="section-header">
        <div>
          <h2>Scheduled Time Blocks</h2>
          <p className="section-description">
            Set recurring blocks during specific times and days
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-timeblock-button"
        >
          {showForm ? 'Cancel' : '+ New Time Block'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="timeblock-form">
          <div className="form-group">
            <label htmlFor="name">Block Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work Hours, Study Time"
              className="text-input"
            />
          </div>

          <div className="time-inputs">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="time-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="time-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Days of Week</label>
            <div className="days-selector">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleToggleDay(day.value)}
                  className={`day-button ${
                    selectedDays.includes(day.value) ? 'active' : ''
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button">
            Create Time Block
          </button>
        </form>
      )}

      <div className="timeblocks-list">
        {timeBlocks.length === 0 ? (
          <div className="empty-state">
            <p>No scheduled time blocks yet</p>
            <p className="empty-subtitle">
              Create recurring blocks for work/study hours
            </p>
          </div>
        ) : (
          <div className="timeblocks-grid">
            {timeBlocks.map((block) => (
              <div
                key={block.id}
                className={`timeblock-card ${block.isActive ? 'active' : 'inactive'}`}
              >
                <div className="timeblock-header">
                  <h3>{block.name}</h3>
                  <button
                    onClick={() => onRemoveTimeBlock(block.id)}
                    className="remove-button"
                    title="Remove time block"
                  >
                    ✕
                  </button>
                </div>
                <div className="timeblock-info">
                  <div className="time-range">
                    {formatTime(block.startTime)} - {formatTime(block.endTime)}
                  </div>
                  <div className="days-info">{formatDays(block.daysOfWeek)}</div>
                </div>
                <div className="timeblock-footer">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={block.isActive}
                      onChange={() => onToggleTimeBlock(block.id)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="status-text">
                    {block.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeBlocks;
