
import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth, useUserManagement, useSettings } from './store';
import { User, UserStatus } from './types';
import { Input, Button, Modal, Avatar, TrashIcon, EyeIcon, UserPlusIcon, CheckIcon, XMarkIcon, UserMinusIcon } from './ui'; 
import { formatTimestamp, getRandomColor } from './utils';
import { AVATAR_COLORS, UNKNOWN_USER_PLACEHOLDER } from './constants';

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string; 
  viewMode?: 'view' | 'edit'; 
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isOpen, onClose, userId, viewMode = 'view' }) => {
  const { currentUser, updateCurrentUser, deleteAccount: deleteCurrentUserAccount, blockUser, unblockUser, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriendUser } = useAuth();
  const { getUserById } = useUserManagement(); 
  const { t } = useSettings();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false); 
  
  // Editable fields state
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarBgColor, setAvatarBgColor] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [customStatus, setCustomStatus] = useState('');
  const [bio, setBio] = useState('');
  
  const [isBlockedByCurrentUser, setIsBlockedByCurrentUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userToDisplay = getUserById(userId);
    if (userToDisplay) {
      setProfileUser(userToDisplay);
      setName(userToDisplay.name);
      setNickname(userToDisplay.nickname);
      setAvatarBgColor(userToDisplay.avatarBgColor);
      setAvatarUrl(userToDisplay.avatarUrl);
      setCustomStatus(userToDisplay.customStatus || '');
      setBio(userToDisplay.bio || '');
      setIsEditing(viewMode === 'edit' && currentUser?.id === userId);
      if (currentUser && currentUser.id !== userId) { 
        setIsBlockedByCurrentUser(currentUser.blockedUserIds?.includes(userId) || false);
      }
    } else {
      setProfileUser(null); 
    }
     // Reset error on open/userId change
    setError('');
  }, [userId, getUserById, viewMode, currentUser, isOpen]);


  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileUser || !currentUser || currentUser.id !== profileUser.id || !isEditing) return; 

    setIsLoading(true);
    setError('');

    if (!name.trim() || !nickname.trim()) {
        setError(t('login.error_all_fields_required')); // Re-use translation or make specific one
        setIsLoading(false);
        return;
    }
    
    // Check if nickname is being changed and if it's taken
    if (nickname !== profileUser.nickname) {
        const { users } = useUserManagement(); // Get all users for nickname check
        const nicknameExists = users.some(u => u.id !== currentUser.id && u.nickname === nickname);
        if (nicknameExists) {
            setError(t('profile.error_update_failed')); // Nickname taken error
            setIsLoading(false);
            return;
        }
    }


    const updatedData: Partial<Pick<User, 'name' | 'nickname' | 'avatarUrl' | 'avatarBgColor' | 'customStatus' | 'bio'>> = {
      name,
      nickname,
      avatarUrl, 
      avatarBgColor,
      customStatus,
      bio,
    };
    
    const successCurrent = await updateCurrentUser(updatedData); 
    setIsLoading(false);
    if (successCurrent) {
      onClose();
    } else {
      // Error should have been set if nickname was taken, otherwise a generic one.
      if (!error) setError(t('profile.error_update_failed'));
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(undefined);
  };

  const handleChangeAvatarColor = () => {
    const newColor = getRandomColor(AVATAR_COLORS, name || nickname || Date.now().toString());
    setAvatarBgColor(newColor);
  };

  const handleDeleteOwnAccount = async () => {
    if (window.confirm(t('profile.confirm_delete_account_warning'))) {
        const confirmation = prompt(t('profile.confirm_delete_account_prompt'));
        if (confirmation === 'DELETE') { 
            setIsLoading(true);
            const success = await deleteCurrentUserAccount();
            setIsLoading(false);
            if (success) {
                onClose(); 
            } else {
                setError("Failed to delete account. Please try again."); 
            }
        } else {
            alert("Account deletion cancelled. Confirmation phrase not matched."); 
        }
    }
  };
  
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        setError("File is too large. Max 2MB allowed."); 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setError('');
      };
      reader.onerror = () => {
        setError("Failed to read file."); 
      }
      reader.readAsDataURL(file);
    }
  };

  const handleBlockToggle = async () => {
    if (!currentUser || !profileUser || currentUser.id === profileUser.id) return;
    setIsLoading(true);
    let success;
    if (isBlockedByCurrentUser) {
        success = await unblockUser(profileUser.id);
    } else {
        success = await blockUser(profileUser.id);
    }
    if (success) {
        setIsBlockedByCurrentUser(!isBlockedByCurrentUser);
    } else {
        setError("Failed to update block status."); 
    }
    setIsLoading(false);
  };
  
  const handleFriendAction = async (action: 'send' | 'accept' | 'reject' | 'unfriend') => {
    if (!currentUser || !profileUser || currentUser.id === profileUser.id) return;
    setFriendActionLoading(true);
    let success = false;
    switch(action) {
        case 'send': success = await sendFriendRequest(profileUser.id); break;
        case 'accept': success = await acceptFriendRequest(profileUser.id); break;
        case 'reject': success = await rejectFriendRequest(profileUser.id); break;
        case 'unfriend': 
            if (window.confirm(t('friends.confirm_unfriend', { name: profileUser.name }))) {
                 success = await unfriendUser(profileUser.id);
            }
            break;
    }
    setFriendActionLoading(false);
    // If successful, AuthContext updates will trigger re-renders.
    if (!success && action !== 'unfriend') { // Don't show generic error for unfriend confirm cancel
        setError(t('friends.error_sending_request')); // Generic error for now
    }
  };


  if (!profileUser) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('profile.user_not_found_title')}>
        <p className="text-center text-secondary-600 dark:text-secondary-400">{t('profile.user_not_found_message')}</p>
        <div className="mt-6 flex justify-center">
            <Button onClick={onClose}>{t('profile.close')}</Button>
        </div>
      </Modal>
    );
  }
  
  const canEdit = isEditing && currentUser?.id === profileUser.id;
  const isViewingSelf = currentUser?.id === profileUser.id;

  let friendStatusButton = null;
  if (currentUser && !isViewingSelf) {
    if (currentUser.friendIds?.includes(profileUser.id)) {
      friendStatusButton = <Button type="button" variant="secondary" onClick={() => handleFriendAction('unfriend')} isLoading={friendActionLoading} leftIcon={<UserMinusIcon/>}>{t('friends.unfriend')}</Button>;
    } else if (currentUser.friendRequestIdsSent?.includes(profileUser.id)) {
      friendStatusButton = <Button type="button" variant="secondary" disabled leftIcon={<CheckIcon/>}>{t('profile.friend_request_sent')}</Button>;
    } else if (currentUser.friendRequestIdsReceived?.includes(profileUser.id)) {
      friendStatusButton = (
        <div className="flex space-x-2">
          <Button type="button" variant="primary" onClick={() => handleFriendAction('accept')} isLoading={friendActionLoading} leftIcon={<CheckIcon/>}>{t('profile.accept_friend_request')}</Button>
          <Button type="button" variant="secondary" onClick={() => handleFriendAction('reject')} isLoading={friendActionLoading} leftIcon={<XMarkIcon/>}>{t('profile.reject_friend_request')}</Button>
        </div>
      );
    } else {
      friendStatusButton = <Button type="button" variant="primary" onClick={() => handleFriendAction('send')} isLoading={friendActionLoading} leftIcon={<UserPlusIcon/>}>{t('profile.send_friend_request')}</Button>;
    }
  }


  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={canEdit ? t('profile.edit_profile_title') : t('profile.view_profile_title', { name: profileUser.name })}
      size="md"
    >
      <form onSubmit={handleSaveChanges} className="space-y-4 md:space-y-6">
        <div className="flex flex-col items-center">
          <Avatar 
            user={{ 
              name: canEdit ? name : profileUser.name, 
              nickname: canEdit ? nickname : profileUser.nickname, 
              avatarUrl: canEdit ? avatarUrl : profileUser.avatarUrl, 
              avatarBgColor: canEdit ? avatarBgColor : profileUser.avatarBgColor 
            }} 
            size="xl" 
            className="mb-3 shadow-lg ring-2 ring-primary-200 dark:ring-primary-700"
          />
          {canEdit && (
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-4">
              <Button type="button" size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>{t('profile.change_photo')}</Button>
              <input type="file" accept="image/png, image/jpeg, image/gif" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
              { (avatarUrl) && <Button type="button" size="sm" variant="ghost" onClick={handleRemovePhoto}>{t('profile.remove_photo')}</Button> }
              <Button type="button" size="sm" variant="ghost" onClick={handleChangeAvatarColor}>{t('login.randomize_avatar_color')}</Button>
            </div>
          )}
        </div>

        {canEdit ? (
          <>
            <Input
              label={t('profile.full_name_label')}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
            <Input
              label={t('profile.nickname_label')}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isLoading}
              required
            />
             <Input
              label={t('profile.custom_status_label')}
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="E.g., Working on a project"
              disabled={isLoading}
            />
            <Input
              label={t('profile.bio_label')}
              as="textarea"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              disabled={isLoading}
            />
          </>
        ) : (
          <div className="space-y-3">
            <ProfileInfoItem label={t('profile.full_name_label')} value={profileUser.name} />
            <ProfileInfoItem label={t('profile.nickname_label')} value={`@${profileUser.nickname}`} />
            {profileUser.customStatus && <ProfileInfoItem label={t('profile.custom_status_label')} value={profileUser.customStatus} />}
            {profileUser.bio && <ProfileInfoItem label={t('profile.bio_label')} value={profileUser.bio} preWrap />}
          </div>
        )}
        
        <ProfileInfoItem label={t('profile.email_label')} value={profileUser.email} />
        <ProfileInfoItem label={t('profile.joined_label')} value={formatTimestamp(profileUser.joinedAt, 'date')} />
        <ProfileInfoItem label={t('profile.status_label')} value={profileUser.status === UserStatus.Online ? t('chat.message_area.online') : t('chat.message_area.offline')}
            statusColor={profileUser.status === UserStatus.Online ? 'text-green-500 dark:text-green-400' : 'text-secondary-500 dark:text-secondary-400'} />
        {profileUser.status === UserStatus.Offline && profileUser.lastSeen && 
            <ProfileInfoItem label={t('profile.last_seen_label')} value={formatTimestamp(profileUser.lastSeen, 'full')} />
        }


        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center p-2 bg-red-50 dark:bg-red-900/30 rounded-md">{error}</p>}

        <div className="pt-4 flex flex-col space-y-3 sm:space-y-0 sm:justify-end sm:items-center sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
          {canEdit && (
            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">
              {t('profile.save_changes')}
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => { setIsEditing(false); onClose(); }} disabled={isLoading} className="w-full sm:w-auto">
            {canEdit ? t('profile.cancel') : t('profile.close')}
          </Button>

          {!isViewingSelf && friendStatusButton}
          
          {currentUser?.id !== profileUser.id && ( 
            <Button
              type="button"
              variant={isBlockedByCurrentUser ? 'secondary' : 'danger'}
              outline={!isBlockedByCurrentUser} // Danger button is outlined if not blocked yet
              onClick={handleBlockToggle}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              {isBlockedByCurrentUser ? t('profile.unblock_user') : t('profile.block_user')}
            </Button>
          )}
        </div>
        {isViewingSelf && !isEditing && ( // Show Edit button if viewing self and not already editing
            <div className="mt-4 pt-3 border-t border-secondary-200 dark:border-secondary-600 flex justify-center">
                 <Button type="button" variant="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
        )}
        {canEdit && ( 
             <div className="mt-6 pt-5 border-t border-secondary-200 dark:border-secondary-700">
                <h3 className="text-md font-semibold text-red-600 dark:text-red-400 mb-2">{t('profile.danger_zone')}</h3>
                <Button 
                    type="button" 
                    variant="danger" 
                    onClick={handleDeleteOwnAccount} 
                    isLoading={isLoading}
                    leftIcon={<TrashIcon />}
                    className="w-full sm:w-auto"
                >
                    {t('profile.delete_my_account')}
                </Button>
             </div>
        )}
      </form>
    </Modal>
  );
};

const ProfileInfoItem: React.FC<{ label: string; value: string; statusColor?: string; preWrap?: boolean }> = ({ label, value, statusColor, preWrap = false }) => (
  <div>
    <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">{label}</p>
    <p className={`text-secondary-800 dark:text-secondary-100 ${statusColor || ''} ${preWrap ? 'whitespace-pre-wrap' : ''}`}>{value}</p>
  </div>
);


export default ProfilePage;
