# 🌌 Aetherius Executive AI Study Command Node
### An Interactive, Multi-Agent Exam Prep Workspace & Cognitive Retrieval Pipeline
*Built for Kaggle’s 5-Day AI Agents: Intensive Vibe Coding Course with Google — Capstone Project*

---

## 🏆 Course Concepts Demonstrated (Judges Quick-Map)

The following matrix maps the core architectural evaluations from the rubric directly to their location within the codebase:

| Core Course Concept | Code Location / Implementation Detail | Key Demonstration Feature |
| :--- | :--- | :--- |
| **Multi-Agent Deliberation** | `server.ts` & `src/App.tsx` (Boardroom Debate Engine) | Sophia (Planner), Quincy (Evaluator), Dr. Maya (Jargon Buster), and Serena (Safety Audit) collaborate in a **real, active sequential pipeline** where the output of one agent is fed directly into the input of the next. |
| **Model Context Protocol (MCP)** | `/api/mcp/*` (Express Server) & `/src/components/MCPInspector.tsx` (Inspector UI) | Live, interactive **MCP-protocol-styled / JSON-RPC 2.0 compliant** Express MCP Server executing real tool calls like `fetch_notes_corpus`, `query_taxonomy_vectors`, and `fetch_analogies_db` reading from actual local databases. |
| **Antigravity (Resiliency)** | `server.ts` (`generateContentResiliently`) | Fail-safe multi-model fallback chain (**Gemini 3.5 Flash → Gemini Flash Latest → Gemini 3.1 Flash Lite**) with automated error sanitization, retries, and request limit handling. |
| **Cognitive Security** | `server.ts` (Serena Auditor) | Multi-stage safety auditing for PII/profanity, coupled with secure API key isolation on server proxy routes to prevent browser-side leakage. |
| **Deployability & Perf** | `package.json`, `server.ts`, `api/index.ts` | Fully compatible Zero-Config Vercel Serverless & Docker Cloud Run bundling. Uses esbuild to bundle server typescript into CJS `dist/server.cjs` for instant boots. |
| **Agent Skills / CLI** | `/cli.ts` (`npm run generate-plan`) | Clean CLI-based agent client that reads local environment configs, executes the plan orchestration using Gemini, and renders color-coded ASCII curriculums. |

---

## 🚀 Live Interactive Experience
*   **Production Deployment URL:** https://ais-pre-6hypm3s7eouaggcqoasmhs-71370243479.asia-southeast1.run.app
*   **Alternative Live Sandbox Link:** https://aetherius-mu.vercel.app/
*   **Video Concept Demonstration:** Available in the hackathon media summary deck!

---

## 🌌 System Architecture

```
                                   ┌───────────────────────────┐
                                   │     USER INTERFACES       │
                                   │  (Web App / Node.js CLI)  │
                                   └─────────────┬─────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼ HTTP REST Requests                              ▼ local RPC Command
         ┌──────────────────────────────┐                  ┌──────────────────────────────┐
         │     Express App (Vercel)     │                  │      cli.ts Agent Client     │
         │       (server.ts)            │                  └──────────────┬───────────────┘
         └──────────────┬───────────────┘                                 │
                        ├─────────────────────────────────────────────────┘
                        ▼
         ┌────────────────────────────────────────────────────────┐
         │     Aetherius Resilient Orchestration Engine           │
         │     - multi-agent boardroom debate orchestration        │
         │     - prompt-injection creator lock validation         │
         │     - error sanitization & fail-safe fallback routing   │
         └────────────────────────┬───────────────────────────────┘
                                  │
                                  ├───────────────────────────────┐
                                  ▼                               ▼
                   ┌──────────────────────────────┐ ┌──────────────────────────────┐
                   │    Live MCP Server Engine    │ │   Gemini Developer SDK (@genai)│
                   │    - fetch_notes_corpus      │ │   - gemini-3.5-flash             │
                   │    - query_taxonomy_vectors  │ │   - gemini-flash-latest (fb)     │
                   │    - fetch_analogies_db      │ │   - gemini-3.1-flash-lite   │
                   └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🏆 Project Overview & Value Prompt

The **Aetherius Study Command Node** is an immersive, high-yield learning command center designed to optimize student workflows. Utilizing an advanced, rate-limit-resistant **Multi-Agent Boardroom Deliberation Architecture**, the workspace coordinates specialized academic agents to ingest notes, design day-by-day learning schedules, construct specialized self-tests, and verify output factual consistency.

An integrated, custom-built, pulsing **Deep Focus Pomodoro Timer** with localized browser push alerts keeps users focused, rewarding active session sprints with **dynamic streak increments** and interactive **Confetti celebrations**. All progress metrics, study velocities, and diagnostics are consolidated in a futuristic space-cyber dashboard styled with deep indigo/amber accents and real-time **Recharts** analytics curves.

---

## 🛡️ Multi-Agent Orchestration & "Antigravity" Design

Aetherius deploys a highly stable **multiphasic critique model** consisting of four distinct cognitive avatars:

1.  **📊 Sophia (Syllabus Planner Agent)**: Estimates the academic depth of source notes and builds customizable, step-by-step milestones.
2.  **📝 Quincy (Adaptive Evaluator Agent)**: Analyzes subject-matter weight to craft tailor-made Multiple-Choice questions (MCQs) and active recall flashcards.
3.  **🎓 Dr. Maya (Academic Jargon Buster)**: Simplifies complex equations, terminology, and difficult jargon with relatable everyday analogies.
4.  **🛡️ Serena (Safety Guardrail Auditor)**: Audits all synthesized outputs, filtering PII, measuring factual alignment, and rating hallucination risk scores.

The boardroom logs are simulated live in the stream, letting the student witness the complete deliberation process before locking in a plan.

---

## ✨ Primary Workflows & User Controls

*   **Custom Boardroom Debates**: Enter details, designate timeline parameters, and witness the expert agent boardroom form optimal custom agendas.
*   **Deep Focus Pomodoro Engine**: Standard 25m focus rhythms supplemented by a **1-Minute Sprint Mode**. Tracks session durations and links directly to study streak flame displays.
*   **Desktop & Local Notifications**: Supports standard HTML5 Notification requests seamlessly wrapped inside an iframe-aware error-rescue block to trigger real-time reminder prompts.
*   **Gamified Reward Loop**: Features customizable subtask checks, persistent LocalStorage syncs, high-contrast hover effects, and a custom-built WebGL/Canvas confetti engine triggered by complete course graduate events or perfect tests.
*   **Recharts Diagnostics**: Graph progress velocities, vocabulary mastery metrics, and previous test score tracking directly.

---

## 🛠️ Quick Installation & Setup

Set up Aetherius locally in under 3 minutes:

### 1. Clone & Init Workspace
```bash
git clone <repository_url>
cd aetherius-study-node
npm install
```

### 2. Set Up Credentials
Create a `.env` file at the root level and insert your Gemini API Key:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### 3. Build & Launch Platform
```bash
# Compile client-side and bundle server scripts CJS format
npm run build

# Start production server
npm run start
```
*Browse local workspace immediately at: `http://localhost:3000`*

---

## 🤖 Agent Skills - CLI Command Usage

In addition to the visual board dashboard, Aetherius contains a standalone **CLI Agent client** enabling scholars to coordinate study plans directly from their local terminal, bypassing browser overhead.

Execute the CLI tool using standard NPM parameters:
```bash
# Generate a study plan for Math over 7 days
npm run generate-plan -- --subject=Math --days=7

# Custom shortcuts are also fully supported
npm run generate-plan -- -s Chemistry -d 10
```

The CLI agent automatically loads local `.env` variables, initializes the `@google/genai` client, conducts real-time schema-validated JSON-RPC calls, and prints beautifully formatted, color-coded ANSI terminal study schedules with sub-topic focus breakdowns. If the environment's `GEMINI_API_KEY` is not set, it seamlessly switches to the local cognitive fallback module.

---

## 🧬 Codebase Engineering Highlights

*   **Fail-Safe Model Routing**: Under extreme spikes or API rate exhausts, the server-side router automatically switches to retry models (e.g. `gemini-flash-latest`), guaranteeing study plans are created with zero network exceptions.
*   **Modular Component Scheme**: Clean type definitions are isolated inside `src/types.ts`. Dashboard interfaces, timers, and charts are stored as self-contained TypeScript components under `src/components/` to prevent memory blowouts.
*   **Active Multi-Agent Redesign**: Credit goes to **laggingstick** for guiding the Model Context Protocol (MCP) tool integration design and the active multi-agent boardroom pipeline architecture. This replaces the previous mockup loops with true JSON-RPC 2.0 compliant server-side data querying and a real sequential backend endpoint chaining pipeline.
*   **Interactive MCP Server Playground**: Rather than hardcoding static logs, judges can browse the "Schemas & Playground" tab on the live dashboard, modify tool execution parameters, and click "Run Live MCP Server Request" to run real server-side Node.js function calls with full latency tracing.
*   **Production Authentication Note**: In this demonstration sandbox, MCP and API endpoints do not require active JSON Web Token (JWT) verification to simplify evaluation. For commercial production environments, these routes must be protected using standard OAuth2 sessions or bearer tokens passed within the HTTP authorization headers.

---
*Developed by Yatharth Durgapal, with special architecture credits to laggingstick. Fully optimized, beautifully realized, and battle-tested for Google's Vibe Coding hackathon.*
