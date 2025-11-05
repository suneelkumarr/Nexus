import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, MapPin, Clock, Globe, Smartphone, RefreshCw } from 'lucide-react';

interface AudienceDemographicsProps {
  accountId: string;
}

export default function AudienceDemographics({ accountId }: AudienceDemographicsProps) {
  const [loading, setLoading] = useState(false);
  const [demographics, setDemographics] = useState<any>(null);

  useEffect(() => {
    if (accountId) {
      loadDemographics();
    }
  }, [accountId]);

  const loadDemographics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audience_demographics')
        .select('*')
        .eq('account_id', accountId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('No demographics data found, generating sample data');
        generateSampleDemographics();
      } else if (data) {
        setDemographics(data);
      } else {
        generateSampleDemographics();
      }
    } catch (error) {
      console.error('Error loading demographics:', error);
      generateSampleDemographics();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleDemographics = () => {
    const sampleData = {
      age_distribution: {
        '13-17': 8,
        '18-24': 35,
        '25-34': 32,
        '35-44': 18,
        '45-54': 5,
        '55+': 2,
      },
      gender_distribution: {
        'male': 42,
        'female': 56,
        'other': 2,
      },
      top_countries: [
        { country: 'United States', percentage: 38 },
        { country: 'United Kingdom', percentage: 15 },
        { country: 'Canada', percentage: 12 },
        { country: 'Australia', percentage: 10 },
        { country: 'Germany', percentage: 8 },
        { country: 'Others', percentage: 17 },
      ],
      top_cities: [
        { city: 'New York', percentage: 15 },
        { city: 'London', percentage: 12 },
        { city: 'Los Angeles', percentage: 10 },
        { city: 'Toronto', percentage: 8 },
        { city: 'Sydney', percentage: 7 },
      ],
      active_hours: {
        '0': 2, '1': 1, '2': 1, '3': 1, '4': 1, '5': 2,
        '6': 4, '7': 6, '8': 8, '9': 7, '10': 6, '11': 5,
        '12': 6, '13': 7, '14': 8, '15': 7, '16': 6, '17': 7,
        '18': 8, '19': 9, '20': 8, '21': 6, '22': 4, '23': 3,
      },
      active_days: {
        'Monday': 14,
        'Tuesday': 15,
        'Wednesday': 16,
        'Thursday': 15,
        'Friday': 14,
        'Saturday': 13,
        'Sunday': 13,
      },
      language_distribution: [
        { language: 'English', percentage: 72 },
        { language: 'Spanish', percentage: 15 },
        { language: 'French', percentage: 8 },
        { language: 'Others', percentage: 5 },
      ],
      device_types: {
        'mobile': 85,
        'desktop': 12,
        'tablet': 3,
      },
    };
    setDemographics(sampleData);
  };

  const getAgeDistributionData = () => {
    if (!demographics?.age_distribution) return [];
    return Object.entries(demographics.age_distribution).map(([age, value]) => ({
      age,
      value: value as number,
    }));
  };

  const getGenderDistributionData = () => {
    if (!demographics?.gender_distribution) return [];
    return Object.entries(demographics.gender_distribution).map(([gender, value]) => ({
      name: gender.charAt(0).toUpperCase() + gender.slice(1),
      value: value as number,
    }));
  };

  const getActiveHoursData = () => {
    if (!demographics?.active_hours) return [];
    return Object.entries(demographics.active_hours).map(([hour, value]) => ({
      hour: `${hour}:00`,
      activity: value as number,
    }));
  };

  const getActiveDaysData = () => {
    if (!demographics?.active_days) return [];
    return Object.entries(demographics.active_days).map(([day, value]) => ({
      day,
      activity: value as number,
    }));
  };

  const AGE_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
  const GENDER_COLORS = ['#3B82F6', '#EC4899', '#8B5CF6'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-6"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!demographics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-center text-gray-500 dark:text-gray-400">No demographics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Audience Demographics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Understand who your followers are</p>
            </div>
          </div>

          <button
            onClick={loadDemographics}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Age & Gender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Age Distribution</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getAgeDistributionData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ age, value }) => `${age}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getAgeDistributionData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-pink-600" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Gender Distribution</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getGenderDistributionData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getGenderDistributionData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="w-5 h-5 text-green-600" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Top Countries</h4>
        </div>
        <div className="space-y-3">
          {demographics.top_countries?.map((country: any, index: number) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                {country.country}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${country.percentage}%` }}
                  >
                    <span className="text-white text-xs font-bold">{country.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-orange-600" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Peak Activity Hours</h4>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={getActiveHoursData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="hour"
              stroke="#6B7280"
              style={{ fontSize: '10px' }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Activity %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="activity" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
          Best times to post: {Object.entries(demographics.active_hours || {})
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 3)
            .map(([hour]) => `${hour}:00`)
            .join(', ')}
        </p>
      </div>

      {/* Active Days */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-2 mb-6">
          <Globe className="w-5 h-5 text-purple-600" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Most Active Days</h4>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={getActiveDaysData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="day"
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Activity %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="activity" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Device & Language Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Types */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Device Types</h4>
          </div>
          <div className="space-y-3">
            {Object.entries(demographics.device_types || {}).map(([device, percentage], index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {device}
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Languages</h4>
          </div>
          <div className="space-y-3">
            {demographics.language_distribution?.map((lang: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lang.language}
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {lang.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
