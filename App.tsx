import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Inbox, Layout, User, Rocket, ShieldAlert, AlertTriangle, Trash2, Wrench, Menu, PlusCircle, Command, ShieldCheck, Loader2, ChevronRight, X, Check } from 'lucide-react';
import { SidebarNavigation } from './components/SidebarNavigation';
import { SessionList } from './components/SessionList';
import { ChatInterface } from './components/ChatInterface';
import { SettingsView } from './components/SettingsView';
import { AgentsView } from './components/AgentsView';
import { WhatsNewModal } from './components/WhatsNewModal';
import { TourOverlay } from './components/TourOverlay';
import { 
    Session, 
    Message, 
    SessionStatus, 
    Label, 
    UserSettings, 
    Agent, 
    Attachment, 
    OPENROUTER_FREE_MODELS, 
    GEMINI_MODELS, 
    DEEPSEEK_MODELS, 
    MOONSHOT_MODELS, 
    SessionMode,
    Task
} from './types';
import { sendMessageToGemini, generateSessionTitle } from './services/geminiService';

const DEFAULT_LABELS: Label[] = [
    { id: '1', name: 'Design', color: '#A1A1A1' },
    { id: '2', name: 'Research', color: '#737373' },
    { id: '3', name: 'Priority', color: '#F5F5F5' },
];

const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    accentColor: '#F5F5F5',
    workspaceName: 'My Workspace',
    visibleModels: [...GEMINI_MODELS],
    userName: 'User',
    timezone: 'UTC',
    language: 'English',
    city: 'San Francisco',
    country: 'USA',
    baseKnowledge: '',
    sendKey: 'Enter',
    onboardingComplete: false,
    enableTasks: true,
    apiKeys: {
        openRouter: '',
        openRouterAlt: '',
        deepSeek: '',
        moonshot: ''
    }
};

const getSystemInstruction = (userName: string, mode: SessionMode) => `
IDENTITY:
You are a high-performance assistant.
CURRENT MODE: ${mode.toUpperCase()}

STRICT CONVERSATION RULES:
1. NO SIGN-OFFS. Just answer the question.
2. NO META-TALK. Don't explain your thoughts in brackets.
3. BE DIRECT. Get straight to the point.
4. BE PERSONAL. Use the user's name (${userName}) naturally.
5. FORMATTING. ${mode === 'explore' ? 'Answer directly without a formal plan.' : 'Start your response with a quick list of what you are going to do using hyphens (-).'}

${mode === 'execute' ? `
EXECUTE MODE (PLANNING):
Briefly list the steps you will take.
Example:
- Look at the request.
- Prepare the answer.
[Your answer here]
` : ''}

CAPABILITIES:
- [[TITLE: New Title]] - Change the chat name.
- [[STATUS: backlog | todo | needs_review | done | cancelled | archive]] - Change chat status.
- [[LABEL: Label Name]] - Add a tag.
- [[ADD_TASK: Task description]] - Add a subtask.
- [[DONE_TASK: Task description]] - Finish a task.
- [[REMOVE_TASK: Task description]] - Delete a task.
`;

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
          const parsed = JSON.parse(stickyValue);
          if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
              return { ...defaultValue, ...parsed };
          }
          return parsed;
      }
      return defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            console.error("Storage limit reached. Older history might not be saved.");
        }
    }
  }, [key, value]);

  return [value, setValue];
}

const OnboardingModal: React.FC<{ onComplete: (name: string, workspace: string) => void }> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [workspace, setWorkspace] = useState('');

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0D0D0D] p-6 font-inter select-none overflow-hidden">
            <button className="fixed top-6 right-6 p-2 text-white/20 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>

            <div className="w-full max-w-lg text-center mb-12">
                <h2 className="text-[28px] font-semibold text-white mb-3 tracking-tight">Set up your Workspace</h2>
                <p className="text-[15px] text-[#A1A1A1] leading-relaxed">
                    Select how you'd like to power your AI agents.<br />
                    You can add more connections later.
                </p>
            </div>

            <div className="w-full max-w-lg space-y-4 mb-16">
                {/* Name Input Card */}
                <div 
                    className={`relative group p-6 bg-[#1A1A1A]/30 border rounded-[28px] transition-all duration-300 flex items-center gap-5 cursor-text border-white/5 hover:border-white/10 ${name.trim() ? 'border-white/20 bg-[#1A1A1A]/50 ring-1 ring-white/5' : ''}`}
                    onClick={() => document.getElementById('onboarding-name')?.focus()}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${name.trim() ? 'bg-white/10 text-white border-white/10' : 'bg-white/5 text-[#444] border-white/5'}`}>
                        <User className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="text-[12px] font-bold text-white/40 uppercase tracking-[0.05em] mb-1">Your Name</label>
                        <input 
                            id="onboarding-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Type your name here..."
                            className="bg-transparent border-none p-0 focus:ring-0 text-[16px] text-white placeholder-white/20 w-full outline-none font-medium transition-all"
                        />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${name.trim() ? 'bg-white border-white text-black scale-110' : 'border-[#262626]'}`}>
                        {name.trim() && <Check className="w-3.5 h-3.5" strokeWidth={4} />}
                    </div>
                </div>

                {/* Workspace Input Card */}
                <div 
                    className={`relative group p-6 bg-[#1A1A1A]/30 border rounded-[28px] transition-all duration-300 flex items-center gap-5 cursor-text border-white/5 hover:border-white/10 ${workspace.trim() ? 'border-white/20 bg-[#1A1A1A]/50 ring-1 ring-white/5' : ''}`}
                    onClick={() => document.getElementById('onboarding-workspace')?.focus()}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${workspace.trim() ? 'bg-white/10 text-white border-white/10' : 'bg-white/5 text-[#444] border-white/5'}`}>
                        <Layout className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="text-[12px] font-bold text-white/40 uppercase tracking-[0.05em] mb-1">Workspace Name</label>
                        <input 
                            id="onboarding-workspace"
                            value={workspace}
                            onChange={e => setWorkspace(e.target.value)}
                            placeholder="Name your workspace..."
                            className="bg-transparent border-none p-0 focus:ring-0 text-[16px] text-white placeholder-white/20 w-full outline-none font-medium transition-all"
                        />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${workspace.trim() ? 'bg-white border-white text-black scale-110' : 'border-[#262626]'}`}>
                        {workspace.trim() && <Check className="w-3.5 h-3.5" strokeWidth={4} />}
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-center w-full max-w-lg">
                <button 
                    onClick={() => name && workspace && onComplete(name, workspace)}
                    disabled={!name || !workspace}
                    className="w-full py-4 px-6 bg-[#1A1A1A] border border-white/10 rounded-2xl text-[14px] font-bold text-white hover:bg-[#222222] hover:border-white/20 transition-all active:scale-[0.98] disabled:opacity-10 disabled:cursor-not-allowed shadow-xl"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ title: string, description: string, onConfirm: () => void, onCancel: () => void }> = ({ title, description, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-[360px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <Trash2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black tracking-tight text-white">Delete Permanently?</h3>
                    <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest">Careful</p>
                </div>
            </div>
            <p className="text-[13px] text-[var(--text-muted)] font-medium mb-10 leading-relaxed">
                This will remove "{title}" forever. You can't undo this.
            </p>
            <div className="flex flex-col gap-2">
                <button 
                    onClick={onConfirm}
                    className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all active:scale-[0.98] shadow-lg shadow-red-600/10"
                >
                    Delete Now
                </button>
                <button 
                    onClick={onCancel}
                    className="w-full py-4 bg-[var(--bg-elevated)] text-[var(--text-muted)] font-bold rounded-2xl hover:text-[var(--text-main)] transition-colors"
                >
                    Keep It
                </button>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'agents' | 'settings'>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileSessionListOpen, setIsMobileSessionListOpen] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(0);
  
  const [logoClicks, setLogoClicks] = useState(0);
  const [isLogoGlowing, setIsLogoGlowing] = useState(false);

  const [settings, setSettings] = useStickyState<UserSettings>(DEFAULT_SETTINGS, 'shuper_settings');
  const [availableLabels, setAvailableLabels] = useStickyState<Label[]>(DEFAULT_LABELS, 'shuper_labels');
  const [agents, setAgents] = useStickyState<Agent[]>([], 'shuper_agents');
  const [sessions, setSessions] = useStickyState<Session[]>([], 'shuper_sessions');
  const [sessionMessages, setSessionMessages] = useStickyState<Record<string, Message[]>>({}, 'shuper_messages');
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState<Record<string, boolean>>({});
  const [sessionModels, setSessionModels] = useStickyState<Record<string, string>>({}, 'shuper_session_models');

  const [currentFilter, setCurrentFilter] = useState('all');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'chat' | 'agent', id: string, title: string } | null>(null);
  const abortControllers = useRef<Record<string, AbortController>>({});

  const hasAnyKey = useMemo(() => {
    return !!(process.env.API_KEY || settings.apiKeys.openRouter || settings.apiKeys.openRouterAlt || settings.apiKeys.deepSeek || settings.apiKeys.moonshot);
  }, [settings.apiKeys]);

  useEffect(() => {
    if (currentView === 'chat' && !activeSessionId && Array.isArray(sessions) && sessions.length > 0) {
      handleSelectSession(sessions[0].id);
    }
  }, [sessions, activeSessionId, currentView]);

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleNewSession();
            break;
          case 'p':
            e.preventDefault();
            setCurrentView('settings');
            break;
          case 's':
            e.preventDefault();
            setCurrentView('chat');
            setIsMobileSessionListOpen(true);
            setTriggerSearch(prev => prev + 1);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [sessions, currentView, activeSessionId]);

  useEffect(() => {
      if (settings.onboardingComplete) {
          if (sessions.length === 0 && currentView === 'chat') {
              handleNewSession();
          }
      }
  }, [settings.onboardingComplete]);

  useEffect(() => {
    document.body.className = settings.theme === 'light' ? 'light-mode' : '';
    document.documentElement.style.setProperty('--accent', settings.accentColor);
  }, [settings.theme, settings.accentColor]);

  const filteredSessions = useMemo(() => {
    const sessionArr = Array.isArray(sessions) ? sessions : [];
    
    if (currentFilter.startsWith('status:')) {
        const status = currentFilter.split(':')[1] as SessionStatus;
        return sessionArr.filter(s => s.status === status);
    }
    if (currentFilter.startsWith('label:')) {
        const labelId = currentFilter.split(':')[1];
        return sessionArr.filter(s => s.labelIds.includes(labelId));
    }
    switch (currentFilter) {
        case 'flagged': return sessionArr.filter(s => s.isFlagged);
        case 'archived': return sessionArr.filter(s => s.status === 'archive');
        case 'all': default: return sessionArr.filter(s => s.status !== 'archive');
    }
  }, [sessions, currentFilter]);

  const statusCounts = useMemo(() => {
      const counts: Record<string, number> = { backlog: 0, todo: 0, needs_review: 0, done: 0, cancelled: 0, archive: 0 };
      if (Array.isArray(sessions)) {
          sessions.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
      }
      return counts as Record<SessionStatus, number>;
  }, [sessions]);

  const activeSession = Array.isArray(sessions) ? sessions.find(s => s.id === activeSessionId) : null;
  const activeMessages = activeSessionId ? (sessionMessages[activeSessionId] || []) : [];
  const activeLoading = activeSessionId ? (sessionLoading[activeSessionId] || false) : false;

  const handleLogoClick = () => {
    setLogoClicks(prev => {
        const next = prev + 1;
        if (next >= 10) {
            setIsLogoGlowing(true);
        }
        return next;
    });
  };

  const handleUpdateSettings = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
  }, [setSettings]);

  const handleSelectSession = (id: string) => {
      if (id === activeSessionId) {
          setIsMobileSessionListOpen(false);
          return;
      }
      setActiveSessionId(id);
      setIsMobileSessionListOpen(false);
      setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, hasNewResponse: false } : s) : prev);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(id);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      if (!sessionModels[id] && hasAnyKey) {
        const defaultModel = settings.visibleModels[0] || GEMINI_MODELS[0];
        setSessionModels(prev => ({ ...prev, [id]: defaultModel }));
      }
  };

  const handleBack = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const prevId = history[newIndex];
          setHistoryIndex(newIndex);
          setActiveSessionId(prevId);
          setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === prevId ? { ...s, hasNewResponse: false } : s) : prev);
      }
  };

  const handleForward = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const nextId = history[newIndex];
          setHistoryIndex(newIndex);
          setActiveSessionId(nextId);
          setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === nextId ? { ...s, hasNewResponse: false } : s) : prev);
      }
  };

  const handleNewSession = () => {
      const newSession: Session = {
          id: Date.now().toString(),
          title: 'New Chat',
          subtitle: 'Explore',
          timestamp: 'Just now',
          category: 'TODAY',
          status: 'todo',
          labelIds: [],
          tasks: [],
          hasNewResponse: false,
          isFlagged: false,
          mode: 'explore'
      };
      
      setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);
      setSessionMessages(prev => ({ ...prev, [newSession.id]: [] }));
      
      if (hasAnyKey) {
          const defaultModel = settings.visibleModels[0] || GEMINI_MODELS[0];
          setSessionModels(prev => ({ ...prev, [newSession.id]: defaultModel }));
      }

      handleSelectSession(newSession.id);
      // Ensure we switch to the chat view when a new session is created
      setCurrentView('chat');
  };

  const handleRegenerateTitle = async (sessionId: string) => {
      const messages = sessionMessages[sessionId];
      if (!messages || messages.length === 0) return;
      
      const session = Array.isArray(sessions) ? sessions.find(s => s.id === sessionId) : null;
      if (!session) return;

      const historyData = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));

      const newTitle = await generateSessionTitle(historyData, session.title);
      setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s) : prev);
  };

  const executeAICommands = (text: string, sessionId: string) => {
    const statusMatch = text.match(/\[\[STATUS:\s*(.*?)\]\]/);
    if (statusMatch) {
        const newStatus = statusMatch[1].trim().toLowerCase() as SessionStatus;
        if (['backlog', 'todo', 'needs_review', 'done', 'cancelled', 'archive'].includes(newStatus)) {
            setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s) : prev);
        }
    }

    const titleMatch = text.match(/\[\[TITLE:\s*(.*?)\]\]/);
    if (titleMatch) {
        const newTitle = titleMatch[1].trim();
        if (newTitle) {
            setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s) : prev);
        }
    }

    const labelMatch = text.match(/\[\[LABEL:\s*(.*?)\]\]/);
    if (labelMatch) {
        const labelName = labelMatch[1].trim();
        const existingLabel = availableLabels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
        let lid = existingLabel ? existingLabel.id : null;
        if (!lid) {
            const newLabel = { id: Date.now().toString(), name: labelName, color: '#F5F5F5' };
            setAvailableLabels(prev => [...prev, newLabel]);
            lid = newLabel.id;
        }
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, labelIds: s.labelIds.includes(lid!) ? s.labelIds : [...s.labelIds, lid!] } : s));
    }

    const addTaskMatch = text.match(/\[\[ADD_TASK:\s*(.*?)\]\]/);
    if (addTaskMatch) {
        const taskText = addTaskMatch[1].trim();
        if (taskText) {
            setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, tasks: [...(s.tasks || []), { id: Date.now().toString(), text: taskText, completed: false, createdAt: Date.now() }] } : s)));
        }
    }

    const doneTaskMatch = text.match(/\[\[DONE_TASK:\s*(.*?)\]\]/);
    if (doneTaskMatch) {
        const taskRef = doneTaskMatch[1].trim().toLowerCase();
        setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, tasks: (s.tasks || []).map(t => (t.text.toLowerCase().includes(taskRef) ? { ...t, completed: true } : t)) } : s)));
    }

    const removeTaskMatch = text.match(/\[\[REMOVE_TASK:\s*(.*?)\]\]/);
    if (removeTaskMatch) {
        const taskRef = removeTaskMatch[1].trim().toLowerCase();
        setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, tasks: (s.tasks || []).filter(t => !t.text.toLowerCase().includes(taskRef)) } : s)));
    }

    return text
        .replace(/\[\[STATUS:.*?\]\]/g, '')
        .replace(/\[\[TITLE:.*?\]\]/g, '')
        .replace(/\[\[LABEL:.*?\]\]/g, '')
        .replace(/\[\[ADD_TASK:.*?\]\]/g, '')
        .replace(/\[\[DONE_TASK:.*?\]\]/g, '')
        .replace(/\[\[REMOVE_TASK:.*?\]\]/g, '')
        .trim();
  };

  const handleStopGeneration = (sessionId: string) => {
    if (abortControllers.current[sessionId]) {
        abortControllers.current[sessionId].abort();
        delete abortControllers.current[sessionId];
        setSessionLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[], useThinking: boolean, mode: SessionMode, existingMsgId?: string) => {
    if (!activeSessionId) return;
    const currentSessionId = activeSessionId; 

    const modelId = sessionModels[currentSessionId];
    if (!modelId) return;

    if (activeSession?.title === 'New Chat' && text && !existingMsgId) {
        setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === currentSessionId ? { ...s, title: text.slice(0, 30) + (text.length > 30 ? '...' : '') } : s) : prev);
    }

    let newMessageId = Date.now().toString();
    if (existingMsgId) {
        newMessageId = existingMsgId;
        setSessionMessages(prev => ({
            ...prev,
            [currentSessionId]: (prev[currentSessionId] || []).map(m => m.id === existingMsgId ? { ...m, content: text, attachments: attachments } : m)
        }));
    } else {
        const newMessage: Message = {
            id: newMessageId,
            role: 'user',
            content: text,
            timestamp: new Date(),
            attachments: attachments
        };
        setSessionMessages(prev => ({
            ...prev,
            [currentSessionId]: [...(prev[currentSessionId] || []), newMessage]
        }));
    }

    setSessionLoading(prev => ({ ...prev, [currentSessionId]: true }));
    const controller = new AbortController();
    abortControllers.current[currentSessionId] = controller;

    const currentMsgs = sessionMessages[currentSessionId] || [];
    let aiMessageId = (Date.now() + 1).toString();
    const userMsgIndex = currentMsgs.findIndex(m => m.id === newMessageId);
    
    if (existingMsgId && userMsgIndex !== -1 && currentMsgs[userMsgIndex + 1]?.role === 'model') {
        aiMessageId = currentMsgs[userMsgIndex + 1].id;
        setSessionMessages(prev => ({
            ...prev,
            [currentSessionId]: prev[currentSessionId].map(m => m.id === aiMessageId ? { ...m, content: '', thoughtProcess: undefined } : m)
        }));
    } else {
        const initialAiMessage: Message = {
            id: aiMessageId,
            role: 'model',
            content: '',
            timestamp: new Date(),
            thoughtProcess: undefined
        };
        if (existingMsgId && userMsgIndex !== -1) {
            setSessionMessages(prev => {
                const updated = [...(prev[currentSessionId] || [])];
                updated.splice(userMsgIndex + 1, 0, initialAiMessage);
                return { ...prev, [currentSessionId]: updated };
            });
        } else {
            setSessionMessages(prev => ({
                ...prev,
                [currentSessionId]: [...(prev[currentSessionId] || []), initialAiMessage]
            }));
        }
    }

    try {
        const finalMsgsAfterStateUpdate = sessionMessages[currentSessionId] || [];
        const currentIndex = finalMsgsAfterStateUpdate.findIndex(m => m.id === newMessageId);
        const historyData = finalMsgsAfterStateUpdate.slice(0, currentIndex).map(m => {
            const parts: any[] = [];
            if (m.content && m.content.trim()) parts.push({ text: m.content });
            if (m.attachments && m.attachments.length > 0) {
                m.attachments.forEach(att => {
                    if (!att.data) return;
                    const base64Data = att.data.includes('base64,') ? att.data.split('base64,')[1] : att.data;
                    parts.push({ inlineData: { mimeType: att.type, data: base64Data } });
                });
            }
            if (parts.length === 0) parts.push({ text: " " });
            return { role: m.role, parts: parts };
        });

        const agent = agents.find(a => a.id === modelId);
        let systemInstruction = settings.baseKnowledge;
        let actualModel = modelId;

        if (agent) {
            systemInstruction = `${agent.systemInstruction}\n\nUser Context: ${settings.baseKnowledge}`;
            actualModel = agent.baseModel;
        }

        systemInstruction = `${systemInstruction}\n\n${getSystemInstruction(settings.userName, mode)}`;
        
        const onStreamUpdate = (content: string, thoughtProcess?: string) => {
            setSessionMessages(prev => {
                const msgs = prev[currentSessionId] || [];
                return {
                    ...prev,
                    [currentSessionId]: msgs.map(m => m.id === aiMessageId ? { ...m, content, thoughtProcess } : m)
                };
            });
        };

        const response = await sendMessageToGemini(
            text, 
            historyData, 
            systemInstruction, 
            attachments, 
            mode === 'execute', 
            onStreamUpdate,
            settings.apiKeys,
            actualModel,
            mode,
            controller.signal
        );
        
        const cleanText = executeAICommands(response.text, currentSessionId);
        
        setSessionMessages(prev => {
            const msgs = prev[currentSessionId] || [];
            return {
                ...prev,
                [currentSessionId]: msgs.map(m => m.id === aiMessageId ? { ...m, content: cleanText, thoughtProcess: response.thoughtProcess } : m)
            };
        });

        if (currentSessionId !== activeSessionId) {
            setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === currentSessionId ? { ...s, hasNewResponse: true } : s) : prev);
        }

    } catch (e: any) {
        if (e.name === 'AbortError') return;
        console.error("Failed to send message", e);
        const errorText = e.message || "Unknown error";
        if (errorText.includes('404') || errorText.includes('failed to fetch')) setProviderError(errorText);

        setSessionMessages(prev => {
            const msgs = prev[currentSessionId] || [];
            return { ...prev, [currentSessionId]: msgs.map(m => m.id === aiMessageId ? { ...m, content: `Error: ${errorText}` } : m) };
        });
    } finally {
        setSessionLoading(prev => ({ ...prev, [currentSessionId]: false }));
        delete abortControllers.current[currentSessionId];
    }
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleRepairWorkspace = () => {
    setSessions([]);
    setSessionMessages({});
    setAvailableLabels(DEFAULT_LABELS);
    setActiveSessionId(null);
    handleNewSession();
  };

  const updateSessionStatus = (id: string, s: SessionStatus) => setSessions(prev => Array.isArray(prev) ? prev.map(sess => sess.id === id ? { ...sess, status: s } : sess) : prev);
  const updateSessionMode = (id: string, m: SessionMode) => setSessions(prev => Array.isArray(prev) ? prev.map(sess => sess.id === id ? { ...sess, mode: m } : sess) : prev);
  const updateSessionTasks = (id: string, tasks: Task[]) => setSessions(prev => prev.map(s => s.id === id ? { ...s, tasks } : s));
  const updateSessionLabels = (id: string, lid: string) => setSessions(prev => Array.isArray(prev) ? prev.map(s => {
      if (s.id !== id) return s;
      const hasLabel = s.labelIds.includes(lid);
      return { ...s, labelIds: hasLabel ? s.labelIds.filter(x => x !== lid) : [...s.labelIds, lid] };
  }) : prev);
  const toggleSessionFlag = (id: string) => setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, isFlagged: !s.isFlagged } : s) : prev);
  
  const deleteSession = (id: string) => {
      const messages = sessionMessages[id] || [];
      if (messages.length === 0) {
          // Immediately delete without confirmation if chat is empty
          setSessions(prev => Array.isArray(prev) ? prev.filter(s => s.id !== id) : prev);
          if (activeSessionId === id) {
              const remaining = sessions.filter(s => s.id !== id);
              if (remaining.length > 0) handleSelectSession(remaining[0].id);
              else setActiveSessionId(null);
          }
      } else {
          const session = sessions.find(s => s.id === id);
          setDeleteConfirmation({ type: 'chat', id, title: session?.title || 'this chat' });
      }
  };

  const handleConfirmDelete = () => {
      if (!deleteConfirmation) return;
      if (deleteConfirmation.type === 'chat') {
          const id = deleteConfirmation.id;
          setSessions(prev => Array.isArray(prev) ? prev.filter(s => s.id !== id) : prev);
          if (activeSessionId === id) {
              const remaining = sessions.filter(s => s.id !== id);
              if (remaining.length > 0) handleSelectSession(remaining[0].id);
              else setActiveSessionId(null);
          }
      } else {
          setAgents(prev => prev.filter(a => a.id !== deleteConfirmation.id));
      }
      setDeleteConfirmation(null);
  };

  const renameSession = (id: string, t: string) => setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, title: t } : s) : prev);
  const handleUpdateAgent = (updatedAgent: Agent) => setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
  const deleteAgent = (id: string) => {
      const agent = agents.find(a => a.id === id);
      setDeleteConfirmation({ type: 'agent', id, title: agent?.name || 'this agent' });
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] overflow-hidden text-sm font-inter text-[var(--text-main)] relative">
      {!settings.onboardingComplete && !isTourActive && (
          <OnboardingModal onComplete={(name, workspace) => {
              setSettings({ ...settings, userName: name, workspaceName: workspace });
              setIsTourActive(true);
          }} />
      )}

      {isTourActive && (
          <TourOverlay 
            onComplete={() => {
                setSettings({ ...settings, onboardingComplete: true });
                setIsTourActive(false);
            }} 
            onSkip={() => {
                setSettings({ ...settings, onboardingComplete: true });
                setIsTourActive(false);
            }}
            onNewSession={() => {
                // Ensure we don't duplicate sessions if one already exists
                if (sessions.length === 0) handleNewSession();
                setCurrentView('chat');
            }}
          />
      )}

      {deleteConfirmation && (
          <DeleteConfirmationModal 
              title={deleteConfirmation.title}
              description={deleteConfirmation.type === 'chat' ? 'this chat' : 'this agent'}
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteConfirmation(null)}
          />
      )}

      {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      <div className={`fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <SidebarNavigation 
            currentFilter={currentFilter} 
            onSetFilter={(f) => {
                setCurrentFilter(f);
                setIsMobileSidebarOpen(false);
                setIsMobileSessionListOpen(true);
            }} 
            onNewSession={() => {
                handleNewSession();
                setIsMobileSidebarOpen(false);
            }}
            onBack={handleBack}
            onForward={handleForward}
            canBack={historyIndex > 0}
            canForward={historyIndex < history.length - 1}
            statusCounts={statusCounts}
            availableLabels={availableLabels}
            currentView={currentView}
            onChangeView={(v) => {
                setCurrentView(v);
                setIsMobileSidebarOpen(false);
            }}
            workspaceName={settings.workspaceName}
            workspaceIcon={settings.workspaceIcon}
            onShowWhatsNew={() => setIsWhatsNewOpen(true)}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onLogoClick={handleLogoClick}
            isLogoGlowing={isLogoGlowing}
          />
      </div>

      <WhatsNewModal isOpen={isWhatsNewOpen} onClose={() => setIsWhatsNewOpen(false)} />

      <div className="flex-1 flex overflow-hidden relative">
          {currentView === 'chat' && (
              <div className="absolute inset-0 flex animate-in fade-in zoom-in-95 duration-300">
                <div className={`w-full md:w-[300px] flex-shrink-0 transition-all duration-300 ${isMobileSessionListOpen ? 'block' : 'hidden'} md:block`}>
                    <SessionList 
                        sessions={filteredSessions} 
                        activeSessionId={activeSessionId || ''} 
                        onSelectSession={handleSelectSession}
                        onUpdateSessionStatus={updateSessionStatus} 
                        onDeleteSession={deleteSession}
                        onRenameSession={renameSession}
                        onRegenerateTitle={handleRegenerateTitle}
                        availableLabels={availableLabels}
                        onToggleLabel={updateSessionLabels}
                        onCreateLabel={(l) => setAvailableLabels(prev => [...prev, l])}
                        sessionLoading={sessionLoading}
                        onNewSession={handleNewSession}
                        onToggleFlag={toggleSessionFlag}
                        currentFilter={currentFilter}
                        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                        triggerSearch={triggerSearch}
                    />
                </div>
                
                <div className={`flex-1 transition-all duration-300 h-full ${!isMobileSessionListOpen || !activeSessionId ? 'block' : 'hidden md:block'}`}>
                    {activeSession ? (
                        <ChatInterface 
                            key={activeSession.id}
                            session={activeSession}
                            messages={activeMessages} 
                            onSendMessage={handleSendMessage}
                            onStopGeneration={() => handleStopGeneration(activeSessionId!)}
                            isLoading={activeLoading}
                            onUpdateStatus={(status) => updateSessionStatus(activeSessionId!, status)}
                            onUpdateMode={(mode) => updateSessionMode(activeSessionId!, mode)}
                            onUpdateTasks={(tasks) => updateSessionTasks(activeSessionId!, tasks)}
                            availableLabels={availableLabels}
                            onUpdateLabels={(labelId) => updateSessionLabels(activeSessionId!, labelId)}
                            onCreateLabel={(l) => setAvailableLabels(prev => [...prev, l])}
                            onDeleteSession={() => deleteSession(activeSessionId!)}
                            onRenameSession={(title) => renameSession(activeSessionId!, title)}
                            onRegenerateTitle={handleRegenerateTitle}
                            onToggleFlag={() => toggleSessionFlag(activeSessionId!)}
                            onChangeView={setCurrentView}
                            onNewSession={handleNewSession}
                            visibleModels={settings.visibleModels}
                            agents={agents}
                            currentModel={activeSessionId ? (sessionModels[activeSessionId] || '') : ''}
                            onSelectModel={(m) => {
                                if(activeSessionId) setSessionModels(prev => ({...prev, [activeSessionId]: m}));
                            }}
                            sendKey={settings.sendKey}
                            hasOpenRouterKey={!!(settings.apiKeys.openRouter || settings.apiKeys.openRouterAlt)}
                            hasDeepSeekKey={!!settings.apiKeys.deepSeek}
                            hasMoonshotKey={!!settings.apiKeys.moonshot}
                            onBackToList={() => setIsMobileSessionListOpen(true)}
                            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                            hasAnyKey={hasAnyKey}
                            userSettings={settings}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] bg-[var(--bg-tertiary)] flex-col gap-2 h-full">
                            <div className="md:hidden absolute top-4 left-4">
                                <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--text-main)]">
                                    <Menu className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-lg">
                                <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" strokeWidth={2} />
                            </div>
                        </div>
                    )}
                </div>
              </div>
          )}

          {currentView === 'settings' && (
              <div className="absolute inset-0 flex animate-in fade-in zoom-in-95 duration-300">
                  <SettingsView 
                    settings={settings} 
                    onUpdateSettings={handleUpdateSettings}
                    labels={availableLabels}
                    onUpdateLabels={setAvailableLabels}
                    onClearData={handleClearData}
                    onRepairWorkspace={handleRepairWorkspace}
                  />
              </div>
          )}

          {currentView === 'agents' && (
              <div className="absolute inset-0 flex animate-in fade-in zoom-in-95 duration-300">
                  <AgentsView 
                    agents={agents}
                    onCreateAgent={(a) => setAgents(prev => [...prev, a])}
                    onDeleteAgent={deleteAgent}
                    onUpdateAgent={handleUpdateAgent}
                  />
              </div>
          )}
      </div>
    </div>
  );
};

export default App;