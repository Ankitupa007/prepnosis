"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, TrendingUp, BookOpen, Brain, Filter, ChevronDown } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [analyticsData, setAnalyticsData] = useState({
    overall_stats: {
      total_attempts: 47,
      total_questions_attempted: 1420,
      correct_answers: 994,
      incorrect_answers: 334,
      unanswered: 92,
      overall_accuracy: 70,
      average_time_per_question: 45,
      total_study_time_minutes: 1065
    },
    daily_performance: [
      { date: '2025-05-20', attempts: 2, accuracy: 72, average_score: 85 },
      { date: '2025-05-21', attempts: 1, accuracy: 68, average_score: 78 },
      { date: '2025-05-22', attempts: 3, accuracy: 75, average_score: 90 },
      { date: '2025-05-23', attempts: 2, accuracy: 71, average_score: 82 },
      { date: '2025-05-24', attempts: 1, accuracy: 69, average_score: 79 },
      { date: '2025-05-25', attempts: 2, accuracy: 73, average_score: 87 },
      { date: '2025-05-26', attempts: 1, accuracy: 76, average_score: 91 }
    ],
    subject_performance: [
      { subject: 'Cardiology', accuracy: 78, questions_attempted: 245, weightage_neet_pg: 15 },
      { subject: 'Respiratory', accuracy: 72, questions_attempted: 189, weightage_neet_pg: 12 },
      { subject: 'Gastroenterology', accuracy: 65, questions_attempted: 167, weightage_neet_pg: 10 },
      { subject: 'Neurology', accuracy: 69, questions_attempted: 201, weightage_neet_pg: 8 }
    ],
    weak_topics: [
      { topic: 'Heart Failure Management', subject: 'Cardiology', accuracy: 45, questions_attempted: 22 },
      { topic: 'COPD Treatment', subject: 'Respiratory', accuracy: 52, questions_attempted: 31 },
      { topic: 'IBD Diagnosis', subject: 'Gastroenterology', accuracy: 48, questions_attempted: 25 }
    ]
  });

  type HeatmapDatum = {
    date: string;
    topic: string;
    intensity: 'none' | 'low' | 'medium' | 'high' | 'very-high';
    activity: number;
  };
  const [heatmapData, setHeatmapData] = useState<HeatmapDatum[]>([]);

  // Generate mock heatmap data
  useEffect(() => {
    const getAnalyticsData = async () => {
      const response = await fetch('/api/analytics/heatmap'); // Replace with actual API endpoint
      const heatMapData = await response.json();
      setHeatmapData(heatMapData.data || []);
    }
    getAnalyticsData();
  }, []);

  type StatCardProps = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    trend?: number;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: StatCardProps) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#66C3C1', opacity: 0.1 }}>
            <Icon className="h-6 w-6" style={{ color: '#66C3C1' }} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const ActivityHeatmap = () => {
    const getIntensityColor = (intensity: any) => {
      switch (intensity) {
        case 'none': return '#f3f4f6';
        case 'low': return '#e0f2f1';
        case 'medium': return '#b2dfdb';
        case 'high': return '#4db6ac';
        case 'very-high': return '#26a69a';
        default: return '#f3f4f6';
      }
    };

    const topics = [...new Set(heatmapData.map(d => d.topic))];
    const dates = [...new Set(heatmapData.map(d => d.date))].sort();

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Study Activity Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${dates.length}, 12px)` }}>
              <div></div>
              {dates.map((date, i) => (
                <div key={date} className="text-xs text-gray-500 text-center">
                  {i % 7 === 0 ? new Date(date).getDate() : ''}
                </div>
              ))}

              {topics.map(topic => (
                <React.Fragment key={topic}>
                  <div className="text-sm text-gray-700 py-1 pr-2 truncate">{topic}</div>
                  {dates.map(date => {
                    const dataPoint = heatmapData.find(d => d.date === date && d.topic === topic);
                    return (
                      <div
                        key={`${topic}-${date}`}
                        className="h-3 w-3 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: getIntensityColor(dataPoint?.intensity) }}
                        title={`${topic} - ${date}: ${dataPoint?.activity || 0} questions`}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">Less</span>
          <div className="flex space-x-1">
            {['none', 'low', 'medium', 'high', 'very-high'].map(intensity => (
              <div
                key={intensity}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: getIntensityColor(intensity) }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">More</span>
        </div>
      </div>
    );
  };

  const PerformanceChart = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Daily Performance Trend</h3>
      <div className="h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {analyticsData.daily_performance.map((day, index) => {
            const x = (index / (analyticsData.daily_performance.length - 1)) * 360 + 20;
            const y = 180 - (day.accuracy / 100) * 140;
            return (
              <g key={day.date}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#66C3C1"
                  className="hover:r-6 transition-all cursor-pointer"
                />
                {index < analyticsData.daily_performance.length - 1 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={(index + 1) / (analyticsData.daily_performance.length - 1) * 360 + 20}
                    y2={180 - (analyticsData.daily_performance[index + 1].accuracy / 100) * 140}
                    stroke="#66C3C1"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
          <line x1="20" y1="180" x2="380" y2="180" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="20" y1="40" x2="380" y2="40" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="20" y1="110" x2="380" y2="110" stroke="#e5e7eb" strokeWidth="1" />
          <text x="10" y="185" fontSize="12" fill="#6b7280">0%</text>
          <text x="10" y="115" fontSize="12" fill="#6b7280">50%</text>
          <text x="10" y="45" fontSize="12" fill="#6b7280">100%</text>
        </svg>
      </div>
    </div>
  );

  const WeakAreasPanel = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Areas for Improvement</h3>
      <div className="space-y-4">
        {analyticsData.weak_topics.map((topic, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{topic.topic}</p>
              <p className="text-sm text-gray-600">{topic.subject} • {topic.questions_attempted} questions</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-red-600">{topic.accuracy}%</span>
              <p className="text-xs text-gray-500">accuracy</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SubjectPerformance = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
      <div className="space-y-4">
        {analyticsData.subject_performance.map((subject, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                <span className="text-sm text-gray-600">{subject.accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${subject.accuracy}%`,
                    backgroundColor: subject.accuracy >= 70 ? '#66C3C1' : subject.accuracy >= 50 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{subject.questions_attempted} questions attempted</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FilterControls = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <BookOpen className="h-4 w-4 text-gray-500" />
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
        >
          <option value="all">All Subjects</option>
          <option value="cardiology">Cardiology</option>
          <option value="respiratory">Respiratory</option>
          <option value="gastro">Gastroenterology</option>
        </select>
      </div>
    </div>
  );

  type TabButtonProps = {
    id: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };

  const TabButton = ({ id, label, icon: Icon }: TabButtonProps) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id
        ? 'text-white shadow-sm'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      style={{
        backgroundColor: activeTab === id ? '#66C3C1' : 'transparent'
      }}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your learning progress and identify areas for improvement</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton id="overview" label="Overview" icon={TrendingUp} />
          <TabButton id="heatmap" label="Activity Heatmap" icon={Calendar} />
        </div>

        {/* Filter Controls */}
        <FilterControls />

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Target}
                title="Overall Accuracy"
                value={`${analyticsData.overall_stats.overall_accuracy}%`}
                subtitle={`${analyticsData.overall_stats.correct_answers}/${analyticsData.overall_stats.total_questions_attempted} correct`}
                trend={2.5}
              />
              <StatCard
                icon={BookOpen}
                title="Questions Attempted"
                value={analyticsData.overall_stats.total_questions_attempted.toLocaleString()}
                subtitle={`${analyticsData.overall_stats.total_attempts} test attempts`}
              />
              <StatCard
                icon={Clock}
                title="Avg Time/Question"
                value={`${analyticsData.overall_stats.average_time_per_question}s`}
                subtitle={`${Math.round(analyticsData.overall_stats.total_study_time_minutes / 60)}h total study time`}
              />
              <StatCard
                icon={Brain}
                title="Study Streak"
                value="12 days"
                subtitle="Keep it up!"
                trend={8.3}
              />
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart />
              <WeakAreasPanel />
            </div>

            <SubjectPerformance />
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <ActivityHeatmap />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Active Day:</span>
                    <span className="font-medium">Yesterday (15 questions)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Studied Topic:</span>
                    <span className="font-medium">Cardiology</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Streak:</span>
                    <span className="font-medium">5 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly Goal:</span>
                    <span className="font-medium">85% complete</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Study Recommendations</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Focus on Gastroenterology</p>
                    <p className="text-xs text-blue-700">Low activity in the past week</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Great consistency!</p>
                    <p className="text-xs text-green-700">You've studied 5 days in a row</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">Review weak topics</p>
                    <p className="text-xs text-yellow-700">3 topics below 60% accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;