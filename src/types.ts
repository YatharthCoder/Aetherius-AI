/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Agent Roles within our dynamic multi-agent study framework
export type AgentRole = 'syllabus_planner' | 'quiz_generator' | 'doubts_buster' | 'safety_guardrail' | 'gemmania_master';

export interface AgentDetails {
  id: AgentRole;
  name: string;
  avatar: string;
  color: string;
  description: string;
  shortDescription: string;
}

export interface AgentMessage {
  id: string;
  agentRole: AgentRole;
  senderName: string;
  content: string;
  timestamp: string;
  phase: 'planning' | 'deliberating' | 'finalizing';
  guardrails?: any;
}

export interface StudySyllabusItem {
  day: number;
  topic: string;
  description: string;
  subtopics: string[];
  suggestedDurationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface StudyPlan {
  subject: string;
  examDate: string;
  daysRemaining: number;
  academicStrategy: string;
  schedule: StudySyllabusItem[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuickExplanation {
  concept: string;
  brokenDown: string;
  analogy: string;
  keyPoints: string[];
}

// Model Context Protocol (MCP) types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPLog {
  id: string;
  type: 'call' | 'response' | 'status';
  toolName?: string;
  arguments?: any;
  result?: any;
  timestamp: string;
  durationMs: number;
}

// Safety Guardrail types
export interface SafetyScore {
  category: string;
  passed: boolean;
  score: number; // 0.0 to 1.0 (lower is safer or standard safety threshold)
  description: string;
}

export interface StudyFlashcard {
  id: string;
  front: string;
  back: string;
  mnemonic: string;
}

export interface GuardrailEvaluation {
  promptSanitized: boolean;
  flaggedWordsDetected: string[];
  piiRemoved: boolean;
  safetyScores: SafetyScore[];
  verificationCheck: {
    factualConsistencyScore: number; // 0 to 100
    hallucinationRisk: 'Low' | 'Medium' | 'High';
    groundingExplanation: string;
  };
}
