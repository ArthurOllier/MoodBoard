import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoodCalendar } from '../components/MoodCalendar';

export function Calendar() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('nav.calendar')}</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <MoodCalendar />
      </div>
    </div>
  );
}