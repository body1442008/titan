
import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, useSettings } from './store';
import { Input, Button, Avatar, ArrowRightCircleIcon } from './ui'; // Changed AppLogo to ArrowRightCircleIcon
import { APP_NAME, AVATAR_COLORS } from './constants';
import { getInitials, getRandomColor } from './utils';
import { User, SignupPayload, SignupCompletionResult, TranslationKey } from './types'; 

interface AuthPageProps {
  initialView?: 'login' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ initialView = 'login' }) => {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, currentUser } = useAuth();
  const { t } = useSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarBgColorSeed, setAvatarBgColorSeed] = useState(fullName || nickname); 

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);
  
  useEffect(() => {
    if (!isLoginView) {
      setAvatarBgColorSeed(fullName || nickname);
    }
  }, [fullName, nickname, isLoginView]);


  const handleAuthAction = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isLoginView) {
      const success = await login(email, password);
      if (!success) setError(t('login.error_invalid_credentials'));
      else navigate(from, { replace: true });
    } else {
      if (!fullName.trim() || !nickname.trim() || !email.trim() || !password.trim()) {
        setError(t('login.error_all_fields_required'));
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(t('login.error_password_length'));
        setIsLoading(false);
        return;
      }
      const signupData: SignupPayload = {
        name: fullName,
        nickname,
        email,
        passwordHash: password, 
        avatarInitialColorSeed: avatarBgColorSeed
      };
      const result: SignupCompletionResult = await signup(signupData);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        let errorKey: TranslationKey = 'login.error_signup_failed'; 
        if (result.reason === 'duplicate_email') {
          errorKey = 'login.error_email_exists';
        } else if (result.reason === 'duplicate_nickname') {
          errorKey = 'login.error_nickname_exists';
        } else if (result.reason === 'duplicate_both') {
          errorKey = 'login.error_email_and_nickname_exists';
        }
        setError(t(errorKey));
      }
    }
    setIsLoading(false);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
    setNickname('');
    setAvatarBgColorSeed(Date.now().toString()); 
  };
  
  const handleRandomizeAvatarColor = () => {
    setAvatarBgColorSeed(Date.now().toString()); 
  };

  const cardBaseClass = "w-full max-w-md bg-white dark:bg-secondary-800 shadow-2xl rounded-xl p-8 md:p-10 transition-all duration-300 ease-in-out";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600 dark:from-secondary-800 dark:via-secondary-900 dark:to-black p-4 selection:bg-primary-300 selection:text-primary-800">
      <div className="mb-8 transform hover:scale-105 transition-transform duration-300 flex items-center space-x-2">
        <ArrowRightCircleIcon className="w-10 h-10 text-white" />
        <span className="text-3xl font-bold tracking-tight text-white">TitanChat</span>
      </div>
      <div className={`${cardBaseClass} transform hover:shadow-blue-500/30 dark:hover:shadow-primary-400/20`}>
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-secondary-100 mb-8">
          {isLoginView ? t('login.welcome_back') : t('login.create_account')}
        </h2>
        <form onSubmit={handleAuthAction} className="space-y-6">
          {!isLoginView && (
            <>
              <div className="flex flex-col items-center mb-6">
                <Avatar 
                    user={{ 
                        name: fullName, 
                        nickname: nickname, 
                        avatarBgColor: getRandomColor(AVATAR_COLORS, avatarBgColorSeed) 
                    } as User} 
                    size="xl" 
                    className="shadow-lg mb-2 ring-2 ring-blue-200 dark:ring-primary-700"
                />
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  onClick={handleRandomizeAvatarColor}
                  className="mt-1 text-xs text-blue-600 dark:text-blue-400"
                >
                  {t('login.randomize_avatar_color')}
                </Button>
              </div>
              <Input
                label={t('login.full_name')}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Ada Lovelace"
                required={!isLoginView}
                disabled={isLoading}
                autoComplete="name"
              />
              <Input
                label={t('login.nickname')}
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="E.g., ada_dev"
                required={!isLoginView}
                disabled={isLoading}
                autoComplete="username"
              />
            </>
          )}
          <Input
            label={t('login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            autoComplete="email"
          />
          <Input
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.password') + " (min. 6 characters)"}
            required
            disabled={isLoading}
            autoComplete={isLoginView ? "current-password" : "new-password"}
          />
          
          {error && <p className="text-sm text-red-500 dark:text-red-400 text-center p-2 bg-red-50 dark:bg-red-900/30 rounded-md">{error}</p>}

          <Button 
            type="submit" 
            size="lg" 
            className="w-full !py-3 text-base bg-blue-500 hover:bg-blue-600 focus:ring-blue-400 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400" 
            isLoading={isLoading}
          >
            {isLoginView ? t('login.login_button') : t('login.create_account_button')}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-secondary-400">
          {isLoginView ? t('login.no_account_q') : t('login.have_account_q')}{' '}
          <button onClick={toggleView} className="font-medium text-blue-600 hover:text-blue-700 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none focus:underline">
            {isLoginView ? t('login.signup_now') : t('login.login_now')}
          </button>
        </p>
      </div>
       <footer className="mt-10 text-center text-sm text-blue-100 dark:text-secondary-500">
        &copy; {new Date().getFullYear()} {APP_NAME}. {t('general.loading')}
      </footer>
    </div>
  );
};

export default AuthPage;
