/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { AlertCircle, Award, CheckCircle } from 'lucide-react';

interface QuizInsightData {
  subTopic: string;
  correctCount: number;
  totalCount: number;
  strugglePercentage: number; // 0 to 100
}

interface QuizInsightsChartProps {
  answers: Array<{
    questionText: string;
    isCorrect: boolean;
  }>;
  topic: string;
}

// Map common keywords to core study concepts
export function getQuestionSubtopic(question: string, topic: string): string {
  const q = question.toLowerCase();
  if (q.includes("polarization") || q.includes("basis") || q.includes("bases")) return "Photon Polarization";
  if (q.includes("eavesdrop") || q.includes("intercept") || q.includes("threshold") || q.includes("eve")) return "Eavesdropping Limits";
  if (q.includes("bb84") || q.includes("protocol") || q.includes("exchange")) return "BB84 Key Exchange";
  if (q.includes("gradient") || q.includes("descent") || q.includes("optimizer")) return "Gradient Descent";
  if (q.includes("overfit") || q.includes("regulariz") || q.includes("complexity") || q.includes("noise")) return "Overfitting Control";
  if (q.includes("validation") || q.includes("cross") || q.includes("score")) return "Cross-Validation";
  if (q.includes("quantum") || q.includes("qkd")) return "QKD Core Principles";
  
  if (topic && topic !== "Review Session" && topic.length < 25) {
    return topic;
  }
  
  // Hash fallback
  const hash = question.length % 3;
  if (hash === 0) return "Core Theory Concepts";
  if (hash === 1) return "Practical Applications";
  return "Error Analysis & Tuning";
}

export const QuizInsightsChart: React.FC<QuizInsightsChartProps> = ({ answers, topic }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Process answers into subtopic struggle metrics
  const insights: QuizInsightData[] = React.useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();

    answers.forEach((ans) => {
      const sub = getQuestionSubtopic(ans.questionText, topic);
      const current = map.get(sub) || { correct: 0, total: 0 };
      if (ans.isCorrect) {
        current.correct += 1;
      }
      current.total += 1;
      map.set(sub, current);
    });

    const list: QuizInsightData[] = [];
    map.forEach((value, key) => {
      const correctRatio = value.correct / value.total;
      const strugglePercentage = Math.round((1 - correctRatio) * 100);
      list.push({
        subTopic: key,
        correctCount: value.correct,
        totalCount: value.total,
        strugglePercentage
      });
    });

    // Sort from highest struggle to lowest struggle
    return list.sort((a, b) => b.strugglePercentage - a.strugglePercentage);
  }, [answers, topic]);

  useEffect(() => {
    if (!svgRef.current || insights.length === 0) return;

    // Clear previous SVG contents
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const width = 480;
    const barHeight = 44;
    const padding = 12;
    const margin = { top: 10, right: 60, bottom: 20, left: 140 };
    const chartHeight = insights.length * (barHeight + padding) + margin.top + margin.bottom;

    // Configure SVG viewbox and style
    svgElement
      .attr('viewBox', `0 0 ${width} ${chartHeight}`)
      .attr('width', '100%')
      .attr('height', chartHeight)
      .style('background', 'transparent')
      .style('overflow', 'visible');

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleBand()
      .domain(insights.map(d => d.subTopic))
      .range([margin.top, chartHeight - margin.bottom])
      .padding(0.2);

    const chartGroup = svgElement.append('g')
      .attr('transform', `translate(${margin.left}, 0)`);

    // Draw gridlines
    chartGroup.append('g')
      .attr('class', 'grid-lines')
      .attr('transform', `translate(0, ${chartHeight - margin.bottom})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-chartHeight + margin.top + margin.bottom)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', '#334155')
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.4)
      );

    // Dynamic Gradients
    const defs = svgElement.append('defs');
    
    // Gradient for high struggle (Amber/Red/Coral)
    const highStruggleGrad = defs.append('linearGradient')
      .attr('id', 'high-struggle-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    highStruggleGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e');
    highStruggleGrad.append('stop').attr('offset', '100%').attr('stop-color', '#fb923c');

    // Gradient for low struggle / mastery (Emerald/Teal)
    const lowStruggleGrad = defs.append('linearGradient')
      .attr('id', 'low-struggle-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    lowStruggleGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0ea5e9');
    lowStruggleGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

    // Draw background tracks for bars
    chartGroup.selectAll('.bg-bar')
      .data(insights)
      .enter()
      .append('rect')
      .attr('class', 'bg-bar')
      .attr('y', d => yScale(d.subTopic) || 0)
      .attr('x', 0)
      .attr('width', xScale(100))
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', '#1e293b')
      .attr('opacity', 0.5);

    // Draw interactive bars
    chartGroup.selectAll('.struggle-bar')
      .data(insights)
      .enter()
      .append('rect')
      .attr('class', 'struggle-bar')
      .attr('y', d => yScale(d.subTopic) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', d => d.strugglePercentage > 40 ? 'url(#high-struggle-grad)' : 'url(#low-struggle-grad)')
      .style('cursor', 'pointer')
      // Initial state for transition
      .attr('width', 0)
      .transition()
      .duration(800)
      .delay((_d, i) => i * 150)
      .attr('width', d => Math.max(xScale(d.strugglePercentage), 8)); // at least a sliver visible

    // Draw subtopic labels on left axis
    chartGroup.selectAll('.subtopic-label')
      .data(insights)
      .enter()
      .append('text')
      .attr('class', 'subtopic-label')
      .attr('x', -15)
      .attr('y', d => (yScale(d.subTopic) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#e2e8f0')
      .style('font-size', '10.5px')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .style('font-weight', 'bold')
      .text(d => d.subTopic);

    // Draw percentage text on right
    chartGroup.selectAll('.percentage-value')
      .data(insights)
      .enter()
      .append('text')
      .attr('class', 'percentage-value')
      .attr('x', d => Math.max(xScale(d.strugglePercentage), 8) + 10)
      .attr('y', d => (yScale(d.subTopic) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', d => d.strugglePercentage > 40 ? '#f43f5e' : '#10b981')
      .style('font-size', '11px')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .style('font-weight', '900')
      // Initial opacity for transition
      .style('opacity', 0)
      .text(d => `${d.strugglePercentage}% Struggle`)
      .transition()
      .duration(400)
      .delay((_d, i) => i * 150 + 600)
      .style('opacity', 1);

    // Add x-axis reference line at bottom
    chartGroup.append('line')
      .attr('x1', 0)
      .attr('y1', chartHeight - margin.bottom)
      .attr('x2', xScale(100))
      .attr('y2', chartHeight - margin.bottom)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5);

  }, [insights]);

  const highStruggles = insights.filter(x => x.strugglePercentage >= 50);

  return (
    <div className="bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            📊 D3 Quiz Struggle Analytics Insights
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">Concept struggle index (0% means flawless mastery, 100% means total struggle)</p>
        </div>
        <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          <span className="text-[8px] font-mono font-bold text-indigo-300 uppercase">Live D3 Model</span>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500 font-mono italic">
          No insights recorded. Complete a quiz first!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Chart Container */}
          <div className="lg:col-span-7 flex justify-center bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <svg ref={svgRef} className="max-w-full" />
          </div>

          {/* Actionable Insights Panel */}
          <div className="lg:col-span-5 space-y-3 text-left">
            <h5 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
              🧠 Actionable Feedback Checklist:
            </h5>
            
            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
              {highStruggles.length > 0 ? (
                highStruggles.map((h, i) => (
                  <div key={i} className="flex gap-2 bg-rose-500/5 border border-rose-500/20 rounded-xl p-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-mono font-bold text-rose-300 leading-tight">
                        Critical Focus: {h.subTopic}
                      </p>
                      <p className="text-[9.5px] text-slate-400 leading-snug mt-1">
                        We recommend review, tutoring sessions, or asking Aether-Bot (Humour Robot on the left) for a quick sarcastic breakdown!
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono font-bold text-emerald-300 leading-tight">
                      Subtopic Mastery Achieved!
                    </p>
                    <p className="text-[9.5px] text-slate-400 leading-snug mt-1">
                      You are completely dominating this topic! Go claim a Capstone Prestige Badge in the Kaggle VIP Lounge.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Prestige badge hint */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
              <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase">
                Unlock prestige medals in the Kaggle Capstone Lounge for flawless submissions!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
