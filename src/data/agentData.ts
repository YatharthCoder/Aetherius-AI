/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentDetails } from '../types';

export const AGENT_LIST: AgentDetails[] = [
  {
    id: 'gemmania_master',
    name: 'Gemmania (Ultimate Study AI Agent)',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    color: 'bg-cyan-600 border-cyan-400',
    description: 'The supercharged Cosmic Gemini study engine that coordinates individual pipelines with retrieval feedback.',
    shortDescription: 'Ultimate Study AI'
  },
  {
    id: 'syllabus_planner',
    name: 'Sophia (Syllabus Planner Agent)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    color: 'bg-indigo-600 border-indigo-400',
    description: 'Deconstructs massive textbooks and lecture notes into high-yield day-by-day prep schedules.',
    shortDescription: 'Active Curriculum Planner'
  },
  {
    id: 'quiz_generator',
    name: 'Quincy (Quiz Generator Agent)',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    color: 'bg-amber-600 border-amber-400',
    description: 'Generates customized active-recall question banks focused on difficult bottlenecks.',
    shortDescription: 'Retentive Evaluation Specialist'
  },
  {
    id: 'doubts_buster',
    name: 'Dr. Maya (Doubt Buster Agent)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    color: 'bg-fuchsia-600 border-fuchsia-400',
    description: 'Deconstructs tough terminology with visual, metaphorical, and interactive explanations.',
    shortDescription: 'Cognitive Analogy Generator'
  },
  {
    id: 'safety_guardrail',
    name: 'Serena (Safety Guardrail Agent)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    color: 'bg-emerald-600 border-emerald-400',
    description: 'Audits inputs for safe prompts and filters hallucinatory facts for rigorous factual grounding.',
    shortDescription: 'Safety & Sourcing Auditor'
  }
];
