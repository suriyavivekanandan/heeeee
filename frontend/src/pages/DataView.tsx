// src/pages/DataView.tsx
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, ChartBar, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WastageData {
  date: string;
  initialWeight: number;
  remainingWeight: number;
  wastagePercentage: number;
}

function DataView() {
  const [wastageData, setWastageData] = useState<WastageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchData();
  }, [viewType]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const processedData = data.map(entry => ({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        initialWeight: entry.initial_weight,
        remainingWeight: entry.remaining_weight || 0,
        wastagePercentage: ((entry.initial_weight - (entry.remaining_weight || 0)) / entry.initial_weight) * 100
      }));

      setWastageData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ChartBar className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Food Waste Analytics</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('daily')}
              className={`px-4 py-2 rounded-md ${
                viewType === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewType('weekly')}
              className={`px-4 py-2 rounded-md ${
                viewType === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className={`px-4 py-2 rounded-md ${
                viewType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Food Waste Trend</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wastageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="initialWeight" fill="#4F46E5" name="Initial Weight (kg)" />
                    <Bar dataKey="remainingWeight" fill="#10B981" name="Remaining Weight (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-900">Average Wastage</h3>
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {(wastageData.reduce((acc, curr) => acc + curr.wastagePercentage, 0) / wastageData.length).toFixed(1)}%
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-900">Total Food Saved</h3>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {wastageData.reduce((acc, curr) => acc + curr.remainingWeight, 0).toFixed(1)} kg
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-purple-900">Total Entries</h3>
                  <ChartBar className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600 mt-2">{wastageData.length}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DataView;

