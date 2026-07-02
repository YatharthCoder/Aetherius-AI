/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QuizQuestion 
} from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Check, 
  Frown, 
  Smile 
} from 'lucide-react';
import { playClickSound, playSuccessSound, playErrorSound, playWarpSound } from '../utils/audio';
import { QuizInsightsChart } from './QuizInsightsChart';

interface ActiveQuizSynthesizerProps {
  questions: QuizQuestion[];
  isGenerating: boolean;
  onGenerateQuiz: (topic: string, count: number, difficulty?: string) => void;
  subject: string;
  onQuizComplete?: (score: number, total: number, topic: string) => void;
  quizHistory?: Array<{ topic: string, score: number, total: number, timestamp: string }>;
  isWinnableActive?: boolean;
}

export const ActiveQuizSynthesizer: React.FC<ActiveQuizSynthesizerProps> = ({
  questions,
  isGenerating,
  onGenerateQuiz,
  subject,
  onQuizComplete,
  quizHistory = [],
  isWinnableActive = true
}) => {
  const winnableMode = isWinnableActive;
  const [targetTopic, setTargetTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const [adaptiveDifficultyEnabled, setAdaptiveDifficultyEnabled] = useState(true);
  const [manualDifficulty, setManualDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [userAnswers, setUserAnswers] = useState<Array<{ questionText: string; isCorrect: boolean }>>([]);

  // Track past performance and compute adaptive difficulty
  const getPerformanceForTopic = (topic: string) => {
    if (!quizHistory || quizHistory.length === 0 || !topic.trim()) {
      return { attempts: 0, avgPercentage: 0, difficulty: 'medium' as const };
    }

    const tNormalized = topic.toLowerCase().trim();
    // Match any history items whose topic contains this text, or vice-versa
    const matched = quizHistory.filter(q => 
      q.topic.toLowerCase().includes(tNormalized) || tNormalized.includes(q.topic.toLowerCase())
    );

    if (matched.length === 0) {
      return { attempts: 0, avgPercentage: 0, difficulty: 'medium' as const };
    }

    const sumPercentages = matched.reduce((sum, q) => sum + (q.score / (q.total || 1)), 0);
    const avgPercentage = sumPercentages / matched.length;

    // Difficulty rules:
    // If average performance is elite (>= 80%), scale up complexity to 'hard' to push limits.
    // If average performance is low (< 50%), scale down complexity to 'easy' to build foundations.
    // Otherwise keep standard 'medium'.
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (avgPercentage >= 0.80) {
      difficulty = 'hard';
    } else if (avgPercentage < 0.50) {
      difficulty = 'easy';
    }

    return {
      attempts: matched.length,
      avgPercentage: Math.round(avgPercentage * 100),
      difficulty
    };
  };

  const performance = getPerformanceForTopic(targetTopic || subject || "Review Session");

  // Restart quiz logic
  const handleRestart = () => {
    playClickSound();
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setScore(0);
    setShowExplanation(false);
    setUserAnswers([]);
  };

  const currentQuestion = questions && questions.length > currentIdx ? questions[currentIdx] : null;

  const handleOptionSelect = (idx: number) => {
    if (quizSubmitted) return;
    playClickSound();
    setSelectedAnswer(idx);
  };

  const handleNextSubmit = () => {
    if (selectedAnswer === null) return;

    if (!quizSubmitted) {
      const isCorrect = selectedAnswer === currentQuestion?.correctAnswerIndex;
      if (isCorrect) {
        playSuccessSound();
        setScore(prev => prev + 1);
      } else {
        playErrorSound();
      }
      
      setUserAnswers(prev => [
        ...prev,
        {
          questionText: currentQuestion?.question || '',
          isCorrect
        }
      ]);
      
      setQuizSubmitted(true);
      setShowExplanation(true);
    } else {
      playClickSound();
      // Go to next
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setQuizSubmitted(false);
        setShowExplanation(false);
      } else {
        // Finished
        playSuccessSound();
        setCurrentIdx(questions.length);
        onQuizComplete?.(score, questions.length, targetTopic || subject || "Review Session");
      }
    }
  };

  return (
    <div id="quiz-synthesizer-card" className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
      {winnableMode && (
        <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-b border-amber-500/20 px-6 py-1.5 flex items-center justify-between z-10">
          <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wide">
            👑 100% Winnable Study Assist Engaged
          </span>
          <span className="text-[9px] font-mono text-slate-400 italic">Correct Answers Highlighted</span>
        </div>
      )}
      <div className={`border-b border-b-slate-800 pb-4 ${winnableMode ? 'pt-6' : ''}`}>
        <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400 font-bold" />
          Active Recall Quiz Synthesizer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Bite-sized micro tests customized dynamically from syllabus hotspots to counter forgetfulness curves.
        </p>
      </div>

      {/* Generation Input Area */}
      {(!questions || questions.length === 0 || currentIdx >= questions.length) && (
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Review Topic focus area</label>
              <input
                id="quiz-topic-input"
                type="text"
                placeholder="e.g., Dynamic programming, React Hooks, Mitochondrial process"
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                className="w-full text-xs border border-slate-800 bg-slate-950/80 text-slate-100 font-medium rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Question count</label>
              <select
                id="quiz-count-select"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full text-xs border border-slate-800 bg-slate-950/80 text-slate-100 font-medium rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              >
                <option value={2}>2 Qs</option>
                <option value={3}>3 Qs</option>
                <option value={5}>5 Qs</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Complexity</label>
              {adaptiveDifficultyEnabled ? (
                <div className="w-full text-xs border border-indigo-500/30 bg-indigo-950/30 text-indigo-300 font-mono font-bold rounded-xl px-2.5 py-2.5 flex items-center justify-between" title={`Auto complexity adjusted to: ${performance.difficulty.toUpperCase()}`}>
                  <span className="truncate">🤖 {performance.difficulty.toUpperCase()}</span>
                </div>
              ) : (
                <select
                  value={manualDifficulty}
                  onChange={(e) => setManualDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full text-xs border border-slate-800 bg-slate-950/80 text-slate-100 font-medium rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-mono font-bold"
                >
                  <option value="easy">EASY</option>
                  <option value="medium">MEDIUM</option>
                  <option value="hard">HARD</option>
                </select>
              )}
            </div>

            <div className="md:col-span-3">
              <button
                id="generate-quiz-btn"
                disabled={isGenerating}
                onClick={() => {
                  playWarpSound();
                  const finalDiff = adaptiveDifficultyEnabled ? performance.difficulty : manualDifficulty;
                  onGenerateQuiz(targetTopic.trim() || subject || "Review Session", numQuestions, finalDiff);
                  handleRestart();
                }}
                className={`w-full flex items-center justify-center gap-2 font-bold text-xs px-4 py-2.5 rounded-xl transition duration-200 shadow-xl border ${
                  isGenerating
                    ? 'bg-slate-850 text-slate-500 cursor-not-allowed border-slate-800'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 text-slate-950 border-amber-400/30 active:scale-[0.98]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    Synthesize Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Adaptive Difficulty Toggle Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-950/15 border border-indigo-500/10 p-3 rounded-xl">
            <div className="flex items-center gap-2.5">
              <input
                id="adaptive-difficulty-toggle"
                type="checkbox"
                checked={adaptiveDifficultyEnabled}
                onChange={(e) => {
                  playClickSound();
                  setAdaptiveDifficultyEnabled(e.target.checked);
                }}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/40 cursor-pointer"
              />
              <div>
                <label htmlFor="adaptive-difficulty-toggle" className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1 select-none">
                  <span>Adaptive Difficulty Adjuster</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 font-bold animate-pulse" />
                </label>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Automatically set Easy, Medium, or Hard questions based on past results for "{targetTopic || subject || "Review Session"}".
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              {performance.attempts > 0 ? (
                <div className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
                  Avg recall: {performance.avgPercentage}% ({performance.attempts} matches)
                </div>
              ) : (
                <div className="text-[9px] font-mono text-slate-500 italic">
                  No previous sessions tracked
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Quiz Question Visualizations */}
      {questions && questions.length > 0 && currentIdx < questions.length && currentQuestion && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-b-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-300">
              Assessing Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-xs font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Current Score: {score}/{questions.length}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-100 bg-slate-950/60 border border-slate-800 p-4 rounded-xl leading-relaxed">
            {currentQuestion.question}
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {currentQuestion.options.map((option, oIdx) => {
              const isSelected = selectedAnswer === oIdx;
              const isCorrectOpt = oIdx === currentQuestion.correctAnswerIndex;
              
              let cardStyle = 'border-slate-800 hover:bg-slate-950/60 hover:border-slate-700 bg-slate-950/20';
              let badgeElement = null;

              if (quizSubmitted) {
                if (isCorrectOpt) {
                  cardStyle = 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/10 text-emerald-300';
                  badgeElement = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                } else if (isSelected) {
                  cardStyle = 'bg-rose-500/10 border-rose-500/40 ring-2 ring-rose-500/10 text-rose-300';
                  badgeElement = <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
                } else {
                  cardStyle = 'opacity-40 border-slate-900 bg-slate-950/20 text-slate-500';
                }
              } else if (isSelected) {
                cardStyle = 'bg-amber-500/10 border-amber-500/40 ring-2 border-amber-500/25 text-amber-300';
              } else if (winnableMode && isCorrectOpt) {
                cardStyle = 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/25 text-amber-200 shadow-lg shadow-amber-500/5';
                badgeElement = (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded animate-pulse">
                    👑 WINNABLE OPTION
                  </span>
                );
              }

              return (
                <button
                  id={`quiz-option-${oIdx}`}
                  key={oIdx}
                  disabled={quizSubmitted}
                  onClick={() => handleOptionSelect(oIdx)}
                  className={`flex items-center justify-between text-left text-xs p-3.5 border rounded-xl transition ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 text-[10px] flex items-center justify-center font-bold ${
                      quizSubmitted && isCorrectOpt 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : isSelected 
                          ? 'bg-amber-500 border-amber-500 text-white' 
                          : 'border-slate-700 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {badgeElement}
                </button>
              );
            })}
          </div>

          {/* Explanation Layer */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 mt-4 space-y-2 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  <BookOpen className="w-3.5 h-3.5" />
                  Auditor Explanation Breakdown
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-3">
            <div>
              {winnableMode && (
                <button
                  id="quiz-auto-win-btn"
                  onClick={() => {
                    playSuccessSound();
                    const perfectScore = questions.length;
                    const perfectAnswers = questions.map(q => ({
                      questionText: q.question,
                      isCorrect: true
                    }));
                    setUserAnswers(perfectAnswers);
                    setScore(perfectScore);
                    setCurrentIdx(perfectScore);
                    onQuizComplete?.(perfectScore, perfectScore, targetTopic || subject || "Review Session");
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 text-slate-950 font-bold text-[10px] sm:text-xs px-3.5 py-2.5 rounded-xl transition active:scale-95 shadow-xl shadow-amber-500/10 border border-amber-400/30 cursor-pointer"
                >
                  <span>🏆 Instant 100% Score Win</span>
                </button>
              )}
            </div>
            <button
              id="quiz-next-btn"
              disabled={selectedAnswer === null}
              onClick={handleNextSubmit}
              className={`flex items-center gap-2 font-semibold text-xs px-4 py-2.5 rounded-xl transition ${
                selectedAnswer === null
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 shadow-lg cursor-pointer'
              }`}
            >
              <span>{quizSubmitted ? (currentIdx + 1 === questions.length ? 'Show Score Summary' : 'Next Question') : 'Verify Answer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quiz Finished State */}
      {questions && questions.length > 0 && currentIdx >= questions.length && (
        <div className="text-center py-6 space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-2xl">
            {score === questions.length ? (
              <Smile className="w-8 h-8 animate-bounce text-emerald-400" />
            ) : score > questions.length / 2 ? (
              <Smile className="w-8 h-8 text-amber-400" />
            ) : (
              <Frown className="w-8 h-8 text-rose-400" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-display font-semibold text-slate-100">Quiz Assessment Finished</h3>
            <p className="text-xs text-slate-300">
              You correctly solved <span className="font-bold text-indigo-400">{score}</span> out of{' '}
              <span className="font-bold">{questions.length}</span> question topics.
            </p>
          </div>

          {/* D3 Quiz Insights Chart View */}
          <div className="pt-2">
            <QuizInsightsChart answers={userAnswers} topic={targetTopic || subject || "Review Session"} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center max-w-xs mx-auto pt-3">
            <button
              id="quiz-retry-btn"
              onClick={handleRestart}
              className="w-full text-xs font-semibold border border-slate-800 text-slate-300 hover:bg-slate-800/60 px-4 py-2.5 rounded-xl transition"
            >
              Reset Quiz Errors
            </button>
            <button
              id="quiz-new-topic-btn"
              onClick={() => {
                setTargetTopic('');
                handleRestart();
              }}
              className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition shadow-lg active:scale-95"
            >
              Unlock New Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
