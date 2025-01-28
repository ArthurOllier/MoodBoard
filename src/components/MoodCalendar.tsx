import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock data - replace with real data from your database
const mockMoodData = new Map([
  ['2024-03-01', { average: 4.2, count: 8 }],
  ['2024-03-04', { average: 3.8, count: 7 }],
  ['2024-03-05', { average: 4.5, count: 9 }],
  ['2024-03-06', { average: 3.9, count: 8 }],
  ['2024-03-07', { average: 4.1, count: 6 }],
]);

interface DayMood {
  average: number;
  count: number;
}

export function MoodCalendar() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const getMoodColor = (mood: DayMood) => {
    const value = mood.average;
    if (value >= 4.5) return 'bg-mood-5/20 hover:bg-mood-5/30';
    if (value >= 4) return 'bg-mood-4/20 hover:bg-mood-4/30';
    if (value >= 3) return 'bg-mood-3/20 hover:bg-mood-3/30';
    if (value >= 2) return 'bg-mood-2/20 hover:bg-mood-2/30';
    return 'bg-mood-1/20 hover:bg-mood-1/30';
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = [];
  let week = [];

  days.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-white dark:bg-gray-800 p-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const moodData = mockMoodData.get(dateKey);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative bg-white dark:bg-gray-800 p-2 h-24 text-left transition-colors',
                    !isCurrentMonth && 'text-gray-400 dark:text-gray-600',
                    isSelected && 'ring-2 ring-indigo-500 dark:ring-indigo-400',
                    moodData && getMoodColor(moodData)
                  )}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {moodData && (
                    <div className="absolute bottom-2 right-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Info className="w-4 h-4 mr-1" />
                      <span>{moodData.count}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {selectedDate && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {mockMoodData.get(format(selectedDate, 'yyyy-MM-dd')) ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team Average: {mockMoodData.get(format(selectedDate, 'yyyy-MM-dd'))?.average.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Responses: {mockMoodData.get(format(selectedDate, 'yyyy-MM-dd'))?.count}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No mood data available for this date
            </p>
          )}
        </div>
      )}
    </div>
  );
}