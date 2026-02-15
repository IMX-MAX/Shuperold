import React, { useState, useMemo, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { SidebarNavigation } from './components/SidebarNavigation';
import { SessionList } from './components/SessionList';
import { ChatInterface } from './components/ChatInterface';
import { SettingsView } from './components/SettingsView';
import { AgentsView } from './components/AgentsView';
import { WhatsNewModal } from './components/WhatsNewModal';
import { Session, Message, SessionStatus, Label, UserSettings, Agent, Attachment, OPENROUTER_FREE_MODELS, GEMINI_MODELS, SessionMode } from './types';
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
    // Updated default models to valid ones
    visibleModels: ['gemini-3-flash-preview', 'gemini-3-pro-preview'],
    userName: 'Nathan',
    timezone: 'UTC',
    language: 'English',
    city: 'San Francisco',
    country: 'USA',
    baseKnowledge: '',
    sendKey: 'Enter',
    apiKeys: {
        gemini: process.env.API_KEY || '',
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

// Helper for local storage
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'agents' | 'settings'>('chat');
  
  // Persisted State
  const [settings, setSettings] = useStickyState<UserSettings>(DEFAULT_SETTINGS, 'shuper_settings');
  const [availableLabels, setAvailableLabels] = useStickyState<Label[]>(DEFAULT_LABELS, 'shuper_labels');
  const [agents, setAgents] = useStickyState<Agent[]>([], 'shuper_agents');
  const [sessions, setSessions] = useStickyState<Session[]>([], 'shuper_sessions');
  const [sessionMessages, setSessionMessages] = useStickyState<Record<string, Message[]>>({}, 'shuper_messages');
  // Note: We don't persist activeSessionId to prevent sticking to deleted sessions easily, but we could.
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [sessionLoading, setSessionLoading] = useState<Record<string, boolean>>({});
  // Persist model selection per session? Or global? Let's keep it transient or persist simple.
  const [sessionModels, setSessionModels] = useState<Record<string, string>>({});

  const [currentFilter, setCurrentFilter] = useState('all');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  // Initialize active session if exists
  useEffect(() => {
      if (sessions.length > 0 && !activeSessionId) {
          // If we have sessions but none active, maybe load the first one?
          // Or don't, just let user select.
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
    if (currentFilter.startsWith('status:')) {
        const status = currentFilter.split(':')[1] as SessionStatus;
        return sessions.filter(s => s.status === status);
    }
    if (currentFilter.startsWith('label:')) {
        const labelId = currentFilter.split(':')[1];
        return sessions.filter(s => s.labelIds.includes(labelId));
    }
    switch (currentFilter) {
        case 'flagged': return sessions.filter(s => s.isFlagged);
        case 'archived': return sessions.filter(s => s.status === 'archive');
        case 'all': default: return sessions.filter(s => s.status !== 'archive');
    }
  }, [sessions, currentFilter]);

  const statusCounts = useMemo(() => {
      const counts: Record<string, number> = { backlog: 0, todo: 0, needs_review: 0, done: 0, cancelled: 0, archive: 0 };
      sessions.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
      return counts as Record<SessionStatus, number>;
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMessages = activeSessionId ? (sessionMessages[activeSessionId] || []) : [];
  const activeLoading = activeSessionId ? (sessionLoading[activeSessionId] || false) : false;

  const handleSelectSession = (id: string) => {
      if (id === activeSessionId) return;
      setActiveSessionId(id);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, hasNewResponse: false } : s));
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
          setSessions(prev => prev.map(s => s.id === prevId ? { ...s, hasNewResponse: false } : s));
      }
  };

  const handleForward = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const nextId = history[newIndex];
          setHistoryIndex(newIndex);
          setActiveSessionId(nextId);
          setSessions(prev => prev.map(s => s.id === nextId ? { ...s, hasNewResponse: false } : s));
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
      setSessions(prev => [newSession, ...prev]);
      setSessionMessages(prev => ({ ...prev, [newSession.id]: [] }));
      // Default to gemini-3-flash-preview
      setSessionModels(prev => ({ ...prev, [newSession.id]: settings.visibleModels[0] || 'gemini-3-flash-preview' }));
      handleSelectSession(newSession.id);
  };

  const handleRegenerateTitle = async (sessionId: string) => {
      const messages = sessionMessages[sessionId];
      if (!messages || messages.length === 0) return;
      
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const historyData = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));

      const newTitle = await generateSessionTitle(historyData, session.title, settings.apiKeys.gemini);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
  };

  // --- AI Command Execution Logic ---
  const executeAICommands = (text: string, sessionId: string) => {
    // Check for Status Change
    const statusMatch = text.match(/\[\[STATUS:\s*(.*?)\]\]/);
    if (statusMatch) {
        const newStatus = statusMatch[1].trim().toLowerCase() as SessionStatus;
        if (['backlog', 'todo', 'needs_review', 'done', 'cancelled', 'archive'].includes(newStatus)) {
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s));
        }
    }

    // Check for Title Change
    const titleMatch = text.match(/\[\[TITLE:\s*(.*?)\]\]/);
    if (titleMatch) {
        const newTitle = titleMatch[1].trim();
        if (newTitle) {
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
        }
    }

    // Check for Label Add
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
                color: '#3B82F6' // Default color
            };
            setAvailableLabels(prev => [...prev, newLabel]);
            labelIdToAdd = newLabel.id;
        }

        if (labelIdToAdd) {
             setSessions(prev => prev.map(s => {
                 if (s.id !== sessionId) return s;
                 if (s.labelIds.includes(labelIdToAdd)) return s;
                 return { ...s, labelIds: [...s.labelIds, labelIdToAdd] };
             }));
        }
    }

    // Return text without the commands
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
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: text.slice(0, 30) + (text.length > 30 ? '...' : '') } : s));
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachments: attachments
    };
    
    // Add User Message
    setSessionMessages(prev => ({
        ...prev,
        [currentSessionId]: [...(prev[currentSessionId] || []), newMessage]
    }));
    setSessionLoading(prev => ({ ...prev, [currentSessionId]: true }));

    // Placeholder for AI Message (Stream target)
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
            return {
                role: m.role,
                parts: parts
            };
        });

        const modelId = sessionModels[currentSessionId];
        const agent = agents.find(a => a.id === modelId);
        
        let systemInstruction = settings.baseKnowledge;
        let actualModel = modelId;

        if (agent) {
            systemInstruction = `${agent.systemInstruction}\n\nUser Context: ${settings.baseKnowledge}`;
            actualModel = agent.baseModel;
        }

        // Inject AI Command Instructions
        systemInstruction = `${systemInstruction}\n\n${AI_COMMANDS_INSTRUCTION}`;
        
        // --- API KEY SELECTION ---
        let apiKey = '';
        if (actualModel.startsWith('gemini-')) {
            apiKey = settings.apiKeys.gemini;
        } else if (actualModel.startsWith('deepseek-')) {
            apiKey = settings.apiKeys.deepSeek;
        } else if (actualModel.startsWith('moonshot-')) {
            apiKey = settings.apiKeys.moonshot;
        } else if (OPENROUTER_FREE_MODELS.includes(actualModel)) {
            apiKey = settings.apiKeys.openRouter;
        }
        
        const onStreamUpdate = (content: string, thoughtProcess?: string) => {
            setSessionMessages(prev => {
                const msgs = prev[currentSessionId] || [];
                return {
                    ...prev,
                    [currentSessionId]: msgs.map(m => 
                        m.id === aiMessageId 
                            ? { ...m, content, thoughtProcess } 
                            : m
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
        
        // Final command execution and cleanup
        const cleanText = executeAICommands(response.text, currentSessionId);
        
        // Update message with cleaned text
        setSessionMessages(prev => {
            const msgs = prev[currentSessionId] || [];
            return {
                ...prev,
                [currentSessionId]: msgs.map(m => 
                    m.id === aiMessageId 
                        ? { ...m, content: cleanText, thoughtProcess: response.thoughtProcess } 
                        : m
                )
            };
        });

        setSessions(prev => prev.map(s => {
           if (s.id === currentSessionId) {
               return { ...s, hasNewResponse: true };
           }
           return s;
        }));

    } catch (e: any) {
        console.error("Failed to send message", e);
        // Better error handling for Quota Exceeded
        const errorMessage = e.message?.includes('429') || e.message?.includes('quota') 
            ? "⚠️ API Quota Exceeded. Please add a valid API key in Settings." 
            : "Sorry, I encountered an error. Please check your network or API key.";

        setSessionMessages(prev => {
            const msgs = prev[currentSessionId] || [];
            return {
                ...prev,
                [currentSessionId]: msgs.map(m => 
                    m.id === aiMessageId 
                        ? { ...m, content: errorMessage } 
                        : m
                )
            };
        });
    } finally {
        setSessionLoading(prev => ({ ...prev, [currentSessionId]: false }));
    }
  };

  const updateSessionStatus = (id: string, s: SessionStatus) => setSessions(prev => prev.map(sess => sess.id === id ? { ...sess, status: s } : sess));
  const updateSessionMode = (id: string, m: SessionMode) => setSessions(prev => prev.map(sess => sess.id === id ? { ...sess, mode: m } : sess));
  const updateSessionLabels = (id: string, lid: string) => setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      const hasLabel = s.labelIds.includes(lid);
      return { ...s, labelIds: hasLabel ? s.labelIds.filter(x => x !== lid) : [...s.labelIds, lid] };
  }));
  const toggleSessionFlag = (id: string) => setSessions(prev => prev.map(s => s.id === id ? { ...s, isFlagged: !s.isFlagged } : s));
  
  const deleteSession = (id: string) => {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
          const remaining = sessions.filter(s => s.id !== id);
          if (remaining.length > 0) handleSelectSession(remaining[0].id);
          else setActiveSessionId(null);
      }
  };
  const renameSession = (id: string, t: string) => setSessions(prev => prev.map(s => s.id === id ? { ...s, title: t } : s));

  if (activeSession?.hasNewResponse) {
     setTimeout(() => setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, hasNewResponse: false } : s)), 0);
  }

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

      {/* Main Content Area with Transitions */}
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
                    onUpdateSettings={setSettings}
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