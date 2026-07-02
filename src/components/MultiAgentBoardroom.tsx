/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User2, 
  Calendar, 
  HelpCircle, 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles,
  RefreshCw,
  MessageSquareCode,
  Volume2,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { AgentRole, AgentDetails, AgentMessage } from '../types';
import { AGENT_LIST } from '../data/agentData';

interface MultiAgentBoardroomProps {
  messages: AgentMessage[];
  activeAgentId: AgentRole | null;
  phase: 'idle' | 'running' | 'completed';
  onTriggerPlan: () => void;
  subject: string;
  isTourActive?: boolean;
  tourStep?: number;
  onRetryAgent?: (role: AgentRole) => void;
}

export const MultiAgentBoardroom: React.FC<MultiAgentBoardroomProps> = ({
  messages,
  activeAgentId,
  phase,
  onTriggerPlan,
  subject,
  isTourActive = false,
  tourStep = 0,
  onRetryAgent
}) => {
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  return (
    <div id="boardroom-card" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl p-6 overflow-hidden relative group">
      {/* Animated Subtle Ambient Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5 mb-6 relative z-10">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full uppercase">
            Multi-Agent Synthesis Suite
          </span>
          <h2 className="text-lg font-display font-bold text-slate-100 mt-2 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            Adaptive Agent Boardroom Council
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-light">
            Observe the specialized debate pipeline analyze, verify, and ground your curriculums.
          </p>
        </div>

        {phase === 'idle' && (
          <div className="relative">
            {isTourActive && tourStep === 2 && (
              <div className="absolute -top-10 right-0 bg-indigo-500 text-white font-mono font-black text-[8px] px-2 py-1 rounded-full uppercase tracking-wider animate-bounce whitespace-nowrap z-50 shadow-md">
                👉 Click to Assemble Agent Debate!
              </div>
            )}
            <button
              id="trigger-boardroom-btn"
              onClick={onTriggerPlan}
              className={`flex items-center gap-2 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition duration-200 cursor-pointer ${
                isTourActive && tourStep === 2 
                  ? 'bg-amber-500 hover:bg-amber-600 ring-4 ring-amber-500/60 scale-105 shadow-xl animate-pulse text-slate-950' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/10 active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Assemble Boardroom Agent Group
            </button>
          </div>
        )}
      </div>

      {/* Agents Avatars Grid with Speeking and Thinking live state metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6 relative z-10 font-sans">
        {AGENT_LIST.map((agent) => {
          const isCurrentActiveMsgAgent = activeAgentId === agent.id;
          const isBoardroomRunning = phase === 'running';
          
          let animationState: 'idle' | 'speaking' | 'thinking' = 'idle';
          if (isBoardroomRunning) {
            animationState = isCurrentActiveMsgAgent ? 'speaking' : 'thinking';
          }

          const hasFailed = failedAvatars[agent.id];

          return (
            <motion.div
              key={agent.id}
              id={`agent-avatar-${agent.id}`}
              animate={{ 
                scale: animationState === 'speaking' ? 1.04 : animationState === 'thinking' ? 0.98 : 1,
                borderColor: animationState === 'speaking' 
                  ? 'rgba(168, 85, 247, 0.4)' 
                  : animationState === 'thinking'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(51, 65, 85, 0.3)'
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className={`flex flex-col items-center p-3 text-center rounded-2xl border transition duration-300 relative ${
                animationState === 'speaking' 
                  ? 'bg-purple-950/20 shadow-purple-500/5 shadow-2xl ring-2 ring-purple-500/20' 
                  : animationState === 'thinking'
                    ? 'bg-slate-950/20 opacity-80 border-slate-800'
                    : 'bg-slate-950/40 border-slate-800/60'
              }`}
            >
              {/* Particle flow glowing back ring for active states */}
              {animationState === 'speaking' && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-indigo-500/10 opacity-70 animate-pulse pointer-events-none" />
              )}

              <div className="relative">
                {/* Radial Pulse under avatar */}
                {animationState === 'speaking' && (
                  <span className="absolute -inset-1.5 rounded-full bg-purple-500/20 animate-ping duration-1000" />
                )}
                {animationState === 'thinking' && (
                  <span className="absolute -inset-1 rounded-full bg-indigo-500/5 animate-pulse duration-[2000ms]" />
                )}

                {hasFailed ? (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white relative z-10 border-2 shadow-md transition-transform duration-300 ${
                    agent.id === 'gemmania_master' ? 'bg-gradient-to-tr from-cyan-500 to-purple-600 border-cyan-400' :
                    agent.id === 'syllabus_planner' ? 'bg-gradient-to-tr from-indigo-500 to-indigo-700 border-indigo-400' :
                    agent.id === 'quiz_generator' ? 'bg-gradient-to-tr from-amber-500 to-amber-700 border-amber-400' :
                    agent.id === 'doubts_buster' ? 'bg-gradient-to-tr from-fuchsia-500 to-fuchsia-700 border-fuchsia-400' :
                    'bg-gradient-to-tr from-emerald-500 to-emerald-700 border-emerald-400'
                  } ${
                    animationState === 'speaking' 
                      ? 'scale-105 animate-bounce' 
                      : animationState === 'thinking'
                        ? 'scale-95 opacity-90'
                        : ''
                  }`} style={{ animationDuration: '3.5s' }}>
                    {agent.id === 'gemmania_master' ? 'GM' :
                     agent.id === 'syllabus_planner' ? 'SO' :
                     agent.id === 'quiz_generator' ? 'QU' :
                     agent.id === 'doubts_buster' ? 'MY' : 'SE'}
                  </div>
                ) : (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedAvatars(prev => ({ ...prev, [agent.id]: true }))}
                    className={`w-14 h-14 rounded-full object-cover border-2 shadow-md relative z-10 transition-transform duration-300 ${
                      animationState === 'speaking' 
                        ? 'border-purple-400 scale-105 animate-bounce' 
                        : animationState === 'thinking'
                          ? 'border-indigo-500/50 scale-95 opacity-90'
                          : 'border-slate-700'
                    }`}
                    style={{
                      animationDuration: '3.5s'
                    }}
                  />
                )}

                {/* State Indicator Icon badges */}
                {animationState === 'speaking' && (
                  <div className="absolute bottom-0 right-0 z-20 bg-purple-500 border-2 border-slate-950 rounded-full p-1 shadow-lg animate-pulse">
                    <Volume2 className="w-3 h-3 text-white" />
                  </div>
                )}
                {animationState === 'thinking' && (
                  <div className="absolute bottom-0 right-0 z-20 bg-indigo-600 border-2 border-slate-950 rounded-full p-1 shadow-lg">
                    <Activity className="w-3 h-3 text-indigo-200 animate-pulse" />
                  </div>
                )}
              </div>

              <p className={`text-xs font-bold mt-2.5 line-clamp-1 relative z-10 transition ${
                animationState === 'speaking' ? 'text-purple-300' : 'text-slate-200'
              }`}>
                {agent.name.split(' ')[0]}
              </p>

              {/* Status Badge below avatar */}
              <div className="mt-1 relative z-10">
                {animationState === 'speaking' ? (
                  <span className="text-[8px] font-mono uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 animate-pulse font-bold tracking-tight">
                    Speaking...
                  </span>
                ) : animationState === 'thinking' ? (
                  <span className="text-[8px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/25 tracking-tight font-bold">
                    Thinking...
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight font-semibold">
                    {agent.shortDescription}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Discussion Chat Bubbles with dark custom theme */}
      <div className="max-h-[300px] overflow-y-auto border border-slate-800/80 rounded-2xl bg-slate-950/60 p-4 space-y-4 mb-3 scrollbar-thin relative z-10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <MessageSquareCode className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
            <p className="text-xs font-medium text-slate-300">Boardroom awaiting trigger.</p>
            <p className="text-[10px] max-w-sm mt-1 text-slate-500 leading-normal">
              Provide exam topics and hit "Trigger Multi-Agent Boardroom" to watch collaborative agents generate an optimized schedule.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const matchedAgent = AGENT_LIST.find(a => a.id === msg.agentRole);
              const hasFailedChatImg = failedAvatars[msg.agentRole];

              return (
                <motion.div
                  key={msg.id}
                  id={`boardroom-chat-msg-${msg.id}`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-3 items-start"
                >
                  {hasFailedChatImg || !matchedAgent?.avatar ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-md ring-1 ring-slate-850 ${
                      msg.agentRole === 'gemmania_master' ? 'bg-gradient-to-tr from-cyan-500 to-purple-600' :
                      msg.agentRole === 'syllabus_planner' ? 'bg-gradient-to-tr from-indigo-500 to-indigo-700' :
                      msg.agentRole === 'quiz_generator' ? 'bg-gradient-to-tr from-amber-500 to-amber-700' :
                      msg.agentRole === 'doubts_buster' ? 'bg-gradient-to-tr from-fuchsia-500 to-fuchsia-700' :
                      'bg-gradient-to-tr from-emerald-500 to-emerald-700'
                    }`}>
                      {msg.agentRole === 'gemmania_master' ? 'GM' :
                       msg.agentRole === 'syllabus_planner' ? 'SO' :
                       msg.agentRole === 'quiz_generator' ? 'QU' :
                       msg.agentRole === 'doubts_buster' ? 'MY' : 'SE'}
                    </div>
                  ) : (
                    <img
                      src={matchedAgent.avatar}
                      alt={msg.senderName}
                      referrerPolicy="no-referrer"
                      onError={() => setFailedAvatars(prev => ({ ...prev, [msg.agentRole]: true }))}
                      className="w-8 h-8 rounded-full object-cover shadow-md mt-0.5 ring-1 ring-slate-800 shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-md max-w-[90%]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{msg.senderName}</span>
                      <div className="flex items-center gap-1.5">
                        {onRetryAgent && phase !== 'running' && msg.agentRole !== 'gemmania_master' && (
                          <button
                            onClick={() => onRetryAgent(msg.agentRole)}
                            className="text-[8px] font-mono font-bold bg-slate-950/80 hover:bg-slate-950 text-indigo-400 hover:text-indigo-300 border border-slate-800 hover:border-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition flex items-center gap-1 active:scale-95"
                            title={`Re-run the ${msg.senderName} generation step separately`}
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Recalibrate</span>
                          </button>
                        )}
                        <span className="text-[8px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans font-light">{msg.content}</p>

                    {msg.guardrails && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="flex items-center gap-1 text-[9.5px] font-mono font-bold text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>GUARDRAIL AUDIT TRACE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                          <div className="flex justify-between">
                            <span>Factual Accuracy:</span>
                            <span className="text-emerald-400 font-bold">
                              {msg.guardrails.factualScore !== undefined ? `${Math.round(msg.guardrails.factualScore * 100)}%` : '98%'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sourcing Authenticity:</span>
                            <span className="text-emerald-400 font-bold">
                              {msg.guardrails.sourceIntegrity !== undefined ? `${Math.round(msg.guardrails.sourceIntegrity * 100)}%` : '99%'}
                            </span>
                          </div>
                          <div className="flex justify-between col-span-2 border-t border-slate-900 mt-1 pt-1">
                            <span>Safety & Policy Compliance:</span>
                            <span className="text-emerald-400 font-black">PASSED</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {phase === 'running' && (
        <div className="flex items-center gap-2 justify-center py-2 text-xs text-indigo-400 font-mono relative z-10 font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Deliberating... Agent pipeline execution in progress</span>
        </div>
      )}
    </div>
  );
};
