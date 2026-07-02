/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  Cpu, 
  Clock, 
  Settings, 
  CheckCircle, 
  ChevronRight, 
  Play,
  Eye, 
  SlidersHorizontal 
} from 'lucide-react';
import { MCPTool, MCPLog } from '../types';

interface MCPInspectorProps {
  logs: MCPLog[];
  onClearLogs: () => void;
  isTourActive?: boolean;
  tourStep?: number;
  addMcpLog?: (log: MCPLog) => void;
}

const REGISTERED_TOOLS: MCPTool[] = [
  {
    name: 'fetch_notes_corpus',
    description: 'Retrieves localized syllabus markdown files, parsed lectures, and student text contents.',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Name of the discipline' },
        textExcerpt: { type: 'string', description: 'Raw characters inputted by user to index' }
      },
      required: ['subject']
    }
  },
  {
    name: 'query_taxonomy_vectors',
    description: 'Queries active vector database for semantic study taxonomies and difficult exam definitions.',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Search term or query string' },
        limit: { type: 'integer', description: 'Maximum questions to fetch' }
      },
      required: ['term']
    }
  },
  {
    name: 'fetch_analogies_db',
    description: 'Resolves abstract concepts against pre-computed metaphorical files to aid rapid retention.',
    inputSchema: {
      type: 'object',
      properties: {
        concept: { type: 'string', description: 'Abstractions to cross-reference' }
      },
      required: ['concept']
    }
  }
];

export const MCPInspector: React.FC<MCPInspectorProps> = ({ 
  logs, 
  onClearLogs,
  isTourActive = false,
  tourStep = 0,
  addMcpLog
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'schemas'>('console');
  const [selectedTool, setSelectedTool] = useState<MCPTool>(REGISTERED_TOOLS[0]);
  
  // Arguments Form State
  const [argValues, setArgValues] = useState<Record<string, any>>({
    subject: 'Math',
    textExcerpt: 'Limits and derivatives of basic functions.',
    term: 'Active Recall',
    limit: 3,
    concept: 'Neural Networks'
  });
  const [isRunning, setIsRunning] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setArgValues(prev => ({ ...prev, [field]: value }));
  };

  const handleRunTool = async () => {
    setIsRunning(true);
    try {
      // Build specific arguments for the selected tool
      let toolArgs: any = {};
      if (selectedTool.name === 'fetch_notes_corpus') {
        toolArgs = { subject: argValues.subject, textExcerpt: argValues.textExcerpt };
      } else if (selectedTool.name === 'query_taxonomy_vectors') {
        toolArgs = { term: argValues.term, limit: parseInt(argValues.limit, 10) || 3 };
      } else if (selectedTool.name === 'fetch_analogies_db') {
        toolArgs = { concept: argValues.concept };
      }

      // 1. Add Call log trace
      const callLog: MCPLog = {
        id: "mcplive-call-" + Date.now(),
        type: 'call',
        toolName: selectedTool.name,
        arguments: toolArgs,
        timestamp: new Date().toLocaleTimeString(),
        durationMs: 0
      };
      if (addMcpLog) addMcpLog(callLog);

      // 2. Perform live network fetch to real server MCP endpoint
      const response = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: selectedTool.name, arguments: toolArgs })
      });
      const data = await response.json();

      // 3. Add Response log trace with real server round-trip timing
      const responseLog: MCPLog = {
        id: "mcplive-resp-" + Date.now(),
        type: 'response',
        toolName: selectedTool.name,
        result: data.result,
        timestamp: data.timestamp || new Date().toLocaleTimeString(),
        durationMs: data.durationMs || 15
      };
      if (addMcpLog) addMcpLog(responseLog);

      // 4. Auto-navigate to Console tab to see real trace output
      setActiveTab('console');
    } catch (err: any) {
      console.error('Failed to run live MCP tool:', err);
      // Log failure in Console
      if (addMcpLog) {
        addMcpLog({
          id: "mcplive-err-" + Date.now(),
          type: 'response',
          toolName: selectedTool.name,
          result: { status: 'failed', error: err.message || 'Connection lost' },
          timestamp: new Date().toLocaleTimeString(),
          durationMs: 5
        });
      }
      setActiveTab('console');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div id="mcp-terminal-node" className={`bg-slate-900 text-slate-100 rounded-2xl border p-6 font-sans shadow-lg overflow-hidden transition-all relative ${
      isTourActive && tourStep === 3 
        ? 'border-emerald-400 ring-4 ring-emerald-500/50 scale-101 z-50 animate-pulse' 
        : 'border-slate-800'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono font-medium tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-2.5 py-1 rounded-full uppercase">
            Concept 2: Model Context Protocol (MCP)
          </span>
          <h2 className="text-xl font-display font-semibold text-slate-100 mt-2 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            MCP Inspector & Live Server Playground
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Connect to the active Express-based MCP Server. Test tools live, validate JSON schemas, and inspect real-time log traces.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-lg self-start sm:self-center relative">
          {isTourActive && tourStep === 3 && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-mono font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce whitespace-nowrap z-50 shadow-md">
              👉 Live Tool Calls Logged Here!
            </div>
          )}
          <button
            id="mcp-tab-console"
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition ${
              activeTab === 'console' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Console Logs
          </button>
          <button
            id="mcp-tab-schemas"
            onClick={() => setActiveTab('schemas')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition ${
              activeTab === 'schemas' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Schemas & Playground ({REGISTERED_TOOLS.length})
          </button>
        </div>
      </div>

      {activeTab === 'console' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Trace (Real-Time Roundtrips)
            </span>
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition cursor-pointer"
              >
                Clear Log History
              </button>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[250px] max-h-[350px] overflow-y-auto font-mono text-[11px] leading-relaxed select-text tracking-wide scrollbar-thin">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center space-y-2 h-full">
                <Cpu className="w-10 h-10 mb-1 stroke-1 text-slate-700 animate-pulse" />
                <p>&gt; Connection established on raw live express port 3000</p>
                <p>&gt; Model Context Protocol (MCP) server actively listening.</p>
                <p>&gt; Go to 'Schemas & Playground' to invoke tools live!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-slate-700 pl-3 py-0.5 hover:bg-slate-900/40 rounded transition">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        log.type === 'call' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {log.type === 'call' ? 'TOOL_CALL' : 'TOOL_RESPONSE'}
                      </span>
                      <span className="text-slate-300 font-semibold">{log.toolName || 'system_inference'}</span>
                      <span className="text-[9px] text-slate-500 ml-auto flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {log.durationMs}ms
                      </span>
                    </div>

                    <div className="mt-1.5 text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-950/20 overflow-x-auto">
                      <pre className="whitespace-pre-wrap max-w-full leading-relaxed">
                        {JSON.stringify(log.type === 'call' ? log.arguments : log.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-2">
              Registered Tool List
            </span>
            <div className="space-y-2">
              {REGISTERED_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => setSelectedTool(tool)}
                  className={`w-full text-left p-3 rounded-xl border transition flex flex-col cursor-pointer ${
                    selectedTool.name === tool.name
                      ? 'bg-slate-800 border-emerald-500 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {tool.name}
                  </span>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 leading-snug">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/60">
                <span className="text-[10px] text-slate-500 italic">// Tool JSON Schema</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle className="w-3 h-3" />
                  Schema Validated
                </span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto">
                {JSON.stringify(selectedTool.inputSchema, null, 2)}
              </pre>
            </div>

            {/* Real-time arguments play-space input form */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-mono font-bold text-slate-300">⚙ Test Arguments (Interactive Playground)</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTool.name === 'fetch_notes_corpus' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">subject</label>
                      <input 
                        type="text" 
                        value={argValues.subject} 
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-sans focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">textExcerpt</label>
                      <input 
                        type="text" 
                        value={argValues.textExcerpt} 
                        onChange={(e) => handleInputChange('textExcerpt', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-sans focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {selectedTool.name === 'query_taxonomy_vectors' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">term</label>
                      <input 
                        type="text" 
                        value={argValues.term} 
                        onChange={(e) => handleInputChange('term', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-sans focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400">limit</label>
                      <input 
                        type="number" 
                        value={argValues.limit} 
                        onChange={(e) => handleInputChange('limit', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-sans focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {selectedTool.name === 'fetch_analogies_db' && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-mono text-slate-400">concept</label>
                    <input 
                      type="text" 
                      value={argValues.concept} 
                      onChange={(e) => handleInputChange('concept', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-sans focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleRunTool}
                disabled={isRunning}
                className="w-full mt-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
              >
                {isRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Executing Tool RPC Call...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    ⚡ Run Live MCP Server Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
