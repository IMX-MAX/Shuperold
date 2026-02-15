import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Inbox, Layout, User, Rocket, ShieldAlert, AlertTriangle, Trash2, Wrench, Menu, PlusCircle } from 'lucide-react';
import { SidebarNavigation } from './components/SidebarNavigation';
import { SessionList } from './components/SessionList';
import { ChatInterface } from './components/ChatInterface';
import { SettingsView } from './components/SettingsView';
import { AgentsView } from './components/AgentsView';
import { WhatsNewModal } from './components/WhatsNewModal';
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
    SessionMode 
} from './types';
import { sendMessageToGemini, generateSessionTitle } from './services/geminiService';

const DEFAULT_LABELS: Label[] = [
    { id: '1', name: 'Design', color: '#EC4899' },
    { id: '2', name: 'Research', color: '#8B5CF6' },
    { id: '3', name: 'Writing', color: '#A78BFA' },
    { id: '4', name: 'Code', color: '#3B82F6' },
    { id: '5', name: 'Bug', color: '#0EA5E9' },
];

const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    accentColor: '#3B82F6',
    workspaceName: 'shuper - your favorite AI executor',
    visibleModels: [...GEMINI_MODELS],
    userName: 'Nathan',
    timezone: 'UTC',
    language: 'English',
    city: 'San Francisco',
    country: 'USA',
    baseKnowledge: '',
    sendKey: 'Enter',
    onboardingComplete: false,
    apiKeys: {
        openRouter: '',
        openRouterAlt: '',
        deepSeek: '',
        moonshot: ''
    }
};

const AI_COMMANDS_INSTRUCTION = `
IDENTITY:
You are Shuper AI, a high-performance assistant integrated into the Shuper Workspace.
You provide extremely precise, efficient, and sophisticated responses.

STRICT CONVERSATION RULES:
1. NO SIGN-OFFS. Do not say "Respectfully, Shuper AI", "Best regards", or any other closing statement.
2. NO META-TALK. Do not output status updates or inner thoughts in brackets.
3. BE DIRECT. Get straight to the helpful information.
4. IDENTITY. If asked, you are Shuper AI.

EXECUTE MODE (PLANNING):
If the user is in Execute mode, you MUST start your response with a clear internal plan of action.
Format each step of your plan on a new line starting with a hyphen (-).
Ensure these steps describe your logic or intent (e.g., "- Acknowledge the user's greeting.", "- Confirm readiness to execute tasks.").
Once your plan is complete, provide your final response on a new line.

Example for a greeting:
- Acknowledge the user's greeting.
- Confirm readiness to execute tasks or provide advanced technical assistance.
Hello! I'm Shuper AI, ready to assist you.

SYSTEM CAPABILITIES (USE ONLY IF REQUESTED):
- [[TITLE: New Title]] - To rename this session.
- [[STATUS: backlog | todo | needs_review | done | cancelled | archive]] - To change status.
- [[LABEL: Label Name]] - To add a label to this session.

LABEL RESTRICTION:
IMPORTANT: You MUST NOT output the [[LABEL: ...]] tag for a NEW label that doesn't already exist unless the user has explicitly given you permission.
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
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

const OnboardingModal: React.FC<{ onComplete: (name: string, workspace: string) => void }> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [workspace, setWorkspace] = useState('');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <div className="w-full max-w-md bg-[#171717] border border-[#333] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome to Shuper</h2>
                    <p className="text-gray-400 text-sm mt-2">Let's set up your personal workspace.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <User className="w-3 h-3" /> Your Name
                        </label>
                        <input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Nathan"
                            className="w-full bg-[#202020] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <Layout className="w-3 h-3" /> Workspace Name
                        </label>
                        <input 
                            value={workspace}
                            onChange={e => setWorkspace(e.target.value)}
                            placeholder="e.g. My Creative Lab"
                            className="w-full bg-[#202020] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => name && workspace && onComplete(name, workspace)}
                        disabled={!name || !workspace}
                        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        Start Exploring
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ title: string, description: string, onConfirm: () => void, onCancel: () => void }> = ({ title, description, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#333] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-[#EF4444] mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">{description}</p>
            <div className="flex gap-3">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-2.5 bg-[#2A2A2A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors border border-[#333]"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-600/10"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

const ModelErrorPopup: React.FC<{ error: string, onClose: () => void }> = ({ error, onClose }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-[#1A1A1A] border border-red-900/50 rounded-2xl p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold">Provider Error</h3>
            </div>
            <p className="text-sm text-gray-300 mb-2 font-medium">This model appears to be down or returning an error:</p>
            <div className="bg-black/40 rounded-lg p-3 text-xs font-mono text-red-400 mb-6 max-h-32 overflow-y-auto border border-red-900/20">
                {error}
            </div>
            <button 
                onClick={onClose}
                className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition-colors"
            >
                Dismiss
            </button>
        </div>
    </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'agents' | 'settings'>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileSessionListOpen, setIsMobileSessionListOpen] = useState(true);
  
  // Logo glow state
  const [logoClicks, setLogoClicks] = useState(0);
  const [isLogoGlowing, setIsLogoGlowing] = useState(false);

  // Global Context Menu state
  const [globalContextMenu, setGlobalContextMenu] = useState<{ x: number, y: number } | null>(null);

  // Persisted State
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
      if (settings.onboardingComplete) {
          if (sessions.length > 0 && !activeSessionId) {
              // Auto-select is disabled for better mobile experience initially
          } else if (sessions.length === 0 && currentView === 'chat') {
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

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    setGlobalContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleUpdateSettings = useCallback((newSettings: UserSettings) => {
    const updatedVisibleModels = new Set(newSettings.visibleModels);
    
    if ((newSettings.apiKeys.openRouter || newSettings.apiKeys.openRouterAlt) && !(settings.apiKeys.openRouter || settings.apiKeys.openRouterAlt)) {
        OPENROUTER_FREE_MODELS.forEach(m => updatedVisibleModels.add(m));
    }
    if (newSettings.apiKeys.deepSeek && !settings.apiKeys.deepSeek) {
        DEEPSEEK_MODELS.forEach(m => updatedVisibleModels.add(m));
    }
    if (newSettings.apiKeys.moonshot && !settings.apiKeys.moonshot) {
        MOONSHOT_MODELS.forEach(m => updatedVisibleModels.add(m));
    }

    setSettings({
        ...newSettings,
        visibleModels: Array.from(updatedVisibleModels)
    });
  }, [settings, setSettings]);

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
        
        let labelIdToAdd = '';
        if (existingLabel) {
            labelIdToAdd = existingLabel.id;
        } else {
            const newLabel: Label = {
                id: Date.now().toString(),
                name: labelName,
                color: '#3B82F6'
            };
            setAvailableLabels(prev => [...prev, newLabel]);
            labelIdToAdd = newLabel.id;
        }

        if (labelIdToAdd) {
             setSessions(prev => Array.isArray(prev) ? prev.map(s => {
                 if (s.id !== sessionId) return s;
                 if (s.labelIds.includes(labelIdToAdd)) return s;
                 return { ...s, labelIds: [...s.labelIds, labelIdToAdd] };
             }) : prev);
        }
    }

    return text
        .replace(/\[\[STATUS:.*?\]\]/g, '')
        .replace(/\[\[TITLE:.*?\]\]/g, '')
        .replace(/\[\[LABEL:.*?\]\]/g, '')
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

        systemInstruction = `${systemInstruction}\n\n${AI_COMMANDS_INSTRUCTION}`;
        
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
            return { ...prev, [currentSessionId]: msgs.map(m => m.id === aiMessageId ? { ...m, content: "Sorry, I encountered an error." } : m) };
        });
    } finally {
        setSessionLoading(prev => ({ ...prev, [currentSessionId]: false }));
        delete abortControllers.current[currentSessionId];
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear ALL data?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const handleRepairWorkspace = () => {
    if (confirm("Repair Workspace will clear chats and labels. Continue?")) {
        setSessions([]);
        setSessionMessages({});
        setAvailableLabels(DEFAULT_LABELS);
        setActiveSessionId(null);
        handleNewSession();
    }
  };

  const updateSessionStatus = (id: string, s: SessionStatus) => setSessions(prev => Array.isArray(prev) ? prev.map(sess => sess.id === id ? { ...sess, status: s } : sess) : prev);
  const updateSessionMode = (id: string, m: SessionMode) => setSessions(prev => Array.isArray(prev) ? prev.map(sess => sess.id === id ? { ...sess, mode: m } : sess) : prev);
  const updateSessionLabels = (id: string, lid: string) => setSessions(prev => Array.isArray(prev) ? prev.map(s => {
      if (s.id !== id) return s;
      const hasLabel = s.labelIds.includes(lid);
      return { ...s, labelIds: hasLabel ? s.labelIds.filter(x => x !== lid) : [...s.labelIds, lid] };
  }) : prev);
  const toggleSessionFlag = (id: string) => setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, isFlagged: !s.isFlagged } : s) : prev);
  
  const deleteSession = (id: string) => {
      const session = sessions.find(s => s.id === id);
      setDeleteConfirmation({ type: 'chat', id, title: session?.title || 'this conversation' });
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
    <div 
        className="flex h-screen w-full bg-[var(--bg-primary)] overflow-hidden text-sm font-inter text-[var(--text-main)] relative"
        onContextMenu={handleGlobalContextMenu}
    >
      {!settings.onboardingComplete && (
          <OnboardingModal onComplete={(name, workspace) => {
              setSettings({ ...settings, userName: name, workspaceName: workspace, onboardingComplete: true });
          }} />
      )}

      {providerError && (
          <ModelErrorPopup error={providerError} onClose={() => setProviderError(null)} />
      )}

      {deleteConfirmation && (
          <DeleteConfirmationModal 
              title={`Delete ${deleteConfirmation.type === 'chat' ? 'Conversation' : 'Agent'}?`}
              description={`Are you sure you want to delete "${deleteConfirmation.title}"?`}
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteConfirmation(null)}
          />
      )}

      {isMobileSidebarOpen && (
          <div 
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
              onClick={() => setIsMobileSidebarOpen(false)}
          />
      )}

      <div className={`
          fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
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
                <div className={`
                    w-full md:w-[300px] flex-shrink-0 transition-all duration-300
                    ${isMobileSessionListOpen ? 'block' : 'hidden'} md:block
                `}>
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
                    />
                </div>
                
                <div className={`
                    flex-1 transition-all duration-300 h-full
                    ${!isMobileSessionListOpen || !activeSessionId ? 'block' : 'hidden md:block'}
                `}>
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
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] bg-[var(--bg-tertiary)] flex-col gap-2 h-full">
                            <div className="md:hidden absolute top-4 left-4">
                                <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--text-main)]">
                                    <Menu className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-lg">
                                <Inbox className="w-6 h-6 text-[var(--text-muted)]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-medium text-[var(--text-main)]">Welcome to Shuper</h3>
                            <p className="text-[var(--text-dim)] px-10 text-center">Select a session to start.</p>
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