import React from 'react';
import { useTranslation } from 'react-i18next';
import { Frown, Meh, Smile, SmilePlus, AlertCircle, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

interface MoodOption {
  value: number | 'ooo';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

export function MoodInput() {
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = React.useState<number | 'ooo' | null>(null);

  const moodOptions: MoodOption[] = [
    { value: 1, label: t('mood.veryBad'), icon: Frown, color: 'mood-1' },
    { value: 2, label: t('mood.bad'), icon: AlertCircle, color: 'mood-2' },
    { value: 3, label: t('mood.neutral'), icon: Meh, color: 'mood-3' },
    { value: 4, label: t('mood.good'), icon: Smile, color: 'mood-4' },
    { value: 5, label: t('mood.veryGood'), icon: SmilePlus, color: 'mood-5' },
    { value: 'ooo', label: t('mood.ooo'), icon: Briefcase, color: 'gray-400' },
  ];

  const handleMoodSelect = (mood: number | 'ooo') => {
    setSelectedMood(mood);
    // TODO: Save mood to database
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {moodOptions.map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => handleMoodSelect(value)}
            className={cn(
              'flex flex-col items-center p-4 rounded-lg transition-all duration-200',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              selectedMood === value && 'ring-2 ring-offset-2 dark:ring-offset-gray-800',
              typeof value === 'number' ? `ring-mood-${value}` : 'ring-gray-400'
            )}
          >
            <Icon
              className={cn(
                'w-8 h-8 mb-2',
                typeof value === 'number' ? `text-mood-${value}` : 'text-gray-400'
              )}
            />
            <span className="text-sm font-medium text-center">{label}</span>
          </button>
        ))}
      </div>
      {selectedMood && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          Thank you for sharing your mood today!
        </p>
      )}
    </div>
  );
}