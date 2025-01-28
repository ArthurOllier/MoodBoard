import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoodInput } from '../components/MoodInput';
import { TeamAverage } from '../components/TeamAverage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type TeamMood = Database['public']['Tables']['team_moods']['Row'];

export function Dashboard() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [trendData, setTrendData] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchMoodData();
  }, []);

  async function fetchMoodData() {
    try {
      const { data: moodData, error: moodError } = await supabase
        .from('team_moods')
        .select(`
          mood,
          date,
          team_id,
          teams (
            name
          )
        `)
        .order('date', { ascending: true })
        .limit(30);

      if (moodError) throw moodError;

      // Process the data for the chart
      const processedData = moodData?.reduce((acc: any, curr) => {
        const date = curr.date;
        const existingDay = acc.find((d: any) => d.date === date);

        if (existingDay) {
          if (!existingDay[curr.teams?.name]) {
            existingDay[curr.teams?.name] = {
              total: curr.mood,
              count: 1
            };
          } else {
            existingDay[curr.teams?.name].total += curr.mood;
            existingDay[curr.teams?.name].count += 1;
          }
        } else {
          acc.push({
            date,
            [curr.teams?.name]: {
              total: curr.mood,
              count: 1
            }
          });
        }
        return acc;
      }, []);

      // Calculate averages
      const finalData = processedData.map((day: any) => {
        const result = { date: day.date };
        Object.keys(day).forEach(key => {
          if (key !== 'date') {
            result[key] = day[key].total / day[key].count;
          }
        });
        return result;
      });

      setTrendData(finalData || []);
    } catch (err) {
      console.error('Error fetching mood data:', err);
      setError('Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchMoodData();
            }}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('nav.dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{t('mood.title')}</h2>
          <MoodInput onMoodSubmit={fetchMoodData} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Team Average</h2>
          <TeamAverage data={trendData} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Mood Trends</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="date"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                  }}
                />
                {Object.keys(trendData[0] || {}).filter(key => key !== 'date').map((teamName, index) => (
                  <Line
                    key={teamName}
                    type="monotone"
                    name={teamName}
                    dataKey={teamName}
                    stroke={[
                      '#54A0FF',
                      '#00D2D3',
                      '#FF9F43',
                      '#5E72E4',
                      '#11CDEF',
                    ][index % 5]}
                    strokeWidth={2}
                    dot={{ fill: [
                      '#54A0FF',
                      '#00D2D3',
                      '#FF9F43',
                      '#5E72E4',
                      '#11CDEF',
                    ][index % 5] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}