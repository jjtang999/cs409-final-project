export interface User {
  id: string;
  email: string;
  username: string;
}

export interface BlockedWebsite {
  id: string;
  url: string;
  category?: string;
  addedAt: Date;
}

export interface TimeBlock {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  isActive: boolean;
}

export interface FocusSession {
  id: string;
  name: string;
  duration: number; // in minutes
  startedAt: Date;
  endAt: Date;
  isActive: boolean;
}

export interface AppState {
  user: User | null;
  blockedWebsites: BlockedWebsite[];
  timeBlocks: TimeBlock[];
  activeFocusSession: FocusSession | null;
}
