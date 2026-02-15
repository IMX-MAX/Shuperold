import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Inbox } from 'lucide-react';
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
    apiKeys: {
        gemini: '',
        openRouter: '',
        deepSeek: '',
        moonshot: ''
    }
};

const AI_COMMANDS_INSTRUCTION = `
SYSTEM TOOL CAPABILITIES:
You have access to control the chat interface. You can rename the session, change its status, or add labels by outputting specific tags.

Commands:
- Rename Chat: [[TITLE: New Title Here]]
- Change Status: [[STATUS: todo | backlog | needs_review | done | cancelled | archive]]
- Add Label: [[LABEL: Label Name]]

Usage Rule:
- Output these tags on a separate line or at the end of your response.
- Do not output the tags if you are just answering a question normally. Only use them if the user asks you to update the session.
`;

// Helper for local storage persistence using standard function syntax to avoid parser ambiguity
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'agents' | 'settings'>('chat');
  
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

  // Initialize active session
  useEffect(() => {
      if (sessions.length > 0 && !activeSessionId) {
          setActiveSessionId(sessions[0].id);
      } else if (sessions.length === 0 && currentView === 'chat') {
          handleNewSession();
      }
  }, []);

  // Theme Handling
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

  const handleUpdateSettings = useCallback((newSettings: UserSettings) => {
    const updatedVisibleModels = new Set(newSettings.visibleModels);
    
    if (newSettings.apiKeys.gemini && !settings.apiKeys.gemini) {
        GEMINI_MODELS.forEach(m => updatedVisibleModels.add(m));
    }
    if (newSettings.apiKeys.openRouter && !settings.apiKeys.openRouter) {
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
      if (id === activeSessionId) return;
      setActiveSessionId(id);
      setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, hasNewResponse: false } : s) : prev);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(id);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
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
      setSessionModels(prev => ({ ...prev, [newSession.id]: settings.visibleModels[0] || 'gemini-3-flash-preview' }));
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

      const newTitle = await generateSessionTitle(historyData, session.title, settings.apiKeys.gemini);
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

  const handleSendMessage = async (text: string, attachments: Attachment[], useThinking: boolean, mode: SessionMode) => {
    if (!activeSessionId) return;
    const currentSessionId = activeSessionId; 

    if (activeSession?.title === 'New Chat' && text) {
        setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === currentSessionId ? { ...s, title: text.slice(0, 30) + (text.length > 30 ? '...' : '') } : s) : prev);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachments: attachments
    };
    
    setSessionMessages(prev => ({
        ...prev,
        [currentSessionId]: [...(prev[currentSessionId] || []), newMessage]
    }));
    setSessionLoading(prev => ({ ...prev, [currentSessionId]: true }));

    const aiMessageId = (Date.now() + 1).toString();
    const initialAiMessage: Message = {
        id: aiMessageId,
        role: 'model',
        content: '',
        timestamp: new Date(),
        thoughtProcess: (useThinking || mode === 'execute') ? "Initializing..." : undefined
    };

    setSessionMessages(prev => ({
        ...prev,
        [currentSessionId]: [...(prev[currentSessionId] || []), initialAiMessage]
    }));

    try {
        const historyData = (sessionMessages[currentSessionId] || []).map(m => {
            const parts: any[] = [];
            if (m.content && m.content.trim()) {
                parts.push({ text: m.content });
            }
            if (m.attachments && m.attachments.length > 0) {
                m.attachments.forEach(att => {
                    const base64Data = att.data.split(',')[1] || att.data;
                    parts.push({
                        inlineData: {
                            mimeType: att.type,
                            data: base64Data
                        }
                    });
                });
            }
            if (parts.length === 0) {
                parts.push({ text: " " });
            }
            return { role: m.role, parts: parts };
        });

        const modelId = sessionModels[currentSessionId] || settings.visibleModels[0] || 'gemini-3-flash-preview';
        const agent = agents.find(a => a.id === modelId);
        
        let systemInstruction = settings.baseKnowledge;
        let actualModel = modelId;

        if (agent) {
            systemInstruction = `${agent.systemInstruction}\n\nUser Context: ${settings.baseKnowledge}`;
            actualModel = agent.baseModel;
        }

        systemInstruction = `${systemInstruction}\n\n${AI_COMMANDS_INSTRUCTION}`;
        
        let apiKey = '';
        if (actualModel.startsWith('gemini-')) {
            apiKey = settings.apiKeys.gemini || process.env.API_KEY || '';
        } else if (actualModel.startsWith('deepseek-')) {
            apiKey = settings.apiKeys.deepSeek;
        } else if (actualModel.startsWith('moonshot-')) {
            apiKey = settings.apiKeys.moonshot;
        } else if (actualModel.includes('/') || actualModel.includes(':')) {
            apiKey = settings.apiKeys.openRouter;
        }
        
        const onStreamUpdate = (content: string, thoughtProcess?: string) => {
            setSessionMessages(prev => {
                const msgs = prev[currentSessionId] || [];
                return {
                    ...prev,
                    [currentSessionId]: msgs.map(m => 
                        m.id === aiMessageId ? { ...m, content, thoughtProcess } : m
                    )
                };
            });
        };

        const response = await sendMessageToGemini(
            text, 
            historyData, 
            systemInstruction, 
            attachments, 
            useThinking, 
            onStreamUpdate,
            apiKey,
            actualModel,
            mode
        );
        
        const cleanText = executeAICommands(response.text, currentSessionId);
        
        setSessionMessages(prev => {
            const msgs = prev[currentSessionId] || [];
            return {
                ...prev,
                [currentSessionId]: msgs.map(m => 
                    m.id === aiMessageId ? { ...m, content: cleanText, thoughtProcess: response.thoughtProcess } : m
                )
            };
        });

        setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === currentSessionId ? { ...s, hasNewResponse: true } : s) : prev);

    } catch (e: any) {
        console.error("Failed to send message", e);
        const errorMessage = e.message?.includes('429') || e.message?.includes('quota') 
            ? "⚠️ API Quota Exceeded. Please add a valid API key in Settings." 
            : "Sorry, I encountered an error. Please check your network or API key.";

        setSessionMessages(prev => {
            const msgs = prev[currentSessionId] || [];
            return {
                ...prev,
                [currentSessionId]: msgs.map(m => 
                    m.id === aiMessageId ? { ...m, content: errorMessage } : m
                )
            };
        });
    } finally {
        setSessionLoading(prev => ({ ...prev, [currentSessionId]: false }));
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
      setSessions(prev => Array.isArray(prev) ? prev.filter(s => s.id !== id) : prev);
      if (activeSessionId === id) {
          const sessionArr = Array.isArray(sessions) ? sessions : [];
          const remaining = sessionArr.filter(s => s.id !== id);
          if (remaining.length > 0) handleSelectSession(remaining[0].id);
          else setActiveSessionId(null);
      }
  };
  const renameSession = (id: string, t: string) => setSessions(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, title: t } : s) : prev);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] overflow-hidden text-sm font-inter text-[var(--text-main)] selection:bg-[var(--accent)] selection:text-white">
      <SidebarNavigation 
        currentFilter={currentFilter} 
        onSetFilter={setCurrentFilter} 
        onNewSession={handleNewSession}
        onBack={handleBack}
        onForward={handleForward}
        canBack={historyIndex > 0}
        canForward={historyIndex < history.length - 1}
        statusCounts={statusCounts}
        availableLabels={availableLabels}
        currentView={currentView}
        onChangeView={setCurrentView}
        workspaceName={settings.workspaceName}
        onShowWhatsNew={() => setIsWhatsNewOpen(true)}
      />

      <WhatsNewModal isOpen={isWhatsNewOpen} onClose={() => setIsWhatsNewOpen(false)} />

      <div className="flex-1 flex overflow-hidden relative">
          {currentView === 'chat' && (
              <div className="absolute inset-0 flex animate-in fade-in zoom-in-95 duration-300">
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
                />
                {activeSession ? (
                    <ChatInterface 
                        key={activeSession.id}
                        session={activeSession}
                        messages={activeMessages} 
                        onSendMessage={handleSendMessage}
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
                        
                        visibleModels={settings.visibleModels}
                        agents={agents}
                        currentModel={activeSessionId ? (sessionModels[activeSessionId] || settings.visibleModels[0]) : 'gemini-3-flash-preview'}
                        onSelectModel={(m) => {
                            if(activeSessionId) setSessionModels(prev => ({...prev, [activeSessionId]: m}));
                        }}
                        sendKey={settings.sendKey}
                        hasOpenRouterKey={!!settings.apiKeys.openRouter}
                        hasDeepSeekKey={!!settings.apiKeys.deepSeek}
                        hasMoonshotKey={!!settings.apiKeys.moonshot}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] bg-[var(--bg-tertiary)] flex-col gap-2">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-lg">
                            <Inbox className="w-6 h-6 text-[var(--text-muted)]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-main)]">Welcome to Shuper</h3>
                        <p className="text-[var(--text-dim)]">Select a session or create a new one to get started.</p>
                    </div>
                )}
              </div>
          )}

          {currentView === 'settings' && (
              <div className="absolute inset-0 flex animate-in fade-in zoom-in-95 duration-300">
                  <SettingsView 
                    settings={settings} 
                    onUpdateSettings={handleUpdateSettings}
                    labels={availableLabels}
                    onUpdateLabels={setAvailableLabels}
                  />
              </div>
          )}

          {currentView === 'agents' && (
              <div className="absolute inset-0 flex animate-in fade-in zoom-in-95 duration-300">
                  <AgentsView 
                    agents={agents}
                    onCreateAgent={(a) => setAgents(prev => [...prev, a])}
                    onDeleteAgent={(id) => setAgents(prev => prev.filter(a => a.id !== id))}
                  />
              </div>
          )}
      </div>
    </div>
  );
};

export default App;