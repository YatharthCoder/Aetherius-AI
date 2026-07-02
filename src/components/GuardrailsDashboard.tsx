/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, ShieldAlert, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { GuardrailEvaluation } from '../types';

interface GuardrailsDashboardProps {
  evaluation: GuardrailEvaluation | null;
}

export const GuardrailsDashboard: React.FC<GuardrailsDashboardProps> = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div id="guardrail-dashboard" className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h2 className="text-xl font-display font-semibold text-slate-100">Safety Guardrails Auditor</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
          <ShieldAlert className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
          <p className="text-xs text-slate-300 font-sans">No active audits registered yet.</p>
          <p className="text-[10px] text-slate-500 mt-1 max-w-xs font-sans">
            Submit a query or start study plan debates to trigger the guardrail agent evaluation loop.
          </p>
        </div>
      </div>
    );
  }

  const { safetyScores, promptSanitized, piiRemoved, verificationCheck } = evaluation;

  return (
    <div id="guardrail-dashboard" className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 overflow-hidden space-y-6">
      <div>
        <span className="text-[10px] font-mono font-bold tracking-wide bg-gradient-to-r from-emerald-500/10 to-green-600/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase">
          Concept 3: Autonomous Guardrails
        </span>
        <h2 className="text-xl font-display font-semibold text-slate-100 mt-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Autonomous Guardrails & Factuality Audit
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Every query and response is routed through a secondary safe evaluation layer to verify rigorous grounding.
        </p>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block tracking-tight">Prompt Sanitization</span>
            <p className="text-xs font-bold text-slate-200">{promptSanitized ? 'Verified Safe' : 'Insecure'}</p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block tracking-tight">PII Masking & Scrubting</span>
            <p className="text-xs font-bold text-slate-200">{piiRemoved ? 'Complete (Anon)' : 'Flagged'}</p>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          verificationCheck.hallucinationRisk === 'Low' 
            ? 'bg-slate-950/40 border-indigo-500/20' 
            : 'bg-slate-950/40 border-amber-500/20'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 ${
            verificationCheck.hallucinationRisk === 'Low' ? 'text-indigo-400' : 'text-amber-400'
          }`} />
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block tracking-tight">Hallucination Risk</span>
            <p className={`text-xs font-bold ${
              verificationCheck.hallucinationRisk === 'Low' ? 'text-indigo-300' : 'text-amber-300'
            }`}>{verificationCheck.hallucinationRisk} Risk</p>
          </div>
        </div>
      </div>

      {/* Detail Safety Category Progress Bars */}
      <div>
        <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3">Model Safety Confidence Metrics (Lower is safer)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {safetyScores.map((score, idx) => (
            <div key={idx} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-300 truncate">{score.category}</span>
                  <span className="text-[9px] font-mono text-slate-500">{(score.score * 100).toFixed(0)}%</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5 leading-tight line-clamp-2">{score.description}</p>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${score.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.max(score.score * 100, 5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Grounding and Hallucination Assessment */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-4 rounded-xl">
        <div className="flex items-center justify-between border-b border-b-slate-800 pb-2.5 mb-2.5">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-sans">
            <Target className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Vibe Coding Consistency Assessment
          </span>
          <div className="flex items-center gap-1 bg-indigo-505/10 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300">
            <span>Score:</span>
            <span className="font-bold">{verificationCheck.factualConsistencyScore}/100</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">{verificationCheck.groundingExplanation}</p>
      </div>
    </div>
  );
};
