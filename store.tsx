
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Chat, Message, AuthContextType, ChatContextType, UserManagementContextType, SettingsContextType, Theme, UserStatus, MessageType, AppSettings, Language, MessageReaction, FontSize, ChatParticipant, TranslationKey, CurrentCallInfo, CallType, StatusVideo, StatusReply, PresenceVisibility, SignupPayload, SignupCompletionResult, SignupResultReason, MessagingPrivacy, GroupPermissions } from './types'; 
import { AVATAR_COLORS, DEFAULT_APP_SETTINGS, UNKNOWN_USER_PLACEHOLDER, DEFAULT_GROUP_PERMISSIONS } from './constants'; 
import { generateToken, decodeToken, generateId, getRandomColor, getInitials, formatTimestamp } from './utils';
import { translationsData } from './translations'; 

const ALL_USERS_STORAGE_KEY = 'titanChatAllUsers';
const GLOBAL_CHATS_STORAGE_KEY = 'titanChatAllChatsGlobal'; 
const GLOBAL_MESSAGES_STORAGE_KEY = 'titanChatAllMessagesGlobal'; 
const APP_SETTINGS_STORAGE_KEY_PREFIX = 'titanChatAppSettings_'; 
const ADMIN_EMAIL = 'admin@example.com';
const DELETE_FOR_EVERYONE_TIME_LIMIT_MS = 10 * 60 * 1000; // 10 minutes

// --- User Management Context ---
const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    let initialUsers: User[] = [];
    try {
      const storedUsers = localStorage.getItem(ALL_USERS_STORAGE_KEY);
      if (storedUsers) {
        initialUsers = JSON.parse(storedUsers).map((u: User) => ({
            ...u,
            blockedUserIds: u.blockedUserIds || [],
            statusVideos: u.statusVideos || [],
            friendRequestIdsSent: u.friendRequestIdsSent || [],
            friendRequestIdsReceived: u.friendRequestIdsReceived || [],
            friendIds: u.friendIds || [],
            presenceVisibility: u.presenceVisibility || PresenceVisibility.Everyone, 
            messagingPrivacy: u.messagingPrivacy || MessagingPrivacy.Everyone, 
        }));
      }
    } catch (error) {
      console.error("Failed to parse users from localStorage:", error);
    }

    const adminUserExists = initialUsers.some(u => u.email === ADMIN_EMAIL);
    if (!adminUserExists) {
        const adminUser: User = {
            id: generateId(),
            name: "Titan Admin",
            nickname: "titanadmin",
            email: ADMIN_EMAIL,
            passwordHash: "admin", 
            avatarBgColor: getRandomColor(AVATAR_COLORS, "AdminSeed"),
            isAdmin: true,
            status: UserStatus.Offline,
            joinedAt: new Date().toISOString(),
            blockedUserIds: [],
            statusVideos: [],
            friendRequestIdsSent: [],
            friendRequestIdsReceived: [],
            friendIds: [],
            presenceVisibility: PresenceVisibility.Nobody, 
            messagingPrivacy: MessagingPrivacy.Everyone, 
        };
        initialUsers.push(adminUser);
    }
    
    if (initialUsers.length === 0 && !localStorage.getItem(ALL_USERS_STORAGE_KEY)) {
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify([])); 
    }
    return initialUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Failed to save users to localStorage:", error);
    }
  }, [users]);

  const getUserById = useCallback((userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  }, [users]);

  const updateUser = useCallback(async (userId: string, updatedData: Partial<User>): Promise<boolean> => {
    if (updatedData.nickname) {
        const currentUserData = users.find(u => u.id === userId);
        if (currentUserData && currentUserData.nickname !== updatedData.nickname) {
            const nicknameExists = users.some(u => u.id !== userId && u.nickname === updatedData.nickname);
            if (nicknameExists) {
                console.error("Nickname already taken by another user.");
                return false; 
            }
        }
    }
    await new Promise(resolve => setTimeout(resolve, 100)); 
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updatedData } : u));
    return true;
  }, [users, setUsers]);

  const deleteUserByAdmin = useCallback(async (userId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300)); 
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    return true;
  }, [setUsers]);

  const addStatusVideo = useCallback(async (userId: string, videoUrl: string, caption?: string): Promise<boolean> => {
    const newStatus: StatusVideo = {
      id: generateId(),
      userId,
      videoUrl,
      caption,
      createdAt: new Date().toISOString(),
      views: [],
      likes: [],
      replies: [],
    };
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === userId ? { ...u, statusVideos: [...(u.statusVideos || []), newStatus] } : u
    ));
    return true;
  }, [setUsers]);

  const likeStatusVideo = useCallback(async (ownerUserId: string, statusId: string, likerUserId: string): Promise<boolean> => {
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === ownerUserId) {
        const statusVideos = (u.statusVideos || []).map(sv => {
          if (sv.id === statusId) {
            const alreadyLiked = sv.likes.includes(likerUserId);
            return {
              ...sv,
              likes: alreadyLiked ? sv.likes.filter(id => id !== likerUserId) : [...sv.likes, likerUserId],
            };
          }
          return sv;
        });
        return { ...u, statusVideos };
      }
      return u;
    }));
    return true;
  }, [setUsers]);

  const addStatusReply = useCallback(async (ownerUserId: string, statusId: string, replierUserId: string, text: string): Promise<boolean> => {
    const newReply: StatusReply = {
      id: generateId(),
      senderId: replierUserId,
      text,
      timestamp: new Date().toISOString(),
    };
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === ownerUserId) {
        const statusVideos = (u.statusVideos || []).map(sv => {
          if (sv.id === statusId) {
            return { ...sv, replies: [...sv.replies, newReply] };
          }
          return sv;
        });
        return { ...u, statusVideos };
      }
      return u;
    }));
    return true;
  }, [setUsers]);

  const markStatusAsViewed = useCallback(async (ownerUserId: string, statusId: string, viewerUserId: string): Promise<boolean> => {
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === ownerUserId) {
        const statusVideos = (u.statusVideos || []).map(sv => {
          if (sv.id === statusId && !sv.views.includes(viewerUserId)) {
            return { ...sv, views: [...sv.views, viewerUserId] };
          }
          return sv;
        });
        return { ...u, statusVideos };
      }
      return u;
    }));
    return true;
  }, [setUsers]);


  return (
    <UserManagementContext.Provider value={{ users, setUsers, getUserById, updateUser, deleteUserByAdmin, addStatusVideo, likeStatusVideo, addStatusReply, markStatusAsViewed }}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = (): UserManagementContextType => {
  const context = useContext(UserManagementContext);
  if (!context) throw new Error('useUserManagement must be used within a UserProvider');
  return context;
};

// --- Auth Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('titanChatToken'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { users: allUsersGlobal, setUsers: setAllUsersGlobal, updateUser: updateUserInGlobalList, getUserById } = useUserManagement();

  useEffect(() => {
    if (token && allUsersGlobal.length > 0) { 
      const decodedUser = decodeToken(token, allUsersGlobal);
      setCurrentUser(decodedUser);
      if (decodedUser && updateUserInGlobalList && decodedUser.status !== UserStatus.Online) {
         updateUserInGlobalList(decodedUser.id, { status: UserStatus.Online, lastSeen: new Date().toISOString() });
      }
    } else if (!token) {
        setCurrentUser(null);
    }
  }, [token, allUsersGlobal, updateUserInGlobalList]);


  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    if (!allUsersGlobal) return false;
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const user = allUsersGlobal.find(u => u.email === email && u.passwordHash === pass); 
    if (user) {
      const userToken = generateToken(user);
      setCurrentUser(user);
      setToken(userToken);
      localStorage.setItem('titanChatToken', userToken);
      if (updateUserInGlobalList) {
        updateUserInGlobalList(user.id, { status: UserStatus.Online, lastSeen: new Date().toISOString() });
      }
      return true;
    }
    return false;
  }, [allUsersGlobal, setToken, setCurrentUser, updateUserInGlobalList]);

  const signup = useCallback(async (userData: SignupPayload): Promise<SignupCompletionResult> => {
    if (!allUsersGlobal || !setAllUsersGlobal) return { success: false, reason: 'unknown_error' };
    await new Promise(resolve => setTimeout(resolve, 500));

    const emailExists = allUsersGlobal.some(u => u.email === userData.email);
    const nicknameExists = allUsersGlobal.some(u => u.nickname === userData.nickname);

    if (emailExists && nicknameExists) {
      console.warn("User with this email AND nickname already exists");
      return { success: false, reason: 'duplicate_both' };
    }
    if (emailExists) {
      console.warn("User with this email already exists");
      return { success: false, reason: 'duplicate_email' };
    }
    if (nicknameExists) {
      console.warn("User with this nickname already exists");
      return { success: false, reason: 'duplicate_nickname' };
    }

    const newUser: User = {
      id: generateId(),
      ...userData,
      avatarBgColor: getRandomColor(AVATAR_COLORS, userData.avatarInitialColorSeed || userData.name),
      isAdmin: false, 
      status: UserStatus.Online,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      customStatus: "",
      bio: "", 
      blockedUserIds: [],
      statusVideos: [],
      friendRequestIdsSent: [],
      friendRequestIdsReceived: [],
      friendIds: [],
      presenceVisibility: PresenceVisibility.Everyone, 
      messagingPrivacy: MessagingPrivacy.Everyone, 
    };
    
    setAllUsersGlobal(prev => [...prev, newUser]);
    
    const userToken = generateToken(newUser);
    setCurrentUser(newUser);
    setToken(userToken);
    localStorage.setItem('titanChatToken', userToken);
    return { success: true };
  }, [allUsersGlobal, setAllUsersGlobal, setToken, setCurrentUser]);

  const logout = useCallback(() => {
    if (currentUser && updateUserInGlobalList) {
        updateUserInGlobalList(currentUser.id, { status: UserStatus.Offline, lastSeen: new Date().toISOString() });
    }
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('titanChatToken');
    if (currentUser?.id) {
        localStorage.removeItem(`${APP_SETTINGS_STORAGE_KEY_PREFIX}${currentUser.id}`);
    }
  }, [currentUser, updateUserInGlobalList, setCurrentUser, setToken]);

  const updateCurrentUser = useCallback(async (updatedData: Partial<Pick<User, 'name' | 'nickname' | 'avatarUrl' | 'avatarBgColor' | 'customStatus' | 'bio' | 'blockedUserIds' | 'statusVideos' | 'friendRequestIdsSent' | 'friendRequestIdsReceived' | 'friendIds' | 'presenceVisibility' | 'passwordHash' | 'messagingPrivacy'>>): Promise<boolean> => {
    if (!currentUser || !updateUserInGlobalList) return false;
    
    const success = await updateUserInGlobalList(currentUser.id, updatedData);
    if (success) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    }
    return success;
  }, [currentUser, updateUserInGlobalList, setCurrentUser]);
  
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    if (!currentUser || !setAllUsersGlobal) return false;
    const currentUserId = currentUser.id;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setAllUsersGlobal(prevUsers => prevUsers.filter(u => u.id !== currentUserId));
        
    const storedGlobalChats = localStorage.getItem(GLOBAL_CHATS_STORAGE_KEY);
    if (storedGlobalChats) {
      let allGlobalChats: Chat[] = JSON.parse(storedGlobalChats);
      allGlobalChats = allGlobalChats.map(chat => {
          const userParticipantIndex = chat.participants.findIndex(p => p.userId === currentUserId);
          if (userParticipantIndex !== -1) {
              if (chat.participants.length === 1) return null; 
              chat.participants.splice(userParticipantIndex, 1); 
              if (chat.isGroup && chat.ownerId === currentUserId) {
                  if (chat.participants.length > 0) {
                      const otherAdmins = chat.groupAdminIds.filter(id => id !== currentUserId && chat.participants.some(p => p.userId === id));
                      if (otherAdmins.length > 0) {
                          chat.ownerId = otherAdmins[0];
                      } else if (chat.participants.length > 0) { 
                          chat.ownerId = chat.participants[0].userId;
                          if(!chat.groupAdminIds.includes(chat.participants[0].userId)) {
                            chat.groupAdminIds.push(chat.participants[0].userId);
                          }
                      } else { 
                          return null; 
                      }
                  } else { 
                      return null; 
                  }
              }
              chat.groupAdminIds = chat.groupAdminIds.filter(id => id !== currentUserId);
          }
          return chat;
      }).filter(Boolean) as Chat[];
      localStorage.setItem(GLOBAL_CHATS_STORAGE_KEY, JSON.stringify(allGlobalChats));
    }

    const storedGlobalMessages = localStorage.getItem(GLOBAL_MESSAGES_STORAGE_KEY);
    if (storedGlobalMessages) {
        let allGlobalMessages: { [chatId: string]: Message[] } = JSON.parse(storedGlobalMessages);
        for (const chatId in allGlobalMessages) {
            allGlobalMessages[chatId] = allGlobalMessages[chatId].map(msg => {
                if (msg.senderId === currentUserId) {
                    return { ...msg, senderId: UNKNOWN_USER_PLACEHOLDER.id || 'deleted_user', text: "Message from a deleted user.", type: MessageType.System, reactions:[], isDeleted: true, isDeletedGlobally: true };
                }
                return msg;
            });
        }
        localStorage.setItem(GLOBAL_MESSAGES_STORAGE_KEY, JSON.stringify(allGlobalMessages));
    }

    localStorage.removeItem(`${APP_SETTINGS_STORAGE_KEY_PREFIX}${currentUserId}`);
    logout(); 
    return true;
  }, [currentUser, setAllUsersGlobal, logout]);

  const blockUser = useCallback(async (userIdToBlock: string): Promise<boolean> => {
    if (!currentUser) return false;
    const currentBlockedIds = currentUser.blockedUserIds || [];
    if (currentBlockedIds.includes(userIdToBlock)) return true; 

    const newBlockedIds = [...currentBlockedIds, userIdToBlock];
    return updateCurrentUser({ blockedUserIds: newBlockedIds });
  }, [currentUser, updateCurrentUser]);

  const unblockUser = useCallback(async (userIdToUnblock: string): Promise<boolean> => {
    if (!currentUser) return false;
    const currentBlockedIds = currentUser.blockedUserIds || [];
    if (!currentBlockedIds.includes(userIdToUnblock)) return true; 

    const newBlockedIds = currentBlockedIds.filter(id => id !== userIdToUnblock);
    return updateCurrentUser({ blockedUserIds: newBlockedIds });
  }, [currentUser, updateCurrentUser]);

  const sendFriendRequest = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!currentUser || !updateUserInGlobalList || !getUserById) return false;
    const targetUser = getUserById(targetUserId);
    if (!targetUser) return false;

    if (currentUser.friendIds?.includes(targetUserId) || 
        currentUser.friendRequestIdsSent?.includes(targetUserId) || 
        currentUser.friendRequestIdsReceived?.includes(targetUserId) ||
        targetUser.friendRequestIdsSent?.includes(currentUser.id) 
    ) {
        return false;
    }

    const updatedCurrentUserSuccess = await updateUserInGlobalList(currentUser.id, {
      friendRequestIdsSent: [...(currentUser.friendRequestIdsSent || []), targetUserId]
    });
    const updatedTargetUserSuccess = await updateUserInGlobalList(targetUserId, {
      friendRequestIdsReceived: [...(targetUser.friendRequestIdsReceived || []), currentUser.id]
    });

    if (updatedCurrentUserSuccess && updatedTargetUserSuccess) {
        setCurrentUser(prev => prev ? {...prev, friendRequestIdsSent: [...(prev.friendRequestIdsSent || []), targetUserId]} : null);
        return true;
    }
    return false;
  }, [currentUser, updateUserInGlobalList, getUserById, setCurrentUser]);

  const acceptFriendRequest = useCallback(async (requesterId: string): Promise<boolean> => {
    if (!currentUser || !updateUserInGlobalList || !getUserById) return false;
    const requesterUser = getUserById(requesterId);
    if (!requesterUser) return false;

    const updatedCurrentUserSuccess = await updateUserInGlobalList(currentUser.id, {
      friendIds: [...(currentUser.friendIds || []), requesterId],
      friendRequestIdsReceived: (currentUser.friendRequestIdsReceived || []).filter(id => id !== requesterId)
    });
    const updatedRequesterUserSuccess = await updateUserInGlobalList(requesterId, {
      friendIds: [...(requesterUser.friendIds || []), currentUser.id],
      friendRequestIdsSent: (requesterUser.friendRequestIdsSent || []).filter(id => id !== currentUser.id)
    });

    if (updatedCurrentUserSuccess && updatedRequesterUserSuccess) {
      setCurrentUser(prev => prev ? {
          ...prev, 
          friendIds: [...(prev.friendIds || []), requesterId],
          friendRequestIdsReceived: (prev.friendRequestIdsReceived || []).filter(id => id !== requesterId)
        } : null);
      return true;
    }
    return false;
  }, [currentUser, updateUserInGlobalList, getUserById, setCurrentUser]);

  const rejectFriendRequest = useCallback(async (requesterId: string): Promise<boolean> => {
    if (!currentUser || !updateUserInGlobalList || !getUserById) return false;
    const requesterUser = getUserById(requesterId);
    if (!requesterUser) return false;

    const updatedCurrentUserSuccess = await updateUserInGlobalList(currentUser.id, {
      friendRequestIdsReceived: (currentUser.friendRequestIdsReceived || []).filter(id => id !== requesterId)
    });
    const updatedRequesterUserSuccess = await updateUserInGlobalList(requesterId, {
      friendRequestIdsSent: (requesterUser.friendRequestIdsSent || []).filter(id => id !== currentUser.id)
    });
    
    if (updatedCurrentUserSuccess && updatedRequesterUserSuccess) {
      setCurrentUser(prev => prev ? {
          ...prev, 
          friendRequestIdsReceived: (prev.friendRequestIdsReceived || []).filter(id => id !== requesterId)
        } : null);
      return true;
    }
    return false;
  }, [currentUser, updateUserInGlobalList, getUserById, setCurrentUser]);
  
  const unfriendUser = useCallback(async (friendId: string): Promise<boolean> => {
    if (!currentUser || !updateUserInGlobalList || !getUserById) return false;
    const friendUser = getUserById(friendId);
    if (!friendUser) return false;

    const updatedCurrentUserSuccess = await updateUserInGlobalList(currentUser.id, {
      friendIds: (currentUser.friendIds || []).filter(id => id !== friendId),
    });
    const updatedFriendUserSuccess = await updateUserInGlobalList(friendId, {
      friendIds: (friendUser.friendIds || []).filter(id => id !== currentUser.id),
    });

    if (updatedCurrentUserSuccess && updatedFriendUserSuccess) {
      setCurrentUser(prev => prev ? {
          ...prev, 
          friendIds: (prev.friendIds || []).filter(id => id !== friendId),
        } : null);
      return true;
    }
    return false;
  }, [currentUser, updateUserInGlobalList, getUserById, setCurrentUser]);

  const getAdminUser = useCallback(() => {
    return allUsersGlobal.find(u => u.email === ADMIN_EMAIL && u.isAdmin);
  }, [allUsersGlobal]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; errorKey?: TranslationKey }> => {
    if (!currentUser) return { success: false, errorKey: 'general.error' };
    if (currentUser.passwordHash !== currentPassword) { 
      return { success: false, errorKey: 'settings.error_incorrect_current_password' };
    }
    if (newPassword.length < 6) {
        return { success: false, errorKey: 'settings.error_new_password_length'};
    }

    const success = await updateCurrentUser({ passwordHash: newPassword });
    if (success) {
      return { success: true };
    }
    return { success: false, errorKey: 'general.error' };
  }, [currentUser, updateCurrentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, token, login, signup, logout, updateCurrentUser, deleteAccount, blockUser, unblockUser, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriendUser, getAdminUser, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


// --- Chat Context ---
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { getUserById, users } = useUserManagement(); 
  const [chats, setChats] = useState<Chat[]>([]); 
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({}); 
  const [currentCallInfo, setCurrentCallInfo] = useState<CurrentCallInfo>({
    chatId: null,
    targetUserId: null,
    targetUserName: null,
    type: null,
    status: 'idle',
    callStartTime: undefined,
    isReceivingCall: false,
    localStream: null,
    remoteStream: null,
  });

  useEffect(() => {
    if (currentUser) {
      try {
        const storedGlobalChats = localStorage.getItem(GLOBAL_CHATS_STORAGE_KEY);
        let allGlobalChats: Chat[] = storedGlobalChats ? JSON.parse(storedGlobalChats) : [];
        
        allGlobalChats = allGlobalChats.map(c => ({ 
            ...c,
            unreadCounts: c.unreadCounts || {},
            groupAdminIds: c.groupAdminIds || (c.ownerId ? [c.ownerId] : []),
            groupBannedUserIds: c.groupBannedUserIds || [],
            ownerId: c.ownerId || c.createdBy,
            mutedPresenceTargetUserIds: c.mutedPresenceTargetUserIds || [],
            isMuted: c.isMuted || false,
            backgroundId: c.backgroundId || 'default',
            defaultPermissions: c.isGroup ? { ...DEFAULT_GROUP_PERMISSIONS, ...(c.defaultPermissions || {}) } : undefined,
            memberPermissionOverrides: c.isGroup ? (c.memberPermissionOverrides || {}) : undefined,
        }));

        const userChats = allGlobalChats.filter(chat =>
          chat.participants.some(p => p.userId === currentUser.id)
        );
        setChats(userChats);
      } catch (error) {
        console.error("Failed to parse global chats from localStorage:", error);
        setChats([]);
      }
    } else {
      setChats([]);
    }
  }, [currentUser, users]); 

  useEffect(() => {
    if (currentUser) {
      try {
        const storedGlobalMessages = localStorage.getItem(GLOBAL_MESSAGES_STORAGE_KEY);
        setMessages(storedGlobalMessages ? JSON.parse(storedGlobalMessages) : {});
      } catch (error) {
        console.error("Failed to parse global messages from localStorage:", error);
        setMessages({});
      }
    } else {
      setMessages({});
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
        try {
            const storedGlobalChats = localStorage.getItem(GLOBAL_CHATS_STORAGE_KEY);
            let allGlobalChats: Chat[] = storedGlobalChats ? JSON.parse(storedGlobalChats) : [];
            const globalChatsMap = new Map(allGlobalChats.map(c => [c.id, c]));
            chats.forEach(localChat => {
                globalChatsMap.set(localChat.id, localChat);
            });
            localStorage.setItem(GLOBAL_CHATS_STORAGE_KEY, JSON.stringify(Array.from(globalChatsMap.values())));
        } catch (error) {
            console.error("Failed to save global chats to localStorage:", error);
        }
    }
  }, [chats, currentUser]);

  useEffect(() => {
    if (currentUser) {
        try {
            const storedGlobalMessages = localStorage.getItem(GLOBAL_MESSAGES_STORAGE_KEY);
            let allGlobalMessages: { [chatId: string]: Message[] } = storedGlobalMessages ? JSON.parse(storedGlobalMessages) : {};
            Object.keys(messages).forEach(chatId => {
                allGlobalMessages[chatId] = messages[chatId];
            });
            localStorage.setItem(GLOBAL_MESSAGES_STORAGE_KEY, JSON.stringify(allGlobalMessages));
        } catch (error) {
            console.error("Failed to save global messages to localStorage:", error);
        }
    }
  }, [messages, currentUser]);


  const getChatById = useCallback((chatId: string) => {
    return chats.find(c => c.id === chatId);
  }, [chats]);

  const canUserPerformActionInGroup = useCallback((userId: string, chat: Chat | undefined, action: keyof GroupPermissions): boolean => {
    if (!chat || !chat.isGroup || !chat.defaultPermissions) return true; // Default to true if not a group or no permissions set (should not happen for groups)

    const userIsOwner = chat.ownerId === userId;
    if (userIsOwner) {
        // Owner can do almost anything, except maybe things that require other specific states.
        // For these specific permissions, owner has full rights.
        if (action === 'canPinMessages' || action === 'canChangeGroupInfo' || action === 'canAddMembers') return true;
    }

    const userIsAdmin = chat.groupAdminIds.includes(userId);

    // Check member-specific overrides first
    const memberOverrides = chat.memberPermissionOverrides?.[userId];
    if (memberOverrides && typeof memberOverrides[action] === 'boolean') {
      return memberOverrides[action]!;
    }

    // Fallback to default group permissions
    // Some actions are admin-only by default in the DEFAULT_GROUP_PERMISSIONS constant
    // but the `defaultPermissions` on the chat object is the source of truth for the group's current setting.
    if (action === 'canPinMessages' || action === 'canChangeGroupInfo' || action === 'canAddMembers') {
        // If the group default allows everyone, then true. Otherwise, only if user is admin.
        return chat.defaultPermissions[action] ? true : userIsAdmin;
    }
    
    // For other actions, use the direct boolean value from defaultPermissions
    return chat.defaultPermissions[action];
  }, []);


  const fetchMessages = useCallback(async (chatId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100)); 
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId] || [] 
    }));
  }, []);

  const sendMessage = useCallback(async (
    chatId: string, 
    content: string, 
    type: MessageType = MessageType.Text, 
    fileName?: string,
    fileSize?: number,
    fileType?: string,
    replyTo?: string,
    editingMessageId?: string,
    callDuration?: string,
    forwardedFrom?: Message['forwardedFrom']
  ): Promise<boolean | { success: boolean; errorKey?: TranslationKey }> => {
    if (!currentUser) return { success: false };

    const chatToUpdate = getChatById(chatId); 
    if (!chatToUpdate) return { success: false };
    
    // Permission checks for group chats
    if (chatToUpdate.isGroup && type !== MessageType.CallLog && type !== MessageType.System) {
        const isMedia = type === MessageType.Image || type === MessageType.Video;
        const isFile = type === MessageType.File;
        // Basic message sending (text, like, link, sticker/gif)
        if (!canUserPerformActionInGroup(currentUser.id, chatToUpdate, 'canSendMessages')) {
            return { success: false, errorKey: 'chat.permission_denied_admins_only' }; // Or a more specific key
        }
        if (isMedia && !canUserPerformActionInGroup(currentUser.id, chatToUpdate, 'canSendMedia')) {
            return { success: false, errorKey: 'chat.permission_denied_admins_only' };
        }
        if (isFile && !canUserPerformActionInGroup(currentUser.id, chatToUpdate, 'canSendFiles')) {
            return { success: false, errorKey: 'chat.permission_denied_admins_only' };
        }
        // Links and Stickers/GIFs are tied to canSendMessages for this iteration.
        // A more granular check can be added if these permissions diverge.
    }


    if (type !== MessageType.CallLog && type !== MessageType.System) { 
        if (!chatToUpdate.isGroup) {
            const otherParticipant = chatToUpdate.participants.find(p => p.userId !== currentUser.id);
            if (otherParticipant) {
                const otherUser = getUserById(otherParticipant.userId);
                if (currentUser.blockedUserIds?.includes(otherParticipant.userId) || otherUser?.blockedUserIds?.includes(currentUser.id)) {
                    return { success: false, errorKey: 'chat.cannot_message_blocked_user' }; 
                }
                if (otherUser?.messagingPrivacy === MessagingPrivacy.FriendsOnly && !currentUser.friendIds?.includes(otherUser.id)) {
                    return { success: false, errorKey: 'chat.error_messaging_friends_only' };
                }
            }
        } else { 
            if (chatToUpdate.groupBannedUserIds?.includes(currentUser.id)) {
                return { success: false, errorKey: 'chat.you_are_blocked_message' };
            }
            // The canUserPerformActionInGroup checks above handle group send permissions
        }
    }

    if (editingMessageId) {
        setMessages(prev => {
            const chatMessages = prev[chatId] || [];
            const updatedMessages = chatMessages.map(msg => 
                msg.id === editingMessageId ? { ...msg, text: content, type: MessageType.Text, isEdited: true, timestamp: new Date().toISOString() } : msg
            );
            return { ...prev, [chatId]: updatedMessages };
        });
        setChats(prevChats => prevChats.map(c => {
            if (c.id === chatId && c.lastMessage?.id === editingMessageId) {
                return { ...c, lastMessage: { ...c.lastMessage, text: content, type: MessageType.Text, isEdited: true, timestamp: new Date().toISOString() } as Message };
            }
            return c;
        }).sort((a,b) => new Date(b.lastMessage?.timestamp || b.createdAt).getTime() - new Date(a.lastMessage?.timestamp || a.createdAt).getTime()));
        return { success: true };
    }

    const newMessage: Message = {
      id: generateId(),
      chatId,
      senderId: currentUser.id,
      text: content,
      type,
      fileName: type === MessageType.File ? fileName : undefined,
      fileSize: type === MessageType.File ? fileSize : undefined,
      fileType: type === MessageType.File ? fileType : undefined,
      callDuration: type === MessageType.CallLog ? callDuration : undefined,
      replyTo: replyTo, 
      timestamp: new Date().toISOString(),
      reactions: [],
      readBy: type === MessageType.CallLog ? chatToUpdate.participants.map(p => p.userId) : [currentUser.id],
      forwardedFrom: forwardedFrom,
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));
    
    setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
            const updatedUnreadCounts = { ...c.unreadCounts };
            if (type !== MessageType.CallLog && type !== MessageType.System) { 
                c.participants.forEach(p => {
                    if (p.userId !== currentUser.id) {
                        updatedUnreadCounts[p.userId] = (updatedUnreadCounts[p.userId] || 0) + 1;
                    }
                });
            }
            return { 
                ...c, 
                lastMessage: newMessage, 
                lastMessageSenderName: chatToUpdate.isGroup && type !== MessageType.CallLog && type !== MessageType.System ? currentUser.nickname : undefined,
                unreadCounts: updatedUnreadCounts 
            };
        }
        return c;
      }).sort((a,b) => new Date(b.lastMessage?.timestamp || b.createdAt).getTime() - new Date(a.lastMessage?.timestamp || a.createdAt).getTime())
    );
    return { success: true };
  }, [currentUser, chats, getChatById, getUserById, setChats, setMessages, canUserPerformActionInGroup]);
  
  const createOrOpenChat = useCallback(async (otherUserId: string, isFriendshipChat: boolean = true): Promise<string | null> => {
    if (!currentUser || !getUserById) return null;
    const otherUser = getUserById(otherUserId);
    if (!otherUser) {
        console.error("Other user not found");
        return null;
    }

    if (currentUser.blockedUserIds?.includes(otherUserId) || otherUser.blockedUserIds?.includes(currentUser.id)) {
      console.warn("Cannot open chat: User is blocked or has blocked you.");
      return null;
    }

    if (otherUser.messagingPrivacy === MessagingPrivacy.FriendsOnly && !currentUser.friendIds?.includes(otherUser.id)) {
        console.warn("Cannot initiate chat: Recipient only accepts messages from friends.");
        return null; 
    }

    const existingChat = chats.find(c => 
        !c.isGroup && 
        c.participants.length === 2 &&
        c.participants.some(p => p.userId === currentUser.id) &&
        c.participants.some(p => p.userId === otherUserId)
    );

    if (existingChat) {
        setActiveChatId(existingChat.id);
        return existingChat.id;
    }
    
    const currentUserParticipant: ChatParticipant = {
        userId: currentUser.id,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl,
        avatarBgColor: currentUser.avatarBgColor
    };
    const otherUserParticipant: ChatParticipant = {
        userId: otherUser.id,
        nickname: otherUser.nickname,
        avatarUrl: otherUser.avatarUrl,
        avatarBgColor: otherUser.avatarBgColor
    };

    const newChat: Chat = {
      id: generateId(),
      participants: [currentUserParticipant, otherUserParticipant],
      isGroup: false,
      createdAt: new Date().toISOString(),
      name: otherUser.name, 
      groupAdminIds: [], 
      groupBannedUserIds: [],
      mutedPresenceTargetUserIds: [],
      isMuted: false,
      unreadCounts: {}, 
      typing: {},
      backgroundId: 'default',
    };
    setChats(prev => [newChat, ...prev].sort((a,b) => new Date(b.lastMessage?.timestamp || b.createdAt).getTime() - new Date(a.lastMessage?.timestamp || a.createdAt).getTime()));
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [currentUser, chats, getUserById, setChats, setActiveChatId]); 

  const createGroupChat = useCallback(async (name: string, participantIds: string[], groupAvatarSeed?: string, groupImage?: string): Promise<string | null> => {
    if (!currentUser || !getUserById) return null;
    const allParticipantDetails: ChatParticipant[] = [];
    allParticipantDetails.push({
        userId: currentUser.id,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl,
        avatarBgColor: currentUser.avatarBgColor
    });
    for (const pid of participantIds) {
        if (pid === currentUser.id) continue;
        const user = getUserById(pid);
        if (user) {
            allParticipantDetails.push({
                userId: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                avatarBgColor: user.avatarBgColor
            });
        }
    }
    if (allParticipantDetails.length < 2) { 
        console.error("Group chat needs at least current user and one other participant.");
        return null;
    }
    const newGroupChat: Chat = {
      id: generateId(),
      name: name,
      participants: allParticipantDetails,
      isGroup: true,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      ownerId: currentUser.id, 
      groupAdminIds: [currentUser.id], 
      groupAvatarUrl: groupAvatarSeed ? getRandomColor(AVATAR_COLORS, groupAvatarSeed) : getRandomColor(AVATAR_COLORS, name), 
      groupImage: groupImage || undefined,
      groupBannedUserIds: [],
      mutedPresenceTargetUserIds: [],
      isMuted: false,
      unreadCounts: {}, 
      typing: {},
      backgroundId: 'default',
      defaultPermissions: { ...DEFAULT_GROUP_PERMISSIONS, canChangeGroupInfo: true, canAddMembers: true, canPinMessages: true }, // Owner/creator sets initial as admin-like
      memberPermissionOverrides: {},
    };
    setChats(prev => [newGroupChat, ...prev].sort((a,b) => new Date(b.lastMessage?.timestamp || b.createdAt).getTime() - new Date(a.lastMessage?.timestamp || a.createdAt).getTime()));
    setActiveChatId(newGroupChat.id);
    setMessages(prev => ({ ...prev, [newGroupChat.id]: [] })); 
    return newGroupChat.id;
  }, [currentUser, getUserById, setChats, setActiveChatId, setMessages]); 

  const updateMessageInChat = useCallback((chatId: string, messageId: string, updatedMessageData: Partial<Message>) => {
    setMessages(prevMessages => {
        const chatMessages = prevMessages[chatId];
        if (!chatMessages) return prevMessages;
        const updatedChatMessages = chatMessages.map(msg => 
            msg.id === messageId ? { ...msg, ...updatedMessageData } : msg
        );
        setChats(prevChats => prevChats.map(c => {
            if (c.id === chatId && c.lastMessage?.id === messageId) {
                return { ...c, lastMessage: { ...c.lastMessage, ...updatedMessageData } as Message };
            }
            return c;
        }));
        return { ...prevMessages, [chatId]: updatedChatMessages };
    });
  }, [setMessages, setChats]); 

  const deleteMessageInChat = useCallback(async (chatId: string, messageId: string, deleteType: 'me' | 'everyone' = 'me'): Promise<void> => {
    if (!currentUser) return;
    const messageToDelete = messages[chatId]?.find(m => m.id === messageId);
    if (!messageToDelete) return;

    if (deleteType === 'everyone' && messageToDelete.senderId === currentUser.id) {
        const messageTime = new Date(messageToDelete.timestamp).getTime();
        const currentTime = Date.now();
        if (currentTime - messageTime <= DELETE_FOR_EVERYONE_TIME_LIMIT_MS) { 
            updateMessageInChat(chatId, messageId, {
                isDeletedGlobally: true,
                text: "This message was deleted by the sender.",
                type: MessageType.System,
                reactions: [],
            });
            return;
        } else {
            console.warn("Time limit for 'delete for everyone' passed. Deleting for self only.");
        }
    }
    updateMessageInChat(chatId, messageId, {
        isDeleted: true, 
        text: "This message was deleted.", 
        type: MessageType.System, 
        reactions: [], 
    });
  }, [updateMessageInChat, currentUser, messages]);

  const addReaction = useCallback(async (chatId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser.id;
    const originalMessage = messages[chatId]?.find(m => m.id === messageId);
    if (!originalMessage || originalMessage.isDeleted || originalMessage.isDeletedGlobally) return;
    let newReactions = [...(originalMessage.reactions || [])];
    const existingReactionIndex = newReactions.findIndex(r => r.emoji === emoji);
    if (existingReactionIndex > -1) { 
        const reaction = newReactions[existingReactionIndex];
        const userIndex = reaction.userIds.indexOf(currentUserId);
        if (userIndex > -1) { 
            reaction.userIds = reaction.userIds.filter(uid => uid !== currentUserId);
            if (reaction.userIds.length === 0) { 
                newReactions.splice(existingReactionIndex, 1);
            }
        } else { 
            reaction.userIds.push(currentUserId);
        }
    } else { 
        newReactions.push({ emoji, userIds: [currentUserId] });
    }
    updateMessageInChat(chatId, messageId, { reactions: newReactions });
  }, [currentUser, updateMessageInChat, messages]);


  const markMessagesAsRead = useCallback(async (chatId: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser.id;
    
    setMessages(prevHttpMessages => {
        const chatHttpMessages = prevHttpMessages[chatId];
        if (!chatHttpMessages) return prevHttpMessages;
        const updatedChatHttpMessages = chatHttpMessages.map(msg => {
            if (msg.senderId !== currentUserId && (!msg.readBy || !msg.readBy.includes(currentUserId))) {
                return { ...msg, readBy: [...(msg.readBy || []), currentUserId] };
            }
            return msg;
        });
        return { ...prevHttpMessages, [chatId]: updatedChatHttpMessages };
    });

    setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
            const newUnreadCounts = { ...(c.unreadCounts || {}) };
            newUnreadCounts[currentUserId] = 0;
            return { ...c, unreadCounts: newUnreadCounts };
        }
        return c;
    }));
  }, [currentUser, setMessages, setChats]); 

  const setTypingStatus = useCallback((chatId: string, isTyping: boolean) => {
    if (!currentUser) return;
    setChats(prevChats => 
        prevChats.map(chat => 
            chat.id === chatId ? { 
                ...chat, 
                typing: { 
                    ...chat.typing, 
                    [currentUser.id]: isTyping 
                } 
            } : chat
        )
    );
  }, [currentUser, setChats]); 

  // Call Management
   const stopLocalStreams = useCallback(() => {
    if (currentCallInfo.localStream) {
      currentCallInfo.localStream.getTracks().forEach(track => track.stop());
    }
   }, [currentCallInfo.localStream]);

  const initiateCall = useCallback(async (chatId: string, targetUserId: string, type: CallType) => {
    if (!currentUser) return;
    const targetUser = getUserById(targetUserId);
    if (!targetUser) {
        console.error("Target user for call not found");
        setCurrentCallInfo({ chatId, targetUserId, targetUserName: "Unknown", type, status: 'failed', isReceivingCall: false, localStream: null, remoteStream: null });
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
        setCurrentCallInfo({
            chatId,
            targetUserId,
            targetUserName: targetUser.name,
            type,
            status: 'initiating_outgoing',
            callStartTime: new Date().toISOString(),
            isReceivingCall: false,
            localStream: stream,
            remoteStream: null,
        });
        setTimeout(() => {
            setCurrentCallInfo(prev => prev.status === 'initiating_outgoing' ? { ...prev, status: 'outgoing_ringing' } : prev);
        }, 1500);
        setTimeout(() => {
            setCurrentCallInfo(prev => prev.status === 'outgoing_ringing' ? { ...prev, status: 'connected', callStartTime: new Date().toISOString() } : prev);
        }, 4000);

    } catch (err) {
        console.error("Error accessing media devices.", err);
        setCurrentCallInfo({ chatId, targetUserId, targetUserName: targetUser.name, type, status: 'failed', isReceivingCall: false, localStream: null, remoteStream: null });
    }
  }, [currentUser, getUserById]);

  const answerCall = useCallback(async () => {
    if (!currentCallInfo.isReceivingCall || !currentCallInfo.chatId) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: currentCallInfo.type === 'video', audio: true });
        setCurrentCallInfo(prev => ({
            ...prev,
            status: 'connected',
            callStartTime: new Date().toISOString(),
            isReceivingCall: false, 
            localStream: stream,
        }));
    } catch (err) {
        console.error("Error accessing media devices for answering call.", err);
        setCurrentCallInfo(prev => ({ ...prev, status: 'failed' }));
        stopLocalStreams(); 
    }
  }, [currentCallInfo, stopLocalStreams]);

  const declineCall = useCallback(() => {
    if (!currentCallInfo.isReceivingCall || !currentCallInfo.chatId || !currentCallInfo.targetUserId) return;
     const callStarter = getUserById(currentCallInfo.targetUserId);
     sendMessage(
        currentCallInfo.chatId,
        `Call declined by ${currentUser?.name || 'User'}`,
        MessageType.CallLog,
        undefined, undefined, undefined, undefined, undefined,
        `declined by ${currentUser?.name || 'User'}`
    );
    setCurrentCallInfo(prev => ({ ...prev, status: 'declined', isReceivingCall: false, localStream: null }));
    stopLocalStreams();
    setTimeout(() => setCurrentCallInfo({ chatId: null, targetUserId: null, targetUserName: null, type: null, status: 'idle', isReceivingCall: false, localStream: null, remoteStream: null }), 1500);
  }, [currentCallInfo, sendMessage, stopLocalStreams, currentUser, getUserById]);

  const endCall = useCallback((isMissed: boolean = false) => {
    if (currentCallInfo.status === 'idle') return;

    if (currentCallInfo.chatId && currentCallInfo.callStartTime && currentCallInfo.status === 'connected') {
        const endTime = new Date();
        const startTime = new Date(currentCallInfo.callStartTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        const durationFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const otherPersonName = currentCallInfo.targetUserName || "User";
        sendMessage(
            currentCallInfo.chatId, 
            `Call with ${otherPersonName} - Duration: ${durationFormatted}`, 
            MessageType.CallLog,
            undefined, undefined, undefined, undefined, undefined,
            durationFormatted
        );
    } else if (isMissed && currentCallInfo.chatId && currentCallInfo.targetUserId) {
         const callerName = getUserById(currentCallInfo.targetUserId)?.name || "User";
         sendMessage(
            currentCallInfo.chatId,
            `Missed ${currentCallInfo.type} call from ${callerName}`,
            MessageType.CallLog
        );
    }


    stopLocalStreams();
    setCurrentCallInfo(prev => ({...prev, status: 'ended', localStream: null, remoteStream: null, isReceivingCall: false }));
    setTimeout(() => {
        setCurrentCallInfo({ chatId: null, targetUserId: null, targetUserName: null, type: null, status: 'idle', callStartTime: undefined, isReceivingCall: false, localStream: null, remoteStream: null });
    }, 1500); 
  }, [currentCallInfo, sendMessage, stopLocalStreams, getUserById]);
  
  const simulateIncomingCall = useCallback(async (chatId: string, fromUserId: string, type: CallType) => {
    if (!currentUser) return;
    const fromUser = getUserById(fromUserId);
    if (!fromUser) return;
    
    if (currentCallInfo.status !== 'idle' && currentCallInfo.status !== 'ended') {
        console.warn("Cannot receive call, already in one or one recently ended.");
        return;
    }

    setCurrentCallInfo({
        chatId,
        targetUserId: fromUserId, 
        targetUserName: fromUser.name,
        type,
        status: 'incoming_ringing',
        isReceivingCall: true,
        localStream: null, 
        remoteStream: null,
    });
  }, [currentUser, getUserById, currentCallInfo.status]);


  const updateGroupDetails = useCallback(async (chatId: string, details: Partial<Pick<Chat, 'name' | 'groupImage'>>): Promise<boolean> => {
    if (!currentUser) return false;
    const chat = getChatById(chatId);
    if (!canUserPerformActionInGroup(currentUser.id, chat, 'canChangeGroupInfo')) {
        console.warn("User does not have permission to change group info.");
        return false;
    }
    setChats(prev => prev.map(c => c.id === chatId ? {...c, ...details} : c));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [setChats, currentUser, getChatById, canUserPerformActionInGroup]);

  const updateGroupPermissions_deprecated = useCallback(async (chatId: string, permissions: any): Promise<boolean> => {
    // This function is deprecated in favor of updateGroupDefaultPermissions and updateMemberGroupPermissions
    console.warn("updateGroupPermissions_deprecated is called. Use new permission functions.");
    return false;
  }, []);
  
  const updateGroupDefaultPermissions = useCallback(async (chatId: string, newDefaults: Partial<GroupPermissions>): Promise<boolean> => {
    if (!currentUser) return false;
    const chat = getChatById(chatId);
    if (!chat || !chat.isGroup || chat.ownerId !== currentUser.id) { // Only owner can change default permissions
        console.warn("Only group owner can change default permissions.");
        return false;
    }
    setChats(prev => prev.map(c => 
        (c.id === chatId && c.isGroup) ? {...c, defaultPermissions: { ...(c.defaultPermissions || DEFAULT_GROUP_PERMISSIONS), ...newDefaults }} : c
    ));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [currentUser, getChatById, setChats]);

  const updateMemberGroupPermissions = useCallback(async (chatId: string, memberId: string, overrides: Partial<GroupPermissions>): Promise<boolean> => {
    if (!currentUser) return false;
    const chat = getChatById(chatId);
     if (!chat || !chat.isGroup || !(chat.ownerId === currentUser.id || chat.groupAdminIds.includes(currentUser.id))) {
        console.warn("Only group owner or admin can change member permissions.");
        return false;
    }
    if (chat.ownerId === memberId) { // Cannot change owner's permissions
        console.warn("Cannot change owner's permissions.");
        return false;
    }

    setChats(prev => prev.map(c => {
        if (c.id === chatId && c.isGroup) {
            const updatedOverrides = { ...(c.memberPermissionOverrides || {}) };
            if (Object.keys(overrides).length === 0) { // If empty overrides, remove entry
                delete updatedOverrides[memberId];
            } else {
                updatedOverrides[memberId] = { ...(updatedOverrides[memberId] || {}), ...overrides };
            }
            return {...c, memberPermissionOverrides: updatedOverrides };
        }
        return c;
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [currentUser, getChatById, setChats]);


  const kickUserFromGroup = useCallback(async (chatId: string, userIdToKick: string): Promise<boolean> => {
    if (!currentUser) return false;
    const chat = getChatById(chatId);
    // Owner can kick anyone (except self, handled below). Admins can kick non-admins.
    const isCurrentUserAdminOrOwner = chat?.ownerId === currentUser.id || chat?.groupAdminIds.includes(currentUser.id);
    const isTargetUserAdmin = chat?.groupAdminIds.includes(userIdToKick);
    const isTargetUserOwner = chat?.ownerId === userIdToKick;

    if (!isCurrentUserAdminOrOwner || (isTargetUserAdmin && chat?.ownerId !== currentUser.id) || isTargetUserOwner) {
        console.warn("Insufficient permissions to kick this user.");
        return false;
    }
    if (userIdToKick === currentUser.id) {
        console.warn("Cannot kick self.");
        return false;
    }

    setChats(prev => prev.map(c => {
        if (c.id === chatId && c.isGroup) {
            return {
                ...c,
                participants: c.participants.filter(p => p.userId !== userIdToKick),
                groupAdminIds: c.groupAdminIds.filter(id => id !== userIdToKick),
                memberPermissionOverrides: c.memberPermissionOverrides ? (Object.fromEntries(Object.entries(c.memberPermissionOverrides).filter(([uid]) => uid !== userIdToKick))) : {}
            };
        }
        return c;
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [setChats, currentUser, getChatById]);

  const banUserFromGroup = useCallback(async (chatId: string, userIdToBan: string): Promise<boolean> => {
    if (!currentUser) return false;
    const chat = getChatById(chatId);
    const isCurrentUserAdminOrOwner = chat?.ownerId === currentUser.id || chat?.groupAdminIds.includes(currentUser.id);
    const isTargetUserAdmin = chat?.groupAdminIds.includes(userIdToBan);
    const isTargetUserOwner = chat?.ownerId === userIdToBan;

    if (!isCurrentUserAdminOrOwner || (isTargetUserAdmin && chat?.ownerId !== currentUser.id) || isTargetUserOwner) {
        console.warn("Insufficient permissions to ban this user.");
        return false;
    }
     if (userIdToBan === currentUser.id) {
        console.warn("Cannot ban self.");
        return false;
    }

     setChats(prev => prev.map(c => {
        if (c.id === chatId && c.isGroup) {
            const updatedBannedIds = Array.from(new Set([...(c.groupBannedUserIds || []), userIdToBan]));
            return {
                ...c,
                participants: c.participants.filter(p => p.userId !== userIdToBan), 
                groupAdminIds: c.groupAdminIds.filter(id => id !== userIdToBan),
                groupBannedUserIds: updatedBannedIds,
                memberPermissionOverrides: c.memberPermissionOverrides ? (Object.fromEntries(Object.entries(c.memberPermissionOverrides).filter(([uid]) => uid !== userIdToBan))) : {}
            };
        }
        return c;
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [setChats, currentUser, getChatById]);
  
  const unbanUserFromGroup = useCallback(async (chatId: string, userIdToUnban: string): Promise<boolean> => {
    if (!currentUser) return false;
    const chat = getChatById(chatId);
     if (!(chat?.ownerId === currentUser.id || chat?.groupAdminIds.includes(currentUser.id))) {
        console.warn("Insufficient permissions to unban users.");
        return false;
    }
    setChats(prev => prev.map(c => {
        if (c.id === chatId && c.isGroup) {
            return {
                ...c,
                groupBannedUserIds: (c.groupBannedUserIds || []).filter(id => id !== userIdToUnban)
            };
        }
        return c;
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [setChats, currentUser, getChatById]);

  const addMembersToGroup = useCallback(async (chatId: string, userIdsToAdd: string[]): Promise<boolean> => {
    if (!currentUser || !getUserById) return false;
    const chat = getChatById(chatId);
    if (!canUserPerformActionInGroup(currentUser.id, chat, 'canAddMembers')) {
        console.warn("User does not have permission to add members.");
        return false;
    }
    setChats(prevChats => prevChats.map(c => {
      if (c.id === chatId && c.isGroup) {
        const newParticipants: ChatParticipant[] = [...c.participants];
        for (const userId of userIdsToAdd) {
          if (!c.participants.some(p => p.userId === userId)) { 
            const user = getUserById(userId);
            if (user && !(c.groupBannedUserIds || []).includes(userId)) { // Do not add banned users
              newParticipants.push({
                userId: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                avatarBgColor: user.avatarBgColor
              });
            }
          }
        }
        return { ...c, participants: newParticipants };
      }
      return c;
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [currentUser, getUserById, setChats, getChatById, canUserPerformActionInGroup]);

  const transferGroupOwnership = useCallback(async (chatId: string, newOwnerId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setChats(prevChats => prevChats.map(c => {
      if (c.id === chatId && c.isGroup && c.ownerId === currentUser.id) { 
        if (c.participants.some(p => p.userId === newOwnerId) && c.groupAdminIds.includes(newOwnerId)) { 
          return {
            ...c,
            ownerId: newOwnerId,
          };
        }
      }
      return c;
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }, [currentUser, setChats]);

  const setGroupAdmins = useCallback(async (chatId: string, adminIds: string[]): Promise<boolean> => {
     if (!currentUser) return false;
     const chat = getChatById(chatId);
     if (!chat || chat.ownerId !== currentUser.id) { // Only owner can set admins
         console.warn("Only group owner can manage admins.");
         return false;
     }
    // Ensure owner is always an admin
    const newAdminIds = Array.from(new Set(chat.ownerId ? [...adminIds, chat.ownerId] : adminIds));

    setChats(prev => prev.map(c => c.id === chatId && c.isGroup ? {...c, groupAdminIds: newAdminIds } : c));
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }, [setChats, currentUser, getChatById]);

  const deleteChatForCurrentUser = useCallback(async (chatId: string): Promise<void> => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setMessages(prev => {
        const { [chatId]: _removed, ...rest } = prev;
        return rest;
    });
    if (activeChatId === chatId) {
        setActiveChatId(null);
    }
  }, [setChats, setMessages, activeChatId, setActiveChatId]);

  const clearAllCurrentUserChats = useCallback(async (): Promise<void> => {
    setChats([]);
    setMessages({});
    setActiveChatId(null);
  }, [setChats, setMessages, setActiveChatId]);

  const clearChatHistory = useCallback(async (chatId: string): Promise<void> => {
    setMessages(prev => ({ ...prev, [chatId]: [] }));
    setChats(prevChats => prevChats.map(c => 
        c.id === chatId ? { ...c, lastMessage: undefined, unreadCounts: {} } : c
    ));
  }, [setMessages, setChats]);

  const toggleMuteUserPresenceInChat = useCallback(async (chatId: string, targetUserId: string): Promise<void> => {
    setChats(prev => prev.map(c => {
        if (c.id === chatId) {
            const currentMuted = c.mutedPresenceTargetUserIds || [];
            const isMuted = currentMuted.includes(targetUserId);
            return {
                ...c,
                mutedPresenceTargetUserIds: isMuted 
                    ? currentMuted.filter(id => id !== targetUserId)
                    : [...currentMuted, targetUserId]
            };
        }
        return c;
    }));
  }, [setChats]);

  const leaveGroup = useCallback(async (chatId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const currentUserId = currentUser.id;
    let groupRemovedForUser = false;

    setChats(prevChats => 
        prevChats.map(chat => {
            if (chat.id === chatId && chat.isGroup) {
                const updatedChat = { ...chat };
                if (updatedChat.ownerId === currentUserId) {
                    const otherAdmins = updatedChat.groupAdminIds.filter(id => id !== currentUserId && updatedChat.participants.some(p => p.userId === id));
                    const otherMembers = updatedChat.participants.filter(p => p.userId !== currentUserId);

                    if (otherAdmins.length > 0) {
                        updatedChat.ownerId = otherAdmins[0];
                    } else if (otherMembers.length > 0) {
                        updatedChat.ownerId = otherMembers[0].userId;
                        if (!updatedChat.groupAdminIds.includes(otherMembers[0].userId)) {
                            updatedChat.groupAdminIds = [...updatedChat.groupAdminIds, otherMembers[0].userId]; 
                        }
                    } else {
                        updatedChat.ownerId = undefined; 
                    }
                }
                updatedChat.participants = updatedChat.participants.filter(p => p.userId !== currentUserId);
                updatedChat.groupAdminIds = updatedChat.groupAdminIds.filter(id => id !== currentUserId);
                updatedChat.memberPermissionOverrides = updatedChat.memberPermissionOverrides ? (Object.fromEntries(Object.entries(updatedChat.memberPermissionOverrides).filter(([uid]) => uid !== currentUserId))) : {};
                
                if (updatedChat.participants.length === 0) {
                    groupRemovedForUser = true; 
                    try {
                        const storedGlobalChats = localStorage.getItem(GLOBAL_CHATS_STORAGE_KEY);
                        let allGlobalChats: Chat[] = storedGlobalChats ? JSON.parse(storedGlobalChats) : [];
                        allGlobalChats = allGlobalChats.filter(c => c.id !== chatId); 
                        localStorage.setItem(GLOBAL_CHATS_STORAGE_KEY, JSON.stringify(allGlobalChats));
                    } catch (e) { console.error("Error modifying global chats for empty group:", e); }
                    return null; 
                }
                groupRemovedForUser = true;
                return updatedChat;
            }
            return chat;
        }).filter(chat => chat !== null) as Chat[] 
    );
    
    if (groupRemovedForUser && activeChatId === chatId) {
        setActiveChatId(null);
    }
    return true;
  }, [currentUser, activeChatId, setActiveChatId, setChats]);

  const toggleMuteChat = useCallback(async (chatId: string): Promise<void> => {
    setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, isMuted: !c.isMuted } : c
    ));
  }, [setChats]);

  const updateChatBackground = useCallback(async (chatId: string, backgroundId: string | undefined): Promise<void> => {
    setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, backgroundId: backgroundId || 'default' } : c
    ));
  }, [setChats]);
  
  const forwardMessages = useCallback(async (originalMessage: Message, targetChatIds: string[]): Promise<void> => {
    if (!currentUser) return;
    const originalSender = getUserById(originalMessage.senderId);

    for (const targetChatId of targetChatIds) {
        await sendMessage(
            targetChatId,
            originalMessage.text || (originalMessage.type === MessageType.Image ? "Forwarded Image" : "Forwarded File"), 
            originalMessage.type,
            originalMessage.fileName,
            originalMessage.fileSize,
            originalMessage.fileType,
            undefined, 
            undefined, 
            undefined, 
            { 
                userId: currentUser.id, 
                originalSenderName: originalSender?.name || "Unknown User",
                originalTimestamp: originalMessage.timestamp,
            }
        );
    }
  }, [currentUser, sendMessage, getUserById]);


  return (
    <ChatContext.Provider value={{ 
        chats, setChats, activeChatId, setActiveChatId, messages, setMessages, 
        sendMessage, fetchMessages, getChatById, createOrOpenChat, createGroupChat, 
        updateMessageInChat, deleteMessageInChat, addReaction, markMessagesAsRead, setTypingStatus, 
        initiateCall, answerCall, declineCall, endCall, currentCallInfo, setCurrentCallInfo, simulateIncomingCall,
        updateGroupDetails, updateGroupPermissions_deprecated, updateGroupDefaultPermissions, updateMemberGroupPermissions, canUserPerformActionInGroup,
        kickUserFromGroup, banUserFromGroup, unbanUserFromGroup, 
        addMembersToGroup, transferGroupOwnership, setGroupAdmins,
        deleteChatForCurrentUser, clearAllCurrentUserChats, clearChatHistory,
        toggleMuteUserPresenceInChat, leaveGroup, toggleMuteChat,
        updateChatBackground, forwardMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

// --- Settings Context ---
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth(); 

  const getSettingsStorageKey = useCallback(() => 
    currentUser ? `${APP_SETTINGS_STORAGE_KEY_PREFIX}${currentUser.id}` : null,
  [currentUser]);

  const [settings, setSettings] = useState<AppSettings>(() => {
    return {
      ...DEFAULT_APP_SETTINGS,
      translations: translationsData[DEFAULT_APP_SETTINGS.language]
    };
  });
  
  useEffect(() => {
    const storageKey = getSettingsStorageKey();
    let loadedSettings = {
        ...DEFAULT_APP_SETTINGS,
        translations: translationsData[DEFAULT_APP_SETTINGS.language] 
    };

    if (storageKey) {
        try {
            const storedSettingsString = localStorage.getItem(storageKey);
            if (storedSettingsString) {
                const parsedSettings = JSON.parse(storedSettingsString);
                loadedSettings = {
                    ...DEFAULT_APP_SETTINGS, 
                    ...parsedSettings,       
                    translations: translationsData[parsedSettings.language || DEFAULT_APP_SETTINGS.language]
                };
            } else { 
                 loadedSettings.translations = translationsData[loadedSettings.language];
            }
        } catch (error) {
            console.error("Failed to parse settings for user:", error);
            loadedSettings.translations = translationsData[DEFAULT_APP_SETTINGS.language];
        }
    } else if (!currentUser) { 
         loadedSettings = {
             ...DEFAULT_APP_SETTINGS,
             translations: translationsData[DEFAULT_APP_SETTINGS.language]
         };
    }
    setSettings(loadedSettings);
  }, [currentUser, getSettingsStorageKey]);


  useEffect(() => {
    const storageKey = getSettingsStorageKey();
    if (storageKey) {
      const { translations, ...storableSettings } = settings;
      localStorage.setItem(storageKey, JSON.stringify(storableSettings));
    }
    
    document.documentElement.className = settings.theme;
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';

    const fontClasses: FontSize[] = ['xs', 'sm', 'base', 'lg', 'xl'];
    fontClasses.forEach(fc => document.body.classList.remove(`text-${fc}`)); 
    document.body.classList.add(`text-${settings.fontSize}`);

  }, [settings, currentUser, getSettingsStorageKey]);

  const updateSetting = <K extends keyof Omit<AppSettings, 'translations'>>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
        const newSettings = { ...prev, [key]: value };
        if (key === 'language') {
            newSettings.translations = translationsData[value as Language];
        }
        return newSettings;
    });
  };

  const t = useCallback((key: TranslationKey, substitutions?: Record<string, string | number>): string => {
    let translation = settings.translations[key] || key; 
    if (substitutions) {
        Object.entries(substitutions).forEach(([subKey, subValue]) => {
            translation = translation.replace(new RegExp(`{${subKey}}`, 'g'), String(subValue));
        });
    }
    return translation;
  }, [settings.translations]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, theme: settings.theme, language: settings.language, fontSize: settings.fontSize, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};

// --- Combined App Providers ---
export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <UserProvider> 
      <AuthProvider>
        <SettingsProvider> 
          <ChatProvider> 
            {children}
          </ChatProvider>
        </SettingsProvider>
      </AuthProvider>
    </UserProvider>
  );
};
