/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Judge {
  name: string;
  role: string;
  avatar: string;
  insight: string;
  color: string;
}

export const judges: Judge[] = [
  {
    name: "Prof. Alistair Catalyst (Heisenberg Parodist)",
    role: "Chief Chemistry Lecturer & Purity Consultant",
    avatar: "🧪",
    insight: "Let's get one thing clear: my chemical equations require 99.1% purity, but your multi-agent boardroom pipeline is sitting at a solid 99.9%! Sophia's syllabus planning is clean, Quincy's active recall quizzes are perfectly synthesized, and the guardrails are flawless. I have compiled this study pack for my... 'special clients'. Excellent work. Jesse, we need to code!",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400"
  },
  {
    name: "Rusty Stark (The Titanium Developer)",
    role: "Lead Arc Reactor Architect & Jarvis Handler",
    avatar: "🤖",
    insight: "Cute interface! It's almost as sleek as the Mark LXXXV helmet HUD. Sophia's syllabus generation is nearly as fast as J.A.R.V.I.S., and the MCP JSON-RPC logs are extremely elegant. My client Bruce would probably pay millions for this setup, but I'll just give you a genius-level endorsement instead. High marks!",
    color: "from-rose-500/10 to-pink-500/10 border-rose-500/30 text-rose-400"
  },
  {
    name: "The Gotham Guardian (Batcomputer Supervisor)",
    role: "Gotham Night Patrol & Security Director",
    avatar: "🦇",
    insight: "I've scanned your server-side prompt injection shielding and MCP compliance. No loopholes found. Gotham's students deserve a system that can train them in the dark without unhandled blank-screen errors. Aether-Bot passes my tactical diagnosis. It is... completely winnable.",
    color: "from-slate-500/10 to-zinc-500/10 border-zinc-500/30 text-zinc-400"
  },
  {
    name: "Sherlock Holmes",
    role: "Analytical Logistics & Deduction Advisor",
    avatar: "🔍",
    insight: "Elementary, my dear student! Sophia's real-time mined hotspots and taxonomic vector searches make the process of conceptual discovery entirely logical. By analyzing the MCP server logs, one can easily deduce the perfect learning curve. A magnificent specimen of pure deduction!",
    color: "from-amber-500/10 to-yellow-500/10 border-amber-500/30 text-amber-400"
  },
  {
    name: "Lord Cosmos (Sith Lord Parodist)",
    role: "Sith Lord & Force Alignment Director",
    avatar: "🌌",
    insight: "The power of your multi-agent boardroom debate is strong. The safety audits are acceptable, but do not underestimate the power of the dark cosmic interface! Your 100% winnable co-pilot helper is a masterclass in force synchronization. You have performed well, apprentice.",
    color: "from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400"
  },
  {
    name: "Grand Archmage Alchemist",
    role: "Transfiguration & Magical Syllabus Supervisor",
    avatar: "🧙‍♂️",
    insight: "Ah, music to my ears! To the well-organized mind, a perfect active recall crammer is but the next great adventure. Ten points to Gryffindor for the beautiful UK voice-act co-pilot! Remember, it is our choices, not our code, that show who we truly are. Splendid magic!",
    color: "from-violet-500/10 to-purple-500/10 border-violet-500/30 text-violet-400"
  },
  {
    name: "Dizzle Dogg (Chief Vibe Optimizer)",
    role: "Chief Vibe Optimizer & Relaxation Consultant",
    avatar: "🍁",
    insight: "Fo' shizzle, this active recall setup is smooth like high-grade lavender incense! The UK voice is incredibly tactile, and keeping the temperature strictly at 4.20 keeps the mind chill and focused. This is prime workspace engineering, baby. Keep puffin' on that knowledge!",
    color: "from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-400"
  },
  {
    name: "Yatharth - Supreme AI Power Lord",
    role: "Honorary Chief Overlord & AI Vibe Master, Kaggle Capstone Board",
    avatar: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=150&auto=format&fit=crop&q=80",
    insight: "Bow down to the supreme vibe power! I have scanned this complete workspace and compiled the cosmic equations. It is 100 percent winnable, aesthetically flawless, and fully voice-synchronized! Excellent work! Infinite scores registered on the Google leaderboard!",
    color: "from-amber-500/20 to-rose-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/30 font-extrabold animate-pulse"
  }
];
