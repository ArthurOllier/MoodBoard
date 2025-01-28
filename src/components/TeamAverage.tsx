import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

// Mock data - replace with real data from your database
const mockData = [
  { day: 'Mon', average: 4.2 },
  { day: 'Tue', average: 3.8 },
  { day: 'Wed', average: 4.5 },
  { day: 'Thu', average: 3.9 },
  { day: 'Fri', average: 4.7 },
];

export function TeamAverage() {
  const { t } = useTranslation();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-lg rounded border dark:border-gray-700">
          <p className="text-sm">
            Average: <span className="font-bold">{payload[0].value.toFixed(1)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="day"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="average"
            fill="url(#gradientColor)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#54A0FF" />
              <stop offset="100%" stopColor="#00D2D3" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}