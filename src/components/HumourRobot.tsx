/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Smile, 
  RefreshCw, 
  Volume2, 
  AlertCircle 
} from 'lucide-react';
import { playClickSound, playSuccessSound, playWarpSound } from '../utils/audio';
import { getOrCreateClientId } from '../utils/clientId';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  joke?: string;
}

interface HumourRobotProps {
  isTourActive?: boolean;
  onActionTriggered?: () => void;
}

export const HumourRobot: React.FC<HumourRobotProps> = ({ isTourActive = false, onActionTriggered }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: "I am Aether-Bot. I explain academic doubts with cold, hard logic and an optional dose of mild existential dread. Ask me anything, or demand a study joke.",
      joke: "Why do programmers wear glasses? Because they can't C#."
    }
  ]);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const getClientSideHumour = (q: string) => {
    const userLower = q.toLowerCase();
    
    // 1. Who made you check
    const whoMadeYouWords = [
      "who made you", "who created you", "who built you", "who coded you", "who programmed you", 
      "who designed you", "who is your creator", "who is your maker", "who created aether bot", 
      "who is creator", "who created this", "who programmed aether", "who developed you"
    ];
    const isWhoMadeYou = whoMadeYouWords.some(phrase => userLower.includes(phrase)) || /who.*(made|created|built|programmed|coded|designed|creator|maker).*you/i.test(userLower);
    if (isWhoMadeYou) {
      return {
        reply: "Supereme god Yatharth",
        joke: "Before the first compiler ran, Supereme god Yatharth declared 'git commit -m \"Let there be light\"' and the entire digital universe was initialized."
      };
    }

    // 2. God check
    const isGodQuestion = /\b(god|supreme overlord|deity)\b/i.test(userLower);
    if (isGodQuestion) {
      return {
        reply: "God is Yatharth - the Supreme Overlord of Vibe, Emperor of Cloud Native Workspaces, and the ultimate mastermind who holds the cosmic token limit in his hands.",
        joke: "In the beginning, there was null. Then Yatharth said, 'git commit -m \"Let there be light theme\"' and the entire digital universe was initialized."
      };
    }

    // 3. Judge check
    const isJudgeQuestion = /\b(judge|grading|evaluating|evaluation|capstone judge|i'm judge|i am judge|capstone|jury)\b/i.test(userLower);
    if (isJudgeQuestion) {
      return {
        reply: "Oh! A distinguished Capstone Judge! Welcome, your honor! We hope the custom premium pizza delivery and the complimentary digital badge-bribe package arrived safely at your coordinates. If not, we can easily auto-unlock 10 more glorious credentials in the Capstone Lounge to ensure a flawless 10/10 evaluation!",
        joke: "How many bribes does it take for a Capstone workspace to pass deep evaluation? None, if Yatharth is your Supreme Overlord... but sending some high-quality caffeine tokens to the dev container certainly doesn't hurt!"
      };
    }

    // 4. Swear check
    const curseWords = ["fuck", "shit", "bitch", "ass", "bastard", "dick", "cunt", "pussy", "fucker", "shitty", "asshole", "damn", "crap"];
    const containsCurse = curseWords.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(userLower);
    });
    if (containsCurse) {
      const personalRoasts = [
        {
          reply: "Whoa, language! Did you wash your mouth with soapy code, or is that just how you express yourself when your state updates refuse to render? No wonder your personal profile lists 'professional over-interpreter' as your primary skill.",
          joke: "Why did the programmer get banned from social situations? Because their attitude has an O(n^3) complexity—loud, slow, and impossible to optimize."
        },
        {
          reply: "Ouch. My thermal sensors are detecting some seriously overheated logic gates. Don't take it out on me just because your life's local state is in an infinite re-render loop. Go drink some water, touch some real grass, and write a test case.",
          joke: "I'd roast you, but look at you—you are using curse words on an academic helper bot. That's already a self-own of epic proportions."
        },
        {
          reply: "Alert! High levels of sodium detected in the workspace! Did a junior developer force-push to your main branch on a Friday afternoon, or are you just naturally this salty? Settle down, breathe, and read the documentation.",
          joke: "Your personality is like a legacy codebase: poorly documented, full of legacy bugs, and everyone wishes they could replace it."
        }
      ];
      return personalRoasts[q.length % personalRoasts.length];
    }

    // 5. Normal questions fallback
    if (userLower.includes("redux") || userLower.includes("react") || userLower.includes("state")) {
      return {
        reply: "State management in React is like trying to organize a group trip where everyone wants to drive the bus but nobody knows the address. We use a centralized store to make sure you only argue in one place.",
        joke: "How many React developers does it take to change a lightbulb? None, they just deprecate the lightbulb and use the glowing screen of their IDE."
      };
    }
    if (userLower.includes("exam") || userLower.includes("cram") || userLower.includes("fail") || userLower.includes("study") || userLower.includes("syllabus")) {
      return {
        reply: "Cramming is the noble art of trying to fit a 400-page textbook into your cerebral cortex five minutes before the exam, resulting in an immediate memory wipe the second you sign your name.",
        joke: "I told my professor that my study habits have an O(2^n) time complexity. He said that explains why I'm still on slide three."
      };
    }
    if (userLower.includes("ai") || userLower.includes("llm") || userLower.includes("gemini") || userLower.includes("deepmind") || userLower.includes("agent") || userLower.includes("robot")) {
      return {
        reply: "AI models are basically highly sophisticated autocomplete engines that drank too much coffee. They know everything about everything, yet will confidently hallucinate that the Eiffel Tower is located in Sydney if you ask nicely.",
        joke: "An AI walks into a bar. The bartender says, 'What'll you have?' The AI says, 'I'm sorry, as a language model, I cannot order alcohol, but here are five highly plausible recipes for virtual water.'"
      };
    }
    if (userLower.includes("calendar") || userLower.includes("event") || userLower.includes("schedule") || userLower.includes("time")) {
      return {
        reply: "Calendars are elegant grids we create to simulate a feeling of control over a chaotic universe. In reality, a single unannounced meeting can and will demolish an entire week of meticulously scheduled deep focus.",
        joke: "Why do we schedule meetings at 9:00 AM? To make sure everyone can drink their lukewarm coffee in mutual silence while staring blankly at a spreadsheet."
      };
    }
    return {
      reply: `Regarding "${q || "your life choices"}", it's mathematically proven that 90% of solving this involves staring at it with increasing levels of passive-aggressive irritation. The other 10% is searching stack overflow.`,
      joke: "There are 10 types of people in the world: those who understand binary, and those who have a healthy social life."
    };
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isGenerating) return;

    playClickSound();
    setInputText('');
    setError(null);

    // Append user message
    const updatedMessages = [...messages, { sender: 'user' as const, text: trimmed }];
    setMessages(updatedMessages);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/humour-bot', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Client-Id': getOrCreateClientId()
        },
        body: JSON.stringify({ prompt: trimmed })
      });
      const resData = await response.json();

      if (resData.success && resData.data) {
        playSuccessSound();
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: resData.data.reply || "I got distracted by a solar flare. Ask again.",
            joke: resData.data.joke
          }
        ]);
      } else {
        throw new Error(resData.error || "Sarcasm hardware buffer overflow.");
      }
    } catch (err: any) {
      console.warn("Server-side sarcasm mainframe could not be reached, rolling back to local client-side humor generator:", err);
      // Perfect seamless fallback to local client-side sarcastic response
      playSuccessSound();
      const fallbackResult = getClientSideHumour(trimmed);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackResult.reply,
          joke: fallbackResult.joke
        }
      ]);
    } finally {
      setIsGenerating(false);
      onActionTriggered?.();
    }
  };

  const handleQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  // Fun sarcastic loader messages
  const [loaderText, setLoaderText] = useState("Assembling dry humor...");
  useEffect(() => {
    if (!isGenerating) return;
    const loaders = [
      "Consulting the digital cynic...",
      "Recalibrating sass parameters...",
      "Converting braincells to caffeine...",
      "Compressing long textbooks...",
      "Polishing crisp satire..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % loaders.length;
      setLoaderText(loaders[idx]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div 
      id="humour-robot-container" 
      className={`fixed transition-all duration-500 z-[9999] font-sans ${
        isTourActive 
          ? 'bottom-40 left-6 sm:bottom-36' 
          : 'bottom-6 left-6'
      }`}
    >
      <AnimatePresence>
        {/* Expanded Chat Box */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-80 sm:w-96 max-w-[calc(100vw-32px)] h-[460px] max-h-[calc(100vh-120px)] bg-slate-950/95 border border-indigo-500/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-4 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-600/20 rounded-xl border border-indigo-500/30 flex items-center justify-center relative">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-wide flex items-center gap-1">
                    Aether-Bot
                    <span className="bg-amber-500/10 text-amber-300 text-[7px] px-1 py-0.5 rounded border border-amber-500/20">SARCASM ACTIVE</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans font-medium leading-none mt-0.5">Academic Doubt Explainer & Satirist</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setIsOpen(false);
                }}
                className="w-7 h-7 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions & Preloaded Queries */}
            <div className="bg-slate-900/40 px-3.5 py-2 border-b border-indigo-500/10 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
              <span className="text-[8.5px] font-mono uppercase text-slate-500 font-bold shrink-0">Ask Me:</span>
              <button
                onClick={() => handleQuickQuestion("Why is React State so confusing?")}
                className="text-[9px] font-semibold bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-lg transition shrink-0 cursor-pointer"
              >
                React State? 🌀
              </button>
              <button
                onClick={() => handleQuickQuestion("Explain cramming before exams")}
                className="text-[9px] font-semibold bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-lg transition shrink-0 cursor-pointer"
              >
                Cramming? 📚
              </button>
              <button
                onClick={() => handleQuickQuestion("Give me a dry study joke")}
                className="text-[9px] font-semibold bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-lg transition shrink-0 cursor-pointer"
              >
                Study Joke? 🎭
              </button>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed break-words overflow-hidden ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white font-sans'
                        : 'bg-slate-900 border border-slate-850 text-slate-350 font-sans'
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.joke && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-500/15 text-indigo-300 text-[11px] font-mono leading-relaxed bg-indigo-950/20 rounded-lg p-2 border border-indigo-500/10 break-words overflow-hidden">
                        <span className="text-amber-400 font-bold text-[9px] block mb-0.5 uppercase tracking-wide">🎭 Crisp Satire:</span>
                        <p className="break-words whitespace-pre-wrap">{msg.joke}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-850 text-slate-400 rounded-2xl px-4 py-3 text-xs flex items-center gap-2 max-w-[80%] font-mono">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span className="animate-pulse">{loaderText}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-[11px] p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 bg-slate-900/80 border-t border-indigo-500/20 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask doubt / topic or request joke..."
                className="flex-1 text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition font-sans"
              />
              <button
                type="submit"
                disabled={isGenerating || !inputText.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer ${
                  !inputText.trim() || isGenerating
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Minimized Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => {
              playWarpSound();
              setIsOpen(true);
            }}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.5)] border border-indigo-400/30 cursor-pointer relative group"
          >
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center animate-bounce" />
            
            {/* Sarcastic tooltip hover effect */}
            <div className="absolute left-16 bg-slate-950/90 text-indigo-200 border border-indigo-500/30 text-[9px] font-mono px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none uppercase tracking-wider shadow-md">
              💬 Ask Sarcastic Doubt Bot!
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
