import { BlockedWebsite, TimeBlock, User } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
console.log(process.env.REACT_APP_API_URL);
console.log(API_URL);
interface AuthPayload {
  user: User;
  blockedWebsites: BlockedWebsite[];
  timeBlocks: TimeBlock[];
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const body = await response.json();
      if (body?.message) {
        message = body.message;
      }
    } catch (error) {
      // ignore JSON parse errors and use generic message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

const post = <T>(path: string, body: Record<string, unknown>) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

const patch = <T>(path: string, body: Record<string, unknown>) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

const del = (path: string) => request<void>(path, { method: 'DELETE' });

export const api = {
  register: (email: string, username: string, password: string) =>
    post<AuthPayload>('/api/auth/register', { email, username, password }),
  login: (email: string, password: string) =>
    post<AuthPayload>('/api/auth/login', { email, password }),
  fetchUserData: (userId: string) => request<AuthPayload>(`/api/users/${userId}`),
  addBlockedSite: (userId: string, url: string, category?: string) =>
    post<BlockedWebsite>(`/api/users/${userId}/blocked-sites`, { url, category }),
  removeBlockedSite: (userId: string, siteId: string) =>
    del(`/api/users/${userId}/blocked-sites/${siteId}`),
  addTimeBlock: (userId: string, block: Omit<TimeBlock, 'id'>) =>
    post<TimeBlock>(`/api/users/${userId}/time-blocks`, block),
  updateTimeBlock: (
    userId: string,
    blockId: string,
    payload: Partial<Omit<TimeBlock, 'id'>>
  ) => patch<TimeBlock>(`/api/users/${userId}/time-blocks/${blockId}`, payload),
  removeTimeBlock: (userId: string, blockId: string) =>
    del(`/api/users/${userId}/time-blocks/${blockId}`),
  checkBlock: (userId: string, url: string) =>
    request<{ blocked: boolean; reason?: string }>(
      `/api/block-check?userId=${encodeURIComponent(userId)}&url=${encodeURIComponent(url)}`
    ),
};

export type AuthResponse = AuthPayload;
