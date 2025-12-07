import React, { useState } from 'react';
import { BlockedWebsite } from '../types';
import './BlockedWebsites.css';

interface BlockedWebsitesProps {
  websites: BlockedWebsite[];
  onAddWebsite: (url: string, category?: string) => void;
  onRemoveWebsite: (id: string) => void;
}

const BlockedWebsites: React.FC<BlockedWebsitesProps> = ({
  websites,
  onAddWebsite,
  onRemoveWebsite,
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    // Basic URL validation
    const urlPattern = /^[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/;
    const cleanUrl = newUrl.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    
    if (!urlPattern.test(cleanUrl)) {
      setError('Please enter a valid domain (e.g., youtube.com or twitter.com)');
      return;
    }

    // Check for duplicates
    const isDuplicate = websites.some(
      (site) => site.url.toLowerCase() === cleanUrl
    );

    if (isDuplicate) {
      setError('This website is already in your blocked list');
      return;
    }

    onAddWebsite(cleanUrl, newCategory.trim() || undefined);
    setNewUrl('');
    setNewCategory('');
  };

  const categories = ['Social Media', 'Entertainment', 'News', 'Shopping', 'Gaming', 'Other'];

  return (
    <div className="blocked-websites">
      <h2>Blocked Websites</h2>
      <p className="section-description">
        Add websites you want to block during your focus sessions
      </p>

      <form onSubmit={handleAddWebsite} className="add-website-form">
        <div className="form-row">
          <div className="input-group">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter website (e.g., youtube.com)"
              className="url-input"
            />
          </div>
          <div className="input-group">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Select category (optional)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="add-button">
            Add Website
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>

      <div className="websites-list">
        {websites.length === 0 ? (
          <div className="empty-state">
            <p>No blocked websites yet</p>
            <p className="empty-subtitle">Start adding websites to block during focus time</p>
          </div>
        ) : (
          <div className="websites-grid">
            {websites.map((website) => (
              <div key={website.id} className="website-card">
                <div className="website-info">
                  <div className="website-url">{website.url}</div>
                  {website.category && (
                    <span className="website-category">{website.category}</span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveWebsite(website.id)}
                  className="remove-button"
                  title="Remove website"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedWebsites;
