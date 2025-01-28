import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon, Bell, MessageSquare, Radio, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock teams data - replace with real data from your database
const mockTeams = [
  { id: 1, name: 'Frontend Team' },
  { id: 2, name: 'Backend Team' },
];

interface TeamNotificationSettings {
  teamId: number;
  overrideGlobal: boolean;
  email: boolean;
  slack: boolean;
  teams: boolean;
  discord: boolean;
  realtime: boolean;
}

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
      <div className="flex items-start space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="ml-11">
        {children}
      </div>
    </div>
  );
}

interface SettingsOptionProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsOption({ label, description, children }: SettingsOptionProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        enabled ? 'bg-indigo-600' : 'bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

export function Settings() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));
  const [selectedTeam, setSelectedTeam] = React.useState<number | null>(null);
  const [globalNotifications, setGlobalNotifications] = React.useState({
    email: true,
    slack: false,
    teams: false,
    discord: false,
    realtime: false,
  });
  const [teamNotifications, setTeamNotifications] = React.useState<TeamNotificationSettings[]>(
    mockTeams.map(team => ({
      teamId: team.id,
      overrideGlobal: false,
      email: true,
      slack: false,
      teams: false,
      discord: false,
      realtime: false,
    }))
  );

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleGlobalNotification = (key: keyof typeof globalNotifications) => {
    setGlobalNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTeamNotification = (teamId: number, key: keyof TeamNotificationSettings) => {
    setTeamNotifications(prev =>
      prev.map(team =>
        team.teamId === teamId
          ? { ...team, [key]: !team[key] }
          : team
      )
    );
  };

  const currentTeamSettings = selectedTeam
    ? teamNotifications.find(team => team.teamId === selectedTeam)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('nav.settings')}</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Language Settings */}
          <div className="p-6">
            <SettingsSection
              title={t('settings.language.title')}
              description={t('settings.language.description')}
              icon={Globe}
            >
              <SettingsOption label={t('settings.language.select')}>
                <select
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  {languages.map(({ code, name, nativeName }) => (
                    <option key={code} value={code}>
                      {nativeName} ({name})
                    </option>
                  ))}
                </select>
              </SettingsOption>
            </SettingsSection>
          </div>

          {/* Theme Settings */}
          <div className="p-6">
            <SettingsSection
              title={t('settings.theme.title')}
              description={t('settings.theme.description')}
              icon={isDark ? Moon : Sun}
            >
              <SettingsOption label={t('settings.theme.darkMode')}>
                <Toggle enabled={isDark} onChange={handleThemeToggle} />
              </SettingsOption>
            </SettingsSection>
          </div>

          {/* Notifications */}
          <div className="p-6">
            <SettingsSection
              title={t('settings.notifications.title')}
              description={t('settings.notifications.description')}
              icon={Bell}
            >
              <div className="space-y-6">
                {/* Global Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">{t('settings.notifications.allTeams')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                    <SettingsOption
                      label={t('settings.notifications.frequency.realtime')}
                      description={t('settings.notifications.frequency.daily')}
                    >
                      <Toggle
                        enabled={globalNotifications.realtime}
                        onChange={() => toggleGlobalNotification('realtime')}
                      />
                    </SettingsOption>
                  </div>

                  <div className="space-y-2">
                    <SettingsOption
                      label={t('settings.notifications.email')}
                      description={t('settings.notifications.emailDescription')}
                    >
                      <Toggle
                        enabled={globalNotifications.email}
                        onChange={() => toggleGlobalNotification('email')}
                      />
                    </SettingsOption>

                    <SettingsOption
                      label={t('settings.notifications.slack')}
                      description={t('settings.notifications.slackDescription')}
                    >
                      <Toggle
                        enabled={globalNotifications.slack}
                        onChange={() => toggleGlobalNotification('slack')}
                      />
                    </SettingsOption>

                    <SettingsOption
                      label={t('settings.notifications.teams')}
                      description={t('settings.notifications.teamsDescription')}
                    >
                      <Toggle
                        enabled={globalNotifications.teams}
                        onChange={() => toggleGlobalNotification('teams')}
                      />
                    </SettingsOption>

                    <SettingsOption
                      label={t('settings.notifications.discord')}
                      description={t('settings.notifications.discordDescription')}
                    >
                      <Toggle
                        enabled={globalNotifications.discord}
                        onChange={() => toggleGlobalNotification('discord')}
                      />
                    </SettingsOption>
                  </div>
                </div>

                {/* Team-Specific Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">{t('settings.notifications.teamSettings')}</h4>
                  <div className="space-y-4">
                    <select
                      value={selectedTeam || ''}
                      onChange={(e) => setSelectedTeam(Number(e.target.value) || null)}
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                      <option value="">{t('settings.notifications.selectTeam')}</option>
                      {mockTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>

                    {currentTeamSettings && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <SettingsOption
                            label={t('settings.notifications.overrideGlobal')}
                            description={t('settings.notifications.teamDescription')}
                          >
                            <Toggle
                              enabled={currentTeamSettings.overrideGlobal}
                              onChange={() => toggleTeamNotification(currentTeamSettings.teamId, 'overrideGlobal')}
                            />
                          </SettingsOption>
                        </div>

                        <div className="space-y-2">
                          <SettingsOption label={t('settings.notifications.email')}>
                            <Toggle
                              enabled={currentTeamSettings.email}
                              onChange={() => toggleTeamNotification(currentTeamSettings.teamId, 'email')}
                              disabled={!currentTeamSettings.overrideGlobal}
                            />
                          </SettingsOption>

                          <SettingsOption label={t('settings.notifications.slack')}>
                            <Toggle
                              enabled={currentTeamSettings.slack}
                              onChange={() => toggleTeamNotification(currentTeamSettings.teamId, 'slack')}
                              disabled={!currentTeamSettings.overrideGlobal}
                            />
                          </SettingsOption>

                          <SettingsOption label={t('settings.notifications.teams')}>
                            <Toggle
                              enabled={currentTeamSettings.teams}
                              onChange={() => toggleTeamNotification(currentTeamSettings.teamId, 'teams')}
                              disabled={!currentTeamSettings.overrideGlobal}
                            />
                          </SettingsOption>

                          <SettingsOption label={t('settings.notifications.discord')}>
                            <Toggle
                              enabled={currentTeamSettings.discord}
                              onChange={() => toggleTeamNotification(currentTeamSettings.teamId, 'discord')}
                              disabled={!currentTeamSettings.overrideGlobal}
                            />
                          </SettingsOption>

                          <SettingsOption label={t('settings.notifications.frequency.realtime')}>
                            <Toggle
                              enabled={currentTeamSettings.realtime}
                              onChange={() => toggleTeamNotification(currentTeamSettings.teamId, 'realtime')}
                              disabled={!currentTeamSettings.overrideGlobal}
                            />
                          </SettingsOption>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}