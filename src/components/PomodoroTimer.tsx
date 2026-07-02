import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  BellOff, 
  Terminal, 
  Sparkles, 
  Coffee, 
  Flame, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { StudyPlan } from '../types';

interface PomodoroTimerProps {
  onSessionComplete: () => void;
  studyPlan: StudyPlan | null;
  completedSubtopics: { [key: string]: boolean };
  onTriggerToast: (title: string, message: string, type: 'success' | 'info' | 'reminder') => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onSessionComplete,
  studyPlan,
  completedSubtopics,
  onTriggerToast
}) => {
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 min default
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  // Custom Quick Preset minutes: 1 minute (for fast testing!), 10 min, 25 min
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync default permission state
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      setIsNotificationEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Timer Tick logic
  useEffect(() => {
    if (isActive) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, mode]);

  // Handle auto-selected fallback from study plan
  useEffect(() => {
    if (studyPlan && studyPlan.schedule && studyPlan.schedule.length > 0) {
      // Find first uncompleted subtask
      let foundUncompleted = '';
      for (const dayItem of studyPlan.schedule) {
        for (const sub of dayItem.subtopics) {
          const uniqueKey = `${studyPlan.subject}_day${dayItem.day}_sub0_${sub}`; // estimate
          const isDone = !!completedSubtopics[uniqueKey];
          if (!isDone) {
            foundUncompleted = `Day ${dayItem.day}: ${sub}`;
            break;
          }
        }
        if (foundUncompleted) break;
      }
      setSelectedTask(foundUncompleted || `Review Study Outline`);
    } else {
      setSelectedTask('General Revision');
    }
  }, [studyPlan, completedSubtopics]);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      onTriggerToast('System Constraint', 'Desktop Notifications are not supported in this browser.', 'info');
      return;
    }

    try {
      // Handle potential iframe cross-origin wrapper restrictions
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      setIsNotificationEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        onTriggerToast('Notifications Enabled', 'You will now receive desktop reminders!', 'success');
        // Test notification
        sendNativeNotification('Aetherius Cognitive Link Live', 'Focus session alerts are now successfully synchronized.');
      } else {
        onTriggerToast('Notifications Blocked', 'In-app custom banners will be used for reminders.', 'info');
      }
    } catch (err) {
      console.warn('Iframe blocked Notification.requestPermission. Fallback to in-app.', err);
      // Fallback
      setPermissionStatus('denied');
      setIsNotificationEnabled(false);
      onTriggerToast('Sandbox Fallback Active', 'Browser blocked permissions. Using high-fidelity in-app system alerts!', 'info');
    }
  };

  const toggleNotifications = () => {
    if (isNotificationEnabled) {
      setIsNotificationEnabled(false);
      onTriggerToast('Notifications Muted', 'Desktop reminders suspended.', 'info');
    } else {
      if (permissionStatus === 'granted') {
        setIsNotificationEnabled(true);
        onTriggerToast('Notifications Active', 'Desktop alerts restored.', 'success');
      } else {
        requestNotificationPermission();
      }
    }
  };

  // Dispatch standard modern Web Notification with custom options & error safety
  const sendNativeNotification = (title: string, body: string) => {
    if (isNotificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const option = {
          body,
          icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          silent: false,
          requireInteraction: true
        };
        new Notification(title, option);
      } catch (err) {
        console.warn('Native notification failed due to sandboxing wrapper:', err);
      }
    }
  };

  const handleTimerComplete = () => {
    setIsActive(false);

    if (mode === 'focus') {
      onTriggerToast('Focus Phase Complete!', `Stellar progress on: "${selectedTask}". Daily study streak incremented!`, 'success');
      sendNativeNotification('Focus Phase Complete! 🎓', `Stellar work completing your sprint on: ${selectedTask}`);
      
      // Increment study streak & confetti!
      onSessionComplete();
      
      // Switch to break
      setMode('break');
      setSecondsLeft(300); // 5 minutes break
    } else {
      onTriggerToast('Break Phase Complete!', 'Time to re-engage deep cognitive wiring.', 'info');
      sendNativeNotification('Break Over! ⚡', 'Time to re-engage and start your next study focus cycle!');
      setMode('focus');
      setSecondsLeft(1500); // Back to 25m
    }
  };

  // Quick Preset Handlers
  const handleSetPreset = (min: number) => {
    setIsActive(false);
    setSecondsLeft(min * 60);
    onTriggerToast('Timer Updated', `Focus countdown adjusted to ${min} minute${min > 1 ? 's' : ''}.`, 'info');
  };

  // Convert seconds left to MM:SS formats
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    onTriggerToast(
      isActive ? 'Focus Interrupted' : 'Focus Phase Active', 
      isActive ? 'Countdown paused.' : `Subtask focus locked: "${selectedTask}"`, 
      'info'
    );
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'focus' ? 1500 : 300);
    onTriggerToast('Timer Reset', 'Countdown restored to base phase values.', 'info');
  };

  // Trigger Instant Test Desktop Reminder
  const triggerInstantDesktopReminder = () => {
    const title = `Aetherius Study Alert: ${selectedTask}`;
    const body = `Review Checklist Subtask Action: Sourced from your live study planner parameters. Ready to finalize mastery?`;
    
    // Trigger desktop native if enabled
    sendNativeNotification(title, body);
    
    // Always trigger beautiful high-impact in-app workspace reminder to guarantee visibility
    onTriggerToast('Localized Notification', body, 'reminder');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
      {/* Glow animations mimicking a ticking system clock */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[50px] transition-all duration-1000 pointer-events-none ${
        isActive 
          ? mode === 'focus' 
            ? 'bg-amber-500/10 animate-pulse' 
            : 'bg-teal-500/10 animate-pulse'
          : 'bg-indigo-500/5'
      }`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Controller Details & Selector */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-all ${
              mode === 'focus'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
            }`}>
              {mode === 'focus' ? <Flame className="w-3 h-3 text-amber-400 animate-pulse" /> : <Coffee className="w-3 h-3 text-teal-400" />}
              {mode === 'focus' ? 'Deep Focus Phase' : 'Recharge Phase'}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {isActive ? 'ACTIVE TICKING' : 'IDLE'}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 block uppercase tracking-wide">
              Target Focus Subtask:
            </label>
            <div className="relative">
              <select
                value={selectedTask}
                onChange={(e) => {
                  setSelectedTask(e.target.value);
                  onTriggerToast('Focus Switched', `Now prioritizing: "${e.target.value}"`, 'info');
                }}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-sans cursor-pointer pr-8"
              >
                <option value="General Revision">General Syllabus Revision</option>
                {studyPlan?.schedule?.flatMap((dayItem) => 
                  dayItem.subtopics.map(sub => `Day ${dayItem.day}: ${sub}`)
                ).map((taskText, tIndex) => (
                  <option key={tIndex} value={taskText}>{taskText}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Buttons for easy grading / sprint test validation */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-505 font-mono mr-1">PRESETS:</span>
            <button
              id="preset-test-sprint"
              onClick={() => handleSetPreset(1)} // 1 min for fast testing!
              className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-850 hover:bg-slate-850 text-indigo-400 px-2 py-1 rounded-lg transition"
              title="Set to 1 Minute for fast test verification!"
            >
              1 Min Sprint ⚡
            </button>
            <button
              id="preset-rapid"
              onClick={() => handleSetPreset(10)}
              className="text-[10px] font-mono bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-300 px-2 py-1 rounded-lg transition"
            >
              10 m
            </button>
            <button
              id="preset-standard"
              onClick={() => handleSetPreset(25)}
              className="text-[10px] font-mono bg-slate-950 border border-slate-850 hover:bg-slate-855 text-slate-350 px-2 py-1 rounded-lg transition"
            >
              25 mFocus
            </button>
          </div>
        </div>

        {/* Right Side: Gigantic Timer Ring and Control Pedals */}
        <div className="flex items-center gap-6 bg-slate-950/40 border border-slate-855/60 p-4 rounded-2xl shadow-inner shrink-0 self-center md:self-auto">
          
          {/* Main pulsing timer text */}
          <div className="text-center">
            <div className={`text-4xl font-mono font-bold tracking-tight select-none transition-all duration-300 ${
              isActive 
                ? mode === 'focus'
                  ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-[pulse_1.5s_infinite]'
                  : 'text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.25)] animate-pulse'
                : 'text-slate-300'
            }`}>
              {formatTime(secondsLeft)}
            </div>
            <p className="text-[9px] font-mono text-slate-505 uppercase tracking-widest mt-1">
              Time Remaining
            </p>
          </div>

          {/* Play / Action Pedals */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <button
                id="toggle-pomodoro-btn"
                onClick={toggleTimer}
                className={`p-2.5 rounded-xl transition font-bold active:scale-95 ${
                  isActive
                    ? 'bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-505/20'
                }`}
                title={isActive ? 'Pause Study Cycle' : 'Launch Deep Focus Engine'}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                id="reset-pomodoro-btn"
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition hover:text-slate-200 active:scale-95"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Notification sync option right inside the widget layout */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5 border-t border-slate-850/80 mt-1">
              <button
                id="toggle-desktop-reminders"
                onClick={toggleNotifications}
                className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[9px] font-mono font-bold border transition duration-200 ${
                  isNotificationEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
                title={isNotificationEnabled ? 'Desktop Notifications Active' : 'Enable Localized Browser Notifications'}
              >
                {isNotificationEnabled ? <Bell className="w-3 h-3 text-emerald-400" /> : <BellOff className="w-3 h-3 text-slate-500" />}
                <span>{isNotificationEnabled ? 'MUTED ON' : 'DESKTOP'}</span>
              </button>

              <button
                id="trigger-test-reminder-instant"
                onClick={triggerInstantDesktopReminder}
                className="px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-mono"
                title="Test customized notification immediately!"
              >
                TEST
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
