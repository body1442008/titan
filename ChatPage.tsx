console.log("ChatPage.tsx module loading..."); // Diagnostic log
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth, useChat, useUserManagement, useSettings } from './store';
import { Avatar, Button, Input, Modal, CogIcon, UsersIcon, ChatBubbleIcon, SearchIcon, PaperClipIcon, FaceSmileIcon, PaperAirplaneIcon, EyeIcon, PlusIcon, ThumbsUpIcon, LoadingSpinner, ArrowLeftIcon, ReplyIcon, ReactionPicker, ReactionsDisplay, CheckIcon, DoubleCheckIcon, XMarkIcon, UsersGroupIcon, GroupInfoModal, UserPlusIcon, FriendRequestsModal, CameraIcon, UserMinusIcon, NoSymbolIcon, PencilIcon, ImagePlusIcon, DocumentPlusIcon, ArchiveBoxXMarkIcon, ArrowPathIcon, EllipsisVerticalIcon, VideoCameraIcon, VideoCallModal, TrashIcon as UiTrashIcon, ChevronUpIcon, ChevronDownIcon, BellIcon, BellSlashIcon, EyeSlashIcon, PhotoIcon, FilmIcon, DocumentTextIcon, LinkIcon, SharedMediaViewerModal, AppLogo, ShareIcon, PhoneIcon, DropdownMenu, DropdownItem } from './ui';
import { User, Chat, Message, MessageType, UserStatus, ChatParticipant, TranslationKey, SidebarViewType, PresenceVisibility, MessageActionType, MessagingPrivacy, SharedMediaType, GroupPermissions } from './types'; 
import { formatTimestamp, getInitials, getRandomColor, shouldShowUserPresence } from './utils';
import { AVATAR_COLORS, APP_NAME, UNKNOWN_USER_PLACEHOLDER, MORE_EMOJIS_FOR_PICKER, CHAT_BACKGROUNDS } from './constants';
import ProfilePage from './ProfilePage'; 

interface ChatPageProps {
  initialView?: SidebarViewType;
}

const NavItem: React.FC<{ icon: React.ReactNode; labelKey: TranslationKey; isActive: boolean; onClick: () => void; notificationCount?: number; }> = ({ icon, labelKey, isActive, onClick, notificationCount }) => {
  const { t } = useSettings();
  const label = t(labelKey);
  return (
    <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        title={label} 
        aria-label={label}
        className={`w-full flex flex-col items-center p-2 rounded-lg transition-colors duration-150 relative h-16 md:h-auto ${
        isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-700 dark:text-primary-100' : 'text-secondary-500 hover:bg-secondary-200 dark:text-secondary-400 dark:hover:bg-secondary-700'
        }`}
    >
        {icon}
        <span className="text-xs mt-1 sr-only md:not-sr-only">{label}</span>
        {notificationCount && notificationCount > 0 && (
            <span className="absolute top-1 right-1 md:top-0.5 md:right-0.5 min-w-[1rem] h-4 px-1 bg-red-500 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center border-2 border-secondary-50 dark:border-secondary-800">
                {notificationCount > 9 ? '9+' : notificationCount}
            </span>
        )}
    </Button>
  );
};


const Sidebar: React.FC<{ 
    activeView: SidebarViewType; 
    onViewChange: (view: SidebarViewType) => void;
    onUserLogout: () => void;
    currentUser: User | null;
    friendRequestCount: number;
}> = ({ activeView, onViewChange, onUserLogout, currentUser, friendRequestCount }) => {
  const navigate = useNavigate();
  const { t } = useSettings();

  return (
    <div className="w-16 md:w-20 bg-secondary-50 dark:bg-secondary-800 h-full flex flex-col justify-between items-center p-2 md:p-3 shadow-lg z-30 shrink-0">
      <div className="w-full">
        {currentUser && (
          <button onClick={() => onViewChange('profile')} title={t('chat.profile_title')} aria-label={t('chat.profile_title')} className="mb-4 md:mb-6 w-full flex justify-center group">
            <Avatar user={currentUser} size="md" className="group-hover:ring-2 group-hover:ring-primary-300 dark:group-hover:ring-primary-500 transition-all"/>
          </button>
        )}
        <nav className="space-y-2 md:space-y-3 w-full">
          <NavItem icon={<ChatBubbleIcon className="w-5 h-5 md:w-6 md:h-6"/>} labelKey="chat.chats_title" isActive={activeView === 'chats'} onClick={() => onViewChange('chats')} />
          <NavItem icon={<UsersIcon className="w-5 h-5 md:w-6 md:h-6"/>} labelKey="friends.sidebar_title" isActive={activeView === 'contacts'} onClick={() => onViewChange('contacts')} />
          <NavItem icon={<UsersGroupIcon className="w-5 h-5 md:w-6 md:h-6"/>} labelKey="chat.groups_title" isActive={activeView === 'groups'} onClick={() => onViewChange('groups')} />
          <NavItem icon={<UserPlusIcon className="w-5 h-5 md:w-6 md:h-6"/>} labelKey="friends.friend_requests_title" isActive={activeView === 'friend_requests'} onClick={() => onViewChange('friend_requests')} notificationCount={friendRequestCount} />
          <NavItem icon={<SearchIcon className="w-5 h-5 md:w-6 md:h-6"/>} labelKey="chat.search_title" isActive={activeView === 'search'} onClick={() => onViewChange('search')} />
        </nav>
      </div>
      <div className="space-y-2 md:space-y-3 w-full">
        <NavItem icon={<CogIcon className="w-5 h-5 md:w-6 md:h-6"/>} labelKey="chat.settings_title" isActive={activeView === 'settings'} onClick={() => navigate('/settings')} />
        <Button variant="ghost" size="icon" onClick={onUserLogout} className="w-full text-secondary-500 hover:text-red-500 dark:hover:text-red-400 h-16 md:h-auto" title={t('chat.logout_button')} aria-label={t('chat.logout_button')}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
           </svg>
           <span className="text-xs mt-1 sr-only md:not-sr-only">{t('chat.logout_button')}</span>
        </Button>
      </div>
    </div>
  );
};

const ChatListItem: React.FC<{ chat: Chat; isActive: boolean; onClick: () => void; currentUser: User | null }> = ({ chat, isActive, onClick, currentUser }) => {
  const { getUserById } = useUserManagement();
  const { t } = useSettings();
  if (!currentUser) return null;
  
  let displayName = chat.name || t('general.unknown_user');
  let avatarUser: Pick<User, 'name' | 'nickname' | 'avatarUrl' | 'avatarBgColor' | 'status' | 'lastSeen' | 'presenceVisibility'> | { name?: string, nickname?: string, avatarUrl?: string, avatarBgColor: string, isGroupPlaceholder?: boolean, groupImage?: string, status?: UserStatus, lastSeen?: string, presenceVisibility?: PresenceVisibility } | typeof UNKNOWN_USER_PLACEHOLDER = UNKNOWN_USER_PLACEHOLDER;
  let subText = t('general.no_messages_yet_group');
  let showStatusIndicatorForAvatar = false;
  const unreadCountForCurrentUser = chat.isMuted ? 0 : (chat.unreadCounts?.[currentUser.id] || 0);

  const otherParticipantInOneOnOne = chat.isGroup ? null : chat.participants.find(p => p.userId !== currentUser.id);
  const isTargetUserPresenceMuted = otherParticipantInOneOnOne ? (chat.mutedPresenceTargetUserIds?.includes(otherParticipantInOneOnOne.userId) || false) : false;


  if (chat.isGroup) {
    displayName = chat.name || t('general.group');
    avatarUser = { name: displayName, avatarBgColor: chat.groupAvatarUrl || getRandomColor(AVATAR_COLORS, chat.id), isGroupPlaceholder: true, groupImage: chat.groupImage };
    if (chat.lastMessage) {
        let senderName = t('general.unknown_user');
        if (chat.lastMessage.senderId === currentUser.id) {
            senderName = t('profile.nickname_label'); 
        } else {
            senderName = chat.lastMessageSenderName || getUserById(chat.lastMessage.senderId)?.nickname || t('general.unknown_user');
        }

        if (chat.lastMessage.type === MessageType.CallLog) {
            subText = chat.lastMessage.text || t('chat.call_log_message', {details: chat.lastMessage.callDuration || 'Video Call'});
        } else if (chat.lastMessage.isDeleted || chat.lastMessage.isDeletedGlobally) {
            subText = chat.lastMessage.isDeletedGlobally ? t('chat.message_bubble.message_deleted_by_sender') : t('chat.message_bubble.message_deleted');
        } else {
            subText = `${senderName}: ${chat.lastMessage.text?.substring(0,25) || (chat.lastMessage.type === MessageType.Image ? t('general.image_message') : (chat.lastMessage.type === MessageType.File ? t('general.file_message') : t('general.liked_message', {name:''})) ) }...`;
        }
    } else {
        subText = t('general.no_messages_yet_group');
    }
  } else {
    if (otherParticipantInOneOnOne) {
        const foundUser = getUserById(otherParticipantInOneOnOne.userId);
        if (foundUser) {
            displayName = foundUser.name;
            avatarUser = foundUser;
            const canSeePresence = shouldShowUserPresence(currentUser, foundUser, isTargetUserPresenceMuted);
            showStatusIndicatorForAvatar = canSeePresence;
            if (canSeePresence) {
                subText = foundUser.status === UserStatus.Online ? t('chat.message_area.online') : (foundUser.lastSeen ? t('chat.message_area.last_seen', {time: formatTimestamp(foundUser.lastSeen, 'relative')}) : t('chat.message_area.offline'));
            } else {
                subText = t('chat.message_area.offline'); 
            }
        } else {
            displayName = otherParticipantInOneOnOne.nickname || t('general.unknown_user');
            avatarUser = { ...UNKNOWN_USER_PLACEHOLDER, id: otherParticipantInOneOnOne.userId, name: displayName, nickname: otherParticipantInOneOnOne.nickname };
            subText = t('chat.message_area.unknown_status');
        }
    }
    if (chat.lastMessage) {
      if (chat.lastMessage.type === MessageType.CallLog) {
        subText = chat.lastMessage.text || t('chat.call_log_message', {details: chat.lastMessage.callDuration || 'Video Call'});
      } else if (chat.lastMessage.isDeleted || chat.lastMessage.isDeletedGlobally) {
        subText = chat.lastMessage.isDeletedGlobally ? t('chat.message_bubble.message_deleted_by_sender') : t('chat.message_bubble.message_deleted');
      } else {
        subText = chat.lastMessage.type === MessageType.Image ? `📷 ${t('general.image_message')}` 
                    : chat.lastMessage.type === MessageType.File ? `📄 ${chat.lastMessage.fileName || t('general.file_message')}`
                    : chat.lastMessage.type === MessageType.Video ? `🎬 Video`
                    : chat.lastMessage.type === MessageType.Like ? t('general.liked_message', {name: (chat.lastMessage.senderId === currentUser.id ? "You" : getUserById(chat.lastMessage.senderId)?.nickname || t('general.unknown_user')) })
                    : chat.lastMessage.text || t('general.no_messages_yet_group');
      }
    }
  }
  
  const isDisabled = avatarUser === UNKNOWN_USER_PLACEHOLDER && !chat.isGroup;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`w-full flex items-center p-3 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-150 rounded-lg ${
        isActive && !isDisabled ? 'bg-primary-100 dark:bg-primary-700 shadow-md' : ''
      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={`${t('chat.chats_title')} ${displayName}`}
    >
      <Avatar user={avatarUser as User} size="md" showStatusIndicator={showStatusIndicatorForAvatar} status={avatarUser?.status} />
      <div className="ml-3 flex-1 min-w-0 text-left">
        <div className="flex items-center">
            <p className={`font-semibold truncate text-secondary-800 dark:text-secondary-100 ${isActive && !isDisabled ? 'text-primary-700 dark:text-primary-100' : ''}`}>{displayName}</p>
            {chat.isMuted && <BellSlashIcon className="w-3 h-3 text-secondary-400 dark:text-secondary-500 ml-1.5 shrink-0" title={t('chat.muted_icon_alt')}/>}
        </div>
        <p className={`text-xs text-secondary-500 dark:text-secondary-400 truncate ${isActive && !isDisabled ? 'text-primary-600 dark:text-primary-300' : ''}`}>{subText}</p>
      </div>
      <div className="ml-2 flex flex-col items-end shrink-0">
        <span className={`text-xs ${isActive ? 'text-primary-600 dark:text-primary-300' : 'text-secondary-400 dark:text-secondary-500'}`}>{formatTimestamp(chat.lastMessage?.timestamp, 'time')}</span>
        {unreadCountForCurrentUser > 0 && !isDisabled && (
          <span className="mt-1 px-1.5 py-0.5 text-2xs bg-red-500 text-white font-semibold rounded-full">{unreadCountForCurrentUser}</span>
        )}
      </div>
    </button>
  );
};

const ChatListPanel: React.FC<{onNewChatRequest: () => void;}> = ({onNewChatRequest}) => {
  const { chats, activeChatId, setActiveChatId } = useChat();
  const { currentUser } = useAuth();
  const { getUserById } = useUserManagement();
  const { t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat => {
    if (!currentUser) return false;
    if (chat.isGroup) {
        return chat.name ? chat.name.toLowerCase().includes(searchTerm.toLowerCase()) : searchTerm === '';
    }
    const otherParticipant = chat.participants.find(p => p.userId !== currentUser.id);
    if (otherParticipant) {
        const otherUserDetails = getUserById(otherParticipant.userId);
        if (otherUserDetails) { 
            return otherUserDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   otherUserDetails.nickname.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return otherParticipant.nickname.toLowerCase().includes(searchTerm.toLowerCase()); 
    }
    return false;
  }).sort((a,b) => new Date(b.lastMessage?.timestamp || b.createdAt).getTime() - new Date(a.lastMessage?.timestamp || a.createdAt).getTime());
  
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-secondary-200 dark:border-secondary-700 flex flex-col h-full bg-white dark:bg-secondary-800">
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 sticky top-0 bg-white dark:bg-secondary-800 z-10">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-secondary-800 dark:text-secondary-100">{t('chat.chats_title')}</h2>
            <Button variant="ghost" size="icon" onClick={onNewChatRequest} title={t('chat.start_new_chat')} aria-label={t('chat.start_new_chat')}>
                <PlusIcon className="w-5 h-5"/>
            </Button>
        </div>
        <Input 
            type="search" 
            placeholder={t('chat.search_chats_placeholder')}
            aria-label={t('chat.search_chats_placeholder')}
            className="w-full" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            wrapperClassName="mb-0"
            leftIcon={<SearchIcon className="w-4 h-4"/>}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {chats.length === 0 && (
            <p className="p-4 text-center text-secondary-500 dark:text-secondary-400">{t('chat.no_chats_yet')}</p>
        )}
        {chats.length > 0 && filteredChats.length === 0 && searchTerm && (
            <p className="p-4 text-center text-secondary-500 dark:text-secondary-400">{t('chat.no_chats_found', {searchTerm})}</p>
        )}
        {filteredChats.map(chat => (
            <ChatListItem 
              key={chat.id} 
              chat={chat} 
              isActive={activeChatId === chat.id} 
              onClick={() => handleSelectChat(chat.id)}
              currentUser={currentUser}
            />
        ))}
      </div>
    </div>
  );
};

const ContactListPanel: React.FC<{onNewChatRequest: () => void; onUserSelect: (userId: string) => void;}> = ({onNewChatRequest, onUserSelect}) => {
    const { users } = useUserManagement();
    const { currentUser } = useAuth();
    const { t } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');

    const friends = users.filter(u => currentUser?.friendIds?.includes(u.id) && u.id !== currentUser?.id);
    
    const filteredFriends = friends.filter(friend => 
        friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));

    return (
        <div className="w-full md:w-80 lg:w-96 border-r border-secondary-200 dark:border-secondary-700 flex flex-col h-full bg-white dark:bg-secondary-800">
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 sticky top-0 bg-white dark:bg-secondary-800 z-10">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-secondary-800 dark:text-secondary-100">{t('chat.contacts_title')}</h2>
                </div>
                <Input 
                    type="search" 
                    placeholder={t('chat.search_contacts_placeholder')}
                    aria-label={t('chat.search_contacts_placeholder')}
                    className="w-full" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                    leftIcon={<SearchIcon className="w-4 h-4"/>}
                />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {friends.length === 0 && (
                    <p className="p-4 text-center text-secondary-500 dark:text-secondary-400">{t('chat.no_contacts_to_show')}</p>
                )}
                {friends.length > 0 && filteredFriends.length === 0 && searchTerm && (
                    <p className="p-4 text-center text-secondary-500 dark:text-secondary-400">{t('chat.no_contacts_found', {searchTerm})}</p>
                )}
                {filteredFriends.map(user => (
                    <button 
                        key={user.id} 
                        onClick={() => onUserSelect(user.id)} 
                        className="w-full flex items-center p-3 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-150 rounded-lg text-left"
                        aria-label={`Start chat with ${user.name}`}
                    >
                        <Avatar user={user} size="md" showStatusIndicator={true} status={user.status}/>
                        <div className="ml-3">
                            <p className="font-semibold text-secondary-800 dark:text-secondary-100">{user.name}</p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">@{user.nickname}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const SearchUsersPanel: React.FC<{onUserSelect: (userId: string) => void;}> = ({onUserSelect}) => {
    const { users } = useUserManagement();
    const { currentUser, sendFriendRequest } = useAuth();
    const { t } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    const handleAddFriend = async (targetUserId: string) => {
        setActionLoading(prev => ({...prev, [targetUserId]: true}));
        await sendFriendRequest(targetUserId);
        setActionLoading(prev => ({...prev, [targetUserId]: false}));
    };

    const filteredUsers = searchTerm.length > 1 ? users.filter(user => 
        user.id !== currentUser?.id && 
        user.email !== 'admin@example.com' && 
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => a.name.localeCompare(b.name)) : [];

    return (
        <div className="w-full md:w-80 lg:w-96 border-r border-secondary-200 dark:border-secondary-700 flex flex-col h-full bg-white dark:bg-secondary-800">
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 sticky top-0 bg-white dark:bg-secondary-800 z-10">
                <h2 className="text-xl font-bold text-secondary-800 dark:text-secondary-100 mb-3">{t('chat.search_title')}</h2>
                <Input 
                    type="search" 
                    placeholder={t('chat.search_users_placeholder')}
                    aria-label={t('chat.search_users_placeholder')}
                    className="w-full" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                    leftIcon={<SearchIcon className="w-4 h-4"/>}
                />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {searchTerm.length <= 1 && (
                    <p className="p-4 text-center text-secondary-500 dark:text-secondary-400">{t('chat.type_to_search_users')}</p>
                )}
                {searchTerm.length > 1 && filteredUsers.length === 0 && (
                    <p className="p-4 text-center text-secondary-500 dark:text-secondary-400">{t('chat.no_users_found', {searchTerm})}</p>
                )}
                {filteredUsers.map(user => {
                    const isFriend = currentUser?.friendIds?.includes(user.id);
                    const requestSent = currentUser?.friendRequestIdsSent?.includes(user.id);
                    const requestReceived = currentUser?.friendRequestIdsReceived?.includes(user.id);

                    return (
                        <div key={user.id} className="w-full flex items-center justify-between p-3 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-150 rounded-lg">
                            <button onClick={() => onUserSelect(user.id)} className="flex items-center flex-grow min-w-0 text-left">
                                <Avatar user={user} size="md" showStatusIndicator={true} status={user.status}/>
                                <div className="ml-3 min-w-0">
                                    <p className="font-semibold text-secondary-800 dark:text-secondary-100 truncate">{user.name}</p>
                                    <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">@{user.nickname}</p>
                                </div>
                            </button>
                            <div className="ml-2 shrink-0">
                                {isFriend ? (
                                    <Button size="sm" variant="ghost" disabled leftIcon={<CheckIcon className="w-4 h-4"/>} className="text-green-500">{t('profile.friends')}</Button>
                                ) : requestSent ? (
                                    <Button size="sm" variant="ghost" disabled leftIcon={<CheckIcon className="w-4 h-4"/>}>{t('profile.friend_request_sent')}</Button>
                                ) : requestReceived ? (
                                    <Button size="sm" variant="primary" onClick={() => onUserSelect(user.id)} leftIcon={<EyeIcon className="w-4 h-4"/>}>{t('profile.view_friends')}</Button> 
                                ) : (
                                    <Button 
                                        size="sm" 
                                        variant="primary" 
                                        onClick={() => handleAddFriend(user.id)}
                                        isLoading={actionLoading[user.id]}
                                        leftIcon={<UserPlusIcon className="w-4 h-4"/>}
                                    >
                                        {t('search.add_friend_button')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CreateGroupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participantIds: string[], avatarSeed?: string) => Promise<string | null>;
}> = ({ isOpen, onClose, onCreateGroup }) => {
  const { users } = useUserManagement();
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const friends = users.filter(u => currentUser?.friendIds?.includes(u.id) && u.id !== currentUser?.id);
  
  const availableMembers = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name));

  const handleToggleMember = (userId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMemberIds.length === 0) {
      setError("Group name and at least one member are required.");
      return;
    }
    setError('');
    setIsLoading(true);
    const newGroupId = await onCreateGroup(groupName, selectedMemberIds, groupName); 
    setIsLoading(false);
    if (newGroupId) {
      onClose();
    } else {
      setError("Failed to create group. Please try again.");
    }
  };
  
  useEffect(() => { 
    if(!isOpen){
        setGroupName('');
        setSelectedMemberIds([]);
        setSearchTerm('');
        setError('');
        setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('groups.create_group_title')} size="md">
      <div className="space-y-4">
        <Input 
            label={t('groups.group_name_label')}
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="E.g., Project Team"
            disabled={isLoading}
            required
        />
        <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">{t('groups.select_members_label')}</label>
            <Input 
                type="search" 
                placeholder={t('chat.search_contacts_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                wrapperClassName="mb-2"
                leftIcon={<SearchIcon className="w-4 h-4"/>}
            />
            <div className="max-h-48 overflow-y-auto border border-secondary-200 dark:border-secondary-700 rounded-md p-2 space-y-1 custom-scrollbar">
                {availableMembers.length === 0 && (
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 p-2 text-center">
                        {friends.length === 0 ? t('groups.no_contacts_to_add_to_group') : t('chat.no_contacts_found', {searchTerm})}
                    </p>
                )}
                {availableMembers.map(user => (
                    <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-md cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedMemberIds.includes(user.id)}
                            onChange={() => handleToggleMember(user.id)}
                            className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                            disabled={isLoading}
                        />
                        <Avatar user={user} size="sm" />
                        <span className="text-secondary-800 dark:text-secondary-200">{user.name} <span className="text-xs text-secondary-500">(@{user.nickname})</span></span>
                    </label>
                ))}
            </div>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>{t('profile.cancel')}</Button>
        <Button 
            variant="primary" 
            onClick={handleCreateGroup} 
            isLoading={isLoading} 
            disabled={!groupName.trim() || selectedMemberIds.length === 0}
        >
            {t('groups.create_button')}
        </Button>
      </div>
    </Modal>
  );
};


const GroupsPanel: React.FC<{ onGroupSelect: (chatId: string) => void; }> = ({ onGroupSelect }) => {
    const { chats } = useChat();
    const { currentUser } = useAuth();
    const { t } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const { createGroupChat } = useChat();

    const groupChats = chats.filter(chat => 
        chat.isGroup &&
        chat.participants.some(p => p.userId === currentUser?.id) &&
        (chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '')
    ).sort((a,b) => (a.name || '').localeCompare(b.name || ''));

    return (
        <div className="w-full md:w-80 lg:w-96 border-r border-secondary-200 dark:border-secondary-700 flex flex-col h-full bg-white dark:bg-secondary-800">
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 sticky top-0 bg-white dark:bg-secondary-800 z-10">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-secondary-800 dark:text-secondary-100">{t('chat.groups_title')}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsCreateGroupModalOpen(true)} title={t('groups.create_group_title')} aria-label={t('groups.create_group_title')}>
                        <PlusIcon className="w-5 h-5"/>
                    </Button>
                </div>
                <Input 
                    type="search" 
                    placeholder={t('chat.search_chats_placeholder')}
                    aria-label={t('chat.search_chats_placeholder')}
                    className="w-full" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    wrapperClassName="mb-0"
                    leftIcon={<SearchIcon className="w-4 h-4"/>}
                />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {groupChats.length === 0 && (
                    <p className="p-4 text-center text-secondary-500 dark:text-secondary-400">
                        {searchTerm ? t('chat.no_chats_found', {searchTerm}) : t('chat.no_chats_yet')} 
                    </p>
                )}
                {groupChats.map(chat => (
                    <button 
                        key={chat.id} 
                        onClick={() => onGroupSelect(chat.id)} 
                        className="w-full flex items-center p-3 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-150 rounded-lg text-left"
                        aria-label={`Open group chat ${chat.name}`}
                    >
                        <Avatar user={{name: chat.name, avatarBgColor: chat.groupAvatarUrl || 'bg-blue-500', isGroupPlaceholder: true, groupImage: chat.groupImage }} size="md" />
                        <div className="ml-3 min-w-0">
                            <p className="font-semibold text-secondary-800 dark:text-secondary-100 truncate">{chat.name}</p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">{t('chat.message_area.members', {count: chat.participants.length})}</p>
                        </div>
                    </button>
                ))}
            </div>
            <CreateGroupModal 
                isOpen={isCreateGroupModalOpen} 
                onClose={() => setIsCreateGroupModalOpen(false)}
                onCreateGroup={createGroupChat}
            />
        </div>
    );
};

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  sender?: User | null; 
  chat: Chat;
  currentUser: User;
  allMessages: { [chatId: string]: Message[] };
  onReply: (messageId: string, messageText: string) => void;
  onDelete: (messageId: string, deleteType: 'me' | 'everyone') => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, currentText: string) => void;
  onViewProfile: (userId: string) => void;
  isConsecutive: boolean;
  searchHighlight?: string; 
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
    message, isOwnMessage, sender, chat, currentUser, allMessages,
    onReply, onDelete, onAddReaction, onEdit, onViewProfile, isConsecutive, searchHighlight
}) => {
    const { t } = useSettings();
    const [showActions, setShowActions] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);

    const senderDetails = sender || (message.senderId === UNKNOWN_USER_PLACEHOLDER.id ? UNKNOWN_USER_PLACEHOLDER : null) ;
    const senderName = senderDetails ? senderDetails.name : (message.senderId === currentUser.id ? currentUser.name : t('general.unknown_user'));
    
    const handleAction = (action: MessageActionType) => {
        setShowActions(false);
        if (action === MessageActionType.Reply && message.text) onReply(message.id, message.text);
        if (action === MessageActionType.Edit && message.text) onEdit(message.id, message.text);
        if (action === MessageActionType.Delete) {
            if (window.confirm(t('chat.message_bubble.confirm_delete_message'))) {
                onDelete(message.id, 'me');
            }
        }
        if (action === MessageActionType.DeleteForEveryone) {
             if (window.confirm(t('chat.message_bubble.confirm_delete_for_everyone'))) {
                onDelete(message.id, 'everyone');
            }
        }
    };
    
    const canDeleteForEveryone = isOwnMessage && (Date.now() - new Date(message.timestamp).getTime() < 10 * 60 * 1000) && !message.isDeletedGlobally && message.type !== MessageType.System && message.type !== MessageType.CallLog;


    const highlightText = (text: string, highlight: string) => {
      if (!highlight.trim()) {
        return text;
      }
      const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-500 rounded px-0.5">{part}</mark> : part
      );
    };


    if (message.isDeleted && !message.isDeletedGlobally && !isOwnMessage) {
      return null; 
    }
    
    const messageContent = () => {
        if (message.isDeletedGlobally) {
            return <p className="italic text-secondary-500 dark:text-secondary-400 text-xs">{t('chat.message_bubble.message_deleted_by_sender')}</p>;
        }
        if (message.isDeleted) {
            return <p className="italic text-secondary-500 dark:text-secondary-400 text-xs">{t('chat.message_bubble.message_deleted')}</p>;
        }
        switch (message.type) {
            case MessageType.Text:
              return (
                <p className="whitespace-pre-wrap break-words">
                    {searchHighlight && message.text ? highlightText(message.text, searchHighlight) : message.text}
                    {message.isEdited && <span className="text-2xs text-secondary-400 dark:text-secondary-500 ml-1.5 opacity-70">({t('chat.message_bubble.edited_tag')})</span>}
                </p>
              );
            case MessageType.Image:
                return (
                    <div className="max-w-xs cursor-pointer" onClick={() => window.open(message.text, '_blank')}>
                        <img src={message.text} alt={t('chat.message_bubble.image_alt')} className="rounded-md object-contain max-h-60" />
                    </div>
                );
            case MessageType.File:
                return (
                    <div className="flex items-center space-x-2 p-2 bg-secondary-100 dark:bg-secondary-600 rounded-md">
                        <DocumentPlusIcon className="w-6 h-6 text-primary-500" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.fileName}</p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ''} - {message.fileType}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" title={t('chat.message_bubble.download_file', {filename: message.fileName || 'file'})}>
                            <ArrowPathIcon className="w-4 h-4"/> {/* Replace with actual download icon */}
                        </Button>
                    </div>
                );
            case MessageType.Like:
                return <ThumbsUpIcon className="w-7 h-7 text-primary-500" />;
            case MessageType.System:
                return <p className="text-xs italic text-secondary-500 dark:text-secondary-400">{message.text}</p>;
            case MessageType.CallLog:
                return <p className="text-xs italic text-secondary-500 dark:text-secondary-400">{t('chat.call_log_message', { details: message.callDuration ? `Duration: ${message.callDuration}` : (message.text || 'Call')})}</p>;
            default:
                return <p>Unsupported message type</p>;
        }
    };
    
    // System messages are centered and simple
    if (message.type === MessageType.System || message.type === MessageType.CallLog || message.isDeletedGlobally || message.isDeleted) {
        return (
            <div ref={messageRef} className="py-2 px-3 text-center w-full">
                <span className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-700/50 px-2 py-0.5 rounded-full">
                    {messageContent()} - {formatTimestamp(message.timestamp, 'time')}
                </span>
            </div>
        );
    }

    const bubbleClasses = isOwnMessage
      ? 'bg-primary-500 text-white rounded-br-none'
      : 'bg-white dark:bg-secondary-700 text-secondary-800 dark:text-secondary-100 rounded-bl-none shadow-sm';
    
    const alignmentClasses = isOwnMessage ? 'items-end' : 'items-start';
    const nameColor = isOwnMessage ? 'text-primary-200' : 'text-primary-500 dark:text-primary-400';

    return (
        <div 
            ref={messageRef}
            className={`flex flex-col p-1 group relative ${alignmentClasses} ${isConsecutive && !chat.isGroup ? (isOwnMessage ? 'mt-0.5' : 'mt-0.5') : 'mt-2'}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
          <div className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              {!isOwnMessage && chat.isGroup && !isConsecutive && (
                <Avatar user={senderDetails || undefined} size="xs" className="mb-0.5 self-end" onClick={() => senderDetails && onViewProfile(senderDetails.id)} />
              )}
              {isConsecutive && !chat.isGroup && <div className="w-6"></div>} {/* Spacer for consecutive messages */}

              <div className="flex flex-col max-w-[70%]">
                  {!isOwnMessage && chat.isGroup && !isConsecutive && (
                      <span className={`text-xs font-medium mb-0.5 px-3 ${nameColor}`}>{senderName}</span>
                  )}
                  {message.replyTo && allMessages[chat.id]?.find(m => m.id === message.replyTo) && (
                      <div className={`text-xs px-3 pt-1.5 pb-1 rounded-t-lg 
                            ${isOwnMessage ? 'bg-primary-400 text-primary-100' : 'bg-secondary-100 dark:bg-secondary-600 text-secondary-600 dark:text-secondary-300'}
                            border-b ${isOwnMessage ? 'border-primary-300' : 'border-secondary-200 dark:border-secondary-500'}
                            opacity-80 line-clamp-2`}>
                         <ReplyIcon className="w-3 h-3 inline-block mr-1 align-middle"/> 
                         {allMessages[chat.id].find(m => m.id === message.replyTo)?.text?.substring(0, 50) || "Original message"}...
                      </div>
                  )}
                  {message.forwardedFrom && (
                    <div className={`text-2xs px-3 pt-1 pb-0.5 rounded-t-lg 
                        ${isOwnMessage ? 'bg-primary-400/80 text-primary-100/90' : 'bg-secondary-100/80 dark:bg-secondary-600/80 text-secondary-500 dark:text-secondary-300/90'}
                        opacity-90`}>
                       <ShareIcon className="w-2.5 h-2.5 inline-block mr-1 align-middle"/> 
                       {t('chat.message_bubble.forwarded_from', {name: message.forwardedFrom.originalSenderName})}
                    </div>
                  )}

                  <div className={`px-3 py-2 rounded-xl ${bubbleClasses} relative min-w-[50px]`}>
                      {messageContent()}
                  </div>
                  
                  <div className={`text-2xs mt-0.5 px-1 ${isOwnMessage ? 'text-right text-primary-100/70' : 'text-left text-secondary-400 dark:text-secondary-500'}`}>
                    {formatTimestamp(message.timestamp, 'time')}
                    {isOwnMessage && message.readBy && message.readBy.length > 1 && (
                      message.readBy.length === chat.participants.length 
                        ? <DoubleCheckIcon className="inline-block ml-1 w-3.5 h-3.5 text-blue-400" title={t('chat.message_bubble.read_by_all')}/> 
                        : <DoubleCheckIcon className="inline-block ml-1 w-3.5 h-3.5" title={t('chat.message_bubble.delivered_read_some')}/>
                    )}
                    {isOwnMessage && message.readBy && message.readBy.length === 1 && !chat.isGroup && (
                        <CheckIcon className="inline-block ml-1 w-3.5 h-3.5" title={t('chat.message_bubble.sent')}/>
                    )}
                  </div>
              </div>

              {/* Message Actions */}
              {showActions && !message.isDeleted && !message.isDeletedGlobally && (
                <div className={`flex items-center space-x-0.5 self-center transition-opacity duration-150 ${isOwnMessage ? 'mr-1' : 'ml-1'}`}>
                    {isOwnMessage && message.type === MessageType.Text && (
                        <Button size="icon" variant="ghost" onClick={() => handleAction(MessageActionType.Edit)} className="p-1 opacity-70 hover:opacity-100" title={t('chat.message_bubble.edit_message')}>
                            <PencilIcon className="w-3.5 h-3.5"/>
                        </Button>
                    )}
                    <ReactionPicker messageId={message.id} onSelectReaction={(emoji) => onAddReaction(message.id, emoji)} />
                    {message.type !== MessageType.Like && (
                        <Button size="icon" variant="ghost" onClick={() => handleAction(MessageActionType.Reply)} className="p-1 opacity-70 hover:opacity-100" title={t('chat.message_bubble.reply')}>
                            <ReplyIcon className="w-3.5 h-3.5"/>
                        </Button>
                    )}
                    {isOwnMessage && (
                        <Button size="icon" variant="ghost" onClick={() => handleAction(MessageActionType.Delete)} className="p-1 opacity-70 hover:opacity-100 text-red-500" title={t('chat.message_bubble.delete_message')}>
                            <UiTrashIcon className="w-3.5 h-3.5"/>
                        </Button>
                    )}
                    {canDeleteForEveryone && (
                         <Button size="icon" variant="ghost" onClick={() => handleAction(MessageActionType.DeleteForEveryone)} className="p-1 opacity-70 hover:opacity-100 text-red-600" title={t('chat.message_bubble.delete_for_everyone')}>
                            <ArchiveBoxXMarkIcon className="w-3.5 h-3.5"/>
                        </Button>
                    )}
                </div>
              )}
          </div>
          {message.reactions && message.reactions.length > 0 && (
            <div className={`mt-0.5 ${isOwnMessage ? 'self-end mr-8' : 'self-start ml-8'}`}>
              <ReactionsDisplay reactions={message.reactions} currentUserId={currentUser.id} onReact={(emoji) => onAddReaction(message.id, emoji)} />
            </div>
          )}
        </div>
    );
};

const MessageArea: React.FC<{ 
    chat: Chat | undefined; 
    currentUser: User; 
    onBack?: () => void; 
    onViewProfile: (userId: string) => void; 
    onShowGroupInfo: (chatId: string) => void;
}> = ({ chat, currentUser, onBack, onViewProfile, onShowGroupInfo }) => {
    const { 
        messages: allMessages, sendMessage, fetchMessages, markMessagesAsRead, setTypingStatus, 
        initiateCall, addReaction, deleteMessageInChat, 
        toggleMuteUserPresenceInChat, deleteChatForCurrentUser, clearChatHistory, toggleMuteChat, updateChatBackground, canUserPerformActionInGroup
    } = useChat();
    const { getUserById } = useUserManagement();
    const { t, settings } = useSettings();

    const [messageText, setMessageText] = useState('');
    const [replyToMessage, setReplyToMessage] = useState<{ id: string, text: string } | null>(null);
    const [editingMessage, setEditingMessage] = useState<{id: string, text: string} | null>(null);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isConsolidatedMenuOpen, setIsConsolidatedMenuOpen] = useState(false);
    const [isSharedMediaModalOpen, setIsSharedMediaModalOpen] = useState(false);
    const [sharedMediaType, setSharedMediaType] = useState<SharedMediaType>('images');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const consolidatedMenuRef = useRef<HTMLDivElement>(null);

    const chatMessages = chat ? (allMessages[chat.id] || []) : [];

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (chat) {
            fetchMessages(chat.id);
            markMessagesAsRead(chat.id);
            scrollToBottom("auto");
        }
        setReplyToMessage(null); 
        setEditingMessage(null);
        setMessageText(''); 
    }, [chat?.id, fetchMessages, markMessagesAsRead]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages.length]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setIsEmojiPickerOpen(false);
          }
          if (consolidatedMenuRef.current && !consolidatedMenuRef.current.contains(event.target as Node)) {
            setIsConsolidatedMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if(editingMessage && inputRef.current) {
            setMessageText(editingMessage.text);
            inputRef.current.focus();
            inputRef.current.setSelectionRange(editingMessage.text.length, editingMessage.text.length);
        }
    }, [editingMessage]);

    const handleSendMessage = async (type: MessageType = MessageType.Text) => {
        if (!chat || (!messageText.trim() && type === MessageType.Text && !editingMessage)) return;

        const content = type === MessageType.Like ? '👍' : messageText.trim();
        const success = await sendMessage(
            chat.id, 
            content, 
            type, 
            undefined, 
            undefined, 
            undefined, 
            replyToMessage?.id,
            editingMessage?.id
        );
        if (typeof success === 'object' && !success.success && success.errorKey) {
            alert(t(success.errorKey));
        } else if (success) {
            setMessageText('');
            setReplyToMessage(null);
            setTypingStatus(chat.id, false);
            setEditingMessage(null);
            setIsEmojiPickerOpen(false);
        }
    };
    
    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
        if (chat && !editingMessage) { // Don't show typing if editing
            setTypingStatus(chat.id, e.target.value.length > 0);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleReply = (messageId: string, messageText: string) => {
        setEditingMessage(null); // Cancel editing if replying
        setReplyToMessage({ id: messageId, text: messageText });
        inputRef.current?.focus();
    };
    
    const handleEdit = (messageId: string, currentText: string) => {
        setReplyToMessage(null); // Cancel reply if editing
        setEditingMessage({ id: messageId, text: currentText});
    };
    
    const handleAddEmoji = (emoji: string) => {
        setMessageText(prev => prev + emoji);
        inputRef.current?.focus();
    };
    
    const handleToggleMutePresence = async (targetId: string) => {
        if (chat) await toggleMuteUserPresenceInChat(chat.id, targetId);
    };

    const handleDeleteChat = async () => {
        if (chat && window.confirm(t('chat.confirm_delete_chat_message', {name: chat.name || 'this chat'}))) {
            await deleteChatForCurrentUser(chat.id);
        }
        setIsConsolidatedMenuOpen(false);
    };

    const handleClearHistory = async () => {
        if (chat && window.confirm(t('chat.confirm_clear_chat_history', {name: chat.name || 'this chat'}))) {
            await clearChatHistory(chat.id);
        }
        setIsConsolidatedMenuOpen(false);
    };
    
    const handleToggleMuteChat = async () => {
        if (chat) await toggleMuteChat(chat.id);
        setIsConsolidatedMenuOpen(false);
    };
    
    const handleChangeChatBackground = async (backgroundId: string) => {
        if (chat) await updateChatBackground(chat.id, backgroundId);
    };

    if (!chat) {
        return <div className="flex-1 flex items-center justify-center text-secondary-500 dark:text-secondary-400 p-4">{t('chat.select_chat_prompt')}</div>;
    }

    const otherParticipant = chat.isGroup ? null : chat.participants.find(p => p.userId !== currentUser.id);
    const otherUserDetails = otherParticipant ? getUserById(otherParticipant.userId) : null;
    const isTargetUserPresenceMuted = otherParticipant ? (chat.mutedPresenceTargetUserIds?.includes(otherParticipant.userId) || false) : false;
    
    let isInputDisabled = false;
    let inputDisabledReasonKey: TranslationKey | null = null;
    if (chat.isGroup) {
        if (!canUserPerformActionInGroup(currentUser.id, chat, 'canSendMessages')) {
            isInputDisabled = true;
            inputDisabledReasonKey = 'groups.permissions.input_disabled_by_group_settings';
        }
    } else if (otherUserDetails && (currentUser.blockedUserIds?.includes(otherUserDetails.id) || otherUserDetails.blockedUserIds?.includes(currentUser.id))) {
        isInputDisabled = true;
        inputDisabledReasonKey = 'chat.cannot_message_blocked_user';
    }


    const typingUsers = Object.entries(chat.typing || {})
        .filter(([userId, isTyping]) => isTyping && userId !== currentUser.id)
        .map(([userId]) => getUserById(userId)?.nickname || t('general.unknown_user'));
    
    const currentChatBackground = CHAT_BACKGROUNDS.find(bg => bg.id === chat.backgroundId) || CHAT_BACKGROUNDS[0];
    const chatBackgroundClass = settings.theme === 'dark' && currentChatBackground.styleClass.includes('dark:') 
      ? currentChatBackground.styleClass 
      : (currentChatBackground.styleClass.split(' dark:')[0] || currentChatBackground.styleClass);


    return (
        <div className={`flex-1 flex flex-col h-full ${chatBackgroundClass} bg-cover bg-center transition-all duration-300`}>
            {/* Chat Header */}
            <header className="p-3 border-b border-secondary-200/50 dark:border-secondary-700/50 flex items-center space-x-3 bg-white/70 dark:bg-secondary-800/70 backdrop-blur-md sticky top-0 z-20">
                {onBack && <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-1"><ArrowLeftIcon /></Button>}
                <Avatar 
                    user={chat.isGroup ? { name: chat.name, avatarBgColor: chat.groupAvatarUrl, isGroupPlaceholder: true, groupImage: chat.groupImage } : otherUserDetails || UNKNOWN_USER_PLACEHOLDER}
                    size="md" 
                    showStatusIndicator={!chat.isGroup && !!otherUserDetails && shouldShowUserPresence(currentUser, otherUserDetails, isTargetUserPresenceMuted)}
                    status={otherUserDetails?.status}
                    onClick={() => chat.isGroup ? onShowGroupInfo(chat.id) : (otherUserDetails && onViewProfile(otherUserDetails.id))}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-secondary-800 dark:text-secondary-100 cursor-pointer" onClick={() => chat.isGroup ? onShowGroupInfo(chat.id) : (otherUserDetails && onViewProfile(otherUserDetails.id))}>
                        {chat.isGroup ? chat.name : (otherUserDetails ? otherUserDetails.name : t('general.unknown_user'))}
                    </h3>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400">
                      {chat.isGroup 
                        ? (typingUsers.length > 0 
                            ? (typingUsers.length === 1 ? t('chat.message_area.typing_indicator_one', {user: typingUsers[0]}) : t('chat.message_area.typing_indicator_many', {users: typingUsers.slice(0,2).join(', ') + (typingUsers.length > 2 ? '...' : '')}))
                            : t('chat.message_area.members', {count: chat.participants.length}))
                        : (otherUserDetails && shouldShowUserPresence(currentUser, otherUserDetails, isTargetUserPresenceMuted)
                            ? (typingUsers.length > 0 ? t('chat.message_area.typing_indicator_one', {user:typingUsers[0]}) : (otherUserDetails.status === UserStatus.Online ? t('chat.message_area.online') : (otherUserDetails.lastSeen ? t('chat.message_area.last_seen', {time: formatTimestamp(otherUserDetails.lastSeen, 'relative')}) : t('chat.message_area.offline'))))
                            : t('chat.message_area.offline'))
                      }
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    {chat.isGroup ? null : (
                        <Button variant="ghost" size="icon" onClick={() => otherUserDetails && initiateCall(chat.id, otherUserDetails.id, 'voice')} title={t('call.voice_call')}><PhoneIcon/></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => otherUserDetails && initiateCall(chat.id, otherUserDetails.id, 'video')} title={t('call.video_call')}><VideoCameraIcon/></Button>
                    
                    <div className="relative" ref={consolidatedMenuRef}>
                        <Button variant="ghost" size="icon" onClick={() => setIsConsolidatedMenuOpen(prev => !prev)} title={t('chat.consolidated_menu_chat_settings')}><EllipsisVerticalIcon/></Button>
                        {isConsolidatedMenuOpen && (
                            <DropdownMenu 
                                isOpen={isConsolidatedMenuOpen} 
                                onClose={() => setIsConsolidatedMenuOpen(false)} 
                                anchorRef={consolidatedMenuRef}
                                className="min-w-[200px]"
                            >
                                {chat.isGroup ? 
                                    <DropdownItem onClick={() => {onShowGroupInfo(chat.id); setIsConsolidatedMenuOpen(false);}}>{t('chat.message_area.group_info')}</DropdownItem>
                                    : (otherUserDetails && 
                                        <>
                                            <DropdownItem onClick={() => {onViewProfile(otherUserDetails.id); setIsConsolidatedMenuOpen(false);}}>{t('chat.message_area.view_profile')}</DropdownItem>
                                            <DropdownItem onClick={() => {handleToggleMutePresence(otherUserDetails.id); setIsConsolidatedMenuOpen(false);}}>
                                                {isTargetUserPresenceMuted ? t('chat.show_user_activity') : t('chat.hide_user_activity')}
                                            </DropdownItem>
                                        </>
                                    )
                                }
                                <DropdownItem onClick={() => setIsSharedMediaModalOpen(true)}>{t('chat.shared_media_title')}</DropdownItem>
                                <DropdownItem onClick={handleToggleMuteChat}> {chat.isMuted ? t('chat.unmute_chat') : t('chat.mute_chat')} </DropdownItem>
                                <DropdownItem onClick={() => { /* Open change background modal or sub-menu */ }}>{t('chat.change_background_title')}</DropdownItem>
                                <DropdownItem onClick={handleClearHistory} className="text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/30">{t('chat.consolidated_menu_clear_history')}</DropdownItem>
                                <DropdownItem onClick={handleDeleteChat} className="text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/30">{t('general.delete') + " " + t('chat.chats_title')}</DropdownItem>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </header>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-0.5 custom-scrollbar">
                {chatMessages.length === 0 && <p className="text-center text-sm text-secondary-500/80 dark:text-secondary-400/80 py-10">{t('chat.message_area.no_messages_yet')}</p>}
                {chatMessages.map((msg, index) => {
                    const sender = getUserById(msg.senderId);
                    const prevMessage = chatMessages[index - 1];
                    const isConsecutive = prevMessage && prevMessage.senderId === msg.senderId && 
                                        (new Date(msg.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 5 * 60 * 1000) && // 5 minutes
                                        prevMessage.type !== MessageType.System && prevMessage.type !== MessageType.CallLog &&
                                        !prevMessage.isDeleted && !prevMessage.isDeletedGlobally; 
                    return (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwnMessage={msg.senderId === currentUser.id} 
                            sender={sender || (msg.senderId === UNKNOWN_USER_PLACEHOLDER.id ? UNKNOWN_USER_PLACEHOLDER as User : null)}
                            chat={chat}
                            currentUser={currentUser}
                            allMessages={allMessages}
                            onReply={handleReply}
                            onDelete={deleteMessageInChat}
                            onAddReaction={(messageId, emoji) => addReaction(chat.id, messageId, emoji)}
                            onEdit={handleEdit}
                            onViewProfile={onViewProfile}
                            isConsecutive={isConsecutive}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <footer className="p-2 md:p-3 border-t border-secondary-200/50 dark:border-secondary-700/50 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm">
                {replyToMessage && (
                    <div className="mb-1.5 p-2 bg-secondary-100 dark:bg-secondary-700 rounded-md text-xs text-secondary-600 dark:text-secondary-300 flex justify-between items-center">
                        <span className="truncate">{t('chat.message_input.replying_to', { message: replyToMessage.text.substring(0,30) + '...' })}</span>
                        <Button variant="ghost" size="icon" onClick={() => setReplyToMessage(null)} className="p-0.5 -mr-1" title={t('chat.message_input.cancel_reply')}><XMarkIcon className="w-3.5 h-3.5"/></Button>
                    </div>
                )}
                {editingMessage && (
                     <div className="mb-1.5 p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded-md text-xs text-yellow-700 dark:text-yellow-300 flex justify-between items-center">
                        <span>{t('chat.message_input.editing_message')}</span>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingMessage(null); setMessageText('');}} className="p-0.5 -mr-1" title={t('profile.cancel')}><XMarkIcon className="w-3.5 h-3.5"/></Button>
                    </div>
                )}
                {isInputDisabled && inputDisabledReasonKey && (
                    <p className="text-xs text-center text-red-500 dark:text-red-400 mb-1">{t(inputDisabledReasonKey)}</p>
                )}
                <div className="flex items-end space-x-2">
                    <div className="relative" ref={emojiPickerRef}>
                         <Button variant="ghost" size="icon" onClick={() => setIsEmojiPickerOpen(prev => !prev)} title={t('chat.message_input.emoji')} disabled={isInputDisabled} aria-expanded={isEmojiPickerOpen}>
                             <FaceSmileIcon className="w-5 h-5"/>
                         </Button>
                         {isEmojiPickerOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-72 h-64 bg-white dark:bg-secondary-700 shadow-xl rounded-lg p-2 border border-secondary-200 dark:border-secondary-600 z-30">
                                <div className="grid grid-cols-8 gap-1 overflow-y-auto h-full custom-scrollbar pr-1">
                                    {MORE_EMOJIS_FOR_PICKER.map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => handleAddEmoji(emoji)} 
                                            className="p-1.5 text-xl hover:bg-secondary-100 dark:hover:bg-secondary-600 rounded-md transition-transform hover:scale-125 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            aria-label={`Add emoji ${emoji}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>
                    <Button variant="ghost" size="icon" title={t('chat.message_input.attach_file')} disabled={isInputDisabled}><PaperClipIcon className="w-5 h-5"/></Button>
                    <textarea
                        ref={inputRef}
                        value={messageText}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat.message_input.placeholder')}
                        aria-label={t('chat.message_input.placeholder')}
                        rows={1}
                        className="flex-1 p-2.5 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-secondary-700/80 text-secondary-900 dark:text-secondary-100 resize-none max-h-28 custom-scrollbar transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isInputDisabled}
                    />
                    <Button 
                        variant="primary" 
                        size="icon" 
                        onClick={() => handleSendMessage(messageText.trim() === '👍' ? MessageType.Like : MessageType.Text)} 
                        title={editingMessage ? t('chat.message_input.save_changes') : t('chat.message_input.send')} 
                        disabled={(!messageText.trim() && !editingMessage) || isInputDisabled}
                        className="p-2.5"
                    >
                        {editingMessage ? <CheckIcon className="w-5 h-5"/> : <PaperAirplaneIcon className="w-5 h-5"/>}
                    </Button>
                </div>
            </footer>
             {isSharedMediaModalOpen && chat && (
                <SharedMediaViewerModal
                    isOpen={isSharedMediaModalOpen}
                    onClose={() => setIsSharedMediaModalOpen(false)}
                    chatId={chat.id}
                    mediaType={sharedMediaType} 
                    messages={chatMessages}
                    t={t}
                />
            )}
        </div>
    );
};


const ChatPage: React.FC<ChatPageProps> = ({ initialView = 'chats' }) => {
  const { currentUser, logout: userLogout } = useAuth();
  const { 
    createOrOpenChat, activeChatId, getChatById, chats, 
    currentCallInfo, endCall: endCurrentCall,
    updateGroupDetails, updateGroupDefaultPermissions, updateMemberGroupPermissions, setGroupAdmins,
    kickUserFromGroup, banUserFromGroup, unbanUserFromGroup, addMembersToGroup,
    transferGroupOwnership, leaveGroup
  } = useChat();
  const { getUserById, users } = useUserManagement();
  const { t } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSidebarView, setActiveSidebarView] = useState<SidebarViewType>(initialView);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [isFriendRequestsModalOpen, setIsFriendRequestsModalOpen] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  useEffect(() => {
    // If a chat is active, hide list on mobile. If no chat, show list.
    if (activeChatId) {
        setIsMobileListVisible(false);
    } else {
        setIsMobileListVisible(true);
    }
  }, [activeChatId]);
  
  useEffect(() => {
      // Navigate to / for initialView='chats' or if path is just /
      // For other initialViews, navigate to their respective paths if not already there
      const currentPath = location.pathname.substring(1); // remove leading /
      if (initialView === 'chats' && currentPath !== '') {
          navigate('/', {replace: true});
      } else if (initialView !== 'chats' && initialView !== currentPath) {
          navigate(`/${initialView}`, {replace: true});
      }
  }, [initialView, navigate, location.pathname]);


  const handleViewChange = (view: SidebarViewType) => {
    setActiveSidebarView(view);
    if(view !== 'profile' && view !== 'settings' && view !== 'friend_requests') {
        setIsMobileListVisible(true); // Always show list panel when changing main views on mobile
    }
    navigate(view === 'chats' ? '/' : `/${view}`);
  };

  const handleUserSelect = async (userId: string) => {
    const newChatId = await createOrOpenChat(userId);
    if (newChatId) {
        setActiveSidebarView('chats');
        navigate('/');
        setIsMobileListVisible(false);
    }
  };
  
  const handleGroupSelect = (chatId: string) => {
    handleViewChange('chats'); // Switch to chats view
    // setActiveChatId is handled by ChatListItem's onClick
    setIsMobileListVisible(false);
  };
  
  const handleShowProfile = (userId: string) => {
    setProfileModalUserId(userId);
    setShowProfileModal(true);
  };

  const handleShowGroupInfo = (chatId: string) => {
    // setActiveChatId(chatId); // Ensure chat is active
    setIsGroupInfoModalOpen(true);
  };
  
  const handleMobileBackToList = () => {
    setIsMobileListVisible(true);
  };
  
  const activeChatDetails = activeChatId ? getChatById(activeChatId) : undefined;
  const friendRequestCount = currentUser?.friendRequestIdsReceived?.length || 0;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const renderActivePanel = () => {
    switch(activeSidebarView) {
      case 'contacts': return <ContactListPanel onNewChatRequest={() => handleViewChange('search')} onUserSelect={handleUserSelect}/>;
      case 'search': return <SearchUsersPanel onUserSelect={handleUserSelect}/>;
      case 'groups': return <GroupsPanel onGroupSelect={handleGroupSelect}/>;
      case 'profile': 
        setShowProfileModal(true); 
        setProfileModalUserId(currentUser.id);
        setActiveSidebarView('chats'); // Revert to chats view in background
        return <ChatListPanel onNewChatRequest={() => handleViewChange('search')}/>; 
      case 'friend_requests':
        setIsFriendRequestsModalOpen(true);
        setActiveSidebarView('chats'); // Revert to chats view in background
        return <ChatListPanel onNewChatRequest={() => handleViewChange('search')}/>;
      case 'chats':
      default:
        return <ChatListPanel onNewChatRequest={() => handleViewChange('search')}/>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar 
        activeView={activeSidebarView} 
        onViewChange={handleViewChange}
        onUserLogout={userLogout}
        currentUser={currentUser}
        friendRequestCount={friendRequestCount}
      />
      {/* Mobile: Conditional rendering of list panel or message area */}
      {/* Desktop: Always show list panel */}
      <div className={`md:flex flex-1 min-w-0 ${isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
          {renderActivePanel()}
      </div>

      <div className={`flex-1 min-w-0 ${isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
        {activeChatId && activeChatDetails ? (
            <MessageArea 
                chat={activeChatDetails} 
                currentUser={currentUser} 
                onBack={handleMobileBackToList} 
                onViewProfile={handleShowProfile} 
                onShowGroupInfo={handleShowGroupInfo}
            />
        ) : (
            <div className="flex-1 hidden md:flex items-center justify-center text-secondary-500 dark:text-secondary-400 p-4 bg-secondary-100 dark:bg-secondary-900">
                {t('chat.select_chat_prompt')}
            </div>
        )}
      </div>

      {showProfileModal && profileModalUserId && (
        <ProfilePage 
            isOpen={showProfileModal} 
            onClose={() => {setShowProfileModal(false); setProfileModalUserId(null);}} 
            userId={profileModalUserId} 
            viewMode={profileModalUserId === currentUser.id ? 'edit' : 'view'}
        />
      )}
      {isGroupInfoModalOpen && activeChatDetails && activeChatDetails.isGroup && (
          <GroupInfoModal 
            isOpen={isGroupInfoModalOpen}
            onClose={() => setIsGroupInfoModalOpen(false)}
            chat={activeChatDetails}
            currentUser={currentUser}
            getParticipantDetails={getUserById}
            onUpdateGroupDetails={updateGroupDetails}
            onUpdateGroupDefaultPermissions={updateGroupDefaultPermissions}
            onUpdateMemberGroupPermissions={updateMemberGroupPermissions}
            onSetGroupAdmins={setGroupAdmins}
            onKickUser={kickUserFromGroup}
            onBanUser={banUserFromGroup}
            onUnbanUser={unbanUserFromGroup}
            onAddMembers={addMembersToGroup}
            onTransferOwnership={transferGroupOwnership}
            onLeaveGroup={leaveGroup}
            t={t}
          />
      )}
      {isFriendRequestsModalOpen && (
        <FriendRequestsModal 
            isOpen={isFriendRequestsModalOpen}
            onClose={() => setIsFriendRequestsModalOpen(false)}
            currentUserId={currentUser.id}
            friendRequestsReceived={currentUser.friendRequestIdsReceived || []}
            onAcceptRequest={useAuth().acceptFriendRequest}
            onRejectRequest={useAuth().rejectFriendRequest}
            getUserById={getUserById}
        />
      )}
      {currentCallInfo.status !== 'idle' && (
        <VideoCallModal
          isOpen={currentCallInfo.status !== 'ended'}
          callInfo={currentCallInfo}
          currentUser={currentUser}
          onEndCall={endCurrentCall}
          t={t}
        />
      )}
    </div>
  );
};

export default ChatPage;