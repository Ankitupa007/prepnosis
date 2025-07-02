"use client";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UserHeader from '@/components/user-header';
import { useEffect, useState } from 'react';
import { SubjectPolygonData } from '@/lib/types/test';
import {
  BookOpen, Target,
  Hand,          // Anatomy
  Activity,      // Physiology
  FlaskConical,  // Biochemistry
  Microscope,    // Pathology
  Pill,          // Pharmacology
  Bug,           // Microbiology
  Gavel,         // Forensic Medicine
  Users,         // Community Medicine (PSM)
  HeartPulse,    // Medicine
  Slice,       // Surgery
  Baby,          // Pediatrics
  // Venus,         // Obstetrics & Gynaecology
  BrainCog,      // Psychiatry
  Eye,           // Ophthalmology
  Ear,           // ENT
  Syringe,         // Anesthesia
  ScanLine,      // Radiology,
  Bone,          // Orthopedics
  Droplet,
  Fingerprint,
  Sparkles,
  HeartHandshake,
  Stethoscope,
  FileQuestion,
  Smile,       // Dermatology
} from "lucide-react";


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

  const subjectIconMap: Record<string, React.FC<any>> = {
    Anatomy: Hand,
    Physiology: Activity,
    Biochemistry: FlaskConical,
    Pathology: Microscope,
    Pharmacology: Pill,
    Microbiology: Bug,
    Dental: Smile,
    "Forensic Medicine": Fingerprint,
    "Community Medicine": Users,
    Medicine: Stethoscope,
    Surgery: Slice,
    Pediatrics: Baby,
    "Obstetrics Gynaecology": HeartHandshake,
    Psychiatry: BrainCog,
    Ophthalmology: Eye,
    ENT: Ear,
    Anaesthesia: Syringe,
    Radiology: ScanLine,
    Orthopaedics: Bone,
    Unknown: FileQuestion,
    Dermatology: Sparkles, // or Sparkles for cosmetic derm
  };

  const getColorByAccuracy = (accuracy: any) => {
    if (accuracy >= 80) return { fill: '#10b981', stroke: '#059669' }; // Green
    if (accuracy >= 60) return { fill: '#f59e0b', stroke: '#d97706' }; // Yellow/Orange
    if (accuracy < 60) return { fill: '#ef4444', stroke: '#dc2626' }; // Red
    return { fill: '#6b7280', stroke: '#4b5563' }; // Gray
  };

  interface SubjectPolygonProps {
    data: SubjectPolygonData;
    isSelected: boolean;
    onClick: () => void;
  }

  const SubjectPolygon = ({ data, isSelected, onClick }: SubjectPolygonProps) => {
    const svgSize = 200;
    const center = svgSize / 2;
    const maxRadius = 80;
    const Icon = subjectIconMap[data.subject.name] || FileQuestion;

    // Create hexagon grid lines
    const gridLevels = [20, 40, 60, 80];
    const angles = [0, 60, 120, 180, 240, 300];

    const colors = getColorByAccuracy(data.accuracyMetrics.overall);

    return (
      <div
        className={`bg-background rounded-xl p-4 shadow-sm border-2 border-dashed transition-all cursor-pointer ${isSelected ? 'border-primary shadow-lg scale-105' : 'border-border hover:shadow-md'
          }`}
        onClick={onClick}
      >
        <div className="text-center mb-3">
          <h3 className="font-semibold text-foreground text-sm flex items-center justify-center gap-2">
            <Icon className="w-4 h-4" />
            {data.subject.name}
          </h3>
          <p className="text-xs my-2 text-foreground/50">Weightage: {data.subject.weightage}%</p>
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
                  strokeDasharray="2,6"
                  stroke="#666666"
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
                stroke="#666666"
                strokeWidth="1"
              />
            ))}

            {/* Performance polygon */}
            <polygon
              points={data.polygon.map(p => `${p.x},${p.y}`).join(' ')}
              fill={colors.fill}
              fillOpacity="0.4"
              stroke={colors.stroke}
              strokeWidth="2"
            />

            {/* Data points */}
            {data.polygon.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={colors.stroke}
                stroke={colors.stroke}
                strokeWidth="1"
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
                  fill="#374151"
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
            <p className="font-semibold text-foreground">{data.accuracyMetrics.overall}%</p>
            <p className="text-foreground/50">Overall</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{data.stats.questionsAttempted}</p>
            <p className="text-foreground/50">Questions</p>
          </div>
        </div>
      </div>
    );
  };
  const DetailedView = ({ data }: { data: SubjectPolygonData }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-foreground mb-4">{data.subject.name} - Detailed Analysis</h3>

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
          <h4 className="font-medium text-foreground mb-3">Performance Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(data.accuracyMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-foreground/50 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium text-foreground">{value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-3">Study Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/50">Questions Attempted</span>
              <span className="font-medium text-foreground">{data.stats.questionsAttempted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/50">Topics Studied</span>
              <span className="font-medium text-foreground">{data.stats.topicsStudied}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/50">Test Questions</span>
              <span className="font-medium text-foreground">{data.stats.testQuestions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const selectedData = polygonData.find(d => d.subject.id === selectedSubject);

  return (
    <div className=" bg-background min-h-screen">
      <UserHeader text='Subject Polygons' />
      {loading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <LoadingSpinner text='Loading Subject Polygons' />
          </div>
        </div>
      ) : (
        <section className='space-y-8 px-6 py-8'>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold ">Subject Performance Polygons</h2>
              <p className="text-foreground/50">Visual analysis of your accuracy across all MBBS subjects</p>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border"
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
          <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Understanding Your Polygons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <div>
                  <p className="font-medium ">Excellent (80%+)</p>
                  <p className="text-sm text-foreground/50">Strong performance</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <div>
                  <p className="font-medium ">Good (60-79%)</p>
                  <p className="text-sm text-foreground/50">Above average</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <div>
                  <p className="font-medium text-foreground">Needs Work (below 60%)</p>
                  <p className="text-sm text-foreground/50">Focus area</p>
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

