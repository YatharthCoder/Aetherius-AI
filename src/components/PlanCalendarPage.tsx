import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Globe, 
  Gift, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  HelpCircle,
  Brain,
  ChevronRight,
  ChevronLeft,
  Smile,
  Trash2,
  Plus,
  Bell,
  Award,
  Cake,
  Volume2,
  X,
  Zap,
  Check,
  PartyPopper,
  CalendarDays,
  Briefcase,
  Flag,
  RotateCcw,
  Compass,
  Flame,
  UserCheck,
  Heart,
  Palette,
  Wifi,
  Loader2,
  SmilePlus,
  Coffee,
  Sun,
  Moon,
  VolumeX,
  Sparkle,
  Search
} from 'lucide-react';
import { StudyPlan } from '../types';
import { playSuccessSound, playWarpSound, playClickSound } from '../utils/audio';
import { ConfettiEffect } from './ConfettiEffect';

interface PlanCalendarPageProps {
  studyPlan: StudyPlan | null;
  onGeneratePlan: (subject: string, days: number, notes: string) => void;
  isGeneratingPlan: boolean;
  completedSubtopics: { [key: string]: boolean };
  onToggleSubtopic: (key: string) => void;
  speakText?: (text: string, force?: boolean, overrideGender?: 'male' | 'female', speakerName?: string) => void;
  externalEventTriggerCount?: number;
  isTourActive?: boolean;
  tourStep?: number;
}

interface CustomEvent {
  id: string;
  title: string;
  time: string;
  dateStr: string; // "YYYY-MM-DD"
  category: 'study' | 'exam' | 'personal' | 'holiday' | 'festival' | 'birthday' | 'task';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface FetchedHoliday {
  date: string; // "YYYY-MM-DD"
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

// Fallback predefined static holidays in case the public API fails or is offline
const PREDEFINED_FALLBACK_HOLIDAYS: { [countryCode: string]: { title: string; month: number; day: number; category: CustomEvent['category'] }[] } = {
  IN: [
    { title: '🎉 New Year’s Day', month: 1, day: 1, category: 'holiday' },
    { title: '🇮🇳 Republic Day Celebration', month: 1, day: 26, category: 'holiday' },
    { title: '🌸 Holi Festival of Colors', month: 3, day: 14, category: 'festival' },
    { title: '🐑 Eid al-Adha Festival', month: 6, day: 6, category: 'festival' },
    { title: '🧘 International Yoga Day', month: 6, day: 21, category: 'festival' },
    { title: '📖 Kabir Jayanti Festival', month: 6, day: 28, category: 'festival' },
    { title: '🕊️ Independence Day', month: 8, day: 15, category: 'holiday' },
    { title: '🎀 Raksha Bandhan Celebration', month: 8, day: 28, category: 'festival' },
    { title: '🕶️ Gandhi Jayanti Anniversary', month: 10, day: 2, category: 'holiday' },
    { title: '🪔 Diwali Festival of Lights', month: 11, day: 5, category: 'festival' },
    { title: '🎄 Christmas Celebration', month: 12, day: 25, category: 'holiday' }
  ],
  US: [
    { title: '🎉 New Year’s Day', month: 1, day: 1, category: 'holiday' },
    { title: '💘 Valentine’s Day Event', month: 2, day: 14, category: 'festival' },
    { title: '🍀 St. Patrick’s Day Festival', month: 3, day: 17, category: 'festival' },
    { title: '✊ Juneteenth Freedom Day', month: 6, day: 19, category: 'holiday' },
    { title: '☀️ Summer Solstice Fest', month: 6, day: 21, category: 'festival' },
    { title: '🇺🇸 Independence Day (4th of July)', month: 7, day: 4, category: 'holiday' },
    { title: '🎃 Halloween Celebration', month: 10, day: 31, category: 'festival' },
    { title: '🎖️ Veterans Day Memorial', month: 11, day: 11, category: 'holiday' },
    { title: '🦃 Thanksgiving Day', month: 11, day: 26, category: 'holiday' },
    { title: '🎄 Christmas Eve Celebration', month: 12, day: 24, category: 'holiday' },
    { title: '🎁 Christmas Day', month: 12, day: 25, category: 'holiday' }
  ],
  GB: [
    { title: '🎉 New Year’s Day', month: 1, day: 1, category: 'holiday' },
    { title: '🥚 Easter Sunday Gala', month: 4, day: 12, category: 'festival' },
    { title: '👑 King’s Official Birthday', month: 6, day: 13, category: 'holiday' },
    { title: '☀️ Summer Solstice Festival', month: 6, day: 21, category: 'festival' },
    { title: '🇬🇧 Summer Bank Holiday', month: 8, day: 31, category: 'holiday' },
    { title: '🎃 Halloween Celebration', month: 10, day: 31, category: 'festival' },
    { title: '🎄 Christmas Holiday', month: 12, day: 25, category: 'holiday' },
    { title: '🎁 Boxing Day Celebration', month: 12, day: 26, category: 'holiday' }
  ],
  JP: [
    { title: '🇯🇵 Ganjitsu (New Year)', month: 1, day: 1, category: 'holiday' },
    { title: '🌸 Sakura Spring Festival', month: 4, day: 5, category: 'festival' },
    { title: '🥁 Yosakoi Soran Festival', month: 6, day: 5, category: 'festival' },
    { title: '☀️ Summer Solstice Celebration', month: 6, day: 21, category: 'festival' },
    { title: '✨ Tanabata Star Festival', month: 7, day: 7, category: 'festival' },
    { title: '⛰️ Mountain Day (Yama no Hi)', month: 8, day: 11, category: 'holiday' },
    { title: '🎨 Culture Day Festival', month: 11, day: 3, category: 'holiday' },
    { title: '👑 Emperor’s Birthday Event', month: 2, day: 23, category: 'holiday' }
  ],
  DE: [
    { title: '🎉 New Year’s Day', month: 1, day: 1, category: 'holiday' },
    { title: '🥚 Ostern (Easter Holiday)', month: 4, day: 12, category: 'festival' },
    { title: '🥨 Labour Day Celebration', month: 5, day: 1, category: 'holiday' },
    { title: '⛪ Corpus Christi (Fronleichnam)', month: 6, day: 4, category: 'holiday' },
    { title: '🎶 Fête de la Musique', month: 6, day: 21, category: 'festival' },
    { title: '🇩🇪 Tag der Deutschen Einheit', month: 10, day: 3, category: 'holiday' },
    { title: '🎄 Christmas Eve Celebration', month: 12, day: 24, category: 'holiday' },
    { title: '🎁 First Day of Christmas', month: 12, day: 25, category: 'holiday' }
  ],
  CA: [
    { title: '🎉 New Year’s Day', month: 1, day: 1, category: 'holiday' },
    { title: '👑 Victoria Day Event', month: 5, day: 24, category: 'holiday' },
    { title: '🌲 National Indigenous Day', month: 6, day: 21, category: 'festival' },
    { title: '⚜️ Fête Nationale du Québec', month: 6, day: 24, category: 'festival' },
    { title: '🍁 Canada Day Holiday', month: 7, day: 1, category: 'holiday' },
    { title: '🍂 Thanksgiving Day', month: 10, day: 12, category: 'holiday' },
    { title: '🎄 Christmas Eve Celebration', month: 12, day: 24, category: 'holiday' },
    { title: '🎁 Christmas Celebration', month: 12, day: 25, category: 'holiday' }
  ],
  AU: [
    { title: '🎉 New Year’s Day', month: 1, day: 1, category: 'holiday' },
    { title: '🐨 Australia Day National', month: 1, day: 26, category: 'holiday' },
    { title: '🕊️ Anzac Day Memorial', month: 4, day: 25, category: 'holiday' },
    { title: '👑 King’s Birthday Holiday', month: 6, day: 8, category: 'holiday' },
    { title: '❄️ Winter Solstice Feast', month: 6, day: 21, category: 'festival' },
    { title: '🎄 Christmas Celebration', month: 12, day: 25, category: 'holiday' },
    { title: '🎁 Boxing Day Celebration', month: 12, day: 26, category: 'holiday' }
  ],
  FR: [
    { title: '🎉 New Year’s Day', month: 1, day: 1, category: 'holiday' },
    { title: '🎶 Fête de la Musique', month: 6, day: 21, category: 'festival' },
    { title: '🥐 Bastille Day National', month: 7, day: 14, category: 'holiday' },
    { title: '🕯️ Toussaint (All Saints Day)', month: 11, day: 1, category: 'holiday' },
    { title: '🕊️ Armistice Day Remembrance', month: 11, day: 11, category: 'holiday' },
    { title: '🎄 Christmas Eve Celebration', month: 12, day: 24, category: 'holiday' },
    { title: '🎁 Christmas Celebration', month: 12, day: 25, category: 'holiday' }
  ]
};

const COUNTRY_OPTIONS = [
  { code: 'IN', name: 'India (IND)', flag: '🇮🇳' },
  { code: 'US', name: 'United States (USA)', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom (UK)', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan (JPN)', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany (GER)', flag: '🇩🇪' },
  { code: 'CA', name: 'Canada (CAN)', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia (AUS)', flag: '🇦🇺' },
  { code: 'FR', name: 'France (FRA)', flag: '🇫🇷' }
];

const CATEGORY_COLORS: { [key in CustomEvent['category']]: { label: string; text: string; bg: string; border: string; dot: string } } = {
  study: { label: 'Study Session', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', dot: 'bg-indigo-400' },
  exam: { label: 'Exam / Milestone', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  personal: { label: 'Personal Event', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  holiday: { label: 'National Holiday', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  festival: { label: 'Cultural Festival', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  birthday: { label: 'Birthday Celebration', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', dot: 'bg-fuchsia-400' },
  task: { label: 'General Task', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400' }
};

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[Safe Storage] Failed to getItem for key "${key}":`, e);
      return (window as any)[`__mem_storage_${key}`] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Safe Storage] Failed to setItem for key "${key}":`, e);
      (window as any)[`__mem_storage_${key}`] = value;
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Safe Storage] Failed to removeItem for key "${key}":`, e);
      delete (window as any)[`__mem_storage_${key}`];
    }
  },
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.warn(`[Safe Storage] Failed to clear localStorage:`, e);
    }
  }
};
const localStorage = safeLocalStorage;

export const PlanCalendarPage: React.FC<PlanCalendarPageProps> = ({
  studyPlan,
  onGeneratePlan,
  isGeneratingPlan,
  completedSubtopics,
  onToggleSubtopic,
  speakText,
  externalEventTriggerCount,
  isTourActive = false,
  tourStep = 0
}) => {
  // Calendar modes: 'general' (Daily Life) and 'study' (Study Prep)
  const [calendarMode, setCalendarMode] = useState<'study' | 'general'>('general');

  // Selected Country for localized holidays
  const [selectedCountry, setSelectedCountry] = useState<string>('IN');

  // API holiday variables
  const [fetchedHolidays, setFetchedHolidays] = useState<FetchedHoliday[]>([]);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Daily Life planner inputs (Active only in daily life mode)
  const [dailyWellnessGoal, setDailyWellnessGoal] = useState('Maintain consistent deep breathing & hydration');
  const [wellnessWaterCups, setWellnessWaterCups] = useState(4);
  const [dailyMood, setDailyMood] = useState<'energetic' | 'calm' | 'thoughtful' | 'tired'>('calm');

  // Study Plan config states (Only visible in Study Prep Mode)
  const [selectedSubject, setSelectedSubject] = useState('Quantum Business & Ethics');
  const [customSubject, setCustomSubject] = useState('');
  const [daysCount, setDaysCount] = useState(5);
  const [customNotes, setCustomNotes] = useState('');
  
  // IP and geolocation states (Obfuscated to protect user data)
  const [detectedIP, setDetectedIP] = useState('Protected Workspace Node');
  const [detectedTimezone, setDetectedTimezone] = useState('Asia/Kolkata');
  const [detectedGeo, setDetectedGeo] = useState('India');

  // Dynamic Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Interactive Calendar grid states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(new Date().getDate());

  // Custom events stored in local storage
  const [events, setEvents] = useState<CustomEvent[]>([]);
  
  // Form variables for adding events (Category color coding is supported)
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventCategory, setNewEventCategory] = useState<CustomEvent['category']>('personal');
  const [newEventPriority, setNewEventPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newEventNotes, setNewEventNotes] = useState('');

  // Birthday setup
  const [birthMonth, setBirthMonth] = useState<number>(6); // June
  const [birthDay, setBirthDay] = useState<number>(27); // 27th
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const [birthdaySimulated, setBirthdaySimulated] = useState(false); // Quick demo override toggle

  const [buddyMessage, setBuddyMessage] = useState('Welcome back! Toggle Daily Life or Study Prep to modify schedules.');
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingReminders, setUpcomingReminders] = useState<CustomEvent[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);

  const curatedSubjects = [
    'Quantum Business & Ethics',
    'Neo-Impressionist Art History',
    'Astrophysical Investment & Finance',
    'Organic Chemistry & Culinary Science',
    'Socratic Game Theory & UX Design',
    'Brutalist Architecture & Web Design',
    'Deep Sea Biology & Mythical Arts'
  ];

  // Dynamic Clock Updating
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check comparing current time with saved event times starting in < 30 mins
  useEffect(() => {
    if (events.length === 0) {
      if (upcomingReminders.length > 0) setUpcomingReminders([]);
      return;
    }

    const now = new Date();
    const upcoming = events.filter(ev => {
      if (!ev.dateStr || !ev.time) return false;
      if (dismissedReminders.includes(ev.id)) return false;

      try {
        const [y, m, d] = ev.dateStr.split('-').map(Number);
        const [h, min] = ev.time.split(':').map(Number);
        const evDate = new Date(y, m - 1, d, h, min, 0);
        
        const diffMs = evDate.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);
        
        // Starts within 30 minutes from now (and hasn't passed more than 1 min ago)
        return diffMins >= -1 && diffMins <= 30;
      } catch (e) {
        return false;
      }
    });

    // If a new reminder is detected, trigger visual chime alert
    const hasNew = upcoming.some(u => !upcomingReminders.some(r => r.id === u.id));
    if (hasNew) {
      playWarpSound();
    }

    setUpcomingReminders(upcoming);
  }, [currentTime, events, dismissedReminders]);

  // Fetch Public Holidays dynamically using public Nager.Date API based on user's selected location!
  useEffect(() => {
    const fetchRegionalHolidays = async () => {
      setIsFetchingHolidays(true);
      setApiConnectionStatus('checking');
      try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${selectedCountry}`);
        if (response.ok) {
          const data: FetchedHoliday[] = await response.json();
          setFetchedHolidays(data);
          setApiConnectionStatus('online');
          console.log(`Successfully synced ${data.length} holidays from Nager.Date API for country: ${selectedCountry}`);
        } else {
          setApiConnectionStatus('offline');
          setFetchedHolidays([]);
        }
      } catch (err) {
        console.warn("Public holiday API error. Reverting gracefully to high fidelity fallback data.", err);
        setApiConnectionStatus('offline');
        setFetchedHolidays([]);
      } finally {
        setIsFetchingHolidays(false);
      }
    };

    fetchRegionalHolidays();
  }, [selectedCountry, currentYear]);

  // Load everything from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('user_calendar_events_v3');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error("Failed loading saved calendar events", e);
      }
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const initialSeed: CustomEvent[] = [
        {
          id: 'seed-1',
          title: '🧘 Mindful Morning Breath',
          time: '08:30',
          dateStr: todayStr,
          category: 'personal',
          priority: 'medium',
          notes: 'Synthesize ocean sound loop, take 10 slow inhales.'
        },
        {
          id: 'seed-2',
          title: '✨ Creative Hackathon Milestone',
          time: '14:00',
          dateStr: todayStr,
          category: 'task',
          priority: 'high',
          notes: 'Interactive judges workbook parameters are running properly.'
        }
      ];
      setEvents(initialSeed);
      localStorage.setItem('user_calendar_events_v3', JSON.stringify(initialSeed));
    }

    // Load custom Birthday config
    const savedBirthMonth = localStorage.getItem('study_buddy_birth_month_v3');
    const savedBirthDay = localStorage.getItem('study_buddy_birth_day_v3');
    if (savedBirthMonth && savedBirthDay) {
      setBirthMonth(parseInt(savedBirthMonth));
      setBirthDay(parseInt(savedBirthDay));
    }

    // Load wellness states
    const savedWellnessWater = localStorage.getItem('user_wellness_water_cups');
    if (savedWellnessWater) setWellnessWaterCups(parseInt(savedWellnessWater));

    // Geolocation detection (strictly obfuscating the client IP to maintain privacy)
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          if (data.ip) {
            const parts = data.ip.split('.');
            if (parts.length === 4) {
              setDetectedIP(`${parts[0]}.***.***.${parts[3]} (Proxied)`);
            } else {
              setDetectedIP('Secure Gateway Proxy (Masked)');
            }
          }
          if (data.timezone) setDetectedTimezone(data.timezone);
          if (data.city && data.country_name) {
            setDetectedGeo(`${data.city}, ${data.country_name}`);
          }
          if (data.country_code) {
            const matched = COUNTRY_OPTIONS.find(o => o.code === data.country_code);
            if (matched) setSelectedCountry(data.country_code);
          }
        }
      } catch (err) {
        setDetectedIP('Protected SSL Proxy');
        setDetectedGeo('Global Coordinate Node');
      }
    };

    detectLocation();
  }, [externalEventTriggerCount]);

  // Sync Birthday & companion dialogues
  useEffect(() => {
    if (birthdaySimulated) {
      setIsBirthdayToday(true);
      setBuddyMessage('🎂 AMAZING! HAPPY BIRTHDAY CHAMPION! 🎈 All workspace components have erupted into celebration mode. Enjoy your beautiful day!');
      return;
    }

    const today = new Date();
    const isBirthToday = (today.getMonth() + 1) === birthMonth && today.getDate() === birthDay;
    setIsBirthdayToday(isBirthToday);
    
    if (isBirthToday) {
      setBuddyMessage('OMG HAPPY BIRTHDAY! 🎁✨ Celebrate with dynamic festive grid indicators & celebratory particle animations! Let\'s go!');
    } else if (calendarMode === 'study') {
      if (studyPlan) {
        setBuddyMessage(`Stellar! Your custom academic schedule for "${studyPlan.subject}" is beautifully mapped onto the study calendar.`);
      } else {
        setBuddyMessage('Select your subject of interest, customize your planning horizon, and generate a dynamic multi-day roadmap.');
      }
    } else {
      setBuddyMessage('Daily Life Mode active. Perfect for general task lists, wellness metrics, and dynamic regional holiday checking.');
    }
  }, [birthMonth, birthDay, studyPlan, calendarMode, birthdaySimulated]);

  const handleSaveBirthday = (m: number, d: number) => {
    setBirthMonth(m);
    setBirthDay(d);
    localStorage.setItem('study_buddy_birth_month_v3', String(m));
    localStorage.setItem('study_buddy_birth_day_v3', String(d));
    setBirthdaySimulated(false);
    playSuccessSound();
  };

  const handleSimulateBirthday = () => {
    playSuccessSound();
    setBirthdaySimulated(prev => !prev);
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || selectedCalendarDay === null) return;
    playSuccessSound();

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedCalendarDay).padStart(2, '0')}`;
    const newEv: CustomEvent = {
      id: `custom-${Date.now()}`,
      title: newEventTitle.trim(),
      time: newEventTime,
      dateStr,
      category: newEventCategory,
      priority: newEventPriority,
      notes: newEventNotes.trim()
    };

    const updated = [...events, newEv];
    setEvents(updated);
    localStorage.setItem('user_calendar_events_v3', JSON.stringify(updated));
    setNewEventTitle('');
    setNewEventNotes('');
  };

  const handleDeleteEvent = (id: string) => {
    playClickSound();
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem('user_calendar_events_v3', JSON.stringify(updated));
  };

  const handleCreatePlan = () => {
    playWarpSound();
    const activeSubject = customSubject.trim() || selectedSubject;
    const notesStr = customNotes.trim() || `Automated study layout compiled dynamically. Region code: ${selectedCountry}.`;
    onGeneratePlan(activeSubject, daysCount, notesStr);
  };

  const handleIncrementWater = () => {
    playClickSound();
    const val = wellnessWaterCups + 1;
    setWellnessWaterCups(val);
    localStorage.setItem('user_wellness_water_cups', String(val));
  };

  const handleResetWater = () => {
    playClickSound();
    setWellnessWaterCups(0);
    localStorage.setItem('user_wellness_water_cups', '0');
  };

  // Calendar parameters
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    playClickSound();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedCalendarDay(null);
  };

  const handleNextMonth = () => {
    playClickSound();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedCalendarDay(null);
  };

  // Resolve combined items for cell grids
  const getCompiledEventsForDate = (year: number, month: number, day: number) => {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const result: CustomEvent[] = [];

    // 1. Add custom events
    const matchedUserEvents = events.filter(e => e.dateStr === dStr);
    result.push(...matchedUserEvents);

    // 2. Add dynamic public regional API holidays
    if (apiConnectionStatus === 'online' && fetchedHolidays.length > 0) {
      const filteredApiHolidays = fetchedHolidays.filter(h => h.date === dStr);
      filteredApiHolidays.forEach((h, i) => {
        result.push({
          id: `api-holiday-${h.date}-${i}`,
          title: `🌍 ${h.localName || h.name}`,
          time: 'All Day',
          dateStr: dStr,
          category: h.types?.includes('OfficialHoliday') ? 'holiday' : 'festival',
          priority: 'medium',
          notes: `Public regional holiday fetched dynamically from live Nager.Date API.`
        });
      });
    } else {
      // Graceful fallback to localized static predefined holidays
      const fallbackList = PREDEFINED_FALLBACK_HOLIDAYS[selectedCountry] || [];
      const matchedFallbacks = fallbackList.filter(f => f.month === month && f.day === day);
      matchedFallbacks.forEach((f, idx) => {
        result.push({
          id: `fallback-holiday-${month}-${day}-${idx}`,
          title: f.title,
          time: 'All Day',
          dateStr: dStr,
          category: f.category,
          priority: 'medium',
          notes: `Official offline backup event for ${selectedCountry}.`
        });
      });
    }

    // 3. Add study plan entries IF Study Prep Mode is active! (CRITICAL REQUIREMENT: "remove study thing if person selecte daily life")
    if (calendarMode === 'study' && studyPlan && studyPlan.schedule) {
      const today = new Date();
      for (let idx = 0; idx < studyPlan.schedule.length; idx++) {
        const d = new Date(today);
        d.setDate(today.getDate() + idx);
        const dStrCell = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (dStrCell === dStr) {
          result.push({
            id: `study-plan-${idx}`,
            title: `📚 Day ${studyPlan.schedule[idx].day}: ${studyPlan.schedule[idx].topic}`,
            time: '09:00',
            dateStr: dStr,
            category: 'study',
            priority: 'high',
            notes: studyPlan.schedule[idx].description
          });
        }
      }
    }

    // 4. Add User Birthday
    if (birthMonth === month && birthDay === day) {
      result.push({
        id: 'birthday-celebration-milestone',
        title: '🎂 Your Grand Birthday Celebration! 🎇',
        time: 'All Day',
        dateStr: dStr,
        category: 'birthday',
        priority: 'high',
        notes: 'Happy Birthday! Take an awesome time off to pamper yourself.'
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      return result.filter(ev => 
        ev.title.toLowerCase().includes(q) || 
        ev.category.toLowerCase().includes(q) ||
        (ev.notes && ev.notes.toLowerCase().includes(q))
      );
    }

    return result;
  };

  const selectedDateStr = selectedCalendarDay 
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedCalendarDay).padStart(2, '0')}`
    : '';

  const activeDayCompiledEvents = selectedCalendarDay 
    ? getCompiledEventsForDate(currentYear, currentMonth + 1, selectedCalendarDay)
    : [];

  const formattedClock = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const formattedSystemDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div id="plan-calendar-root" className="space-y-6 select-none relative">
      
      {/* Decorative Floating Celebrations for Birthdays */}
      {isBirthdayToday && (
        <>
          <ConfettiEffect active={isBirthdayToday} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <div className="absolute top-10 left-[8%] animate-balloon-1 text-3xl">🎈</div>
            <div className="absolute top-24 left-[38%] animate-balloon-2 text-4xl">🎈</div>
            <div className="absolute top-6 left-[82%] animate-balloon-3 text-3xl">🎂</div>
            <div className="absolute top-48 left-[22%] animate-balloon-2 text-2xl">✨</div>
            <div className="absolute top-36 left-[72%] animate-balloon-1 text-3xl">🎉</div>
            <div className="absolute top-14 left-[55%] animate-balloon-3 text-4xl">🥳</div>
          </div>
        </>
      )}

      {/* Embedded Animations */}
      <style>{`
        @keyframes float-balloon {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-balloon-1 { animation: float-balloon 7s infinite linear; }
        .animate-balloon-2 { animation: float-balloon 10s infinite linear; animation-delay: 1.5s; }
        .animate-balloon-3 { animation: float-balloon 13s infinite linear; animation-delay: 3s; }
      `}</style>

      {/* TOP COMMAND NODE (Streamlined & Elegant) */}
      <div className="bg-gradient-to-r from-indigo-950/20 via-[#0d1527] to-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              Universal Plan Calendar
            </div>
            
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-white flex flex-wrap items-center gap-2">
              <span>Dynamic Workspace Calendar</span>
              {isBirthdayToday && (
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-sans text-[10px] font-black uppercase px-2.5 py-1 rounded-full animate-bounce flex items-center gap-1 shadow-lg animate-pulse">
                  <Cake className="w-3.5 h-3.5 text-slate-950" />
                  Happy Birthday! 🎉
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-light">
              Add custom reminders, celebrate regional festivals, and synchronize goals in one unified view.
            </p>
          </div>

          {/* Streamlined Live Clock & Region Selector */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Minimal Clock */}
            <div className="bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center font-mono min-w-[120px] shadow-lg">
              <span className="text-base font-black text-indigo-400 tracking-wider">{formattedClock}</span>
              <span className="text-[8.5px] text-slate-400 font-sans tracking-wide mt-0.5">{formattedSystemDate}</span>
            </div>

            {/* Quick Country Context Pill */}
            <div className="bg-slate-950 border border-slate-850 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs text-slate-300 shadow-lg font-mono">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Region:</span>
              <span className="text-indigo-300 font-bold flex items-center gap-1">
                <span>{COUNTRY_OPTIONS.find(c => c.code === selectedCountry)?.flag}</span>
                <span>{selectedCountry}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE CONTROL COLUMNS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPANION SIDEBAR */}
        <div className="xl:col-span-4 space-y-6 order-2 xl:order-1">
          
          {/* THE MODE SELECTOR SWAPPER */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              🎯 Select Dashboard Mode
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-850">
              <button
                onClick={() => {
                  playClickSound();
                  setCalendarMode('general');
                }}
                className={`py-3 rounded-xl text-xs font-bold font-sans transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  calendarMode === 'general'
                    ? 'bg-slate-850 text-white border border-slate-750 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>Daily Life</span>
              </button>
              
              <button
                onClick={() => {
                  playClickSound();
                  setCalendarMode('study');
                }}
                className={`py-3 rounded-xl text-xs font-bold font-sans transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  calendarMode === 'study'
                    ? 'bg-indigo-600/20 border border-indigo-500/35 text-indigo-300 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Study Prep</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC SIDEBAR SECTION: Show wellness / general planner if DAILY LIFE is active; Show study presets if STUDY PREP is active */}
          <AnimatePresence mode="wait">
            {calendarMode === 'general' ? (
              
              /* DAILY LIFE WELLNESS & GOAL MODULE (No study inputs visible!) */
              <motion.div
                key="general-sidebar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0d1527] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl"
              >
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <SmilePlus className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                    Daily Wellness & Mindset
                  </h3>
                </div>

                {/* Mood Selector */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-mono font-bold uppercase text-slate-400 block">
                    How are you feeling today?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'energetic', label: '⚡ Energetic', border: 'border-yellow-500/35 text-yellow-400' },
                      { key: 'calm', label: '🍃 Calm & Zen', border: 'border-emerald-500/35 text-emerald-400' },
                      { key: 'thoughtful', label: '🧠 Thoughtful', border: 'border-indigo-500/35 text-indigo-400' },
                      { key: 'tired', label: '☕ Needs Recharge', border: 'border-rose-500/35 text-rose-400' }
                    ].map((mood) => (
                      <button
                        key={mood.key}
                        onClick={() => {
                          playClickSound();
                          setDailyMood(mood.key as any);
                          if (mood.key === 'tired') {
                            setBuddyMessage("You are doing an incredible job. Rest and pacing yourself are crucial parts of winning! Take a slow, deep breath, or click the Comfort and Recharge buttons below to relax.");
                          } else {
                            setBuddyMessage(`Awesome! Mindset calibrated to ${mood.key}. Keep pacing yourself!`);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-[10.5px] font-semibold border text-center transition cursor-pointer ${
                          dailyMood === mood.key
                            ? `bg-slate-950 font-bold ${mood.border} ring-1 ring-white/10`
                            : 'bg-slate-950/40 border-slate-850/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Recharge & Comfort Mode for Tired Users */}
                {dailyMood === 'tired' && (
                  <div className="bg-gradient-to-tr from-rose-950/20 via-[#1b101c] to-slate-900 border border-rose-500/20 p-4 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌸</span>
                      <div>
                        <h4 className="text-[11px] font-mono font-black text-rose-300 uppercase tracking-wide">
                          Instant Comfort & Recharge
                        </h4>
                        <p className="text-[9.5px] text-slate-400 font-light font-sans">
                          Feeling exhausted? Let's take a peaceful breather.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          playWarpSound();
                          setBuddyMessage("Take a slow, deep breath in... hold it... now let it all go. You are doing an incredible job. Rest is a crucial part of winning! Take 5 minutes away from the screen, grab a warm drink, and stretch. I'll be right here waiting for you!");
                          speakText?.("Breathe in deeply, hold it, and release. You are doing an incredible job. Rest is a crucial part of winning. Take 5 minutes away from the screen, grab a warm drink, and stretch. I will be right here waiting for you!", true, undefined, "Warm Cosmic Guide");
                        }}
                        className="py-2 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 rounded-xl text-[9.5px] font-bold font-mono tracking-wider transition cursor-pointer text-center flex items-center justify-center gap-1.5 hover:scale-102"
                      >
                        <span>🌸 Cosmic Hug</span>
                      </button>

                      <button
                        onClick={() => {
                          playClickSound();
                          const relaxationTips = [
                            "🌸 Close your eyes and roll your shoulders backwards 5 times. Feel the tension drop.",
                            "🍵 Go sip half a glass of warm water or brew a soothing cup of tea.",
                            "🚶 Stand up, stretch your arms high above your head, and look away from all screens.",
                            "🌌 Dim your screen brightness and take 3 deep slow belly breaths right now.",
                            "🎵 Toggle Voice mode on/off to let the system speak instructions so you can rest your eyes."
                          ];
                          const randomTip = relaxationTips[Math.floor(Math.random() * relaxationTips.length)];
                          setBuddyMessage(randomTip);
                          speakText?.(randomTip.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, ''), true, undefined, "Relaxation Coach");
                        }}
                        className="py-2 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 rounded-xl text-[9.5px] font-bold font-mono tracking-wider transition cursor-pointer text-center flex items-center justify-center gap-1.5 hover:scale-102"
                      >
                        <span>🍵 Relaxation Tip</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Goal parameters */}
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono font-bold uppercase text-slate-400 block">
                    Daily Life High Priority Focus
                  </label>
                  <input
                    type="text"
                    value={dailyWellnessGoal}
                    onChange={(e) => setDailyWellnessGoal(e.target.value)}
                    placeholder="e.g., Hit gym, finish task, read book"
                    className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 transition font-medium"
                  />
                </div>

                {/* Micro Water Tracker */}
                <div className="space-y-3 bg-slate-950/80 border border-slate-850/80 p-4 rounded-2xl shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-cyan-400" />
                      Hydration Intake
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {wellnessWaterCups} / 8 Cups
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min((wellnessWaterCups / 8) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleIncrementWater}
                      className="py-1.5 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      + Drink Cup
                    </button>
                    <button
                      onClick={handleResetWater}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Country selector */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-mono font-bold uppercase text-slate-400 block">
                    Select Your Region For Festivals
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      playClickSound();
                      setSelectedCountry(e.target.value);
                      setBuddyMessage(`Switched region to ${e.target.value}. Fetching live public holidays!`);
                    }}
                    className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-500 font-semibold"
                  >
                    {COUNTRY_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.flag} {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

              </motion.div>
            ) : (
              
              /* STUDY PREP ADAPTIVE PLANNER (Only visible in study mode!) */
              <motion.div
                key="study-sidebar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0d1527] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                    Syllabus Parameter Matrix
                  </h3>
                </div>

                {/* Curated Subjects */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                    Select Syllabus Preset
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1">
                    {curatedSubjects.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          playClickSound();
                          setSelectedSubject(sub);
                          setCustomSubject('');
                        }}
                        className={`text-[9.5px] font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                          selectedSubject === sub && !customSubject
                            ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-350 text-indigo-300'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom subject */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                    Or Enter Target Course/Subject:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced Microelectronics, Organic chemistry"
                    value={customSubject}
                    onChange={(e) => {
                      setCustomSubject(e.target.value);
                      setSelectedSubject('');
                    }}
                    className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 transition font-medium"
                  />
                </div>

                {/* Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-slate-400">
                    <span>Active Horizon</span>
                    <span className="text-indigo-455 text-indigo-400 font-bold">{daysCount} Days</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={7}
                    value={daysCount}
                    onChange={(e) => {
                      playClickSound();
                      setDaysCount(Number(e.target.value));
                    }}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                    Custom Syllabus Directives
                  </label>
                  <textarea
                    placeholder="Enter textbooks, test dates or parameters..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={2}
                    className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 transition font-sans resize-none"
                  />
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-mono font-bold uppercase text-slate-400 block">
                    Country Context (Holidays/Festivals)
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      playClickSound();
                      setSelectedCountry(e.target.value);
                    }}
                    className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 font-semibold"
                  >
                    {COUNTRY_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.flag} {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={isGeneratingPlan || (!customSubject && !selectedSubject)}
                  onClick={handleCreatePlan}
                  className={`w-full py-3 rounded-xl font-bold font-display text-xs transition duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                    isGeneratingPlan
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10'
                  }`}
                >
                  {isGeneratingPlan ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mapping Schedule...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
                      🔮 Generate Study Plan Grid
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CHAT BUDDY & COMPANION + BIRTHDAY SIMULATION BUTTON */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-5 shadow-2xl">
            <div className="relative">
              {isBirthdayToday && <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-10 text-3xl animate-bounce">👑</div>}
              
              <div className={`w-28 h-28 rounded-3xl flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                isBirthdayToday 
                  ? 'border-2 border-fuchsia-500 bg-slate-950 animate-dance shadow-[0_0_30px_rgba(217,70,239,0.3)] scale-110' 
                  : 'border border-slate-800 bg-slate-950'
              }`}>
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  {isBirthdayToday && (
                    <g transform="translate(0, -5)">
                      <path d="M40,24 L50,4 L60,24 Z" fill="#ec4899" stroke="#db2777" strokeWidth="1.5" />
                      <circle cx="50" cy="4" r="3" fill="#fbbf24" className="animate-pulse" />
                    </g>
                  )}

                  <g className={isBirthdayToday ? 'animate-bounce' : ''} style={{ animationDuration: '0.6s' }}>
                    <rect x="14" y="42" width="6" height="18" rx="3" fill="#6366f1" />
                    <rect x="80" y="42" width="6" height="18" rx="3" fill="#6366f1" />
                  </g>

                  <rect x="25" y="30" width="50" height="42" rx="12" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="2" />
                  <rect x="32" y="36" width="36" height="26" rx="6" fill="#020617" stroke="#4338ca" strokeWidth="1.5" />
                  
                  {isBirthdayToday ? (
                    <g stroke="#ec4899" strokeWidth="2.5" fill="none">
                      <path d="M37,47 Q41,43 45,47" />
                      <path d="M55,47 Q59,43 63,47" />
                      <path d="M44,56 Q50,62 56,56" stroke="#fbbf24" />
                    </g>
                  ) : (
                    <g fill="#10b981">
                      <circle cx="41" cy="46" r="2.5" className="animate-pulse" />
                      <circle cx="59" cy="46" r="2.5" className="animate-pulse" />
                      <path d="M44,55 Q50,59 56,55" stroke="#6366f1" strokeWidth="2" fill="none" />
                    </g>
                  )}

                  <rect x="36" y="72" width="8" height="14" rx="3" fill="#6366f1" />
                  <rect x="56" y="72" width="8" height="14" rx="3" fill="#6366f1" />
                </svg>
              </div>
            </div>

            <div className="space-y-1.5 w-full">
              <span className="block text-xs font-mono font-bold text-indigo-400">
                🤖 COMPANION (COSMIC CAPY)
              </span>
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed font-sans relative min-h-[64px] shadow-inner text-left">
                <div className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-slate-950 border-t border-l border-slate-850 rotate-45" />
                {buddyMessage}
              </div>
            </div>

            {/* Set Birthday Calendar Event */}
            <div id="birthday-celebration-card" className={`w-full rounded-2xl p-4 border space-y-3 shadow-xl text-left transition-all duration-300 relative ${
              isTourActive && tourStep === 8 
                ? 'border-fuchsia-400 ring-4 ring-fuchsia-500/50 scale-102 z-50 animate-pulse bg-fuchsia-950/40 shadow-[0_0_35px_rgba(244,63,94,0.45)]' 
                : 'bg-slate-950 border-slate-850'
            }`}>
              {isTourActive && tourStep === 8 && (
                <div className="absolute -top-3.5 right-4 bg-fuchsia-500 text-slate-950 font-mono font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider animate-bounce whitespace-nowrap z-50 shadow-md">
                  👉 Focus Target: Click Birthday for Balloons!
                </div>
              )}
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                <Gift className="w-4 h-4 text-fuchsia-400" />
                Set Your Birthday Anniversary:
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Month</span>
                  <select
                    value={birthMonth}
                    onChange={(e) => handleSaveBirthday(parseInt(e.target.value), birthDay)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Day</span>
                  <select
                    value={birthDay}
                    onChange={(e) => handleSaveBirthday(birthMonth, parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DEMO CELEBRATION OVERRIDE BUTTON */}
              <button
                type="button"
                onClick={handleSimulateBirthday}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  birthdaySimulated
                    ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30 ring-1 ring-fuchsia-400'
                    : 'bg-slate-900 hover:bg-slate-850 text-fuchsia-400 border border-fuchsia-500/20'
                }`}
              >
                <PartyPopper className={`w-3.5 h-3.5 ${birthdaySimulated ? 'animate-bounce' : ''}`} />
                <span>{birthdaySimulated ? '🎂 Birthday Activated! Click to Exit' : '💡 Demo: It\'s my Birthday!'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT GRAND INTERACTIVE CALENDAR WORKSPACE */}
        <div className="xl:col-span-8 space-y-6 order-1 xl:order-2">
          
          {/* CALENDAR MONTH GRID */}
          <div id="calendar-month-grid" className={`border rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 transition-all duration-300 relative ${
            isTourActive && tourStep === 9 
              ? 'border-indigo-400 ring-4 ring-indigo-500/50 scale-101 z-50 animate-pulse bg-indigo-950/40 shadow-[0_0_55px_rgba(99,102,241,0.45)]' 
              : 'bg-[#0d1527] border-slate-800'
          }`}>
            {isTourActive && tourStep === 9 && (
              <div className="absolute -top-3.5 left-6 bg-indigo-500 text-white font-mono font-black text-[8px] px-2 py-1 rounded-full uppercase tracking-wider animate-bounce whitespace-nowrap z-50 shadow-md">
                ⚡ Focus Target: Live Calendar Event Addition Added Below!
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3 sm:pb-5">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-400">
                  <CalendarIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide uppercase flex items-center gap-2">
                    <span>{months[currentMonth]} {currentYear}</span>
                    <span className="text-[10px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded-full">
                      {calendarMode === 'study' ? '🎓 Study Prep Grid' : '📅 Daily Life Grid'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {calendarMode === 'study' 
                      ? 'Study roadmaps and exams are integrated here.' 
                      : 'Personal reminders, cultural festivals & general events.'}
                  </p>
                </div>
              </div>

              {/* Navigation & API Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-100 transition cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2">NAV</span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-100 transition cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Quick Filters Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search events, holidays, or study tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">Quick Filters:</span>
                {(calendarMode === 'study' 
                  ? ['study', 'exam', 'personal', 'holiday'] 
                  : ['personal', 'holiday', 'festival', 'task']
                ).map((tag) => {
                  const isActive = searchQuery.toLowerCase().trim() === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(isActive ? '' : tag)}
                      className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg border transition-all uppercase tracking-wider cursor-pointer ${
                        isActive
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Event Alarm / Notification System */}
            {upcomingReminders.length > 0 && (
              <div className="bg-gradient-to-r from-rose-950/50 via-[#180f1e] to-slate-950 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse shadow-lg shadow-rose-950/20">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500/15 p-2.5 rounded-xl border border-rose-500/30 text-rose-400 shrink-0">
                    <Bell className="w-5 h-5 text-rose-400 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>Upcoming Reminder Alarm</span>
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" />
                    </h4>
                    <div className="space-y-1">
                      {upcomingReminders.map(rem => {
                        const [y, m, d] = rem.dateStr.split('-').map(Number);
                        const [h, min] = rem.time.split(':').map(Number);
                        const remDate = new Date(y, m - 1, d, h, min, 0);
                        const diffMins = Math.max(0, Math.round((remDate.getTime() - new Date().getTime()) / 60000));
                        return (
                          <div key={rem.id} className="text-xs text-slate-300">
                            🔔 <span className="font-bold text-slate-100 font-mono">"{rem.title}"</span> is starting in <span className="text-rose-400 font-black font-mono">{diffMins} mins</span> (at <span className="font-mono text-slate-200">{rem.time}</span>)
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      playClickSound();
                      setDismissedReminders(prev => [...prev, ...upcomingReminders.map(r => r.id)]);
                    }}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[10px] font-mono font-bold uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Dismiss Alert
                  </button>
                </div>
              </div>
            )}

            {/* Weekday Labels with High Contrast Sunday Highlight */}
            <div 
              className="grid gap-1 sm:gap-2.5 text-center text-[10px] md:text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-900/40"
              style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
            >
              <span className="hidden sm:inline text-rose-400 font-black">Sun</span><span className="inline sm:hidden text-rose-400 font-black">S</span>
              <span className="hidden sm:inline">Mon</span><span className="inline sm:hidden">M</span>
              <span className="hidden sm:inline">Tue</span><span className="inline sm:hidden">T</span>
              <span className="hidden sm:inline">Wed</span><span className="inline sm:hidden">W</span>
              <span className="hidden sm:inline">Thu</span><span className="inline sm:hidden">T</span>
              <span className="hidden sm:inline">Fri</span><span className="inline sm:hidden">F</span>
              <span className="hidden sm:inline">Sat</span><span className="inline sm:hidden">S</span>
            </div>

            {/* GRID CELLS */}
            <div 
              className="grid gap-1 sm:gap-2.5 justify-items-stretch"
              style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
            >
              {Array.from({ length: firstDayIndex }).map((_, index) => (
                <div 
                   key={`empty-${index}`} 
                  className="rounded-xl border border-slate-900/40 opacity-20 bg-slate-950/20 aspect-square w-full min-w-0"
                />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNum = index + 1;
                const isSelected = selectedCalendarDay === dayNum;
                const dateOfToday = new Date();
                const isToday = dateOfToday.getFullYear() === currentYear && 
                                dateOfToday.getMonth() === currentMonth && 
                                dateOfToday.getDate() === dayNum;

                const compiledCellEvents = getCompiledEventsForDate(currentYear, currentMonth + 1, dayNum);
                const isBirthCell = birthMonth === (currentMonth + 1) && birthDay === dayNum;
                const isSunday = (firstDayIndex + index) % 7 === 0;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => {
                      playClickSound();
                      setSelectedCalendarDay(dayNum);
                      
                      // Synthesize the day's events aloud as requested
                      const eventsForDay = getCompiledEventsForDate(currentYear, currentMonth + 1, dayNum);
                      let spokenDescription = `Selected Day ${dayNum} of ${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })}. `;
                      if (birthMonth === (currentMonth + 1) && birthDay === dayNum) {
                        spokenDescription += "Omg Happy Birthday! All workstation components have erupted into celebration mode. Celebrate with dynamic festive grid indicators & celebratory particle animations!";
                      } else if (eventsForDay.length > 0) {
                        spokenDescription += `You have ${eventsForDay.length} events scheduled: ` + eventsForDay.map(ev => `${ev.title} scheduled at ${ev.time}`).join(". ");
                      } else {
                        spokenDescription += "No study events scheduled for this day. Enjoy a well-deserved rest, or click the Add Event button to coordinate your calendar.";
                      }
                      speakText?.(spokenDescription, false, undefined, "Calendar Dispatch");
                    }}
                    className={`rounded-xl sm:rounded-2xl border p-1 sm:p-2 flex flex-col justify-between items-stretch transition-all relative text-left group cursor-pointer aspect-square w-full min-w-0 overflow-hidden h-full ${
                      isSelected
                        ? 'bg-[#131d35] border-indigo-500 text-slate-100 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-600/10'
                        : isToday
                          ? 'bg-slate-950 border-emerald-500 text-emerald-400 shadow shadow-emerald-500/10 hover:bg-[#11192d]'
                          : isSunday
                            ? 'bg-rose-950/15 border-rose-950/30 hover:border-rose-900/40 text-slate-400 hover:bg-rose-950/25'
                            : 'bg-[#060c18] border-slate-800 hover:border-slate-750 text-slate-400 hover:bg-[#101729]'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[9px] sm:text-xs font-bold font-mono ${
                        isToday 
                          ? 'bg-emerald-500/20 px-1 py-0.5 rounded text-emerald-400 font-extrabold' 
                          : isSunday 
                            ? 'text-rose-400 font-black' 
                            : 'text-slate-300'
                      }`}>
                        {dayNum}
                      </span>
                      {isBirthCell && <Cake className="w-3 h-3 sm:w-4 sm:h-4 text-fuchsia-400 animate-bounce shrink-0" />}
                    </div>

                    {/* Compact list of color-coded items (Desktop and Tablets) */}
                    <div className="hidden sm:block w-full space-y-1 mt-0.5 overflow-hidden">
                      {compiledCellEvents.slice(0, 2).map((ev, evIdx) => {
                        const styleCfg = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.personal;
                        return (
                          <div 
                            key={`${ev.id}-${evIdx}`}
                            className={`px-1 py-0.5 rounded border text-[8px] sm:text-[9px] font-bold font-mono truncate tracking-tight leading-none whitespace-nowrap overflow-hidden block w-full ${styleCfg.bg} ${styleCfg.text} ${styleCfg.border}`}
                            title={`${styleCfg.label}: ${ev.title}`}
                          >
                            {ev.title}
                          </div>
                        );
                      })}

                      {compiledCellEvents.length > 2 && (
                        <span className="block text-[7px] text-slate-500 font-mono text-right pr-0.5 font-bold leading-none">
                          +{compiledCellEvents.length - 2} More
                        </span>
                      )}
                    </div>

                    {/* Indicator dots for Mobile view only - clean native alignment */}
                    <div className="flex sm:hidden items-center justify-center gap-0.5 mt-auto w-full h-1.5 overflow-hidden">
                      {compiledCellEvents.slice(0, 3).map((ev, evIdx) => {
                        const styleCfg = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.personal;
                        return (
                          <span 
                            key={`${ev.id}-${evIdx}-dot`}
                            className={`w-1 h-1 rounded-full shrink-0 ${styleCfg.dot}`}
                            title={ev.title}
                          />
                        );
                      })}
                    </div>

                    {/* Hover highlights */}
                    <div className="absolute inset-0 border border-indigo-400/0 hover:border-indigo-400/10 rounded-xl sm:rounded-2xl transition pointer-events-none" />
                  </button>
                );
              })}
            </div>

          </div>

          {/* LOWER INTERACTIVE ACTIONS PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Box: Active selected day items list */}
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Focused Cell Details</span>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2 font-mono">
                    <CalendarIcon className="w-4 h-4 text-indigo-400" />
                    {selectedCalendarDay ? `${months[currentMonth]} ${selectedCalendarDay}, ${currentYear}` : 'Select a grid cell'}
                  </h4>
                </div>
                {selectedCalendarDay && (
                  <span className="text-[9px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850 text-indigo-300 font-bold">
                    Day {selectedCalendarDay}
                  </span>
                )}
              </div>

              {selectedCalendarDay ? (
                <div className="space-y-4 min-h-[220px]">
                  
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">
                      Synced Milestones & Events ({activeDayCompiledEvents.length})
                    </span>
                    
                    {activeDayCompiledEvents.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {activeDayCompiledEvents.map((ev, index) => {
                          const styleCfg = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.personal;
                          const isCustom = ev.id.startsWith('custom-') || ev.id.startsWith('sim-event-');
                          return (
                            <div 
                              key={`${ev.id}-${index}`}
                              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs transition ${styleCfg.bg} ${styleCfg.border}`}
                            >
                              <div className="space-y-1 w-full">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`w-2 h-2 rounded-full ${styleCfg.dot}`} />
                                  <span className={`font-mono text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded ${styleCfg.bg} ${styleCfg.text}`}>
                                    {styleCfg.label}
                                  </span>
                                  {ev.time && (
                                    <span className="text-[9.5px] font-mono text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-550" />
                                      {ev.time}
                                    </span>
                                  )}
                                  {ev.priority === 'high' && (
                                    <span className="bg-rose-500/10 text-rose-300 text-[8px] font-bold px-1.5 rounded uppercase font-mono">
                                      CRITICAL
                                    </span>
                                  )}
                                </div>
                                
                                <h5 className="font-bold text-slate-100 font-sans leading-snug">
                                  {ev.title}
                                </h5>

                                {ev.notes && (
                                  <p className="text-[10.5px] text-slate-400 font-light leading-relaxed pt-1 font-sans">
                                    {ev.notes}
                                  </p>
                                )}
                              </div>

                              {isCustom && (
                                <button
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition shrink-0 cursor-pointer"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl text-center space-y-2">
                        <Smile className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 font-medium">No schedules logged for this day cell.</p>
                        <p className="text-[10px] text-slate-500">Perfect day to sit back, meditate, or add a custom task reminder.</p>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border border-slate-850 bg-slate-950/20 rounded-2xl min-h-[220px]">
                  <CalendarIcon className="w-8 h-8 text-slate-700 mb-2 animate-bounce" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No Active Cell Selected</p>
                  <p className="text-[10px] text-slate-500 mt-1">Please select any date square from the big grid view above to review specific schedules.</p>
                </div>
              )}

            </div>

            {/* Right Box: Add Custom Color-Coded Events Form */}
            <div className="bg-[#0d1527] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  Add Color-Coded Milestone
                </h4>
              </div>

              {selectedCalendarDay ? (
                <div className="space-y-3.5 text-left">
                  
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                      Milestone / Task Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Final Exam submission, Gym Session, Doctor visit"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Category Color Coding Select */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                      Custom Category Color Code
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(CATEGORY_COLORS).map(([catKey, details]) => {
                        // Keep 'study' and 'exam' options hidden in daily life mode to prevent clutter (Strict scope!)
                        if (calendarMode === 'general' && (catKey === 'study' || catKey === 'exam')) return null;
                        
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setNewEventCategory(catKey as any);
                            }}
                            className={`p-2 rounded-xl text-[10px] font-bold border text-left transition flex items-center gap-2 cursor-pointer ${
                              newEventCategory === catKey
                                ? `bg-slate-950 ${details.border} ${details.text} font-black shadow-md`
                                : 'bg-slate-950/40 border-slate-850 text-slate-450 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${details.dot}`} />
                            <span>{details.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time & Priority */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                        Milestone Time
                      </label>
                      <input
                        type="time"
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded-xl p-2 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                        Priority Level
                      </label>
                      <select
                        value={newEventPriority}
                        onChange={(e) => setNewEventPriority(e.target.value as any)}
                        className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl p-2 outline-none focus:border-indigo-500 font-semibold"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                      Extra Notes / Parameters (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Study chapters 4-5, Bring notebook..."
                      value={newEventNotes}
                      onChange={(e) => setNewEventNotes(e.target.value)}
                      className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 font-light"
                    />
                  </div>

                  <button
                    disabled={!newEventTitle.trim()}
                    onClick={handleAddEvent}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-white font-sans text-xs font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:from-slate-800 disabled:to-slate-800 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pin Milestone to Day {selectedCalendarDay}</span>
                  </button>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border border-slate-850 bg-slate-950/20 rounded-2xl min-h-[220px]">
                  <HelpCircle className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Form Disabled</p>
                  <p className="text-[10px] text-slate-500 mt-1">Select a cell from the calendar grid to unlock the custom milestone form.</p>
                </div>
              )}

            </div>

          </div>

          {/* DYNAMIC LISTING OF UPCOMING NATIONAL HOLIDAYS FETCHED BY API */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                  Upcoming Festivals & Holidays: {COUNTRY_OPTIONS.find(c => c.code === selectedCountry)?.name}
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded text-indigo-300 font-bold">
                API Live Synced
              </span>
            </div>

            {isFetchingHolidays ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span>Querying public calendar database...</span>
              </div>
            ) : apiConnectionStatus === 'online' && fetchedHolidays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                {fetchedHolidays.slice(0, 12).map((h, i) => {
                  const dObj = new Date(h.date);
                  const formattedD = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col justify-between space-y-1.5 hover:border-slate-750 transition">
                      <div className="space-y-0.5">
                        <span className="text-[8.5px] font-mono text-emerald-400 uppercase font-bold tracking-wide">
                          {h.types?.[0] || 'Official Holiday'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 truncate" title={h.localName || h.name}>
                          {h.localName || h.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-650" />
                        {formattedD}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback list */
              <div className="space-y-3">
                <p className="text-[10.5px] text-slate-400 italic">
                  Offline fallback list active. Here are the curated festivals of the season:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(PREDEFINED_FALLBACK_HOLIDAYS[selectedCountry] || PREDEFINED_FALLBACK_HOLIDAYS.IN).map((f, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                      <div className="space-y-0.5">
                        <span className="text-[8.5px] font-mono text-amber-400 uppercase font-bold">
                          {f.category.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">
                          {f.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Month {f.month}, Day {f.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
