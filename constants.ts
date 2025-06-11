
import { User, Chat, Message, UserStatus, MessageType, AppSettings, Theme, FontSize, Language, TranslationKey, PresenceVisibility, ChatBackground, GroupPermissions } from './types';
// Removed: import { getInitials, getRandomColor } from './utils'; 
import { translationsData } from './translations'; 

export const APP_NAME = "TitanChat";

export const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
  'bg-pink-500', 'bg-rose-500'
];

export const UNKNOWN_USER_PLACEHOLDER: Pick<User, 'name' | 'nickname' | 'avatarBgColor' | 'avatarUrl' | 'customStatus' | 'bio' | 'presenceVisibility'> & { id?: string; status?: UserStatus; lastSeen?: string; } = {
  id: 'unknown_user_id', 
  name: "Unknown User", 
  nickname: "unknown",
  avatarBgColor: "bg-gray-400",
  avatarUrl: undefined,
  customStatus: "Unavailable",
  bio: "This user's information is not available.",
  status: UserStatus.Offline, 
  lastSeen: undefined,
  presenceVisibility: PresenceVisibility.Everyone,      
};


export const DEFAULT_APP_SETTINGS: Omit<AppSettings, 'translations'> & { language: Language } = { 
  theme: Theme.Light, 
  language: 'en',
  notificationsEnabled: true,
  fontSize: 'base',
};

export const DEFAULT_GROUP_PERMISSIONS: GroupPermissions = {
  canSendMessages: true,
  canSendMedia: true,
  canSendFiles: true,
  canSendLinks: true,
  canSendStickersGifs: true,
  canCreatePolls: true, // Defaulting to true, admins can restrict
  canPinMessages: false, // Typically admin/owner
  canChangeGroupInfo: false, // Typically admin/owner
  canAddMembers: false, // Typically admin/owner
};


export const AVAILABLE_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '💯', '🤔', '🔥', '👏', '🤩', '🤷', '👀', '🤯', '🥳'];
export const MORE_EMOJIS_FOR_PICKER = [
    // Smileys & People
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', 
    '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', 
    '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', 
    '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', 
    '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', 
    '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', 
    '😽', '🙀', '😿', '😾',
    // Hand Gestures
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', 
    '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳',
    // Body Parts
    '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
    // Hearts & Symbols
    '💋', '🩸', '💔', '❤️‍🔥', '❤️‍🩹', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', 
    '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤',
    // Objects
    '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙',
];

export const CHAT_BACKGROUNDS: ChatBackground[] = [
    { id: 'default', nameKey: 'chat.background_default', thumbnail: 'bg-secondary-200 dark:bg-secondary-800', styleClass: 'bg-secondary-100 dark:bg-secondary-900' },
    { id: 'sunset', nameKey: 'chat.background_sunset', thumbnail: 'bg-gradient-to-br from-orange-400 to-pink-500', styleClass: 'bg-gradient-to-br from-orange-200 via-red-200 to-pink-300 dark:from-orange-700 dark:via-red-700 dark:to-pink-800' },
    { id: 'forest', nameKey: 'chat.background_forest', thumbnail: 'bg-gradient-to-br from-green-400 to-teal-500', styleClass: 'bg-gradient-to-br from-green-200 via-emerald-200 to-teal-300 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800' },
    { id: 'ocean', nameKey: 'chat.background_ocean', thumbnail: 'bg-gradient-to-br from-blue-400 to-cyan-500', styleClass: 'bg-gradient-to-br from-blue-200 via-sky-200 to-cyan-300 dark:from-blue-700 dark:via-sky-700 dark:to-cyan-800' },
    { id: 'mountains', nameKey: 'chat.background_mountains', thumbnail: 'bg-gradient-to-br from-slate-400 to-neutral-500', styleClass: 'bg-gradient-to-br from-slate-200 via-gray-300 to-neutral-400 dark:from-slate-700 dark:via-gray-700 dark:to-neutral-800' },
    { id: 'city', nameKey: 'chat.background_city', thumbnail: 'bg-gradient-to-br from-indigo-400 to-purple-500', styleClass: 'bg-gradient-to-br from-indigo-200 via-violet-200 to-purple-300 dark:from-indigo-700 dark:via-violet-700 dark:to-purple-800' },
    { id: 'abstract_blue', nameKey: 'chat.background_abstract_blue', thumbnail: 'bg-blue-300 pattern-circuit-board pattern-blue-500 pattern-opacity-20 pattern-size-16', styleClass: 'bg-blue-100 dark:bg-blue-900 pattern-circuit-board pattern-blue-400 dark:pattern-blue-700 pattern-opacity-10 dark:pattern-opacity-20 pattern-size-20' },
    { id: 'abstract_green', nameKey: 'chat.background_abstract_green', thumbnail: 'bg-green-300 pattern-polka-dot pattern-green-500 pattern-opacity-30 pattern-size-8', styleClass: 'bg-green-100 dark:bg-green-900 pattern-polka-dot pattern-green-400 dark:pattern-green-700 pattern-opacity-20 dark:pattern-opacity-20 pattern-size-10' },
    { id: 'abstract_purple', nameKey: 'chat.background_abstract_purple', thumbnail: 'bg-purple-300 pattern-diagonal-lines pattern-purple-500 pattern-opacity-30 pattern-size-4', styleClass: 'bg-purple-100 dark:bg-purple-900 pattern-diagonal-lines pattern-purple-400 dark:pattern-purple-700 pattern-opacity-10 dark:pattern-opacity-20 pattern-size-6' },
    { id: 'abstract_orange', nameKey: 'chat.background_abstract_orange', thumbnail: 'bg-orange-300 pattern-vertical-lines pattern-orange-500 pattern-opacity-30 pattern-size-4', styleClass: 'bg-orange-100 dark:bg-orange-900 pattern-vertical-lines pattern-orange-400 dark:pattern-orange-700 pattern-opacity-10 dark:pattern-opacity-20 pattern-size-6' },
    { id: 'space', nameKey: 'chat.background_space', thumbnail: 'bg-gray-800 pattern-star pattern-yellow-400 pattern-opacity-50 pattern-size-4', styleClass: 'bg-gray-900 dark:bg-black pattern-star pattern-yellow-300 dark:pattern-yellow-500 pattern-opacity-20 dark:pattern-opacity-30 pattern-size-6' },
    { id: 'minimal_gray', nameKey: 'chat.background_minimal_gray', thumbnail: 'bg-slate-200', styleClass: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'minimal_sand', nameKey: 'chat.background_minimal_sand', thumbnail: 'bg-yellow-100', styleClass: 'bg-yellow-50 dark:bg-yellow-900/30' },
    { id: 'dots_light', nameKey: 'chat.background_dots_light', thumbnail: 'bg-white pattern-dots pattern-gray-400 pattern-opacity-40 pattern-size-2', styleClass: 'bg-white dark:bg-gray-100 pattern-dots pattern-gray-300 dark:pattern-gray-700 pattern-opacity-30 dark:pattern-opacity-20 pattern-size-3' },
    { id: 'dots_dark', nameKey: 'chat.background_dots_dark', thumbnail: 'bg-gray-700 pattern-dots pattern-gray-500 pattern-opacity-40 pattern-size-2', styleClass: 'bg-gray-800 dark:bg-secondary-950 pattern-dots pattern-gray-600 dark:pattern-gray-400 pattern-opacity-20 dark:pattern-opacity-30 pattern-size-3' },
];
// Placeholder for Tailwind CSS JIT to pick up pattern classes if using a plugin
// pattern-circuit-board pattern-polka-dot pattern-diagonal-lines pattern-vertical-lines pattern-star pattern-dots
// pattern-blue-500 pattern-green-500 pattern-purple-500 pattern-orange-500 pattern-yellow-400 pattern-gray-400
// pattern-opacity-10 pattern-opacity-20 pattern-opacity-30 pattern-opacity-40 pattern-opacity-50
// pattern-size-2 pattern-size-3 pattern-size-4 pattern-size-6 pattern-size-8 pattern-size-10 pattern-size-16 pattern-size-20
