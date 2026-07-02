import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load local environment variables from .env if present
dotenv.config();

const cleanKey = (key: string | undefined): string => {
  if (!key) return "";
  let k = key.trim();
  if (k.startsWith('"') && k.endsWith('"')) {
    k = k.slice(1, -1).trim();
  } else if (k.startsWith("'") && k.endsWith("'")) {
    k = k.slice(1, -1).trim();
  }
  return k;
};

const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const geminiApiKey = cleanKey(rawKey);

const isApiKeyConfigured = (): boolean => {
  return !!geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY" && geminiApiKey !== "";
};

// ANSI Color helper codes for beautiful CLI output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underline: "\x1b[4m",
  fgCyan: "\x1b[36m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgMagenta: "\x1b[35m",
  fgBlue: "\x1b[34m",
  fgRed: "\x1b[31m",
  bgSlate: "\x1b[48;5;235m",
};

// Fallback Plan Generator
const getFallbackPlan = (subj: string, d: number) => {
  return {
    subject: subj,
    examDate: new Date(Date.now() + d * 24 * 60 * 60 * 1000).toLocaleDateString(),
    daysRemaining: d,
    academicStrategy: `[Offline Fallback] Focused adaptive retrieval strategy optimized for ${subj}. Prioritizing high-yield concepts first, followed by incremental quiz evaluation to counter active cognitive decay.`,
    schedule: Array.from({ length: d }).map((_, i) => {
      const dayNum = i + 1;
      return {
        day: dayNum,
        topic: `Fundamental Concept Core - Unit ${dayNum}`,
        description: `Introductory structural lecture and active flashcard recall session focusing on core aspects of ${subj}.`,
        subtopics: ["Critical terminology definitions", "Historical background and relevance", "Primary mathematical/technical constraints"],
        suggestedDurationMinutes: 90,
        difficulty: dayNum === d ? "Hard" : dayNum > d / 2 ? "Medium" : "Easy"
      };
    })
  };
};

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let subject = "General Engineering";
  let days = 5;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--subject=')) {
      subject = arg.split('=')[1];
    } else if (arg === '--subject' || arg === '-s') {
      subject = args[++i] || subject;
    } else if (arg.startsWith('--days=')) {
      days = parseInt(arg.split('=')[1], 10) || 5;
    } else if (arg === '--days' || arg === '-d') {
      days = parseInt(args[++i], 10) || 5;
    }
  }

  console.log(`\n${colors.fgCyan}${colors.bright}🤖 Aetherius Agent Skills - CLI Study Plan Generator${colors.reset}`);
  console.log(`${colors.dim}Subject: ${colors.reset}${colors.bright}${subject}${colors.reset} | ${colors.dim}Days: ${colors.reset}${colors.bright}${days}${colors.reset}\n`);

  let plan: any = null;
  let isLive = false;

  if (isApiKeyConfigured()) {
    try {
      console.log(`${colors.dim}⚡ Initializing Gemini API and sending autonomous prompt...${colors.reset}`);
      
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a professional academic mentor. Create a custom, highly strategic day-by-day study schedule for:
      Subject: ${subject}
      Days Remaining: ${days}
      Student Notes Context: No extra context provided via CLI.
      Difficulty Focus: Standard incremental build
      
      Synthesize an optimal strategy. Follow the JSON response schema strictly. Provide exactly ${days} items in the schedule, starting with day 1 up to day ${days}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              examDate: { type: Type.STRING },
              daysRemaining: { type: Type.INTEGER },
              academicStrategy: { type: Type.STRING },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    topic: { type: Type.STRING },
                    description: { type: Type.STRING },
                    subtopics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    suggestedDurationMinutes: { type: Type.INTEGER },
                    difficulty: { type: Type.STRING }
                  },
                  required: ["day", "topic", "description", "subtopics", "suggestedDurationMinutes", "difficulty"]
                }
              }
            },
            required: ["subject", "examDate", "daysRemaining", "academicStrategy", "schedule"]
          }
        }
      });

      if (response.text) {
        plan = JSON.parse(response.text.trim());
        isLive = true;
      } else {
        throw new Error("No text returned from Gemini API");
      }
    } catch (err: any) {
      console.warn(`${colors.fgRed}⚠ Gemini Live API call failed, reverting to local intelligent fallback engine.${colors.reset}`);
      plan = getFallbackPlan(subject, days);
    }
  } else {
    console.log(`${colors.fgYellow}ℹ GEMINI_API_KEY is not defined. Using local offline fallback engine.${colors.reset}`);
    plan = getFallbackPlan(subject, days);
  }

  // Beautiful render of the Study Plan in CLI
  console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.fgGreen}${colors.bright}🎯 ACADEMIC CURRICULUM FOR: ${plan.subject.toUpperCase()}${colors.reset}`);
  console.log(`${colors.dim}Target Completion Date: ${colors.reset}${colors.bright}${plan.examDate}${colors.reset}`);
  console.log(`${colors.dim}Engine Mode: ${colors.reset}${isLive ? colors.fgGreen + "LIVE GENERATIVE MODEL" : colors.fgYellow + "OFFLINE INTUATIVE FALLBACK"}${colors.reset}`);
  console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  console.log(`\n${colors.fgMagenta}${colors.bright}💡 ACADEMIC STRATEGY:${colors.reset}`);
  console.log(`${colors.dim}${plan.academicStrategy}${colors.reset}\n`);

  console.log(`${colors.fgCyan}${colors.bright}📅 SCHEDULE:${colors.reset}`);
  
  plan.schedule.forEach((dayItem: any) => {
    const diffColor = dayItem.difficulty === "Hard" ? colors.fgRed : dayItem.difficulty === "Medium" ? colors.fgYellow : colors.fgGreen;
    console.log(`\n  ${colors.bright}Day ${dayItem.day}: ${dayItem.topic}${colors.reset} [${diffColor}${dayItem.difficulty}${colors.reset}] (${dayItem.suggestedDurationMinutes} mins)`);
    console.log(`  ${colors.dim}└ ${dayItem.description}${colors.reset}`);
    if (dayItem.subtopics && dayItem.subtopics.length > 0) {
      console.log(`  ${colors.dim}  Focus Concepts:${colors.reset}`);
      dayItem.subtopics.forEach((sub: string) => {
        console.log(`    ${colors.fgCyan}•${colors.reset} ${sub}`);
      });
    }
  });

  console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.fgGreen}${colors.bright}✓ Curriculum generation complete! Good luck with your study!${colors.reset}`);
  console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

main().catch(err => {
  console.error("CLI Execution failed:", err);
  process.exit(1);
});
