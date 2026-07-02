import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  Flame, 
  CheckSquare, 
  Sparkles,
  RefreshCw,
  HelpCircle,
  Calendar,
  Target,
  Download,
  Clipboard,
  FileText,
  Check,
  Volume2,
  VolumeX,
  Disc,
  Waves,
  Lock,
  Moon,
  Zap,
  BookMarked,
  Wind,
  CloudRain,
  Search,
  X,
  Filter
} from 'lucide-react';
import { StudyPlan } from '../types';
import { ProgressRing } from './ProgressRing';
import { 
  startFocusWaves, 
  stopFocusWaves, 
  setFocusWavesVolume, 
  getActiveFocusWaveType,
  playClickSound
} from '../utils/audio';


interface StudyAnalyticsProps {
  studyPlan: StudyPlan | null;
  completedSubtopics: { [key: string]: boolean };
  quizHistory: Array<{ topic: string, score: number, total: number, timestamp: string }>;
  minedHotspots: Array<{ term: string; definition: string; relevanceScore: number }>;
  internalizedTerms: { [key: string]: boolean };
  toggleInternalizedTerm: (term: string) => void;
  studyStreak: number;
  subject: string;
  loggedDates: string[];
  setLoggedDates: React.Dispatch<React.SetStateAction<string[]>>;
  dailyStudyGoal?: number;
  completedTodayCount?: number;
  completionsByDate?: { [date: string]: string[] };
  doubtHistory?: Array<{
    concept: string;
    timestamp: string;
    brokenDown: string;
    analogy: string;
    acronymStory?: {
      word?: string;
      expansion?: string;
      explanation?: string;
      story: string;
    };
  }>;
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({
  studyPlan,
  completedSubtopics,
  quizHistory,
  minedHotspots,
  internalizedTerms,
  toggleInternalizedTerm,
  studyStreak,
  subject,
  loggedDates,
  setLoggedDates,
  dailyStudyGoal = 3,
  completedTodayCount = 0,
  completionsByDate = {},
  doubtHistory = []
}) => {
  const [sessionCount, setSessionCount] = useState(6);
  const [simulationBoost, setSimulationBoost] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedGain, setCopiedGain] = useState(false);

  const [activeWave, setActiveWave] = useState<'binaural' | 'white' | 'ocean' | 'brown' | 'rain' | null>(getActiveFocusWaveType());
  const [waveVolume, setWaveVolume] = useState<number>(0.35);

  useEffect(() => {
    setActiveWave(getActiveFocusWaveType());
  }, []);

  const handleToggleWave = (type: 'binaural' | 'white' | 'ocean' | 'brown' | 'rain') => {
    playClickSound();
    if (activeWave === type) {
      stopFocusWaves();
      setActiveWave(null);
    } else {
      startFocusWaves(type, waveVolume);
      setActiveWave(type);
    }
  };

  const handleStopAllWaves = () => {
    playClickSound();
    stopFocusWaves();
    setActiveWave(null);
  };

  const handleVolumeChange = (newVol: number) => {
    setWaveVolume(newVol);
    setFocusWavesVolume(newVol);
  };

  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mastered' | 'pending'>('all');


  const generateMarkdownLog = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const completedList = Object.keys(completedSubtopics).filter(k => completedSubtopics[k]);
    
    let markdown = `# 📊 Daily Academic Study Log - ${todayStr}\n\n`;
    markdown += `### 🏷️ Subject Goal: **${subject || 'General Study'}**\n`;
    markdown += `### 🎯 Daily Checklist Target: **${completedTodayCount} / ${dailyStudyGoal}** subtopics completed (${completedTodayCount >= dailyStudyGoal ? '🎉 TARGET ACCOMPLISHED' : '⚡ IN PROGRESS'})\n\n`;
    markdown += `---\n\n`;
    
    markdown += `## 🧠 1. Academic Jargon Buster deconstructions\n`;
    if (doubtHistory && doubtHistory.length > 0) {
      doubtHistory.forEach((item, index) => {
        markdown += `### ${index + 1}. Concept: ${item.concept}\n`;
        markdown += `- **Simpler Terminology**: ${item.brokenDown}\n`;
        markdown += `- **Metaphorical Analogy**: ${item.analogy}\n`;
        if (item.acronymStory) {
          if (item.acronymStory.word) {
            markdown += `- **Catchy Acronym**: **${item.acronymStory.word}** (${item.acronymStory.expansion})\n`;
          }
          markdown += `- **Memorable Catchy Story**: ${item.acronymStory.story}\n`;
        }
        markdown += `\n`;
      });
    } else {
      markdown += `*No deconstructions logged yet during this session. Use 'Academic Jargon Buster' tab to break down complex academic definitions.*\n\n`;
    }

    markdown += `## 📝 2. MCQ Quiz Performance Records\n`;
    if (quizHistory && quizHistory.length > 0) {
      quizHistory.forEach((quiz, index) => {
        markdown += `- **Session ${index + 1}**: ${quiz.topic} | **Score**: ${quiz.score}/${quiz.total} (${Math.round((quiz.score / quiz.total) * 100)}%) on ${quiz.timestamp}\n`;
      });
    } else {
      markdown += `*No practice quizzes attempted yet. Try the 'MCQ Quiz Evaluator' tab to test active recall and get detailed feedback.*\n\n`;
    }

    markdown += `## ⚡ 3. Study Metrics Overview\n`;
    markdown += `- **Current Cognitive Streak**: ${studyStreak} Days Active study\n`;
    markdown += `- **Total Checked Checkpoints**: ${completedList.length} subtopics Mastered\n`;
    markdown += `- **Mined Vocabulary Grounding**: ${minedHotspots.length} critical terms indexed (${minedHotspots.length > 0 ? Math.round((Object.keys(internalizedTerms).filter(k => internalizedTerms[k]).length / minedHotspots.length) * 100) : 0}% mastery)\n\n`;
    
    markdown += `*Auto-generated on-demand by Aetherius Premium Cognitive Study Assistant.*`;
    return markdown;
  };

  const handleDownloadLog = () => {
    const markdown = generateMarkdownLog();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aetherius_Study_Log_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(generateMarkdownLog());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateLastSevenDays = () => {
    const list = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const name = i === 0 ? 'Today' : dayNames[d.getDay()];
      const dayNum = d.getDate();
      list.push({ dateStr, name, dayNum, indexBack: i });
    }
    return list;
  };

  // Generate day-by-day progress data for Recharts
  const daysTotal = studyPlan?.daysRemaining || 5;
  
  const originalChartData = Array.from({ length: daysTotal }, (_, idx) => {
    const dayNum = idx + 1;
    
    // Calculate subtopic completion specifically for this day
    let totalDaySubs = 0;
    let completedDaySubs = 0;
    
    if (studyPlan && studyPlan.schedule) {
      const dayItem = studyPlan.schedule.find(item => item.day === dayNum);
      if (dayItem) {
        dayItem.subtopics.forEach((sub, sIdx) => {
          totalDaySubs++;
          const uniqueKey = `${studyPlan.subject}_day${dayNum}_sub${sIdx}_${sub}`;
          if (completedSubtopics[uniqueKey]) {
            completedDaySubs++;
          }
        });
      }
    }

    const masteryPercent = totalDaySubs > 0 
      ? Math.round((completedDaySubs / totalDaySubs) * 100) 
      : Math.min(100, Math.round((dayNum / daysTotal) * 15 + simulationBoost)); // Fallback projection

    // Find quiz score for this day if exists in history, otherwise supply a realistic baseline
    const dayQuiz = quizHistory[idx];
    const quizScorePercent = dayQuiz
      ? Math.round((dayQuiz.score / dayQuiz.total) * 100)
      : Math.min(100, Math.round(50 + (dayNum / daysTotal) * 25 + (simulationBoost * 0.4)));

    return {
      name: `Day ${dayNum}`,
      "Syllabus Mastery %": Math.min(100, masteryPercent + (masteryPercent === 0 && simulationBoost > 0 ? simulationBoost : 0)),
      "Quiz Score %": quizScorePercent,
      "Target Trend Line": Math.round(40 + (dayNum / daysTotal) * 55)
    };
  });

  const aggregateMasteryCount = Object.keys(completedSubtopics).filter(k => completedSubtopics[k]).length;
  const aggregateTermsCount = Object.keys(internalizedTerms).filter(k => internalizedTerms[k]).length;
  const avgQuizScore = quizHistory.length > 0
    ? Math.round((quizHistory.reduce((sum, item) => sum + (item.score / item.total), 0) / quizHistory.length) * 100)
    : 72;

  // Real-time calculated readiness percentage
  const totalSubtopics = studyPlan?.schedule.reduce((acc, curr) => acc + curr.subtopics.length, 0) || 12;
  const subtopicRatio = totalSubtopics > 0 ? aggregateMasteryCount / totalSubtopics : 0.4;
  const vocabRatio = minedHotspots.length > 0 ? aggregateTermsCount / minedHotspots.length : 0.3;
  
  const baseReadiness = 45 + (subtopicRatio * 35) + (vocabRatio * 15) + (avgQuizScore * 0.05);
  const readinessValue = Math.min(100, Math.round(baseReadiness + (simulationBoost * 0.2)));

  const triggerSimulationIncrease = () => {
    setSimulationBoost(b => Math.min(60, b + 15));
    setSessionCount(s => s + 1);
  };

  const resetSimulationGlow = () => {
    setSimulationBoost(0);
  };

  return (
    <div id="study-analytics-dashboard" className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-b-slate-800/80 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Adaptive Study Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic data-driven visualization of cognitive recall curves, quiz results, and strategic syllabus grounding levels.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="reset-simulation-btn"
            onClick={resetSimulationGlow}
            className="text-[10px] font-semibold font-mono tracking-tight text-slate-450 border border-slate-800 hover:bg-slate-800/60 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            Reset Simulation
          </button>
          <button
            id="simulate-increase-btn"
            onClick={triggerSimulationIncrease}
            className="text-[10px] font-semibold font-mono tracking-tight bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Hours (+15%)
          </button>
        </div>
      </div>

      {/* Numerical Bento Grid Items */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Readiness Score Card */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans font-medium">Memory Retention Target</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-mono font-bold text-white tracking-tight">
              {readinessValue}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${readinessValue}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {readinessValue >= 85 ? 'Highly grounded & exam ready' : readinessValue >= 65 ? 'Accelerating retention' : 'Initial setup block'}
            </p>
          </div>
        </div>

        {/* Completed Checkpoints Card */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans font-medium">Syllabus Checkpoints</span>
            <CheckSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-mono font-bold text-white tracking-tight">
              {aggregateMasteryCount} <span className="text-xs text-slate-500">/ {totalSubtopics} Topics</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Completed <span className="text-indigo-400 font-semibold">{totalSubtopics - aggregateMasteryCount} remaining</span> subtopics to reach 100% syllabus grounding.
            </p>
          </div>
        </div>

        {/* Active Quiz Stats Card */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans font-medium">Average Quiz Precision</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-mono font-bold text-white tracking-tight">
              {avgQuizScore}%
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Sourced across <span className="text-amber-400 font-semibold">{quizHistory.length} test-series</span> attempts. Keep testing active pathways.
            </p>
          </div>
        </div>

        {/* Vocabulary Grounding Card */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans font-medium">Vocabulary Grounding</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-mono font-bold text-white tracking-tight">
              {aggregateTermsCount} <span className="text-xs text-slate-500">/ {minedHotspots.length || 6} Words</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Reviewing cards with individual AI personas marks active jargon entries as internalized.
            </p>
          </div>
        </div>

        {/* Continuous 7-Day Interactive Streak & Calendar Tracker Strip */}
        <div id="streak-calculator-bento" className="bg-slate-950/40 border border-orange-500/20 p-5 rounded-2xl col-span-2 lg:col-span-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500/25 animate-pulse" />
              <div>
                <span className="text-xs font-sans font-bold text-orange-400 block uppercase tracking-wider font-mono">
                  Consecutive Study Streak Auto-Calculator
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">
                  Interactive real-time consecutive date monitoring system. Logs automate ticks.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                Streak: {studyStreak} Days Active
              </span>
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono">
                Log Dates: {loggedDates.length} Days Total
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left summary metrics with glowing progress ring */}
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
              <div className="flex flex-col items-center md:items-start space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-mono font-semibold">Today's Goal Ring</span>
                <div className="flex items-center gap-3 mt-1">
                  <ProgressRing percent={(completedTodayCount / dailyStudyGoal) * 105} size={52} strokeWidth={4.5}>
                    <span className="text-xs font-mono font-black text-orange-450 text-orange-400">
                      {Math.round(Math.min(100, (completedTodayCount / dailyStudyGoal) * 100))}%
                    </span>
                  </ProgressRing>
                  <div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tight leading-none flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500/40 shrink-0" />
                      <span>{studyStreak} Days</span>
                    </div>
                    <span className="text-[9px] font-sans text-slate-500 uppercase tracking-widest block mt-1 font-semibold">consecutive streak</span>
                  </div>
                </div>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                Progress: <strong className="text-orange-400">{completedTodayCount}</strong> of <strong className="text-slate-200">{dailyStudyGoal}</strong> subtopics completed today.
              </p>
            </div>
            
            {/* Right interactive calendar row */}
            <div className="md:col-span-8 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-350 uppercase block font-mono font-bold">Automated 7-Day Attendance Logs</span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">
                  ⚡ Auto-saves daily activity
                </span>
              </div>
              
              <div className="grid grid-cols-7 gap-1.5 md:gap-2 text-center">
                {generateLastSevenDays().map(day => {
                  const isActive = loggedDates.includes(day.dateStr);
                  const isTodayStr = day.indexBack === 0;
                  return (
                    <div
                      key={day.dateStr}
                      id={`calc-day-btn-${day.indexBack}`}
                      className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-b from-orange-500/20 to-orange-500/5 border-orange-500/80 text-orange-300 shadow-md shadow-orange-500/10 scale-[1.01]'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                      } ${isTodayStr ? 'ring-1 ring-indigo-500/40' : ''}`}
                      title={`${day.dateStr}${isTodayStr ? ' (Today)' : ''}: ${isActive ? 'Active Study Logged' : 'Inactive'}`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-tight leading-none mb-1">
                        {day.name}
                      </span>
                      <span className="text-xs font-mono font-bold leading-none">
                        {day.dayNum}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 inline-block animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl mt-3 flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-mono">💡 INFO</span>
            <span>
              If you generated your study checklist for the first time, your streak represents **Day 1** of active learning! If you already studied the past few days, click those calendar days above to set your historical streak.
            </span>
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left: Grounding vs Quiz Trends Line Chart */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 sm:p-5 relative">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Syllabus Grounding vs. Quiz Trends</h3>
              <p className="text-[11px] text-slate-500">Retrieval values mapped over the {daysTotal}-Day timescale</p>
            </div>
            <div className="flex gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
                <span className="text-slate-300">Mastery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                <span className="text-slate-300">Quiz Scores</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[260px] text-[11px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={originalChartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false} 
                  className="font-mono text-[9px]"
                />
                <YAxis 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]}
                  className="font-mono text-[9px]"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Line
                  name="Syllabus Mastery %"
                  type="monotone"
                  dataKey="Syllabus Mastery %"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="Quiz Score %"
                  type="monotone"
                  dataKey="Quiz Score %"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="Target Trend %"
                  type="monotone"
                  dataKey="Target Trend Line"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  opacity={0.3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Daily Goal Completion Bar Chart */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 sm:p-5 relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-slate-200">Daily Goal Completion History</h3>
              <div className="flex gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                  <span className="text-slate-300">Goal Met</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                  <span className="text-slate-300">In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block opacity-40" />
                  <span className="text-slate-300">Goal Target</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-550 mb-4">Completions by date against your current study goal ({dailyStudyGoal} nodes/day)</p>
          </div>

          <div className="w-full h-[240px] text-[11px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={generateLastSevenDays().map(day => {
                  const completedVal = completionsByDate[day.dateStr]?.length || 0;
                  const completedWithBoost = completedVal + (day.indexBack === 0 ? 0 : (simulationBoost > 0 ? Math.min(dailyStudyGoal, Math.floor(simulationBoost / 15)) : 0));
                  return {
                    name: day.name,
                    Completed: completedWithBoost,
                    Goal: dailyStudyGoal,
                    date: day.dateStr
                  };
                })}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false} 
                  className="font-mono text-[9px]"
                />
                <YAxis 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 'auto']}
                  className="font-mono text-[9px]"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="Completed" radius={[4, 4, 0, 0]}>
                  {generateLastSevenDays().map((day, index) => {
                    const completedVal = completionsByDate[day.dateStr]?.length || 0;
                    const completedWithBoost = completedVal + (day.indexBack === 0 ? 0 : (simulationBoost > 0 ? Math.min(dailyStudyGoal, Math.floor(simulationBoost / 15)) : 0));
                    const isGoalReached = completedWithBoost >= dailyStudyGoal;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isGoalReached ? '#10b981' : '#f59e0b'} 
                      />
                    );
                  })}
                </Bar>
                <Bar dataKey="Goal" fill="#475569" opacity={0.3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Daily Knowledge Gain Summary Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-b-slate-800/60 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-display font-bold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
              🧠 End-of-Session Daily Knowledge Gain Summary
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-snug">
              An AI-synthesized debrief of deconstructed vocabulary, concept clarifications, and active recall evaluations mastered during today's session.
            </p>
          </div>
          <button
            onClick={() => {
              playClickSound();
              const gainText = `🧠 DAILY KNOWLEDGE GAIN SUMMARY\n` +
                `Subject: ${subject || 'General Engineering'}\n` +
                `Streak: ${studyStreak} Days Active\n\n` +
                `📘 CONCEPTS DECONSTRUCTED:\n` +
                (doubtHistory && doubtHistory.length > 0 
                  ? doubtHistory.map((d, i) => `${i+1}. ${d.concept}: ${d.brokenDown}\n   Analogy: ${d.analogy}`).join('\n') 
                  : ' - No concepts deconstructed today yet.') +
                `\n\n🎯 ACTIVE EVALUATION PATHWAYS:\n` +
                (quizHistory && quizHistory.length > 0 
                  ? quizHistory.map((q, i) => `- Quiz ${i+1} on "${q.topic}": Score ${q.score}/${q.total} (${Math.round((q.score/q.total)*100)}%)`).join('\n') 
                  : ' - No quiz scores recorded today.') +
                `\n\n📚 MINED VOCABULARY RETENTION:\n` +
                `- Total Terms Mined: ${minedHotspots.length}\n` +
                `- Mastery Rate: ${minedHotspots.length > 0 ? Math.round((Object.keys(internalizedTerms).filter(k => internalizedTerms[k]).length / minedHotspots.length) * 100) : 0}%`;

              navigator.clipboard.writeText(gainText);
              setCopiedGain(true);
              setTimeout(() => setCopiedGain(false), 2000);
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow hover:shadow-indigo-600/10 self-start sm:self-center"
          >
            {copiedGain ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>Copied Summary!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>

        {/* Live Parsed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deconstruction logs section */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Mined Concepts ({doubtHistory?.length || 0})
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {doubtHistory && doubtHistory.length > 0 ? (
                doubtHistory.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-300 block">{item.concept}</span>
                    <p className="text-[10.5px] text-slate-400 leading-normal font-sans font-normal">{item.brokenDown}</p>
                    <p className="text-[9.5px] text-slate-500 italic font-sans font-normal">Analogy: {item.analogy}</p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-550 italic py-2 font-sans font-normal">No concepts deconstructed today. Use the Jargon Buster to populate terms!</p>
              )}
            </div>
          </div>

          {/* Quiz Performance section */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Quiz Performance Logs ({quizHistory?.length || 0})
            </h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {quizHistory && quizHistory.length > 0 ? (
                quizHistory.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-300 block leading-tight">{item.topic}</span>
                      <span className="text-[9px] font-mono text-slate-550">{item.timestamp}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400 block">{item.score} / {item.total}</span>
                      <span className="text-[9px] px-1 bg-amber-500/10 text-amber-300 rounded font-mono">
                        {Math.round((item.score / item.total) * 105)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-550 italic py-2 font-sans font-normal">No quiz history recorded yet. Complete quizzes to populate!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Focus waves audio player & digital achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Binaural Beats & Ambient focus waves player */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/25 to-slate-900 border border-indigo-500/15 p-5 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none">
            <Volume2 className="w-24 h-24 text-indigo-400" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 font-mono text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/10">
              <Zap className="w-3 h-3 text-indigo-400" />
              Mindfulness Cognitive Tuning
            </div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              Neuro-Focus Wave Player (Ambient BG Audio)
            </h3>
            <p className="text-[11px] text-slate-400">
              Synthesize physical sound waves locally in real-time to isolate focus and counter memory fatigue.
            </p>
          </div>

          {/* Active Status Display */}
          <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                {activeWave ? (
                  <Disc className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                  {activeWave === 'binaural' ? '🎧 Binaural Beats Active' : activeWave === 'white' ? '💨 Focus Grey-Noise Active' : activeWave === 'ocean' ? '🌊 Ambient Tide Wave Active' : activeWave === 'brown' ? '🟤 Brown Noise Active' : activeWave === 'rain' ? '🌧️ Rainfall Hum Active' : '🔇 Audio System Idle'}
                </p>
                <p className="text-[9px] font-mono text-slate-500">
                  {activeWave ? 'Streaming synthesized sound wave locally' : 'Click a waveform below to synthesize waves'}
                </p>
              </div>
            </div>

            {activeWave && (
              <button
                onClick={handleStopAllWaves}
                className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-[9px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer"
              >
                Mute Waves
              </button>
            )}
          </div>

          {/* Player controls */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => handleToggleWave('binaural')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none text-center ${
                activeWave === 'binaural'
                  ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-600/15'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Disc className={`w-4 h-4 ${activeWave === 'binaural' ? 'animate-spin text-white' : 'text-indigo-400'}`} style={{ animationDuration: '4s' }} />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold leading-none">Binaural</span>
                <span className="block text-[8px] opacity-70 font-mono">6Hz Theta</span>
              </div>
            </button>

            <button
              onClick={() => handleToggleWave('white')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none text-center ${
                activeWave === 'white'
                  ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-600/15'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeWave === 'white' ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold leading-none">Grey Noise</span>
                <span className="block text-[8px] opacity-70 font-mono">Continuous</span>
              </div>
            </button>

            <button
              onClick={() => handleToggleWave('ocean')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none text-center ${
                activeWave === 'ocean'
                  ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-600/15'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Waves className={`w-4 h-4 ${activeWave === 'ocean' ? 'animate-pulse text-white' : 'text-cyan-400'}`} />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold leading-none">Ocean Tide</span>
                <span className="block text-[8px] opacity-70 font-mono">Ambient</span>
              </div>
            </button>

            <button
              onClick={() => handleToggleWave('brown')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none text-center ${
                activeWave === 'brown'
                  ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-600/15'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Wind className={`w-4 h-4 ${activeWave === 'brown' ? 'animate-pulse text-white' : 'text-amber-400'}`} />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold leading-none">Brown</span>
                <span className="block text-[8px] opacity-70 font-mono">Deep Rumble</span>
              </div>
            </button>

            <button
              onClick={() => handleToggleWave('rain')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none text-center col-span-2 sm:col-span-1 ${
                activeWave === 'rain'
                  ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-600/15'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CloudRain className={`w-4 h-4 ${activeWave === 'rain' ? 'animate-bounce text-white' : 'text-blue-400'}`} />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold leading-none">Rainfall</span>
                <span className="block text-[8px] opacity-70 font-mono">Live Drops</span>
              </div>
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5 pt-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                Synthesized Volume
              </span>
              <span>{Math.round(waveVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={waveVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Digital Achievements / Badges Panel */}
        <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Unlocked Academic Achievements
            </h3>
            <p className="text-[11px] text-slate-400">
              Digital rewards earned as you reinforce cognitive retention and syllabus deconstruction logs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {/* Badge 1: Syllabus Architect */}
            {(() => {
              const unlocked = !!studyPlan && studyPlan.schedule.length > 0;
              return (
                <div className={`p-2.5 rounded-xl border flex gap-2.5 items-center transition-all ${
                  unlocked 
                    ? 'bg-indigo-500/10 border-indigo-500/35 text-slate-200 shadow-md shadow-indigo-500/5' 
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-600'
                  }`}>
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[10.5px] font-bold">{unlocked ? 'Syllabus Architect' : 'Locked Badge'}</span>
                    <span className="block text-[8.5px] text-slate-400 font-medium">Study plan initialized</span>
                  </div>
                </div>
              );
            })()}

            {/* Badge 2: Terminology Wizard */}
            {(() => {
              const unlocked = doubtHistory && doubtHistory.length >= 1;
              return (
                <div className={`p-2.5 rounded-xl border flex gap-2.5 items-center transition-all ${
                  unlocked 
                    ? 'bg-emerald-500/10 border-emerald-500/35 text-slate-200 shadow-md shadow-emerald-500/5' 
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[10.5px] font-bold">{unlocked ? 'Terminology Wizard' : 'Locked Badge'}</span>
                    <span className="block text-[8.5px] text-slate-400 font-medium">Broke down academic jargon</span>
                  </div>
                </div>
              );
            })()}

            {/* Badge 3: Streak Champion */}
            {(() => {
              const unlocked = studyStreak >= 3;
              return (
                <div className={`p-2.5 rounded-xl border flex gap-2.5 items-center transition-all ${
                  unlocked 
                    ? 'bg-orange-500/10 border-orange-500/35 text-slate-200 shadow-md shadow-orange-500/5' 
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-900 text-slate-600'
                  }`}>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[10.5px] font-bold">{unlocked ? 'Streak Champion' : 'Locked Badge'}</span>
                    <span className="block text-[8.5px] text-slate-400 font-medium">Maintain a 3-day active streak</span>
                  </div>
                </div>
              );
            })()}

            {/* Badge 4: Night Owl Master */}
            {(() => {
              const unlocked = aggregateMasteryCount >= 1 || completedTodayCount >= 1;
              return (
                <div className={`p-2.5 rounded-xl border flex gap-2.5 items-center transition-all ${
                  unlocked 
                    ? 'bg-violet-500/10 border-violet-500/35 text-slate-200 shadow-md shadow-violet-500/5' 
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-900 text-slate-600'
                  }`}>
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[10.5px] font-bold">{unlocked ? 'Night Owl Master' : 'Locked Badge'}</span>
                    <span className="block text-[8.5px] text-slate-400 font-medium">Completed late study sessions</span>
                  </div>
                </div>
              );
            })()}

            {/* Badge 5: Quiz Gladiator */}
            {(() => {
              const unlocked = quizHistory && quizHistory.length >= 1;
              return (
                <div className={`p-2.5 rounded-xl border flex gap-2.5 items-center transition-all ${
                  unlocked 
                    ? 'bg-amber-500/10 border-amber-500/35 text-slate-200 shadow-md shadow-amber-500/5' 
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-600'
                  }`}>
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[10.5px] font-bold">{unlocked ? 'Quiz Gladiator' : 'Locked Badge'}</span>
                    <span className="block text-[8.5px] text-slate-400 font-medium">Attempted practice quiz evaluate</span>
                  </div>
                </div>
              );
            })()}

            {/* Badge 6: Perfectionist */}
            {(() => {
              const unlocked = quizHistory && quizHistory.some(q => q.score === q.total);
              return (
                <div className={`p-2.5 rounded-xl border flex gap-2.5 items-center transition-all ${
                  unlocked 
                    ? 'bg-fuchsia-500/10 border-fuchsia-500/35 text-slate-200 shadow-md shadow-fuchsia-500/5' 
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-fuchsia-500/20 text-fuchsia-400 animate-pulse' : 'bg-slate-900 text-slate-600'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[10.5px] font-bold">{unlocked ? 'Perfectionist' : 'Locked Badge'}</span>
                    <span className="block text-[8.5px] text-slate-400 font-medium">100% score on a practice quiz</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Dynamic Grounding Log Grid and list outlines */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Real-time Mined Vocab Hotspots Mastery Track */}
        <div className="bg-slate-950/20 border border-slate-850/80 p-4.5 rounded-xl space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800/50 pb-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Active Vocabulary internalizations
            </h4>
            <button
              id="open-omni-glossary-btn"
              onClick={() => {
                playClickSound();
                setIsGlossaryOpen(true);
              }}
              className="text-[10px] font-semibold bg-indigo-600/90 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3 h-3" />
              Browse Omni-Glossary
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {minedHotspots.length > 0 ? (
              minedHotspots.map((hot, hIdx) => {
                const isVerified = !!internalizedTerms[hot.term];
                return (
                  <div key={hIdx} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                      <span className="font-semibold text-slate-200">{hot.term}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                      isVerified ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/10' : 'bg-slate-900 text-slate-500'
                    }`}>
                      {isVerified ? 'Grounding Verified' : 'Pending Study'}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-slate-550 italic py-2">No active vocabulary mined from lecture outlines yet.</p>
            )}
          </div>
        </div>

        {/* Active Quiz Score Timeline Logs */}
        <div className="bg-slate-950/20 border border-slate-850/80 p-4.5 rounded-xl space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Interactive Quiz History
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {quizHistory.length > 0 ? (
              quizHistory.map((qHistory, qIdx) => {
                const ratio = qHistory.score / qHistory.total;
                return (
                  <div key={qIdx} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/50">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200 line-clamp-1">{qHistory.topic}</p>
                      <p className="text-[9px] text-slate-500">{qHistory.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        ratio >= 0.8 ? 'bg-emerald-500/10 text-emerald-300' : ratio >= 0.5 ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300'
                      }`}>
                        Score: {qHistory.score}/{qHistory.total}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-slate-550 italic py-2">No quiz history compiled yet. Go to MCQ Quiz tab anyway.</p>
            )}
          </div>
        </div>

      </div>

      {/* Markdown Daily Log Card & Download Center */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-b-slate-800/60 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Automated Markdown Daily Study Log
            </h3>
            <p className="text-[10px] text-slate-400 font-sans leading-snug">
              Summarizes your "Academic Jargon Buster" deconstructions and "MCQ Quiz" activities into a persistent downloadable study log.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Log</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadLog}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow hover:shadow-emerald-600/15"
            >
              <Download className="w-3.5 h-3.5 text-white animate-bounce" style={{ animationDuration: '3s' }} />
              <span>Download Log (.md)</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-4.5 border border-slate-900 max-h-60 overflow-y-auto font-mono text-[10px] text-slate-350 leading-relaxed whitespace-pre-wrap select-text selection:bg-indigo-500/30">
          {generateMarkdownLog()}
        </div>
      </div>

      {/* Omni-Glossary Modal Overlay */}
      {isGlossaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-slate-100 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-indigo-400" />
                  🧠 Academic Omni-Glossary
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Search, filter, and review all vocabulary terms and semantic hotspots mined across your subjects.
                </p>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setIsGlossaryOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters and Search Bar */}
            <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search terminology hotspots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-100 font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3 text-slate-500" />
                  Status:
                </span>
                <button
                  onClick={() => { playClickSound(); setFilterType('all'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  All ({minedHotspots.length})
                </button>
                <button
                  onClick={() => { playClickSound(); setFilterType('mastered'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    filterType === 'mastered'
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow'
                      : 'bg-slate-855 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Mastered ({minedHotspots.filter(h => !!internalizedTerms[h.term]).length})
                </button>
                <button
                  onClick={() => { playClickSound(); setFilterType('pending'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    filterType === 'pending'
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 shadow'
                      : 'bg-slate-855 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Pending ({minedHotspots.filter(h => !internalizedTerms[h.term]).length})
                </button>
              </div>
            </div>

            {/* Grid Terminology Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(() => {
                const filtered = minedHotspots.filter(h => {
                  const matchesSearch = h.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        h.definition.toLowerCase().includes(searchQuery.toLowerCase());
                  const isMastered = !!internalizedTerms[h.term];
                  if (filterType === 'mastered') return matchesSearch && isMastered;
                  if (filterType === 'pending') return matchesSearch && !isMastered;
                  return matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <Search className="w-10 h-10 mx-auto stroke-1 text-slate-600 animate-pulse" />
                      <p className="text-sm font-semibold text-slate-450">No glossary terms match your filter.</p>
                      <p className="text-xs text-slate-500">Try revising your search string or clear your filter criteria.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((hot, hIdx) => {
                      const isMastered = !!internalizedTerms[hot.term];
                      return (
                        <div
                          key={hIdx}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            isMastered
                              ? 'bg-emerald-950/15 border-emerald-500/20 text-slate-300'
                              : 'bg-slate-950/30 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`w-2 h-2 rounded-full ${isMastered ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                <h4 className="font-bold text-slate-200 text-sm tracking-tight">{hot.term}</h4>
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-400">
                                  Rel: {Math.round(hot.relevanceScore * 100)}%
                                </span>
                              </div>
                              <p className="text-xs text-slate-450 leading-relaxed font-sans">{hot.definition}</p>
                            </div>
                            <button
                              id={`omni-toggle-${hIdx}`}
                              onClick={() => {
                                playClickSound();
                                toggleInternalizedTerm(hot.term);
                              }}
                              className={`px-2.5 py-1 text-[10px] font-mono tracking-tight shrink-0 transition rounded-lg cursor-pointer ${
                                isMastered
                                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-300 border border-slate-750 hover:bg-slate-700'
                              }`}
                            >
                              {isMastered ? 'Mastered' : 'Verify'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
              <p className="text-[10px] font-mono text-slate-500">
                Total Vocabulary Index: {minedHotspots.length} terms | Mastered: {minedHotspots.filter(h => !!internalizedTerms[h.term]).length} | Retained Mastery: {minedHotspots.length > 0 ? Math.round((minedHotspots.filter(h => !!internalizedTerms[h.term]).length / minedHotspots.length) * 100) : 0}%
              </p>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
