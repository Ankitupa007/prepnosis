"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, Target, TrendingUp, Activity, Users, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserAuthState from '@/components/user-auth-state';

interface SubjectPolygonData {
  subject: {
    id: string;
    name: string;
    weightage: number;
  };
  accuracyMetrics: {
    overall: number;
    topicBased: number;
    testBased: number;
    strength: number;
    consistency: number;
    activity: number;
  };
  stats: {
    questionsAttempted: number;
    topicsStudied: number;
    testQuestions: number;
    strengthDistribution: {
      weak: number;
      beginner: number;
      intermediate: number;
      strong: number;
    };
  };
  polygon: Array<{
    x: number;
    y: number;
    value: number;
    label: string;
  }>;
}

const SubjectAccuracyPolygons = () => {
  const [polygonData, setPolygonData] = useState<SubjectPolygonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('90');

  useEffect(() => {
    fetchPolygonData();
  }, [timeframe]);

  const fetchPolygonData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/polygons`);
      const data = await response.json();

      if (data.success) {
        setPolygonData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch polygon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const SubjectPolygon = ({ data, isSelected, onClick }: {
    data: SubjectPolygonData;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const svgSize = 200;
    const center = svgSize / 2;
    const maxRadius = 80;

    // Create hexagon grid lines
    const gridLevels = [20, 40, 60, 80];
    const angles = [0, 60, 120, 180, 240, 300];

    const createPolygonPath = (points: any[]) => {
      return points.map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ') + ' Z';
    };

    const getColorByAccuracy = (accuracy: number) => {
      if (accuracy >= 80) return '#10B981'; // Green
      if (accuracy >= 60) return '#F59E0B'; // Yellow
      if (accuracy >= 40) return '#EF4444'; // Red
      return '#6B7280'; // Gray
    };

    return (
      <div
        className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer ${isSelected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200 hover:shadow-md'
          }`}
        onClick={onClick}
      >
        <div className="text-center mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">{data.subject.name}</h3>
          <p className="text-xs text-gray-500">Weightage: {data.subject.weightage}%</p>
        </div>

        <div className="flex justify-center mb-3">
          <svg width={svgSize} height={svgSize} className="overflow-visible">
            {/* Grid lines */}
            {gridLevels.map(level => {
              const radius = (level / 100) * maxRadius;
              const gridPoints = angles.map(angle => ({
                x: center + radius * Math.cos((angle * Math.PI) / 180),
                y: center + radius * Math.sin((angle * Math.PI) / 180)
              }));

              return (
                <polygon
                  key={level}
                  points={gridPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axis lines */}
            {angles.map(angle => (
              <line
                key={angle}
                x1={center}
                y1={center}
                x2={center + maxRadius * Math.cos((angle * Math.PI) / 180)}
                y2={center + maxRadius * Math.sin((angle * Math.PI) / 180)}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}

            {/* Performance polygon */}
            <polygon
              points={data.polygon.map(p => `${p.x},${p.y}`).join(' ')}
              fill={getColorByAccuracy(data.accuracyMetrics.overall)}
              fillOpacity="0.3"
              stroke={getColorByAccuracy(data.accuracyMetrics.overall)}
              strokeWidth="2"
            />

            {/* Data points */}
            {data.polygon.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill={getColorByAccuracy(data.accuracyMetrics.overall)}
              />
            ))}

            {/* Labels */}
            {data.polygon.map((point, index) => {
              const labelRadius = maxRadius + 15;
              const angle = angles[index];
              const labelX = center + labelRadius * Math.cos((angle * Math.PI) / 180);
              const labelY = center + labelRadius * Math.sin((angle * Math.PI) / 180);

              return (
                <text
                  key={index}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#6B7280"
                  className="font-medium"
                >
                  {point.label.split('-')[0]}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <p className="font-semibold text-gray-900">{data.accuracyMetrics.overall}%</p>
            <p className="text-gray-600">Overall</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{data.stats.questionsAttempted}</p>
            <p className="text-gray-600">Questions</p>
          </div>
        </div>
      </div>
    );
  };

  const DetailedView = ({ data }: { data: SubjectPolygonData }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{data.subject.name} - Detailed Analysis</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-900">{data.accuracyMetrics.overall}%</p>
          <p className="text-sm text-blue-700">Overall Accuracy</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-900">{data.accuracyMetrics.consistency}%</p>
          <p className="text-sm text-green-700">Consistency</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Activity className="h-6 w-6 text-purple-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-purple-900">{data.accuracyMetrics.activity}%</p>
          <p className="text-sm text-purple-700">Activity Level</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Performance Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(data.accuracyMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium text-gray-900">{value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Study Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Questions Attempted</span>
              <span className="font-medium text-gray-900">{data.stats.questionsAttempted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Topics Studied</span>
              <span className="font-medium text-gray-900">{data.stats.topicsStudied}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Test Questions</span>
              <span className="font-medium text-gray-900">{data.stats.testQuestions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const selectedData = polygonData.find(d => d.subject.id === selectedSubject);

  return (
    <div className="space-y-6 px-6">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="p-3 rounded-full w-10 h-10 bg-gray-100 hover:bg-gray-50" />
            <div className="hidden md:block">
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserAuthState />
          </div>
        </div>
      </header>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner text='Loading Polygons' />
        </div>
      ) : (

        <section className='space-y-8 py-4'>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Subject Performance Polygons</h2>
              <p className="text-gray-600">Visual analysis of your accuracy across all MBBS subjects</p>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="180">Last 6 months</option>
            </select>
          </div>

          {/* Polygon Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {polygonData.map((data) => (
              <SubjectPolygon
                key={data.subject.id}
                data={data}
                isSelected={selectedSubject === data.subject.id}
                onClick={() => setSelectedSubject(
                  selectedSubject === data.subject.id ? null : data.subject.id
                )}
              />
            ))}
          </div>

          {/* Detailed View */}
          {selectedData && <DetailedView data={selectedData} />}

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Understanding Your Polygons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <div>
                  <p className="font-medium text-gray-900">Excellent (80%+)</p>
                  <p className="text-sm text-gray-600">Strong performance</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <div>
                  <p className="font-medium text-gray-900">Good (60-79%)</p>
                  <p className="text-sm text-gray-600">Above average</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <div>
                  <p className="font-medium text-gray-900">Needs Work below (60%)</p>
                  <p className="text-sm text-gray-600">Focus area</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default SubjectAccuracyPolygons