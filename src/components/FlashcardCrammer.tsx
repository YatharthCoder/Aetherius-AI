/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playSuccessSound, playWarpSound } from '../utils/audio';
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  Check, 
  Lightbulb, 
  Cpu, 
  ArrowLeft, 
  ArrowRight 
} from 'lucide-react';
import { StudyFlashcard, MCPLog } from '../types';

interface FlashcardCrammerProps {
  subject: string;
  addMcpLog: (log: MCPLog) => void;
  isWinnableActive?: boolean;
  onActionTriggered?: () => void;
}

export const FlashcardCrammer: React.FC<FlashcardCrammerProps> = ({ 
  subject, 
  addMcpLog,
  isWinnableActive = true,
  onActionTriggered
}) => {
  const winnableMode = isWinnableActive;
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<StudyFlashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [confidence, setConfidence] = useState<{ [key: string]: 'easy' | 'hard' }>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leitnerBoxes, setLeitnerBoxes] = useState<{ [key: string]: number }>({});

  const handleGenerateFlashcards = async (targetTopic: string) => {
    setIsGenerating(true);
    setErrorMessage(null);
    setFlashcards([]);
    setCurrentIdx(0);
    setIsFlipped(false);
    setConfidence({});
    setLeitnerBoxes({});

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic: targetTopic })
      });
      const data = await response.json();
      
      if (data.mcpLogs) {
        data.mcpLogs.forEach((log: MCPLog) => addMcpLog(log));
      }

      if (data.success && data.flashcards && data.flashcards.length > 0) {
        playSuccessSound();
        setFlashcards(data.flashcards);
      } else {
        throw new Error(data.error || 'Failed to synthesize structure of custom flashcards.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Server connection failed while generating active cards.');
    } finally {
      setIsGenerating(false);
      onActionTriggered?.();
    }
  };

  const handleSpeechSynthesis = async (speechText: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    try {
      const response = await fetch('/api/generate-audio-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText })
      });
      const data = await response.json();

      if (data.success && data.live && data.audio) {
        // Decode base64 PCM array
        const rawBinary = window.atob(data.audio);
        const len = rawBinary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = rawBinary.charCodeAt(i);
        }

        // Initialize Web Audio context for 24kHz output
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtxClass({ sampleRate: 24000 });
        
        // Convert Little-Endian 16-bit Signed Short Samples to Float32
        const dataView = new DataView(bytes.buffer);
        const numSamples = bytes.length / 2;
        const outputBuffer = audioCtx.createBuffer(1, numSamples, 24000);
        const channelData = outputBuffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
          channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = outputBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start(0);
      } else {
        // Fallback to standard web browser synthesizer
        if ('speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = 1.0;
          utterance.onend = () => setIsSpeaking(false);
          synth.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
      }
    } catch (e) {
      console.error('TTS execution or decoding failed, triggering standard speech synthesize:', e);
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.onend = () => setIsSpeaking(false);
        synth.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    } finally {
      onActionTriggered?.();
    }
  };

  const recordConfidence = (cardId: string, value: 'easy' | 'hard') => {
    playClickSound();
    
    // Extract base card ID without "-spaced-" suffixes
    const baseCardId = cardId.split('-spaced-')[0];
    
    // Update Leitner Boxes
    setLeitnerBoxes(prev => {
      const currentBox = prev[baseCardId] || 1;
      let nextBox = currentBox;
      if (value === 'easy') {
        nextBox = Math.min(3, currentBox + 1);
      } else {
        nextBox = 1; // Back to Box 1 on struggle
      }
      return { ...prev, [baseCardId]: nextBox };
    });

    setConfidence(prev => ({ ...prev, [cardId]: value }));

    // If struggling, append card copy at the end of the deck queue to force spaced-repetition reappearance!
    if (value === 'hard') {
      const cardToRepeat = flashcards[currentIdx];
      setFlashcards(prev => [
        ...prev, 
        { 
          ...cardToRepeat, 
          id: `${baseCardId}-spaced-${Date.now()}`
        }
      ]);
    }

    // Auto advance after short delay
    setTimeout(() => {
      if (currentIdx + 1 < flashcards.length) {
        setCurrentIdx(prev => prev + 1);
        setIsFlipped(false);
      } else {
        playSuccessSound();
        setCurrentIdx(flashcards.length);
      }
    }, 400);
  };

  const handleAutoWinDeck = () => {
    playSuccessSound();
    const updatedConfidence: { [key: string]: 'easy' | 'hard' } = {};
    const updatedLeitnerBoxes: { [key: string]: number } = {};
    
    flashcards.forEach(card => {
      const baseCardId = card.id.split('-spaced-')[0];
      updatedConfidence[card.id] = 'easy';
      updatedLeitnerBoxes[baseCardId] = 3; // Fully internalized Box 3!
    });
    
    setConfidence(updatedConfidence);
    setLeitnerBoxes(updatedLeitnerBoxes);
    setCurrentIdx(flashcards.length);
  };

  const activeCard = flashcards[currentIdx];

  // Calculate stats based on base cards (ignoring dynamic duplicates)
  const uniqueCardIds = Array.from(new Set(flashcards.map(c => c.id.split('-spaced-')[0])));
  
  const box1Count = uniqueCardIds.filter(id => (leitnerBoxes[id] || 1) === 1).length;
  const box2Count = uniqueCardIds.filter(id => leitnerBoxes[id] === 2).length;
  const box3Count = uniqueCardIds.filter(id => leitnerBoxes[id] === 3).length;

  const easyCount = Object.values(confidence).filter(v => v === 'easy').length;
  const hardCount = Object.values(confidence).filter(v => v === 'hard').length;

  return (
    <div id="vocabulary-crammer-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden">
      {winnableMode && (
        <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-violet-500/10 border-b border-violet-500/20 px-6 py-1.5 flex items-center justify-between z-10">
          <span className="text-[10px] font-mono font-bold text-violet-300 flex items-center gap-1 uppercase tracking-wide">
            👑 100% Winnable Memory Assist Engaged
          </span>
          <span className="text-[9px] font-mono text-slate-400 italic">Mnemonic Locked On Front • 1-Click Solve Ready</span>
        </div>
      )}
      
      {/* Immersive ambient glowing backgrounds */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title block */}
      <div className={`border-b border-b-slate-800 pb-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${winnableMode ? 'pt-6' : ''}`}>
        <div>
          <span className="text-[10px] font-mono font-medium tracking-wide bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-2.5 py-1 rounded-full uppercase">
            Interactive Recall Deck
          </span>
          <h2 className="text-xl font-display font-semibold text-slate-100 mt-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-violet-400" />
            AI Synaptic Flashcard Crammer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate flipped concept cards with mnemonic triggers and listen to dynamic AI Coach vocals.
          </p>
        </div>
      </div>

      {/* Initial state / generation entry */}
      {(flashcards.length === 0) && (
        <div className="space-y-4 relative z-10">
          <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl space-y-4 backdrop-blur-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Enter Topic Sector to Cram</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="flashcard-topic-input"
                  type="text"
                  placeholder="e.g., Memoization vs Tabulation, DNS Resolution, Cellular Respiration"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="flex-1 text-xs border border-slate-800 bg-slate-950/80 text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition font-medium"
                />
                <button
                  id="generate-flashcard-btn"
                  disabled={isGenerating || !topic}
                  onClick={() => {
                    playWarpSound();
                    handleGenerateFlashcards(topic);
                  }}
                  className={`flex items-center justify-center gap-2 font-semibold text-xs px-5 py-3 rounded-xl transition shadow-lg ${
                    !topic || isGenerating
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-700 text-white hover:shadow-violet-500/20 active:scale-95'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Deck...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Synthesize Cards
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {!isGenerating && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center space-y-2 select-none border border-dashed border-slate-800 rounded-xl">
              <BookOpen className="w-8 h-8 stroke-1 text-slate-600 mb-1" />
              <p className="text-xs">No flashcards pre-loaded.</p>
              <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed">
                Provide a high-focused subtopic to let Sophia and Quincy assemble active mnemonic decks.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2 relative z-10">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Error: {errorMessage}</span>
        </div>
      )}

      {/* Active Deck Crammer */}
      {flashcards.length > 0 && activeCard && (
        <div className="space-y-6 relative z-10">
          
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">Card {currentIdx + 1} of {flashcards.length}</span>
            <div className="flex gap-4 font-mono text-[10px] uppercase">
              <span className="text-emerald-400">Got it: {easyCount}</span>
              <span className="text-rose-400">Reviewing: {hardCount}</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300" 
              style={{ width: `${((currentIdx + 1) / flashcards.length) * 100}%` }}
            />
          </div>

          {/* Gamified Spaced-Repetition Leitner System Dashboard */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 text-center">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-rose-400 block uppercase font-bold tracking-wider">📦 Box 1 (Now)</span>
              <span className="text-sm font-mono font-bold text-white px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 inline-block min-w-[2.5rem]">
                {box1Count}
              </span>
              <span className="text-[8px] text-slate-500 block">Review Today</span>
            </div>
            <div className="space-y-1 border-x border-slate-800/80">
              <span className="text-[9px] font-mono text-amber-400 block uppercase font-bold tracking-wider">📦 Box 2 (2 Days)</span>
              <span className="text-sm font-mono font-bold text-white px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 inline-block min-w-[2.5rem]">
                {box2Count}
              </span>
              <span className="text-[8px] text-slate-500 block">Graduated</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold tracking-wider">📦 Box 3 (5 Days)</span>
              <span className="text-sm font-mono font-bold text-white px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 inline-block min-w-[2.5rem]">
                {box3Count}
              </span>
              <span className="text-[8px] text-slate-500 block">Internalized</span>
            </div>
          </div>

          {/* Flipped Card Interface with pure CSS card perspective flip */}
          <div className="flex flex-col items-center justify-center py-4">
            <div 
              onClick={() => {
                playClickSound();
                setIsFlipped(prev => !prev);
              }}
              className="group cursor-pointer w-full max-w-sm h-64 [perspective:1000px]"
            >
              <div 
                className={`relative w-full h-full rounded-2xl border transition-all duration-500 [transform-style:preserve-3d] ${
                  isFlipped 
                    ? '[transform:rotateY(180deg)] border-fuchsia-500/50 bg-slate-900 shadow-fuchsia-500/5' 
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 shadow-slate-950/20'
                } shadow-xl flex items-center justify-center`}
              >
                
                {/* FRONT SIDE */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between [backface-visibility:hidden]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Front Side • Challenge</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                      (leitnerBoxes[activeCard.id.split('-spaced-')[0]] || 1) === 1
                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/25'
                        : (leitnerBoxes[activeCard.id.split('-spaced-')[0]] || 1) === 2
                          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/25'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/25'
                    }`}>
                      📦 Box {leitnerBoxes[activeCard.id.split('-spaced-')[0]] || 1}
                    </span>
                  </div>

                  <div className="space-y-2 text-center w-full">
                    <p className="text-sm font-medium text-slate-100 leading-relaxed text-center font-sans max-w-full overflow-y-auto max-h-[90px] pr-1">
                      {activeCard.front}
                    </p>
                    {winnableMode && activeCard.mnemonic && (
                      <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-2 max-w-[280px] mx-auto animate-pulse">
                        <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest block">👑 Winnable Key Cheat</span>
                        <p className="text-[10px] text-amber-300 italic font-medium leading-snug">"{activeCard.mnemonic}"</p>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 text-center font-mono italic">
                    (Click Card to Flip & Reveal Key Answers)
                  </p>
                </div>

                {/* BACK SIDE */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Back Side • Breakdown</span>
                    <span className="text-[9px] font-semibold text-fuchsia-400 uppercase bg-fuchsia-500/10 px-2 py-0.5 rounded">
                      📦 Box {leitnerBoxes[activeCard.id.split('-spaced-')[0]] || 1} Mnemonic
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed text-center font-sans max-w-full overflow-y-auto max-h-[120px] pr-1">
                    {activeCard.back}
                  </p>

                  {activeCard.mnemonic && (
                    <div className="bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-lg p-2.5 text-center">
                      <span className="text-[9px] font-mono text-fuchsia-400 block tracking-wider uppercase mb-0.5 font-bold">Mnemonic Device Lock</span>
                      <p className="text-[11px] text-fuchsia-300 font-sans italic leading-tight font-medium">"{activeCard.mnemonic}"</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Interactive controls and Audio synthetic briefer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-5">
            <button
              id="tts-readout-btn"
              disabled={isSpeaking}
              onClick={(e) => {
                e.stopPropagation();
                handleSpeechSynthesis(isFlipped ? activeCard.back : activeCard.front);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition ${
                isSpeaking 
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span>{isSpeaking ? 'Model Vocalizing...' : 'AI Voice Coach Readout'}</span>
            </button>

            {/* Assessment rates */}
            <div className="flex flex-wrap items-center gap-2">
              {winnableMode && (
                <button
                  id="flashcard-auto-win-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAutoWinDeck();
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black transition active:scale-95 shadow-lg shadow-amber-500/10 border border-amber-400/30 cursor-pointer"
                >
                  🏆 Instant Solve Deck (Recall All)
                </button>
              )}
              <span className="text-[11px] text-slate-400 font-medium">Evaluate Retrieval:</span>
              <button
                id="confidence-hard-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  recordConfidence(activeCard.id, 'hard');
                }}
                className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/25 px-3.5 py-2 rounded-xl text-xs font-semibold font-sans transition cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Still Struggling
              </button>
              <button
                id="confidence-easy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  recordConfidence(activeCard.id, 'easy');
                }}
                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/25 px-3.5 py-2 rounded-xl text-xs font-semibold font-sans transition cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Nailed It!
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Finished State summary */}
      {flashcards.length > 0 && currentIdx >= flashcards.length && (
        <div className="text-center py-6 space-y-4 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-2xl animate-bounce">
            <Check className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-display font-semibold text-slate-100">Synaptic Cram Deck Completed</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              You reviewed all targets in this segment. Evaluated <span className="text-emerald-400 font-bold">{easyCount} cards</span> as easily retrieved, and marked <span className="text-rose-400 font-bold">{hardCount} cards</span> to consolidate.
            </p>
          </div>

          <div className="pt-3 flex justify-center gap-3">
            <button
              id="flashcard-reset-btn"
              onClick={() => {
                setFlashcards([]);
                setTopic('');
              }}
              className="text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition"
            >
              Cram Other Topic Focus
            </button>
            <button
              id="flashcard-restart-btn"
              onClick={() => {
                setCurrentIdx(0);
                setIsFlipped(false);
                setConfidence({});
              }}
              className="text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl transition shadow-lg active:scale-95"
            >
              Restart Memory Test
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
