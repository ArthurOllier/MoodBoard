import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calendar as CalendarIcon, Users, Settings as SettingsIcon, Sun, Moon, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(false);
  const { signOut, profile } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: BarChart3 },
    { path: '/calendar', label: t('nav.calendar'), icon: CalendarIcon },
    { path: '/teams', label: t('nav.teams'), icon: Users },
    { path: '/settings', label: t('nav.settings'), icon: SettingsIcon },
  ];

  return (
    <div className={cn(
      'min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50',
      'transition-colors duration-200'
    )}>
      <nav className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Team Mood</h1>
        </div>

        {/* User Profile */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              {profile?.full_name?.[0] || profile?.username?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || profile?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile?.username}
              </p>
            </div>
          </div>
        </div>

        <ul className="space-y-2 p-4">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-2 rounded-lg',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  location.pathname === path && 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg
                     hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5" />
                <span>{t('theme.light')}</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>{t('theme.dark')}</span>
              </>
            )}
          </button>

          <button
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg
                     text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}