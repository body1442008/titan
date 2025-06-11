import React, { ReactNode, useState, useEffect, useRef, useMemo } from 'react';
import { getInitials, getRandomColor, formatTimestamp } from './utils';
import { User, MessageReaction, ChatParticipant, Chat, UserStatus, StatusVideo, StatusReply, TranslationKey, PresenceVisibility, CurrentCallInfo, MessagingPrivacy, Message, MessageType, SharedMediaType, GroupPermissionSetting, CallType, ChatBackground, GroupPermissions } from './types';
import { AVAILABLE_REACTIONS, MORE_EMOJIS_FOR_PICKER, UNKNOWN_USER_PLACEHOLDER, CHAT_BACKGROUNDS, DEFAULT_GROUP_PERMISSIONS, AVATAR_COLORS } from './constants';
import { useSettings, useUserManagement, useAuth, useChat } from './store'; 

// Icons
export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.68-3.091a9.023 9.023 0 0 1-5.207 0l-3.681 3.091V16.959c-.34-.02-.68-.045-1.02-.072-1.133-.093-1.98-1.057-1.98-2.193V10.608c0-.97.616-1.813 1.5-2.097M14.25 3.75A2.25 2.25 0 0 0 12 1.5H7.5A2.25 2.25 0 0 0 5.25 3.75v3.455c0 .32.13.626.356.848l3.488 3.488a.75.75 0 0 0 1.06 0l3.488-3.488A1.125 1.125 0 0 0 14.25 7.205V3.75Z" />
 </svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

export const UsersGroupIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.071M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226M12.75 4.5V3m-.223 1.482c.539-.226 1.074-.378 1.626-.44M12 18.75V21m-4.773-1.752A4.5 4.5 0 0 0 7.5 15.25V15h1.575M13.5 15v.25A4.5 4.5 0 0 0 17.25 18h.25a4.5 4.5 0 0 0 .25-8.75V9.75A4.5 4.5 0 0 0 13.5 6H12m2.672.836a4.491 4.491 0 0 1 .696-2.198M16.5 9.75V12m4.5-4.5H21m-3.75 0A4.5 4.5 0 0 1 13.5 9.75V15m0-4.5H12m1.5-.75a4.493 4.493 0 0 0-1.757 2.198M3.75 9.75H3M4.5 7.5A4.5 4.5 0 0 1 8.25 3H9.75M9.75 16.5A4.5 4.5 0 0 1 6 19.75M3.75 12H3m0 3.75A4.5 4.5 0 0 1 7.5 12H9m7.5-3A4.5 4.5 0 0 0 12.75 3M9.75 3.75A4.5 4.5 0 0 0 6 7.5M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  </svg>
);

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.375 19.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

export const UserMinusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const UserCheckIcon: React.FC<{ className?: string }> = ({ className }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

export const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9h-9v9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 0 1 9 9h-9V3Z" />
    </svg>
);


export const NoSymbolIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

export const ArchiveBoxXMarkIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 21h16.5M16.5 6.75h-9m9 3.75h-9M10.5 21V16.5M13.5 21V16.5m2.06-11.47-4.586 4.586m0 0L6.378 9.814M10.964 14.4l4.586-4.586" />
  </svg>
);


export const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v2.25m0-2.25h1.5a2.25 2.25 0 0 0 2.25-2.25V6.75m-1.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125h1.5m1.125-2.25V6.75m0 0A2.25 2.25 0 0 0 6.75 4.5h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.125c0 .621.504 1.125 1.125 1.125h1.5m-1.5 0v2.25m6.75-4.5H7.5V6.75h3.75c.621 0 1.125.504 1.125 1.125v1.125c0 .621-.504 1.125-1.125 1.125h-1.5m3 0h3.75V6.75h-3.75c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125h1.5m-1.5 0v2.25m0 0c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125v-1.125c0-.621-.504-1.125-1.125-1.125h-1.5M19.5 10.5v2.25c0 .621-.504 1.125-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125v-1.125c0-.621.504 1.125 1.125 1.125h1.5Z" />
  </svg>
);


export const PaperClipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.687 7.687a1.5 1.5 0 0 0 2.122 2.122l7.687-7.687-2.121-2.122Z" />
  </svg>
);

export const ImagePlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM12 10.5v4.5m-2.25-2.25h4.5" />
  </svg>
);

export const DocumentPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);


export const FaceSmileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75S9.75 9.336 9.75 9.75Zm4.875 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z" />
  </svg>
);

export const PaperAirplaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z" />
  </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
);

export const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);


export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
);

export const CheckIcon: React.FC<{ className?: string, title?: string }> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export const DoubleCheckIcon: React.FC<{ className?: string; colorClass?: string, title?: string }> = ({ className, colorClass = "currentColor", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={colorClass} className={`w-5 h-5 ${className}`}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5M9 12.75l6 6" />
  </svg>
);


export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A74.905 74.905 0 0 1 6 15.375c0-1.829.413-3.597 1.158-5.231.745-1.634 1.737-3.098 2.966-4.326C11.35 4.597 12.757 4.5 14.25 4.5c1.493 0 2.903.097 4.129.293C19.603 4.986 20.25 5.828 20.25 6.75v6.563c0 .637-.323 1.213-.836 1.547l-4.22 2.638C14.218 18.005 13.5 18.75 12.75 18.75h-5.257Z" />
    <path d="M6 18.75a2.25 2.25 0 0 1-2.25-2.25V13.5A2.25 2.25 0 0 1 6 11.25v6.052c0 .686.447 1.285 1.08 1.454l.823.274A27.25 27.25 0 0 0 6 18.75Z" />
  </svg>
);


export const ReplyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const VideoCameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  </svg>
);

export const VideoCameraSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5-4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75l16.5 16.5m.75-12-3.375-3.375M17.25 20.25 12 15m4.5 4.5-3.375-3.375" />
  </svg>
);


export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 3-3a3 3 0 0 1 3 3v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

export const MicrophoneSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.714 4.714a6.741 6.741 0 0 1 .166 4.908M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 3-3a3 3 0 0 1 3 3v.793M9 9.062A6.16 6.16 0 0 1 12 4.5c1.624 0 3.105.597 4.258 1.562m-8.516 0A6.137 6.137 0 0 0 6.75 12.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);


export const PlayCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
  </svg>
);

export const HeartIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className, filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className} ${filled ? 'text-red-500' : ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

export const ChatBubbleBottomCenterTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.862 8.25-8.625 8.25S3.75 16.556 3.75 12 7.612 3.75 12.375 3.75S21 7.444 21 12Z" />
  </svg>
);


export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export const EllipsisVerticalIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export const BellSlashIcon: React.FC<{ className?: string, title?: string }> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 3.093c.303-.093.615-.164.931-.22a18.36 18.36 0 0 1 2.923-.062c.489.029.972.091 1.442.185M1.5 4.5l16.5 16.5m0-16.5-16.5 16.5M12 22.5c2.394 0 4.398-.76 5.898-2.005M7.062 17.009C5.669 16.035 4.5 14.382 4.5 12.474c0-1.05.215-2.046.619-2.952m12.361 6.556A11.25 11.25 0 0 1 12 20.25c-1.429 0-2.774-.268-3.996-.75M12 6.75A4.498 4.498 0 0 0 9.143 3.093m0 0a4.484 4.484 0 0 1-2.081 1.407" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75a3 3 0 0 0-5.656-2.122" />
  </svg>
);
export const BellIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

export const PhotoIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);
export const FilmIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  </svg>
);
export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
export const LinkIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
);

export const SpeakerWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

export const SpeakerXMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M15.75 18L18 15.75M18 15.75L15.75 18m2.25-2.25L15.75 13.5M13.5 15.75L11.25 18M11.25 18L9 15.75M11.25 18L9 20.25M11.25 18 13.5 20.25M9 15.75l-2.25-2.25M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

export const ArrowRightCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
export { ArrowRightCircleIcon as AppLogo };


// Avatar Component
interface AvatarProps {
  user?: Pick<User, 'name' | 'nickname' | 'avatarUrl' | 'avatarBgColor' | 'status' | 'presenceVisibility'> | { name?: string, nickname?: string, avatarUrl?: string, avatarBgColor: string, isGroupPlaceholder?: boolean, groupImage?: string, status?: UserStatus, presenceVisibility?: PresenceVisibility };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatusIndicator?: boolean; 
  status?: User['status']; 
  hasNewStatus?: boolean; 
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '', showStatusIndicator = false, status, hasNewStatus = false, onClick }) => {
  
  const getSafeUser = () => {
    if (!user) return { name: '??', nickname: '??', avatarBgColor: 'bg-gray-300 dark:bg-gray-700', avatarUrl: undefined, groupImage: undefined, isGroupPlaceholder: false, status: UserStatus.Offline, presenceVisibility: PresenceVisibility.Everyone };
    if ('isGroupPlaceholder' in user && user.isGroupPlaceholder) {
      return { name: user.name || 'Group', nickname: 'group', avatarBgColor: user.avatarBgColor, isGroupPlaceholder: true, avatarUrl: undefined, groupImage: user.groupImage, status: UserStatus.Offline, presenceVisibility: PresenceVisibility.Everyone };
    }
    return {
      name: user.name || 'User',
      nickname: user.nickname || 'user',
      avatarBgColor: user.avatarBgColor || 'bg-gray-500',
      avatarUrl: user.avatarUrl,
      isGroupPlaceholder: false,
      groupImage: undefined,
      status: user.status || UserStatus.Offline,
      presenceVisibility: user.presenceVisibility || PresenceVisibility.Everyone,
    };
  };
  
  const safeUser = getSafeUser();
  const initials = !safeUser.isGroupPlaceholder ? getInitials(safeUser.name || safeUser.nickname) : '';

  const sizeClasses = 
    size === 'xs' ? 'w-6 h-6 text-2xs' :
    size === 'sm' ? 'w-8 h-8 text-xs' : 
    size === 'md' ? 'w-10 h-10 text-sm' : 
    size === 'lg' ? 'w-12 h-12 text-base' : 
    'w-16 h-16 text-lg'; // xl
  
  const statusIndicatorSize = size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const statusIndicatorPosition = size === 'xs' || size === 'sm' ? 'bottom-0 right-0' : 'bottom-0.5 right-0.5';
  
  const statusRingClass = hasNewStatus ? 'ring-2 ring-offset-2 dark:ring-offset-secondary-800 ring-blue-500' : '';

  const commonDivProps = {
      className: `relative rounded-full flex items-center justify-center overflow-hidden shrink-0 ${sizeClasses} ${statusRingClass} ${className} transition-all duration-150 ease-in-out`,
      onClick: onClick, 
  };


  return (
    <div {...commonDivProps}>
      {safeUser.isGroupPlaceholder && safeUser.groupImage ? (
        <img src={safeUser.groupImage} alt={safeUser.name || 'Group Avatar'} className="w-full h-full object-cover" />
      ) : safeUser.avatarUrl && !safeUser.isGroupPlaceholder ? (
        <img src={safeUser.avatarUrl} alt={safeUser.name || 'Avatar'} className="w-full h-full object-cover" />
      ) : safeUser.isGroupPlaceholder ? (
         <div className={`w-full h-full flex items-center justify-center ${safeUser.avatarBgColor} text-white font-semibold`}>
            <UsersGroupIcon className={
              size === 'xs' ? 'w-3 h-3' :
              size === 'sm' ? 'w-4 h-4' : 
              size === 'md' ? 'w-5 h-5' : 
              size === 'lg' ? 'w-6 h-6' : 
              'w-8 h-8'} />
        </div>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${safeUser.avatarBgColor} text-white font-semibold`}>
          {initials}
        </div>
      )}
      {showStatusIndicator && status && !safeUser.isGroupPlaceholder && ( 
        <span className={`absolute ${statusIndicatorPosition} ${statusIndicatorSize} ${status === UserStatus.Online ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white dark:border-secondary-900`} />
      )}
    </div>
  );
};


// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showTooltip?: boolean;
  tooltipText?: string;
  selected?: boolean; 
  outline?: boolean; 
  active?: boolean; 
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  showTooltip = false,
  tooltipText = '',
  selected = false,
  outline = false, 
  active = false, 
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative group whitespace-nowrap";
  
  let variantClass = '';
  if (variant === 'primary') {
    variantClass = `bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm hover:shadow-md ${selected || active ? '!bg-primary-700 ring-2 ring-primary-400' : ''}`;
  } else if (variant === 'secondary') {
    variantClass = `bg-secondary-200 hover:bg-secondary-300 text-secondary-800 dark:bg-secondary-700 dark:hover:bg-secondary-600 dark:text-secondary-100 focus:ring-secondary-500 shadow-sm hover:shadow-md ${selected || active ? '!bg-secondary-300 dark:!bg-secondary-600 ring-2 ring-secondary-400' : ''}`;
  } else if (variant === 'danger') {
    if (outline) {
      variantClass = `bg-transparent hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-500 border border-red-500 dark:border-red-400 focus:ring-red-500 shadow-sm hover:shadow-md ${selected || active ? '!bg-red-100 dark:!bg-red-900/30 ring-2 ring-red-400' : ''}`;
    } else {
      variantClass = `bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md ${selected || active ? '!bg-red-700 ring-2 ring-red-400' : ''}`;
    }
  } else if (variant === 'ghost') {
    variantClass = `bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-700/60 text-primary-600 dark:text-primary-400 focus:ring-primary-500 ${selected || active ? '!bg-primary-100 dark:!bg-primary-700/80 ring-1 ring-primary-300' : ''}`;
    if (active && (selected === undefined || !selected)) { 
        variantClass = `bg-primary-100 dark:bg-primary-700/80 text-primary-700 dark:text-primary-200 ring-1 ring-primary-300 dark:ring-primary-600 ${variantClass}`;
    }
  } else if (variant === 'link') {
    variantClass = 'bg-transparent text-primary-600 dark:text-primary-400 hover:underline p-0 focus:ring-primary-500 focus:ring-offset-0';
  }


  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs', 
    md: 'px-4 py-2 text-sm', 
    lg: 'px-5 py-2.5 text-base', 
    icon: 'p-2', 
  };

  return (
    <button
      className={`${baseStyles} ${variantClass} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      title={props.title || tooltipText} 
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className={children ? "mr-1.5" : ""}>{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className={children ? "ml-1.5" : ""}>{rightIcon}</span>}
      {showTooltip && tooltipText && (
         <span className="absolute bottom-full mb-2 w-max max-w-xs px-2 py-1 bg-secondary-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-lg">
            {tooltipText}
        </span>
      )}
    </button>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  as?: 'input' | 'textarea'; 
  rows?: number; 
}

export const Input: React.FC<InputProps> = ({ label, id, error, className = '', wrapperClassName = '', leftIcon, rightIcon, as = 'input', rows = 3, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const commonClasses = `block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 transition-colors ${error ? 'border-red-500 focus:ring-red-500' : ''} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`;

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-600 dark:text-secondary-300 mb-1">{label}</label>}
      <div className="relative">
        {leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-400">{leftIcon}</div>}
        {as === 'textarea' ? (
          <textarea
            id={inputId}
            rows={rows}
            className={`${commonClasses} resize-vertical min-h-[44px]`} 
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={commonClasses}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {rightIcon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400">{rightIcon}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fit';
  footer?: ReactNode;
  hideCloseButton?: boolean;
  contentClassName?: string;
  containerClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer, hideCloseButton = false, contentClassName = '', containerClassName='' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full !rounded-none md:!rounded-xl', 
    fit: 'w-auto max-w-full', 
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn ${containerClassName}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={typeof title === 'string' ? 'modal-title' : undefined}
    >
      <div
        className={`bg-white dark:bg-secondary-800 rounded-none md:rounded-xl shadow-2xl overflow-hidden w-full h-full md:h-auto md:max-h-[90vh] ${sizeClasses[size]} transform transition-all animate-slideInUp flex flex-col`}
        onClick={(e) => e.stopPropagation()} 
      >
        {(title || !hideCloseButton) && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-secondary-200 dark:border-secondary-700 flex justify-between items-center shrink-0">
            {typeof title === 'string' ? (
                <h3 id="modal-title" className="text-lg font-semibold text-secondary-800 dark:text-secondary-100">
                {title}
                </h3>
            ) : (
                title 
            )}
            {!hideCloseButton && (
              <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200" aria-label="Close modal">
                <XMarkIcon className="w-5 h-5"/>
              </Button>
            )}
          </div>
        )}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar ${contentClassName}`}>
          {children}
        </div>
        {footer && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-secondary-200 dark:border-secondary-700 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// LoadingSpinner Component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; colorClass?: string; className?: string; }> = ({ size = 'md', colorClass = 'border-primary-500 dark:border-primary-400', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[3px]',
    lg: 'w-10 h-10 border-4',
  };
  return (
    <div role="status" aria-label="Loading" className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${sizeClasses[size]} ${colorClass} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// ReactionPicker Component
export const ReactionPicker: React.FC<{
  messageId: string;
  onSelectReaction: (emoji: string) => void;
  availableReactions?: string[];
}> = ({ messageId, onSelectReaction, availableReactions = AVAILABLE_REACTIONS.slice(0, 6) }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-secondary-500 hover:text-primary-500 dark:text-secondary-400 dark:hover:text-primary-300 opacity-70 hover:opacity-100"
        title="Add reaction"
      >
        <FaceSmileIcon className="w-4 h-4" />
      </Button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-1 z-20 bg-white dark:bg-secondary-700 shadow-lg rounded-lg p-1.5 flex space-x-1 border border-secondary-200 dark:border-secondary-600">
          {availableReactions.map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                onSelectReaction(emoji);
                setIsOpen(false);
              }}
              className="p-1.5 text-lg hover:bg-secondary-100 dark:hover:bg-secondary-600 rounded-md transition-transform hover:scale-125"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ReactionsDisplay Component
export const ReactionsDisplay: React.FC<{
  reactions: MessageReaction[];
  currentUserId: string;
  onReact: (emoji: string) => void;
}> = ({ reactions, currentUserId, onReact }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-0.5">
      {reactions.map(reaction => (
        <button
          key={reaction.emoji}
          onClick={() => onReact(reaction.emoji)}
          className={`px-1.5 py-0.5 text-xs rounded-full border transition-colors flex items-center
            ${reaction.userIds.includes(currentUserId)
              ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-700 dark:border-primary-500 dark:text-primary-100'
              : 'bg-secondary-100 border-secondary-200 text-secondary-600 hover:bg-secondary-200 dark:bg-secondary-600 dark:border-secondary-500 dark:text-secondary-200 dark:hover:bg-secondary-500'
            }`}
          aria-pressed={reaction.userIds.includes(currentUserId)}
          aria-label={`Reaction ${reaction.emoji}, count ${reaction.userIds.length}. Press to toggle your reaction.`}
        >
          <span>{reaction.emoji}</span>
          {reaction.userIds.length > 0 && <span className="ml-1 text-[0.65rem] font-medium">{reaction.userIds.length}</span>}
        </button>
      ))}
    </div>
  );
};

// FriendRequestsModal Component
interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  friendRequestsReceived: string[];
  onAcceptRequest: (requesterId: string) => Promise<boolean>;
  onRejectRequest: (requesterId: string) => Promise<boolean>;
  getUserById: (userId: string) => User | undefined;
}

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({ isOpen, onClose, friendRequestsReceived, onAcceptRequest, onRejectRequest, getUserById, currentUserId }) => {
  const { t } = useSettings();
  const [loadingAction, setLoadingAction] = useState<Record<string, boolean>>({});

  const handleAction = async (action: 'accept' | 'reject', requesterId: string) => {
    setLoadingAction(prev => ({ ...prev, [requesterId]: true }));
    if (action === 'accept') {
      await onAcceptRequest(requesterId);
    } else {
      await onRejectRequest(requesterId);
    }
    setLoadingAction(prev => ({ ...prev, [requesterId]: false }));
  };
  
  const actualRequests = friendRequestsReceived.map(id => getUserById(id)).filter(Boolean) as User[];


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('friends.friend_requests_title')} size="md">
      {actualRequests.length === 0 ? (
        <p className="text-center text-secondary-500 dark:text-secondary-400 py-4">{t('friends.no_friend_requests')}</p>
      ) : (
        <ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar -mr-2 pr-2">
          {actualRequests.map(user => (
            <li key={user.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/60 rounded-lg">
              <div className="flex items-center">
                <Avatar user={user} size="md" />
                <div className="ml-3">
                  <p className="font-semibold text-secondary-800 dark:text-secondary-100">{user.name}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">@{user.nickname}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleAction('accept', user.id)} 
                    isLoading={loadingAction[user.id]}
                    leftIcon={<CheckIcon className="w-4 h-4" />}
                >
                    {t('friends.accept')}
                </Button>
                <Button 
                    variant="danger" 
                    outline 
                    size="sm" 
                    onClick={() => handleAction('reject', user.id)} 
                    isLoading={loadingAction[user.id]}
                    leftIcon={<XMarkIcon className="w-4 h-4" />}
                >
                    {t('friends.reject')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>{t('profile.close')}</Button>
      </div>
    </Modal>
  );
};

// VideoCallModal Component
interface VideoCallModalProps {
  isOpen: boolean;
  callInfo: CurrentCallInfo;
  currentUser: User;
  onEndCall: (isMissed?: boolean) => void;
  t: (key: TranslationKey, substitutions?: Record<string, string | number>) => string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({ isOpen, callInfo, currentUser, onEndCall, t }) => {
  const { answerCall, declineCall } = useChat();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callInfo.type === 'video');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && callInfo.localStream) {
      localVideoRef.current.srcObject = callInfo.localStream;
    }
    if (remoteVideoRef.current && callInfo.remoteStream) {
      remoteVideoRef.current.srcObject = callInfo.remoteStream;
    }
  }, [callInfo.localStream, callInfo.remoteStream]);

  useEffect(() => {
     setIsVideoEnabled(callInfo.type === 'video');
  },[callInfo.type]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    callInfo.localStream?.getAudioTracks().forEach(track => track.enabled = !isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    callInfo.localStream?.getVideoTracks().forEach(track => track.enabled = !isVideoEnabled);
  };
  
  if (!isOpen) return null;

  let statusText = '';
  switch (callInfo.status) {
    case 'initiating_outgoing':
    case 'outgoing_ringing':
      statusText = t('call.calling_user', { name: callInfo.targetUserName || 'User' });
      break;
    case 'incoming_ringing':
      statusText = t('call.ringing_user', { name: callInfo.targetUserName || 'User' });
      break;
    case 'connected':
      statusText = t('call.connected_to_user', { name: callInfo.targetUserName || 'User' });
      break;
    case 'failed':
      statusText = t('call.call_failed');
      break;
    case 'ended':
    case 'declined':
      statusText = t('call.call_ended');
      break;
    default:
      statusText = 'Call';
  }

  return (
    <Modal isOpen={isOpen} onClose={() => onEndCall()} title={callInfo.type === 'video' ? t('call.video_call') : t('call.voice_call')} size="lg" hideCloseButton={callInfo.status === 'incoming_ringing'}>
      <div className="flex flex-col items-center justify-center p-4 min-h-[60vh] text-center">
        <Avatar user={{ name: callInfo.targetUserName || 'Unknown', avatarBgColor: getRandomColor(AVATAR_COLORS, callInfo.targetUserName || 'seed')}} size="xl" className="mb-4" />
        <p className="text-xl font-semibold mb-2">{callInfo.targetUserName || t('general.unknown_user')}</p>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">{statusText}</p>

        {callInfo.status === 'connected' && callInfo.type === 'video' && (
          <div className="w-full aspect-video bg-secondary-900 rounded-lg overflow-hidden relative mb-4">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-2 right-2 w-1/4 h-1/4 object-cover rounded-md border-2 border-white dark:border-secondary-800" />
          </div>
        )}
         {callInfo.status === 'connected' && callInfo.type === 'voice' && (
            <div className="my-8 p-6 bg-secondary-100 dark:bg-secondary-700 rounded-full animate-pulse">
                <PhoneIcon className="w-12 h-12 text-primary-500"/>
            </div>
        )}


        <div className="mt-auto flex space-x-3 pt-6">
          {callInfo.status === 'incoming_ringing' ? (
            <>
              <Button variant="danger" size="lg" onClick={() => { declineCall(); }} leftIcon={<PhoneIcon className="transform -rotate-135" />}>
                {t('call.decline_call')}
              </Button>
              <Button variant="primary" size="lg" onClick={answerCall} leftIcon={<PhoneIcon />}>
                {t('call.answer_call')}
              </Button>
            </>
          ) : (callInfo.status === 'connected' || callInfo.status === 'outgoing_ringing' || callInfo.status === 'initiating_outgoing') ? (
            <>
              <Button variant="secondary" size="icon" onClick={handleToggleMute} title={isMuted ? t('call.unmute_audio') : t('call.mute_audio')}>
                {isMuted ? <MicrophoneSlashIcon /> : <MicrophoneIcon />}
              </Button>
              {callInfo.type === 'video' && (
                <Button variant="secondary" size="icon" onClick={handleToggleVideo} title={isVideoEnabled ? t('call.disable_video') : t('call.enable_video')}>
                  {isVideoEnabled ? <VideoCameraIcon /> : <VideoCameraSlashIcon />}
                </Button>
              )}
              <Button variant="danger" size="lg" onClick={() => onEndCall()} leftIcon={<PhoneIcon className="transform -rotate-135" />}>
                {t('general.call_end_call')}
              </Button>
            </>
          ) : (
             <Button variant="secondary" size="lg" onClick={() => onEndCall()}>
                {t('profile.close')}
              </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// SharedMediaViewerModal Component
interface SharedMediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  mediaType: SharedMediaType;
  messages: Message[]; // All messages for the chat
  t: (key: TranslationKey, substitutions?: Record<string, string | number>) => string;
}
export const SharedMediaViewerModal: React.FC<SharedMediaViewerModalProps> = ({ isOpen, onClose, chatId, mediaType, messages, t }) => {
  const filteredMedia = useMemo(() => {
    return messages.filter(msg => {
      if (msg.isDeleted || msg.isDeletedGlobally) return false;
      switch (mediaType) {
        case 'images': return msg.type === MessageType.Image && msg.text;
        case 'videos': return msg.type === MessageType.Video && msg.text;
        case 'files': return msg.type === MessageType.File && msg.fileName;
        case 'links': // Basic link detection for demo
            return msg.type === MessageType.Text && msg.text && (msg.text.includes('http://') || msg.text.includes('https://'));
        default: return false;
      }
    }).reverse(); // Show newest first
  }, [mediaType, messages]);

  const titleMap: Record<SharedMediaType, TranslationKey> = {
    images: 'chat.shared_media_images',
    videos: 'chat.shared_media_videos',
    files: 'chat.shared_media_files',
    links: 'chat.shared_media_links',
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(titleMap[mediaType])} size="lg">
      {filteredMedia.length === 0 ? (
        <p className="text-center text-secondary-500 dark:text-secondary-400 py-8">{t('chat.no_shared_media')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
          {filteredMedia.map(msg => (
            <div key={msg.id} className="aspect-square bg-secondary-100 dark:bg-secondary-700 rounded-md overflow-hidden group relative">
              {mediaType === 'images' && msg.text && (
                <img src={msg.text} alt={t('chat.message_bubble.image_alt')} className="w-full h-full object-cover" />
              )}
              {mediaType === 'videos' && msg.text && (
                // Simple placeholder for video, could be a thumbnail or a mini player
                <div className="w-full h-full flex items-center justify-center">
                  <PlayCircleIcon className="w-12 h-12 text-secondary-500" />
                </div>
              )}
              {mediaType === 'files' && msg.fileName && (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                  <DocumentTextIcon className="w-10 h-10 text-secondary-500 mb-1" />
                  <p className="text-xs text-secondary-600 dark:text-secondary-300 truncate w-full">{msg.fileName}</p>
                  {msg.fileSize && <p className="text-2xs text-secondary-400">{(msg.fileSize / 1024).toFixed(1)} KB</p>}
                </div>
              )}
               {mediaType === 'links' && msg.text && (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center break-all">
                  <LinkIcon className="w-8 h-8 text-secondary-500 mb-1" />
                  <p className="text-xs text-blue-500 dark:text-blue-400 hover:underline line-clamp-3">{msg.text}</p>
                </div>
              )}
               <a 
                href={msg.text || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                aria-label={`View ${mediaType.slice(0, -1)}`}
                >
                <EyeIcon className="w-8 h-8 text-white"/>
              </a>
            </div>
          ))}
        </div>
      )}
       <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>{t('profile.close')}</Button>
      </div>
    </Modal>
  );
};


// GroupInfoModal Component
interface GroupInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    chat: Chat;
    currentUser: User;
    getParticipantDetails: (userId: string) => User | undefined;
    onUpdateGroupDetails: (chatId: string, details: Partial<Pick<Chat, 'name' | 'groupImage'>>) => Promise<boolean>;
    onUpdateGroupDefaultPermissions: (chatId: string, newDefaults: Partial<GroupPermissions>) => Promise<boolean>;
    onUpdateMemberGroupPermissions: (chatId: string, memberId: string, overrides: Partial<GroupPermissions>) => Promise<boolean>;
    onSetGroupAdmins: (chatId: string, adminIds: string[]) => Promise<boolean>;
    onKickUser: (chatId: string, userIdToKick: string) => Promise<boolean>;
    onBanUser: (chatId: string, userIdToBan: string) => Promise<boolean>;
    onUnbanUser: (chatId: string, userIdToUnban: string) => Promise<boolean>;
    onAddMembers: (chatId: string, userIdsToAdd: string[]) => Promise<boolean>;
    onTransferOwnership: (chatId: string, newOwnerId: string) => Promise<boolean>;
    onLeaveGroup: (chatId: string) => Promise<boolean>;
    t: (key: TranslationKey, substitutions?: Record<string, string | number>) => string;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
    isOpen, onClose, chat, currentUser, getParticipantDetails,
    onUpdateGroupDetails, onUpdateGroupDefaultPermissions, onUpdateMemberGroupPermissions, onSetGroupAdmins,
    onKickUser, onBanUser, onUnbanUser, onAddMembers, onTransferOwnership, onLeaveGroup, t
}) => {
    const [groupName, setGroupName] = useState(chat.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [groupImage, setGroupImage] = useState(chat.groupImage || '');
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [activeTab, setActiveTab] = useState<'members' | 'permissions' | 'banned'>('members');
    
    // For adding members
    const [isAddingMembers, setIsAddingMembers] = useState(false);
    const [addMemberSearch, setAddMemberSearch] = useState('');
    const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<string[]>([]);
    
    // For permissions
    const [editingMemberPermissions, setEditingMemberPermissions] = useState<User | null>(null);
    const [tempMemberPermissions, setTempMemberPermissions] = useState<Partial<GroupPermissions>>({});
    const [tempDefaultPermissions, setTempDefaultPermissions] = useState<GroupPermissions>(chat.defaultPermissions || DEFAULT_GROUP_PERMISSIONS);


    const { users } = useUserManagement(); // For member search
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isOwner = chat.ownerId === currentUser.id;
    const isAdmin = chat.groupAdminIds.includes(currentUser.id);

    useEffect(() => {
        if (isOpen) {
            setGroupName(chat.name || '');
            setGroupImage(chat.groupImage || '');
            setIsEditingName(false);
            setIsEditingImage(false);
            setTempDefaultPermissions(chat.defaultPermissions || DEFAULT_GROUP_PERMISSIONS);
        }
    }, [isOpen, chat.name, chat.groupImage, chat.defaultPermissions]);
    
    useEffect(() => {
        if (editingMemberPermissions && chat.memberPermissionOverrides) {
            setTempMemberPermissions(chat.memberPermissionOverrides[editingMemberPermissions.id] || {});
        } else {
            setTempMemberPermissions({});
        }
    }, [editingMemberPermissions, chat.memberPermissionOverrides]);


    const handleSaveName = async () => {
        if (groupName.trim() === chat.name) {
            setIsEditingName(false);
            return;
        }
        await onUpdateGroupDetails(chat.id, { name: groupName.trim() });
        setIsEditingName(false);
    };
    
    const handleSaveImage = async () => {
        await onUpdateGroupDetails(chat.id, { groupImage: groupImage || undefined });
        setIsEditingImage(false);
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) { alert("File is too large. Max 2MB allowed."); return; }
          const reader = new FileReader();
          reader.onloadend = () => setGroupImage(reader.result as string);
          reader.readAsDataURL(file);
        }
    };
    
    const handleAddSelectedMembers = async () => {
        if (selectedMembersToAdd.length > 0) {
            await onAddMembers(chat.id, selectedMembersToAdd);
            setSelectedMembersToAdd([]);
            setAddMemberSearch('');
            setIsAddingMembers(false);
        }
    };
    
    const handleTransferOwnership = async (newOwnerId: string) => {
        if (window.confirm(t('groups.confirm_transfer_ownership', {group: chat.name || 'Group', name: getParticipantDetails(newOwnerId)?.name || 'User'}))) {
            await onTransferOwnership(chat.id, newOwnerId);
        }
    };
    
    const handleSetAdmin = async (memberId: string, makeAdmin: boolean) => {
        let newAdminIds = [...chat.groupAdminIds];
        if (makeAdmin) {
            if (!newAdminIds.includes(memberId)) newAdminIds.push(memberId);
        } else {
            if (memberId === chat.ownerId) { alert("Cannot remove owner from admins."); return; }
            newAdminIds = newAdminIds.filter(id => id !== memberId);
        }
        await onSetGroupAdmins(chat.id, newAdminIds);
    };

    const handleSaveDefaultPermissions = async () => {
        await onUpdateGroupDefaultPermissions(chat.id, tempDefaultPermissions);
    };

    const handleSaveMemberPermissions = async () => {
        if (editingMemberPermissions) {
            await onUpdateMemberGroupPermissions(chat.id, editingMemberPermissions.id, tempMemberPermissions);
            setEditingMemberPermissions(null);
        }
    };

    const handleResetMemberPermissionsToDefault = () => {
        setTempMemberPermissions({}); // Empty object means use group defaults
    };
    
    const togglePermission = (obj: Partial<GroupPermissions>, setObj: React.Dispatch<React.SetStateAction<Partial<GroupPermissions>>>, key: keyof GroupPermissions) => {
      setObj(prev => {
        const currentVal = prev[key];
        const defaultVal = chat.defaultPermissions?.[key] ?? DEFAULT_GROUP_PERMISSIONS[key];
        
        if (obj === tempMemberPermissions) { // Handling member overrides
            if (currentVal === undefined) return {...prev, [key]: !defaultVal }; // If undefined, set to opposite of default
            if (currentVal === defaultVal) return {...prev, [key]: !defaultVal }; // If same as default, set to opposite of default
            return {...prev, [key]: undefined }; // If different from default, reset to default (undefined in override)
        } else { // Handling default permissions
            return {...prev, [key]: !currentVal };
        }
      });
    };


    const availableMembersToAdd = users.filter(u =>
        u.id !== currentUser.id &&
        !chat.participants.some(p => p.userId === u.id) &&
        !chat.groupBannedUserIds?.includes(u.id) &&
        currentUser.friendIds?.includes(u.id) && // Only friends can be added for simplicity
        (u.name.toLowerCase().includes(addMemberSearch.toLowerCase()) || u.nickname.toLowerCase().includes(addMemberSearch.toLowerCase()))
    );
    
    const bannedUsersDetails = chat.groupBannedUserIds?.map(id => getParticipantDetails(id)).filter(Boolean) as User[];


    const renderMemberItem = (member: User) => {
        const isMemberOwner = member.id === chat.ownerId;
        const isMemberAdmin = chat.groupAdminIds.includes(member.id);
        const canManageMember = (isOwner || (isAdmin && !isMemberAdmin && !isMemberOwner)) && member.id !== currentUser.id;

        return (
            <li key={member.id} className="flex items-center justify-between p-2 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 rounded-md">
                <div className="flex items-center">
                    <Avatar user={member} size="sm" />
                    <div className="ml-2">
                        <span className="text-sm font-medium text-secondary-800 dark:text-secondary-200">{member.name}</span>
                        {isMemberOwner && <span className="ml-1.5 text-xs bg-yellow-400 text-yellow-800 px-1.5 py-0.5 rounded-full font-semibold">{t('groups.owner_badge')}</span>}
                        {!isMemberOwner && isMemberAdmin && <span className="ml-1.5 text-xs bg-blue-400 text-blue-800 px-1.5 py-0.5 rounded-full font-semibold">{t('groups.admin_badge')}</span>}
                    </div>
                </div>
                {canManageMember && (
                    <div className="flex space-x-1">
                         {isOwner && !isMemberOwner && (
                            <Button size="icon" variant="ghost" onClick={() => handleSetAdmin(member.id, !isMemberAdmin)} title={isMemberAdmin ? t('groups.remove_admin') : t('groups.make_admin')}>
                                {isMemberAdmin ? <UserMinusIcon className="w-4 h-4 text-orange-500" /> : <UserCheckIcon className="w-4 h-4 text-green-500" />}
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => onKickUser(chat.id, member.id)} title={t('groups.kick_member')}><UserMinusIcon className="w-4 h-4 text-red-500"/></Button>
                        <Button size="icon" variant="ghost" onClick={() => onBanUser(chat.id, member.id)} title={t('groups.ban_member')}><NoSymbolIcon className="w-4 h-4 text-red-600"/></Button>
                    </div>
                )}
            </li>
        );
    };
    
    const renderPermissionToggle = (
      labelKey: TranslationKey,
      permKey: keyof GroupPermissions,
      currentPermissions: Partial<GroupPermissions>,
      setPermissions: React.Dispatch<React.SetStateAction<Partial<GroupPermissions>>>,
      isMemberOverrideContext: boolean = false
    ) => {
        const currentValue = currentPermissions[permKey];
        let displayValue: 'allow' | 'deny' | 'default';
        let effectiveValue: boolean;

        if (isMemberOverrideContext) {
            if (currentValue === undefined) {
                displayValue = 'default';
                effectiveValue = chat.defaultPermissions?.[permKey] ?? DEFAULT_GROUP_PERMISSIONS[permKey];
            } else {
                displayValue = currentValue ? 'allow' : 'deny';
                effectiveValue = currentValue;
            }
        } else { // Default permissions context
            effectiveValue = currentValue ?? DEFAULT_GROUP_PERMISSIONS[permKey];
            displayValue = effectiveValue ? 'allow' : 'deny';
        }
        
        const valueText = displayValue === 'default' 
            ? t('groups.permissions.default_setting', { value: (chat.defaultPermissions?.[permKey] ?? DEFAULT_GROUP_PERMISSIONS[permKey]) ? t('groups.permissions.allow') : t('groups.permissions.deny') })
            : (effectiveValue ? t('groups.permissions.allow') : t('groups.permissions.deny'));

        return (
            <div className="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-700/50 last:border-b-0">
                <span className="text-sm text-secondary-700 dark:text-secondary-300">{t(labelKey)}</span>
                <Button
                    size="sm"
                    variant={displayValue === 'default' ? 'secondary' : (effectiveValue ? 'primary' : 'danger')}
                    outline={displayValue === 'default' || !effectiveValue}
                    onClick={() => togglePermission(currentPermissions, setPermissions, permKey)}
                >
                    {valueText}
                </Button>
            </div>
        );
    };


    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('groups.group_info_title')} size="lg">
            <div className="flex flex-col items-center mb-4">
                <div className="relative group">
                    <Avatar user={{ name: chat.name, avatarBgColor: chat.groupAvatarUrl, isGroupPlaceholder: true, groupImage: groupImage || chat.groupImage }} size="xl" className="mb-2"/>
                    {(isOwner || isAdmin) && (
                         <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 bg-white/70 dark:bg-black/70 rounded-full p-1.5 shadow-md" onClick={() => fileInputRef.current?.click()} title={t('groups.change_group_photo')}>
                            <CameraIcon className="w-5 h-5"/>
                        </Button>
                    )}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
                </div>
                {isEditingName ? (
                    <div className="flex items-center space-x-2 mt-1">
                        <Input value={groupName} onChange={e => setGroupName(e.target.value)} wrapperClassName="!mb-0" className="text-lg" />
                        <Button size="icon" variant="primary" onClick={handleSaveName}><CheckIcon/></Button>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}><XMarkIcon/></Button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 mt-1">
                        <h3 className="text-xl font-semibold text-center">{groupName}</h3>
                        {(isOwner || isAdmin) && <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} title={t('profile.nickname_label')}><PencilIcon className="w-4 h-4"/></Button>}
                    </div>
                )}
                 {(isOwner || isAdmin) && groupImage && (
                    <Button variant="link" size="sm" onClick={() => { setGroupImage(''); onUpdateGroupDetails(chat.id, {groupImage: undefined})}} className="text-xs text-red-500 mt-0.5">{t('groups.remove_group_photo')}</Button>
                )}
            </div>

            <div className="border-b border-secondary-200 dark:border-secondary-600 mb-3">
                <nav className="flex space-x-1 -mb-px">
                    {['members', 'permissions', 'banned'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)}
                            className={`px-3 py-2 font-medium text-sm rounded-t-md transition-colors
                                ${activeTab === tab 
                                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
                                    : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 hover:border-secondary-300'}`
                            }>
                            {t(
                                tab === 'members' ? 'chat.message_area.members' :
                                tab === 'permissions' ? 'groups.permissions_title' :
                                'groups.banned_users_title' 
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            {activeTab === 'members' && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold mb-1">{t('chat.message_area.members', {count: chat.participants.length})}</h4>
                    <ul>{chat.participants.map(p => getParticipantDetails(p.userId)).filter(Boolean).map(user => renderMemberItem(user as User))}</ul>
                    {(isOwner || isAdmin) && (
                         <Button variant="secondary" onClick={() => setIsAddingMembers(true)} leftIcon={<UserPlusIcon className="w-4 h-4"/>} className="w-full mt-3">{t('groups.add_members_button')}</Button>
                    )}
                    {isOwner && chat.participants.length > 1 && (
                        <div className="mt-3 pt-3 border-t">
                             <h4 className="text-sm font-semibold mb-1">{t('groups.transfer_ownership')}</h4>
                             <select 
                                onChange={(e) => e.target.value && handleTransferOwnership(e.target.value)}
                                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-sm"
                                defaultValue=""
                             >
                                <option value="" disabled>{t('groups.select_new_owner')}</option>
                                {chat.groupAdminIds.filter(id => id !== currentUser.id && chat.participants.some(p => p.userId === id)).map(adminId => {
                                    const adminUser = getParticipantDetails(adminId);
                                    return adminUser ? <option key={adminId} value={adminId}>{adminUser.name}</option> : null;
                                })}
                             </select>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'permissions' && (isOwner || isAdmin) && (
                <div>
                     <h4 className="text-md font-semibold mb-2 text-secondary-800 dark:text-secondary-200">{t('groups.permissions.general_settings_title')}</h4>
                     <div className="p-3 bg-secondary-50 dark:bg-secondary-700/30 rounded-lg mb-4">
                        {Object.keys(DEFAULT_GROUP_PERMISSIONS).map(key => renderPermissionToggle(
                            `groups.permissions.${key.replace(/([A-Z])/g, '_$1').toLowerCase()}` as TranslationKey,
                            key as keyof GroupPermissions,
                            tempDefaultPermissions,
                            setTempDefaultPermissions as React.Dispatch<React.SetStateAction<Partial<GroupPermissions>>>
                        ))}
                        {isOwner && <Button onClick={handleSaveDefaultPermissions} variant="primary" size="sm" className="mt-3">{t('profile.save_changes')}</Button>}
                     </div>

                    <h4 className="text-md font-semibold my-3 text-secondary-800 dark:text-secondary-200">{t('groups.permissions.member_overrides_title')}</h4>
                    <select 
                        onChange={(e) => setEditingMemberPermissions(getParticipantDetails(e.target.value) || null)}
                        className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-sm mb-2"
                        value={editingMemberPermissions?.id || ""}
                    >
                        <option value="" disabled>Select member to edit permissions...</option>
                        {chat.participants.filter(p => p.userId !== chat.ownerId).map(p => getParticipantDetails(p.userId)).filter(Boolean).map(user => (
                            <option key={(user as User).id} value={(user as User).id}>{(user as User).name}</option>
                        ))}
                    </select>

                    {editingMemberPermissions && (
                         <div className="p-3 bg-secondary-50 dark:bg-secondary-700/30 rounded-lg">
                            <p className="text-sm font-medium mb-2">{t('groups.permissions.edit_member_permissions_for', {name: editingMemberPermissions.name})}</p>
                            {Object.keys(DEFAULT_GROUP_PERMISSIONS).map(key => renderPermissionToggle(
                                `groups.permissions.${key.replace(/([A-Z])/g, '_$1').toLowerCase()}` as TranslationKey,
                                key as keyof GroupPermissions,
                                tempMemberPermissions,
                                setTempMemberPermissions,
                                true // isMemberOverrideContext
                            ))}
                            <div className="flex space-x-2 mt-3">
                                <Button onClick={handleSaveMemberPermissions} variant="primary" size="sm">{t('profile.save_changes')}</Button>
                                <Button onClick={handleResetMemberPermissionsToDefault} variant="secondary" size="sm">{t('groups.permissions.reset_to_defaults')}</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'banned' && (isOwner || isAdmin) && (
                 <div className="space-y-2">
                    <h4 className="text-sm font-semibold mb-1">{t('groups.banned_users_title')} ({bannedUsersDetails.length})</h4>
                    {bannedUsersDetails.length === 0 ? <p className="text-xs text-secondary-500">No users are currently banned.</p> : (
                        <ul>{bannedUsersDetails.map(user => (
                            <li key={user.id} className="flex items-center justify-between p-2 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 rounded-md">
                                <div className="flex items-center">
                                    <Avatar user={user} size="sm" />
                                    <span className="ml-2 text-sm font-medium text-secondary-800 dark:text-secondary-200">{user.name}</span>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => onUnbanUser(chat.id, user.id)}>{t('groups.unban_member')}</Button>
                            </li>
                        ))}</ul>
                    )}
                </div>
            )}
            </div> {/* End scrollable content */}

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                 <Button variant="danger" outline onClick={async () => {
                    if (window.confirm(t('groups.confirm_leave_group', { groupName: chat.name || 'this group' }))) {
                        await onLeaveGroup(chat.id);
                        onClose();
                    }
                 }} className="w-full sm:w-auto">{t('groups.leave_group_button')}</Button>
                <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">{t('profile.close')}</Button>
            </div>

            {/* Add Members Modal */}
            <Modal isOpen={isAddingMembers} onClose={() => setIsAddingMembers(false)} title={t('groups.add_members_modal_title')} size="sm">
                <Input
                    type="search"
                    placeholder={t('groups.search_contacts_to_add')}
                    value={addMemberSearch}
                    onChange={e => setAddMemberSearch(e.target.value)}
                    wrapperClassName="mb-3"
                    leftIcon={<SearchIcon className="w-4 h-4"/>}
                />
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar -mr-2 pr-2">
                    {availableMembersToAdd.length === 0 && <p className="text-xs text-secondary-500 text-center py-2">{t('chat.no_contacts_found')}</p>}
                    {availableMembersToAdd.map(user => (
                        <label key={user.id} className="flex items-center space-x-2 p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-600 rounded-md cursor-pointer">
                            <input type="checkbox" checked={selectedMembersToAdd.includes(user.id)} onChange={() => setSelectedMembersToAdd(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"/>
                            <Avatar user={user} size="xs"/>
                            <span className="text-sm">{user.name}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={() => setIsAddingMembers(false)}>{t('profile.cancel')}</Button>
                    <Button variant="primary" onClick={handleAddSelectedMembers} disabled={selectedMembersToAdd.length === 0}>{t('groups.add_members_button')}</Button>
                </div>
            </Modal>
        </Modal>
    );
};

// DropdownMenu Component
export interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>; // For positioning relative to an anchor
  children: ReactNode;
  className?: string;
  menuPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, anchorRef, children, className = '', menuPosition = 'bottom-right' }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  const getPositionClasses = () => {
    let classes = 'absolute z-40 ';
    // Simplified positioning logic for now. More complex logic can be added if needed.
    // This assumes the parent of the DropdownMenu (or the anchorRef's parent) is relatively positioned.
    switch (menuPosition) {
        case 'bottom-left': classes += 'top-full left-0 mt-1 '; break;
        case 'top-left': classes += 'bottom-full left-0 mb-1 '; break;
        case 'top-right': classes += 'bottom-full right-0 mb-1 '; break;
        case 'bottom-right': // default
        default: classes += 'top-full right-0 mt-1 '; break;
    }
    return classes;
  };


  return (
    <div
      ref={menuRef}
      className={`${getPositionClasses()} bg-white dark:bg-secondary-700 shadow-xl rounded-lg py-1 border border-secondary-200 dark:border-secondary-600 ${className}`}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
};

// DropdownItem Component
export interface DropdownItemProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, children, className = '', disabled }) => {
  const commonClasses = `block w-full text-left px-4 py-2 text-sm 
    text-secondary-700 dark:text-secondary-200 
    hover:bg-secondary-100 dark:hover:bg-secondary-600 
    focus:outline-none focus:bg-secondary-100 dark:focus:bg-secondary-600
    disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={commonClasses} role="menuitem" disabled={disabled}>
        {children}
      </button>
    );
  }
  return (
    <div className={commonClasses} role="none"> {/* Use role="none" if not interactive per se, or adjust */}
      {children}
    </div>
  );
};