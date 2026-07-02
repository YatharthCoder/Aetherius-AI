/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, BookOpen, Quote, HelpCircleIcon, AlertTriangle } from 'lucide-react';
import { QuickExplanation } from '../types';
import { playWarpSound, playSuccessSound } from '../utils/audio';

interface DoubtBusterProps {
  explanation: QuickExplanation | null;
  isGenerating: boolean;
  onExplainConcept: (concept: string) => void;
}

export const DoubtBuster: React.FC<DoubtBusterProps> = ({
  explanation,
  isGenerating,
  onExplainConcept
}) => {
  const [concept, setConcept] = useState('');

  useEffect(() => {
    if (explanation) {
      playSuccessSound();
    }
  }, [explanation]);

  return (
    <div id="doubt-buster-card" className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="border-b border-b-slate-800 pb-4">
        <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-fuchsia-400 font-bold" />
          Academic Jargon Buster
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Input any complex concept. Get an academic breakdown plus an extremely stupid-simple mental analogy.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="doubt-buster-input"
          type="text"
          placeholder="e.g., Redux Store vs Provider, Epigenetic expression, Quantum super-position"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="flex-1 text-xs border border-slate-800 bg-slate-950/80 text-slate-100 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition font-medium"
        />
        <button
          id="doubt-buster-submit-btn"
          disabled={isGenerating || !concept}
          onClick={() => {
            playWarpSound();
            onExplainConcept(concept);
          }}
          className={`flex items-center justify-center gap-2 font-semibold text-xs px-5 py-3 rounded-xl transition shadow-lg ${
            !concept || isGenerating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white hover:shadow-fuchsia-500/10 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Breaking down...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Deconstruct Concept
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {explanation ? (
          <motion.div
            key={explanation.concept}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pt-2"
          >
            {/* Plain Breakdown */}
            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-tight mb-1 font-semibold">In Plain Terms</span>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">{explanation.brokenDown}</p>
            </div>

            {/* Metaphorical Analogy */}
            <div className="bg-fuchsia-500/5 border border-fuchsia-500/15 p-4 rounded-xl border-l-4 border-l-fuchsia-500">
              <span className="text-[10px] uppercase font-mono text-fuchsia-300 block tracking-tight mb-2 font-semibold flex items-center gap-1">
                <Quote className="w-3 h-3 text-fuchsia-400" />
                The Mental Metaphor
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed font-sans font-medium">
                "{explanation.analogy}"
              </p>
            </div>

            {/* Key Bullet Action Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {explanation.keyPoints.map((pt, idx) => (
                <div key={idx} className="bg-slate-950/10 border border-slate-850 hover:border-slate-800 p-3 rounded-xl transition">
                  <span className="text-[9px] font-mono text-fuchsia-300 bg-fuchsia-500/10 px-1.5 py-0.5 rounded">Point #{idx+1}</span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{pt}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          !isGenerating && (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 select-none">
              <HelpCircleIcon className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
              <p className="text-xs text-slate-500">Enter a concept name above to breakdown.</p>
            </div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};
