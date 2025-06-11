
export enum UserStatus {
  Online = "Online",
  Offline = "Offline",
}

export enum PresenceVisibility {
  Everyone = "everyone",
  FriendsOnly = "friendsOnly",
  Nobody = "nobody",
}

export enum MessagingPrivacy { 
  Everyone = "everyone",
  FriendsOnly = "friendsOnly",
}

export interface User {
  id: string;
  name: string;
  nickname: string;
  email: string;
  passwordHash: string; 
  avatarUrl?: string; 
  avatarBgColor: string;
  isAdmin: boolean;
  status: UserStatus;
  joinedAt: string; 
  lastSeen?: string; 
  customStatus?: string; 
  bio?: string; 
  blockedUserIds: string[]; 
  statusVideos: StatusVideo[]; 
  presenceVisibility: PresenceVisibility; 
  messagingPrivacy: MessagingPrivacy; 

  friendRequestIdsSent: string[]; 
  friendRequestIdsReceived: string[]; 
  friendIds: string[]; 
}

export interface ChatParticipant {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  avatarBgColor: string;
}

export interface StatusVideo {
  id: string;
  userId: string; 
  videoUrl: string; 
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
  views: string[]; 
  likes: string[]; 
  replies: StatusReply[];
}

export interface StatusReply {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export type GroupPermissionSetting = 'everyone' | 'admins'; // Old, to be replaced/augmented

export interface GroupPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean; // Covers images, videos
  canSendFiles: boolean;
  canSendLinks: boolean; // Often tied to canSendMessages
  canSendStickersGifs: boolean; // Often tied to canSendMessages/Media
  canCreatePolls: boolean;
  canPinMessages: boolean; // Usually admin/owner
  canChangeGroupInfo: boolean; // Usually admin/owner (name, avatar, description)
  canAddMembers: boolean; // Usually admin/owner
  // Future: slowModeSeconds: number; autoDeleteMessagesSeconds: number;
}

export interface Chat {
  id:string;
  participants: ChatParticipant[];
  isGroup: boolean;
  createdAt: string; 
  lastMessage?: Message;
  unreadCounts: { [userId: string]: number }; 
  name?: string; 
  typing?: { [userId: string]: boolean };
  groupAvatarUrl?: string; 
  groupImage?: string; 
  groupAdminIds: string[]; 
  groupBannedUserIds: string[]; 
  createdBy?: string; 
  ownerId?: string; 
  lastMessageSenderName?: string; 
  mutedPresenceTargetUserIds?: string[]; 
  isMuted?: boolean; 
  // Old permissions - will be transitioned or removed
  messageSendPermission_deprecated?: GroupPermissionSetting; 
  mediaSendPermission_deprecated?: GroupPermissionSetting; 
  backgroundId?: string;
  defaultPermissions?: GroupPermissions; // New: For group-wide default permissions
  memberPermissionOverrides?: { [userId: string]: Partial<GroupPermissions> }; // New: For member-specific overrides
}

export enum MessageType {
  Text = "text",
  Image = "image",
  File = "file",
  Like = "like", 
  System = "system", 
  Video = "video", 
  CallLog = "call_log", 
}

export enum MessageActionType {
  Edit = "edit",
  Delete = "delete",
  DeleteForEveryone = "delete_for_everyone", 
  Reply = "reply",
  React = "react",
  Forward = "forward",
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id:string;
  chatId: string;
  senderId: string; 
  text?: string; 
  fileName?: string; 
  fileSize?: number; 
  fileType?: string; 
  type: MessageType;
  replyTo?: string; 
  timestamp: string; 
  reactions?: MessageReaction[];
  readBy?: string[]; 
  isEdited?: boolean;
  isDeleted?: boolean; 
  isDeletedGlobally?: boolean; 
  callDuration?: string; 
  forwardedFrom?: { userId: string; originalSenderName: string; originalTimestamp: string };
}

export interface DecodedJWT {
  userId: string;
  email: string;
  nickname: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export enum Theme {
  Light = "light",
  Dark = "dark",
}

export type Language = 'en' | 'ar';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl'; 

export type SharedMediaType = 'images' | 'videos' | 'files' | 'links';

export type ChatBackground = {
  id: string;
  nameKey: TranslationKey; 
  thumbnail: string; 
  styleClass: string; 
};


export type TranslationKey = 
  | 'login.welcome_back' | 'login.create_account' | 'login.full_name' | 'login.nickname' | 'login.email' | 'login.password'
  | 'login.login_button' | 'login.create_account_button' | 'login.no_account_q' | 'login.signup_now' | 'login.have_account_q' | 'login.login_now'
  | 'login.error_invalid_credentials' | 'login.error_all_fields_required' | 'login.error_password_length' | 'login.error_signup_failed' | 'login.randomize_avatar_color'
  | 'login.error_email_exists' | 'login.error_nickname_exists' | 'login.error_email_and_nickname_exists'
  | 'chat.chats_title' | 'chat.contacts_title' | 'chat.search_title' | 'chat.groups_title' | 'chat.settings_title' | 'chat.profile_title' | 'chat.logout_button'
  | 'chat.search_chats_placeholder' | 'chat.search_contacts_placeholder' | 'chat.search_users_placeholder'
  | 'chat.start_new_chat' | 'chat.no_chats_yet' | 'chat.no_chats_found' | 'chat.no_contacts_to_show' | 'chat.no_contacts_found'
  | 'chat.type_to_search_users' | 'chat.no_users_found' | 'chat.select_chat_prompt' | 'chat.message_area.view_profile' | 'chat.message_area.group_info'
  | 'chat.message_area.online' | 'chat.message_area.offline' | 'chat.message_area.last_seen' | 'chat.message_area.unknown_status' | 'chat.message_area.members'
  | 'chat.message_area.typing_indicator_one' | 'chat.message_area.typing_indicator_many' | 'chat.message_area.no_messages_yet' | 'chat.message_area.last_seen_recently'
  | 'chat.message_input.attach_file' | 'chat.message_input.attach_image' | 'chat.message_input.emoji' | 'chat.message_input.send' | 'chat.message_input.like' | 'chat.message_input.placeholder'
  | 'chat.message_input.replying_to' | 'chat.message_input.cancel_reply' | 'chat.message_input.prompt_image_url' | 'chat.message_input.image_url_label'
  | 'chat.message_input.editing_message' | 'chat.message_input.save_changes'
  | 'chat.message_bubble.reply' | 'chat.message_bubble.add_reaction' | 'chat.message_bubble.image_alt' | 'chat.message_bubble.file_download_soon'
  | 'chat.message_bubble.sent' | 'chat.message_bubble.delivered_read_some' | 'chat.message_bubble.read_by_all' | 'chat.message_bubble.seen' 
  | 'chat.message_bubble.download_file'
  | 'chat.message_bubble.edit_message' | 'chat.message_bubble.delete_message' | 'chat.message_bubble.confirm_delete_message' | 'chat.message_bubble.message_deleted' | 'chat.message_bubble.edited_tag'
  | 'chat.message_bubble.delete_for_everyone' | 'chat.message_bubble.confirm_delete_for_everyone' | 'chat.message_bubble.message_deleted_by_sender'
  | 'chat.message_bubble.forward_message' | 'chat.message_bubble.forward_message_to' | 'chat.message_bubble.forwarding_message' | 'chat.message_bubble.forwarded_from'
  | 'chat.user_blocked_message' | 'chat.you_are_blocked_message' | 'chat.cannot_message_blocked_user'
  | 'chat.delete_chat_title' | 'chat.confirm_delete_chat_message' | 'chat.clear_all_chats_title' | 'chat.confirm_clear_all_chats_message' | 'chat.confirm_clear_chat_history'
  | 'chat.error_messaging_friends_only'
  | 'chat.search_in_chat_placeholder' | 'chat.search_results_count' | 'chat.no_search_results' | 'chat.search_previous_match' | 'chat.search_next_match' | 'chat.close_search' 
  | 'chat.call_log_message' | 'chat.hide_user_activity' | 'chat.show_user_activity' 
  | 'chat.mute_chat' | 'chat.unmute_chat' | 'chat.muted_icon_alt'
  | 'chat.shared_media_title' | 'chat.shared_media_images' | 'chat.shared_media_videos' | 'chat.shared_media_files' | 'chat.shared_media_links' | 'chat.no_shared_media'
  | 'chat.permission_denied_admins_only' | 'chat.admins_only_can_send_messages_media' | 'chat.admins_only_can_send_messages' | 'chat.admins_only_can_send_media'
  | 'chat.change_background_title' | 'chat.background_default' | 'chat.background_sunset' | 'chat.background_forest' | 'chat.background_ocean' | 'chat.background_mountains' | 'chat.background_city' | 'chat.background_abstract_blue' | 'chat.background_abstract_green' | 'chat.background_abstract_purple' | 'chat.background_abstract_orange' | 'chat.background_space' | 'chat.background_minimal_gray' | 'chat.background_minimal_sand' | 'chat.background_dots_light' | 'chat.background_dots_dark'
  | 'chat.consolidated_menu_chat_settings' | 'chat.consolidated_menu_clear_history'
  | 'profile.edit_profile_title' | 'profile.view_profile_title' | 'profile.change_photo' | 'profile.remove_photo'
  | 'profile.full_name_label' | 'profile.nickname_label' | 'profile.email_label' | 'profile.joined_label' | 'profile.status_label' | 'profile.last_seen_label'
  | 'profile.custom_status_label' | 'profile.bio_label' | 'profile.save_changes' | 'profile.cancel' | 'profile.close' | 'profile.block_user' | 'profile.unblock_user'
  | 'profile.danger_zone' | 'profile.delete_my_account' | 'profile.error_update_failed' | 'profile.confirm_delete_account_title' | 'profile.confirm_delete_account_warning' | 'profile.confirm_delete_account_prompt'
  | 'profile.confirm_delete_account_button' | 'profile.user_not_found_title' | 'profile.user_not_found_message'
  | 'profile.send_friend_request' | 'profile.friend_request_sent' | 'profile.accept_friend_request' | 'profile.reject_friend_request' | 'profile.friends' | 'profile.view_friends'
  | 'settings.title' | 'settings.appearance_card' | 'settings.theme_label' | 'settings.light_theme' | 'settings.dark_theme'
  | 'settings.language_card' | 'settings.language_label' | 'settings.notifications_card' | 'settings.enable_notifications_label' | 'settings.notifications_note'
  | 'settings.font_size_card' | 'settings.font_size_label' | 'settings.font_size_xs' | 'settings.font_size_sm' | 'settings.font_size_base' | 'settings.font_size_lg' | 'settings.font_size_xl'
  | 'settings.account_management_card' | 'settings.delete_my_account_button' | 'settings.delete_account_warning' | 'settings.clear_all_my_chats_button'
  | 'settings.blocked_users_card' | 'settings.no_blocked_users' | 'settings.unblock_button'
  | 'settings.privacy_card' | 'settings.presence_visibility_label' | 'settings.presence_visibility_everyone' | 'settings.presence_visibility_friends_only' | 'settings.presence_visibility_nobody' | 'settings.presence_visibility_note'
  | 'settings.messaging_privacy_label' | 'settings.messaging_privacy_everyone' | 'settings.messaging_privacy_friends_only' | 'settings.messaging_privacy_note'
  | 'settings.security_card' | 'settings.change_password_button' | 'settings.current_password_label' | 'settings.new_password_label' | 'settings.confirm_new_password_label'
  | 'settings.password_updated_success' | 'settings.error_incorrect_current_password' | 'settings.error_passwords_do_not_match' | 'settings.error_new_password_length'
  | 'admin.title' | 'admin.user_management_title' | 'admin.search_users_placeholder' | 'admin.table_header_user' | 'admin.table_header_email' |
  'admin.table_header_joined' | 'admin.table_header_status' | 'admin.table_header_actions' | 'admin.no_users_yet' | 'admin.no_users_match_search'
  | 'admin.view_profile_action' | 'admin.delete_user_action' | 'admin.admin_cannot_delete_self' | 'admin.confirm_delete_user_q'
  | 'admin.access_denied_title' | 'admin.access_denied_message' | 'admin.go_back_to_chats'
  | 'groups.create_group_title' | 'groups.group_name_label' | 'groups.select_members_label' | 'groups.create_button' | 'groups.no_contacts_to_add_to_group'
  | 'groups.group_info_title' | 'groups.add_members_button' | 'groups.leave_group_button' | 'groups.view_tooltip' | 'groups.add_members_modal_title' | 'groups.search_contacts_to_add'
  | 'groups.kick_member' | 'groups.ban_member' | 'groups.unban_member' | 'groups.change_group_photo' | 'groups.remove_group_photo' | 'groups.confirm_kick_member' | 'groups.confirm_ban_member' | 'groups.member_kicked' | 'groups.member_banned' | 'groups.user_already_banned' | 'groups.cannot_kick_self' | 'groups.cannot_ban_self' | 'groups.manage_members'
  | 'groups.transfer_ownership' | 'groups.confirm_transfer_ownership' | 'groups.select_new_owner' | 'groups.owner_badge' | 'groups.admin_badge' | 'groups.make_admin' | 'groups.remove_admin' | 'groups.only_owner_can_transfer' | 'groups.cannot_transfer_to_self' | 'groups.ownership_transferred' | 'groups.user_not_member_or_already_owner'
  | 'groups.confirm_leave_group' | 'groups.permissions_title' | 'groups.who_can_send_messages' | 'groups.who_can_send_media' | 'groups.option_everyone' | 'groups.option_admins_only'
  | 'groups.banned_users_title'
  | 'groups.permissions.general_settings_title' | 'groups.permissions.member_overrides_title' | 'groups.permissions.edit_member_permissions_for' | 'groups.permissions.reset_to_defaults'
  | 'groups.permissions.can_send_messages' | 'groups.permissions.can_send_media' | 'groups.permissions.can_send_files' | 'groups.permissions.can_send_links'
  | 'groups.permissions.can_send_stickers_gifs' | 'groups.permissions.can_create_polls' | 'groups.permissions.can_pin_messages' | 'groups.permissions.can_change_group_info'
  | 'groups.permissions.can_add_members' | 'groups.permissions.allow' | 'groups.permissions.deny' | 'groups.permissions.default_setting' | 'groups.permissions.override_setting'
  | 'groups.permissions.input_disabled_by_group_settings'
  | 'general.loading' | 'general.error' | 'general.unknown_user' | 'general.group' | 'general.liked_message'
  | 'general.image_message' | 'general.file_message' | 'general.no_messages_yet_group' | 'general.feature_coming_soon'
  | 'general.call_end_call' | 'general.confirm' | 'general.delete'
  | 'status.title' | 'status.add_to_your_status' | 'status.view_status' | 'status.no_statuses_yet' | 'status.your_status'
  | 'status.seen_by' | 'status.reply_to_status' | 'status.enter_video_url' | 'status.caption_optional' | 'status.post_status' | 'status.video_url_placeholder'
  | 'status.replies' | 'status.no_replies_yet' | 'status.liked_by_you' | 'status.like' | 'status.view_count'
  | 'call.voice_call' | 'call.video_call' | 'call.calling_user' | 'call.call_failed' | 'call.call_ended' | 'call.call_unavailable_group'
  | 'call.ringing_user' | 'call.connected_to_user' | 'call.mute_audio' | 'call.unmute_audio' | 'call.disable_video' | 'call.enable_video' | 'call.high_quality_video'
  | 'call.answer_call' | 'call.decline_call' | 'call.missed_call_from' | 'call.call_declined_by_user' | 'call.call_with_duration'
  | 'friends.friend_requests_title' | 'friends.no_friend_requests' | 'friends.accept' | 'friends.reject' | 'friends.request_accepted' | 'friends.request_rejected' | 'friends.request_sent_success' | 'friends.error_sending_request' | 'friends.already_friends' | 'friends.request_already_sent' | 'friends.request_already_received' | 'friends.sidebar_title' | 'friends.unfriend' | 'friends.confirm_unfriend'
  | 'sidebar.friends_title'
  | 'search.add_friend_button';

export type Translations = {
  [key in Language]: {
    [tk in TranslationKey]: string;
  }
};

export interface AppSettings {
  theme: Theme;
  language: Language;
  notificationsEnabled: boolean;
  fontSize: FontSize; 
  translations: Translations[Language]; 
}

export type SignupPayload = Omit<User, 'id' | 'isAdmin' | 'status' | 'joinedAt' | 'avatarBgColor' | 'customStatus' | 'bio' | 'blockedUserIds' | 'statusVideos' | 'friendRequestIdsSent' | 'friendRequestIdsReceived' | 'friendIds' | 'presenceVisibility' | 'messagingPrivacy'> & { avatarInitialColorSeed?: string };

export type SignupResultReason = 'duplicate_email' | 'duplicate_nickname' | 'duplicate_both' | 'unknown_error';
export interface SignupCompletionResult {
  success: boolean;
  reason?: SignupResultReason;
}

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (userData: SignupPayload) => Promise<SignupCompletionResult>;
  logout: () => void;
  updateCurrentUser: (updatedUser: Partial<Pick<User, 'name' | 'nickname' | 'avatarUrl' | 'avatarBgColor' | 'customStatus' | 'bio' | 'blockedUserIds' | 'statusVideos' | 'friendRequestIdsSent' | 'friendRequestIdsReceived' | 'friendIds' | 'presenceVisibility' | 'passwordHash' | 'messagingPrivacy'>>) => Promise<boolean>; 
  deleteAccount: () => Promise<boolean>;
  blockUser: (userIdToBlock: string) => Promise<boolean>;
  unblockUser: (userIdToUnblock: string) => Promise<boolean>;
  sendFriendRequest: (targetUserId: string) => Promise<boolean>;
  acceptFriendRequest: (requesterId: string) => Promise<boolean>;
  rejectFriendRequest: (requesterId: string) => Promise<boolean>;
  unfriendUser: (friendId: string) => Promise<boolean>;
  getAdminUser: () => User | undefined; 
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; errorKey?: TranslationKey }>;
}

export type CallStatus = 'idle' | 'initiating_outgoing' | 'outgoing_ringing' | 'incoming_ringing' | 'connected' | 'failed' | 'ended' | 'declined';
export type CallType = 'voice' | 'video';

export interface CurrentCallInfo {
  chatId: string | null; 
  targetUserId: string | null;
  targetUserName: string | null;
  type: CallType | null;
  status: CallStatus;
  callStartTime?: string; 
  isReceivingCall?: boolean; 
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null; 
}

export interface ChatContextType {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  messages: { [chatId: string]: Message[] };
  setMessages: React.Dispatch<React.SetStateAction<{ [chatId: string]: Message[] }>>;
  sendMessage: (chatId: string, content: string, type?: MessageType, fileName?: string, fileSize?: number, fileType?: string, replyTo?: string, editingMessageId?: string, callDuration?: string, forwardedFrom?: Message['forwardedFrom']) => Promise<boolean | { success: boolean; errorKey?: TranslationKey }>;
  fetchMessages: (chatId: string) => Promise<void>;
  getChatById: (chatId: string) => Chat | undefined;
  createOrOpenChat: (otherUserId: string, isFriendshipChat?: boolean) => Promise<string | null>;
  createGroupChat: (name: string, participantIds: string[], groupAvatarSeed?: string, groupImage?: string) => Promise<string | null>; 
  updateMessageInChat: (chatId: string, messageId: string, updatedMessage: Partial<Message>) => void;
  deleteMessageInChat: (chatId: string, messageId: string, deleteType?: 'me' | 'everyone') => Promise<void>; 
  addReaction: (chatId: string, messageId: string, emoji: string) => Promise<void>;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  setTypingStatus: (chatId: string, isTyping: boolean) => void;
  
  initiateCall: (chatId: string, targetUserId: string, type: CallType) => void;
  answerCall: () => void;
  declineCall: () => void;
  endCall: (isMissed?: boolean) => void;
  currentCallInfo: CurrentCallInfo;
  setCurrentCallInfo: React.Dispatch<React.SetStateAction<CurrentCallInfo>>;
  simulateIncomingCall: (chatId: string, fromUserId: string, type: CallType) => void;

  updateGroupDetails: (chatId: string, details: Partial<Pick<Chat, 'name' | 'groupImage'>>) => Promise<boolean>;
  updateGroupPermissions_deprecated: (chatId: string, permissions: Partial<Pick<Chat, 'messageSendPermission_deprecated' | 'mediaSendPermission_deprecated'>>) => Promise<boolean>; // old name
  updateGroupDefaultPermissions: (chatId: string, newDefaults: Partial<GroupPermissions>) => Promise<boolean>;
  updateMemberGroupPermissions: (chatId: string, memberId: string, overrides: Partial<GroupPermissions>) => Promise<boolean>;
  canUserPerformActionInGroup: (userId: string, chat: Chat | undefined, action: keyof GroupPermissions) => boolean;

  kickUserFromGroup: (chatId: string, userIdToKick: string) => Promise<boolean>;
  banUserFromGroup: (chatId: string, userIdToBan: string) => Promise<boolean>;
  unbanUserFromGroup: (chatId: string, userIdToUnban: string) => Promise<boolean>;
  addMembersToGroup: (chatId: string, userIdsToAdd: string[]) => Promise<boolean>;
  transferGroupOwnership: (chatId: string, newOwnerId: string) => Promise<boolean>;
  setGroupAdmins: (chatId: string, adminIds: string[]) => Promise<boolean>; 
  deleteChatForCurrentUser: (chatId: string) => Promise<void>;
  clearAllCurrentUserChats: () => Promise<void>;
  clearChatHistory: (chatId: string) => Promise<void>; 
  toggleMuteUserPresenceInChat: (chatId: string, targetUserId: string) => Promise<void>; 
  leaveGroup: (chatId: string) => Promise<boolean>; 
  toggleMuteChat: (chatId: string) => Promise<void>; 
  updateChatBackground: (chatId: string, backgroundId: string | undefined) => Promise<void>; 
  forwardMessages: (originalMessage: Message, targetChatIds: string[]) => Promise<void>; 
}

export interface UserManagementContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  getUserById: (userId: string) => User | undefined;
  updateUser: (userId: string, updatedData: Partial<User>) => Promise<boolean>;
  deleteUserByAdmin: (userId: string) => Promise<boolean>;
  addStatusVideo: (userId: string, videoUrl: string, caption?: string) => Promise<boolean>;
  likeStatusVideo: (ownerUserId: string, statusId: string, likerUserId: string) => Promise<boolean>;
  addStatusReply: (ownerUserId: string, statusId: string, replierUserId: string, text: string) => Promise<boolean>;
  markStatusAsViewed: (ownerUserId: string, statusId: string, viewerUserId: string) => Promise<boolean>;
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof Omit<AppSettings, 'translations'>>(key: K, value: AppSettings[K]) => void; 
  theme: Theme;
  language: Language;
  fontSize: FontSize; 
  t: (key: TranslationKey, substitutions?: Record<string, string | number>) => string; 
}

export type SidebarViewType = 'chats' | 'contacts' | 'search' | 'groups' | 'settings' | 'profile' | 'status' | 'friend_requests';
