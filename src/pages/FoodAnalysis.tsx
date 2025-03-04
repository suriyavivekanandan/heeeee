import React, { useEffect, useState } from 'react';
import { BarChart, PieChart as PieChartIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { format } from 'date-fns';

interface FoodAnalysis {
  food_item: string;
  total_waste: number;
  consumption_rate: number;
  frequency: number;
  initial_weight: number;
  remaining_weight: number;
  waste_percentage: number;
}

function FoodAnalysis() {
  const [analysis, setAnalysis] = useState<FoodAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAnalysis();
  }, [selectedDate]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('date', selectedDate);

      if (error) throw error;

      const analysisResults = data.map(entry => {
        const waste = (entry.remaining_weight / entry.initial_weight) * 100;
        return {
          food_item: entry.food_item,
          initial_weight: entry.initial_weight,
          remaining_weight: entry.remaining_weight,
          waste_percentage: waste,
          consumption_rate: 100 - waste,
          frequency: 1
        };
      });

      setAnalysis(analysisResults);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      alert('Error loading analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getConsumptionCategory = (wastePercentage: number) => {
    if (wastePercentage <= 11) return { category: 'High Consumption', color: '#22c55e' };
    if (wastePercentage <= 25) return { category: 'Medium Consumption', color: '#eab308' };
    return { category: 'Low Consumption', color: '#ef4444' };
  };

  const getRecommendations = (foodItem: string, wastePercentage: number) => {
    if (wastePercentage <= 11) {
      return [
        `${foodItem} is being managed efficiently with ${wastePercentage.toFixed(1)}% waste`,
        'Maintain current portion sizes',
        'Document successful practices',
        'Consider expanding menu with similar items'
      ];
    } else if (wastePercentage <= 25) {
      return [
        `${foodItem} shows moderate waste at ${wastePercentage.toFixed(1)}%`,
        'Review portion sizes',
        'Monitor serving temperature',
        'Analyze peak consumption times'
      ];
    } else {
      return [
        `${foodItem} needs attention with ${wastePercentage.toFixed(1)}% waste`,
        `Consider reducing preparation by ${Math.round(wastePercentage/2)}%`,
        'Review recipe and presentation',
        'Survey customer preferences'
      ];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pieChartData = analysis.map(item => ({
    name: item.food_item,
    value: item.waste_percentage
  }));

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-white mr-3" />
                <h1 className="text-2xl font-bold text-white">Food Waste Analysis</h1>
              </div>
              <div className="flex items-center bg-white/10 rounded-lg p-2">
                <label htmlFor="date-select" className="text-white mr-2 text-sm font-medium">Date:</label>
                <input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-white text-gray-800 rounded-md focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pie Chart Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Daily Waste Distribution</h2>
                </div>
                <div className="flex justify-center items-center h-[300px]">
                  {pieChartData.length > 0 ? (
                    <PieChart width={400} height={300}>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                      <Legend />
                    </PieChart>
                  ) : (
                    <div className="text-center text-gray-500">No data available for selected date</div>
                  )}
                </div>
              </div>

              {/* Analysis Cards */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-800 px-1">Consumption Summary</h2>
                <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                  {analysis.length > 0 ? (
                    analysis.map((item, index) => {
                      const { category, color } = getConsumptionCategory(item.waste_percentage);
                      return (
                        <div key={index} className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.food_item}</h3>
                              <span className="text-sm font-medium px-2 py-0.5 rounded-full inline-block mt-1" 
                                style={{ backgroundColor: `${color}20`, color }}>
                                {category}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Initial: {item.initial_weight} kg</p>
                              <p className="text-sm text-gray-600">
                                Remaining: {item.remaining_weight} kg
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">Waste Percentage</span>
                              <span className="font-bold" style={{ color }}>{item.waste_percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="h-2.5 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${item.waste_percentage}%`,
                                  backgroundColor: color
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 p-4 border rounded-lg">
                      No food entries for selected date
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Action Recommendations</h2>
              {analysis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysis.map((item, index) => {
                    const { color } = getConsumptionCategory(item.waste_percentage);
                    const recommendations = getRecommendations(item.food_item, item.waste_percentage);
                    return (
                      <div 
                        key={index} 
                        className="p-5 rounded-lg border transition-all hover:shadow-md"
                        style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}
                      >
                        <h3 className="font-medium text-lg mb-3 flex items-center" style={{ color }}>
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                          {item.food_item}
                        </h3>
                        <ul className="space-y-3">
                          {recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start text-gray-700">
                              <span className="mr-2 text-sm mt-1" style={{ color }}>•</span>
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No recommendations available. Select a date with food entries.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodAnalysis;