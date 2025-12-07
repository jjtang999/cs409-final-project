# FocusBlock - Website Blocking & Focus App

A React TypeScript application that helps users take back control of their online activity by allowing them to restrict access to distracting websites. Perfect for maintaining focus during work or study sessions.

## Features

### 🔐 User Authentication
- Login and registration system
- Form validation and error handling
- Persistent sessions using localStorage

### 🚫 Blocked Websites Management
- Add websites to your block list with custom categories
- Visual website cards with category tags
- Easy removal of blocked sites
- URL validation to ensure proper format

### ⏰ Scheduled Time Blocks
- Create recurring blocks for specific times and days
- Visual day selector (Sun-Sat)
- Toggle blocks on/off without deleting them
- Smart formatting for time display (12-hour format)
- Pre-configured for weekdays by default

### 🎯 Quick Focus Sessions
- Start immediate focus blocks with custom durations
- Pre-set durations: 15, 25, 45, 60, and 90 minutes
- Beautiful circular progress timer
- Live countdown display
- Visual warnings when time is running low
- Ability to end sessions early

### 📊 Dashboard Overview
- Real-time status banner showing active blocks
- Statistics cards for quick insights
- Clean, modern interface
- Responsive design for mobile and desktop

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **CSS3** - Modern styling with gradients and animations
- **localStorage** - Data persistence

## Project Structure

```
src/
├── components/
│   ├── Auth.tsx              # Login/Register component
│   ├── Auth.css
│   ├── BlockedWebsites.tsx   # Website blocking list
│   ├── BlockedWebsites.css
│   ├── TimeBlocks.tsx        # Scheduled time blocks
│   ├── TimeBlocks.css
│   ├── FocusSession.tsx      # Quick focus timer
│   ├── FocusSession.css
│   ├── Dashboard.tsx         # Main dashboard
│   └── Dashboard.css
├── types.ts                  # TypeScript interfaces
├── App.tsx                   # Main app with state management
├── App.css
├── index.tsx
└── index.css
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
cd cs409-final-project
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### First Time Setup
1. Click "Sign Up" and create an account
2. Enter your email, username, and password

### Managing Blocked Websites
1. In the "Blocked Websites" section, enter a website URL (e.g., youtube.com)
2. Optionally select a category
3. Click "Add Website"
4. Remove sites by clicking the ✕ button

### Creating Time Blocks
1. Click "+ New Time Block" in the "Scheduled Time Blocks" section
2. Enter a name (e.g., "Work Hours")
3. Set start and end times
4. Select days of the week
5. Click "Create Time Block"
6. Toggle blocks on/off using the switch

### Starting a Focus Session
1. Scroll to "Quick Focus Session"
2. Enter a session name
3. Choose a preset duration or enter a custom one
4. Click "Start Focus Session"
5. The timer will countdown and display progress
6. End early by clicking "End Session Early"

## Features to Note

### Data Persistence
- All data is saved to localStorage
- Your session persists across page refreshes
- Logout clears all data

### Visual Feedback
- Active blocks show a green status banner
- Inactive states are grayed out
- Hover effects on all interactive elements
- Smooth animations and transitions

### Responsive Design
- Optimized for desktop and mobile
- Grid layouts adjust to screen size
- Touch-friendly buttons and controls

## Future Backend Integration

This frontend is designed to easily connect to a backend API. Key integration points:

1. **Authentication**: Replace mock auth functions with API calls
2. **Data Storage**: Replace localStorage with API endpoints
3. **Real-time Updates**: Add WebSocket support for live blocking
4. **Browser Extension**: Connect to a browser extension for actual website blocking

## Design Inspiration

The app draws inspiration from popular focus tools like:
- **BlockSite** - Website blocking features
- **StayFocusd** - Time-based restrictions
- **Forest** - Focus session gamification

## Color Scheme

- Primary gradient: Purple to violet (#667eea → #764ba2)
- Success: Green (#10b981)
- Background: Light gray gradients
- Text: Gray scale for hierarchy

## Contributing

This is a class project for CS409. Team members can contribute by:
1. Creating a new branch
2. Making changes
3. Submitting a pull request

## License

This project is part of CS409 coursework.

## Team

Created by the CS409 final project team for a website blocking and focus management application.

---

**Note**: This is the frontend-only implementation. Backend and actual browser blocking functionality will be implemented in the next phase.
