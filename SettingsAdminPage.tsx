import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSettings, useUserManagement } from './store'; 
import { AppSettings, Theme, User, UserStatus, Language, FontSize, TranslationKey, PresenceVisibility, MessagingPrivacy } from './types'; // Added MessagingPrivacy
import { Button, Input, Modal, Avatar, TrashIcon, EyeIcon, SunIcon, MoonIcon, ArrowLeftIcon, LoadingSpinner, SearchIcon, UsersGroupIcon } from './ui'; // Added UsersGroupIcon for potential use
import { APP_NAME, DEFAULT_APP_SETTINGS } from './constants'; 
import { formatTimestamp } from './utils';
import ProfilePage from './ProfilePage'; 

interface SettingsAdminPageProps {
  view: 'settings' | 'admin';
}

const SettingsCard: React.FC<{title: string | React.ReactNode, children: React.ReactNode, className?: string}> = ({ title, children, className}) => (
    <div className={`bg-white dark:bg-secondary-800 p-4 md:p-6 rounded-xl shadow-lg ${className}`}>
        { typeof title === 'string' ? (
             <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4 border-b border-secondary-200 dark:border-secondary-700 pb-3">{title}</h3>
            ) : title }
        {children}
    </div>
);

const SettingsContent: React.FC = () => {
  const { settings, updateSetting, t } = useSettings();
  const { deleteAccount, currentUser, unblockUser: unblockUserFromAuth, updateCurrentUser } = useAuth(); 
  const { getUserById } = useUserManagement();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSettingChange = <K extends keyof Omit<AppSettings, 'translations'>>(key: K, value: AppSettings[K]) => {
    updateSetting(key, value);
  };

  const handlePresenceChange = (value: PresenceVisibility) => {
    if (currentUser) {
        updateCurrentUser({ presenceVisibility: value });
    }
  };
  
  const handleMessagingPrivacyChange = (value: MessagingPrivacy) => {
    if (currentUser) {
        updateCurrentUser({ messagingPrivacy: value });
    }
  };


  const handleDeleteMyAccount = async () => {
    // Confirmation is now handled by the modal's button logic
    setIsDeleting(true);
    const success = await deleteAccount();
    setIsDeleting(false);
    if (success) {
        setIsDeleteModalOpen(false); 
    } else {
        alert(t('profile.error_update_failed')); // Assuming generic error message for now
    }
  };
  
  const handleUnblockUser = async (userIdToUnblock: string) => {
    await unblockUserFromAuth(userIdToUnblock);
    // The currentUser object in AuthContext will re-render and update the list.
  };

  const blockedUsersDetails = currentUser?.blockedUserIds?.map(id => getUserById(id)).filter(Boolean) as User[] || [];


  return (
    <div className="max-w-2xl mx-auto p-2 md:p-4 space-y-4 md:space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 md:mb-6 px-2">{t('settings.title')}</h2>
      
      <SettingsCard title={t('settings.appearance_card')}>
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">{t('settings.theme_label')}</label>
                <div className="flex items-center space-x-1 p-1 bg-secondary-100 dark:bg-secondary-700 rounded-full w-fit">
                <Button 
                    variant={settings.theme === Theme.Light ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => handleSettingChange('theme', Theme.Light)}
                    className={`rounded-full px-3 py-1.5 ${settings.theme === Theme.Light ? '' : 'text-secondary-500 dark:text-secondary-400'}`}
                    aria-pressed={settings.theme === Theme.Light}
                    aria-label={t('settings.light_theme')}
                    leftIcon={<SunIcon className="w-4 h-4"/>}
                >
                    {t('settings.light_theme')}
                </Button>
                <Button 
                    variant={settings.theme === Theme.Dark ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => handleSettingChange('theme', Theme.Dark)}
                    className={`rounded-full px-3 py-1.5 ${settings.theme === Theme.Dark ? (settings.theme === Theme.Dark ? 'bg-secondary-600 text-white' : '') : 'text-secondary-500 dark:text-secondary-400'}`}
                    aria-pressed={settings.theme === Theme.Dark}
                    aria-label={t('settings.dark_theme')}
                    leftIcon={<MoonIcon className="w-4 h-4"/>}
                >
                    {t('settings.dark_theme')}
                </Button>
                </div>
            </div>
            <div>
                <label htmlFor="fontSizeSelect" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">{t('settings.font_size_label')}</label>
                <select 
                    id="fontSizeSelect"
                    value={settings.fontSize} 
                    onChange={(e) => handleSettingChange('fontSize', e.target.value as FontSize)}
                    className="w-full p-2.5 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    aria-label={t('settings.font_size_label')}
                >
                    <option value="xs">{t('settings.font_size_xs')}</option>
                    <option value="sm">{t('settings.font_size_sm')}</option>
                    <option value="base">{t('settings.font_size_base')}</option>
                    <option value="lg">{t('settings.font_size_lg')}</option>
                    <option value="xl">{t('settings.font_size_xl')}</option>
                </select>
            </div>
          </div>
      </SettingsCard>

      <SettingsCard title={t('settings.language_card')}>
          <select 
            value={settings.language} 
            onChange={(e) => handleSettingChange('language', e.target.value as Language)}
            className="w-full p-2.5 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label={t('settings.language_label')}
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
          </select>
      </SettingsCard>

      <SettingsCard title={t('settings.privacy_card')}>
        <div className="space-y-4">
            <div>
                <p className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">{t('settings.presence_visibility_label')}</p>
                {(Object.values(PresenceVisibility) as PresenceVisibility[]).map((option) => (
                    <label key={`presence-${option}`} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-700/60">
                        <input
                            type="radio"
                            name="presenceVisibility"
                            value={option}
                            checked={currentUser?.presenceVisibility === option}
                            onChange={() => handlePresenceChange(option)}
                            className="h-4 w-4 text-primary-600 border-secondary-300 dark:border-secondary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700 dark:text-secondary-300">
                            {t(`settings.presence_visibility_${option}` as TranslationKey)}
                        </span>
                    </label>
                ))}
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">{t('settings.presence_visibility_note')}</p>
            </div>
            <div className="pt-3 border-t border-secondary-100 dark:border-secondary-700">
                <p className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">{t('settings.messaging_privacy_label')}</p>
                 {(Object.values(MessagingPrivacy) as MessagingPrivacy[]).map((option) => (
                    <label key={`messaging-${option}`} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-700/60">
                        <input
                            type="radio"
                            name="messagingPrivacy"
                            value={option}
                            checked={currentUser?.messagingPrivacy === option}
                            onChange={() => handleMessagingPrivacyChange(option)}
                            className="h-4 w-4 text-primary-600 border-secondary-300 dark:border-secondary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700 dark:text-secondary-300">
                            {t(`settings.messaging_privacy_${option}` as TranslationKey)}
                        </span>
                    </label>
                ))}
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">{t('settings.messaging_privacy_note')}</p>
            </div>
        </div>
      </SettingsCard>

      <SettingsCard title={t('settings.notifications_card')}>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-secondary-700 dark:text-secondary-300">{t('settings.enable_notifications_label')}</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.notificationsEnabled}
                onChange={(e) => {
                    handleSettingChange('notificationsEnabled', e.target.checked);
                    // For demo purposes, an alert can be shown.
                    // if (e.target.checked) alert("Notifications Enabled (Simulated - actual browser notifications not implemented).");
                    // else alert("Notifications Disabled (Simulated).");
                }}
                id="notificationsToggle"
              />
              <label htmlFor="notificationsToggle" className="sr-only">Toggle Notifications</label>
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-600 rounded-full peer dark:bg-secondary-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-500 peer-checked:bg-primary-600"></div>
            </div>
          </label>
           <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">{t('settings.notifications_note')}</p>
      </SettingsCard>
      
      <SettingsCard title={t('settings.blocked_users_card')}>
        {blockedUsersDetails.length === 0 ? (
            <p className="text-secondary-500 dark:text-secondary-400">{t('settings.no_blocked_users')}</p>
        ) : (
            <ul className="space-y-2">
                {blockedUsersDetails.map(user => (
                    <li key={user.id} className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-700/60 rounded-lg">
                        <div className="flex items-center">
                            <Avatar user={user} size="sm" />
                            <span className="ml-2 text-secondary-800 dark:text-secondary-200">{user.name} (@{user.nickname})</span>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => handleUnblockUser(user.id)}>{t('settings.unblock_button')}</Button>
                    </li>
                ))}
            </ul>
        )}
      </SettingsCard>
        
      <SettingsCard title={t('settings.account_management_card')} className="border-red-500/50 dark:border-red-500/30 border">
           <Button 
            variant="danger" 
            className="w-full sm:w-auto" 
            onClick={() => setIsDeleteModalOpen(true)} 
            leftIcon={<TrashIcon/>}
            >
            {t('settings.delete_my_account_button')}
          </Button>
           <p className="text-xs text-red-600 dark:text-red-400 mt-2">{t('settings.delete_account_warning')}</p>
      </SettingsCard>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('profile.confirm_delete_account_title')} size="sm">
        <p className="text-secondary-700 dark:text-secondary-300 mb-1">
            {t('profile.confirm_delete_account_warning').split('\n\n')[1]}
        </p>
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">
             {t('profile.confirm_delete_account_prompt')}
        </p>
        <Input 
            id="deleteConfirmInput" 
            type="text" 
            placeholder="Type DELETE here" 
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            wrapperClassName="mb-4"
        />
        <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>{t('profile.cancel')}</Button>
            <Button 
                id="confirmDeleteButton" 
                variant="danger" 
                onClick={handleDeleteMyAccount} 
                isLoading={isDeleting} 
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            >
                {t('profile.confirm_delete_account_button')}
            </Button>
        </div>
      </Modal>
    </div>
  );
};

const AdminPanelContent: React.FC = () => {
  const { users, deleteUserByAdmin, getUserById } = useUserManagement();
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null); 
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      alert(t('admin.admin_cannot_delete_self'));
      return;
    }
    if (window.confirm(t('admin.confirm_delete_user_q', { userName, userId }))) {
      setIsDeletingUser(userId);
      await deleteUserByAdmin(userId);
      setIsDeletingUser(null);
    }
  };
  
  const handleViewUser = (userId: string) => {
      const userToView = getUserById(userId);
      if (userToView) {
          setViewedUser(userToView);
          setIsProfileModalOpen(true);
      }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()); 

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-4">
      <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 md:mb-6 px-2">{t('admin.user_management_title')}</h2>
      <div className="mb-6 px-2">
        <Input 
            type="search" 
            placeholder={t('admin.search_users_placeholder')}
            aria-label={t('admin.search_users_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            wrapperClassName="mb-0"
            leftIcon={<SearchIcon className="w-4 h-4"/>}
        />
      </div>

      <div className="bg-white dark:bg-secondary-800 shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
          <thead className="bg-secondary-50 dark:bg-secondary-700/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">{t('admin.table_header_user')}</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">{t('admin.table_header_email')}</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">{t('admin.table_header_joined')}</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">{t('admin.table_header_status')}</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-300 uppercase tracking-wider">{t('admin.table_header_actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-100 dark:divide-secondary-700">
            {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-secondary-500 dark:text-secondary-400">
                    {searchTerm ? t('admin.no_users_match_search', {searchTerm}) : (users.length === 0 ? t('admin.no_users_yet') : "No users to display." )}
                </td></tr>
            )}
            {filteredUsers.map(user => (
              <tr key={user.id} className={`${user.isAdmin ? 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30' : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50'} transition-colors`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar user={user} size="sm" />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{user.name}</div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">@{user.nickname} {user.isAdmin && <span className="text-primary-600 dark:text-primary-400 font-semibold">(Admin)</span>}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-300">{user.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-300">{formatTimestamp(user.joinedAt, 'date')}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === UserStatus.Online ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-600 dark:text-secondary-200'}`}>
                    {user.status === UserStatus.Online ? t('chat.message_area.online') : t('chat.message_area.offline')}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleViewUser(user.id)} title={t('admin.view_profile_action')} aria-label={`${t('admin.view_profile_action')} ${user.name}`} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1">
                    <EyeIcon className="w-4 h-4"/>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteUser(user.id, user.name)} 
                    disabled={user.id === currentUser?.id || isDeletingUser === user.id}
                    isLoading={isDeletingUser === user.id}
                    title={t('admin.delete_user_action')}
                    aria-label={`${t('admin.delete_user_action')} ${user.name}`}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                  >
                    {isDeletingUser === user.id ? <LoadingSpinner size="sm" colorClass="border-red-500"/> : <TrashIcon className="w-4 h-4"/>}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewedUser && (
        <ProfilePage
            isOpen={isProfileModalOpen}
            onClose={() => { setIsProfileModalOpen(false); setViewedUser(null); }}
            userId={viewedUser.id}
            viewMode="view" 
        />
      )}
    </div>
  );
};


const SettingsAdminPage: React.FC<SettingsAdminPageProps> = ({ view }) => {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();

  if (view === 'admin' && !currentUser?.isAdmin) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 p-6">
            <h1 className="text-3xl font-bold mb-4 text-red-600 dark:text-red-400">{t('admin.access_denied_title')}</h1>
            <p className="mb-6 text-lg text-center">{t('admin.access_denied_message')}</p>
            <Button onClick={() => navigate('/')} variant="primary" size="lg" leftIcon={<ArrowLeftIcon/>}>
                {t('admin.go_back_to_chats')}
            </Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-100 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100">
      <header className="bg-white dark:bg-secondary-800 shadow-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-2 -ml-2 p-2" aria-label={t('admin.go_back_to_chats')} title={t('admin.go_back_to_chats')}>
            <ArrowLeftIcon className={`w-5 h-5 ${document.documentElement.dir === 'rtl' ? 'transform scale-x-[-1]' : ''}`}/>
          </Button>
          <h1 className="text-xl font-semibold ">
            {view === 'settings' ? t('settings.title') : t('admin.title')}
          </h1>
        </div>
      </header>
      <main className="py-1">
        {view === 'settings' ? <SettingsContent /> : <AdminPanelContent />}
      </main>
    </div>
  );
};

export default SettingsAdminPage;