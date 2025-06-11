// Removed: import { AVATAR_COLORS } from './constants';
import { User, PresenceVisibility } from './types';

export const getInitials = (name: string): string => {
  if (!name) return '??';
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

export const getRandomColor = (colors: string[], seed?: string): string => {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  return colors[Math.floor(Math.random() * colors.length)];
};

export const formatTimestamp = (isoString?: string, type: 'time' | 'date' | 'full' | 'relative' = 'time'): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();

  if (type === 'relative') {
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
  
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (type === 'date') {
    return date.toLocaleDateString();
  }
  // 'full'
  return date.toLocaleString();
};

export const getOtherParticipant = (chatParticipants: User[] | undefined, currentUserId: string | undefined): User | undefined => {
  if (!chatParticipants || !currentUserId) return undefined;
  return chatParticipants.find(p => p.id !== currentUserId);
};

// Dummy token generator for mock auth
export const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
    isAdmin: user.isAdmin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };
  // In a real app, this would be signed by a server
  return `mockToken.${btoa(JSON.stringify(payload))}`;
};

export const decodeToken = (token: string, allUsers: User[]): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 2 || parts[0] !== 'mockToken') return null;
    const decodedPayload = JSON.parse(atob(parts[1]));
    // Find user from provided users list
    return allUsers.find((u: User) => u.id === decodedPayload.userId) || null;

  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const shouldShowUserPresence = (
    currentUser: User | null,
    targetUser: User | undefined,
    isTargetUserPresenceMuted: boolean = false
): boolean => {
    if (!currentUser || !targetUser || isTargetUserPresenceMuted) return false;
    if (targetUser.presenceVisibility === PresenceVisibility.Everyone) return true;
    if (targetUser.presenceVisibility === PresenceVisibility.FriendsOnly) {
        return !!currentUser.friendIds?.includes(targetUser.id);
    }
    return false;
};