import React, { useState } from 'react';
import './Auth.css';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, username: string, password: string) => Promise<void>;
  isLoading?: boolean;
  serverError?: string | null;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, isLoading = false, serverError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin) {
      if (!username) {
        setError('Please enter a username');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      try {
        setIsSubmitting(true);
        await onRegister(email, username, password);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to register';
        setError(message);
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        setIsSubmitting(true);
        await onLogin(email, password);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to log in';
        setError(message);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Clear form
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">FocusBlock</h1>
        <p className="auth-subtitle">Take back control of your online activity</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          
          {(error || serverError) && (
            <div className="auth-error">{error || serverError}</div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <button type="submit" className="auth-button" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading
              ? 'Please wait...'
              : isLogin
              ? 'Sign In'
              : 'Sign Up'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={toggleMode} className="toggle-button">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
