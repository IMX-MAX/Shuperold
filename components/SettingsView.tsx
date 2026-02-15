import React, { useState } from 'react';
import { UserSettings, Label, GEMINI_MODELS, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS } from '../types';
import { 
  Monitor, 
  Palette, 
  Tag, 
  Plus, 
  Check, 
  X,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Trash2,
  Briefcase,
  MessageSquare,
  Globe,
  Keyboard,
  AlertTriangle,
  Wrench
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  labels: Label[];
  onUpdateLabels: (labels: Label[]) => void;
  onClearData: () => void;
  onRepairWorkspace: () => void;
}

const ApiKeyInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder 
}: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void,
    placeholder: string
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wide">{label}</label>
            <div className="relative flex items-center">
                <div className="absolute left-3 text-[var(--text-dim)]">
                    <Key className="w-4 h-4" />
                </div>
                <input 
                    type={isVisible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[var(--text-main)] text-[var(--text-main)] placeholder-[var(--text-dim)] transition-colors"
                />
                <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute right-3 text-[var(--text-dim)] hover:text-[var(--text-main)]"
                >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

const ModelList = ({ 
    title, 
    models, 
    visibleModels, 
    onToggle 
}: { 
    title: string, 
    models: string[], 
    visibleModels: string[], 
    onToggle: (model: string) => void 
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-[var(--bg-tertiary)] px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
            >
                <h4 className="font-medium text-sm">{title}</h4>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-dim)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />}
            </div>
            {isExpanded && (
                <div className="bg-[var(--bg-secondary)] p-2 space-y-1">
                    {models.map(model => (
                        <div key={model} className="flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--bg-elevated)] transition-colors">
                            <span className="text-sm truncate max-w-[80%]">{model}</span>
                            <div 
                                onClick={() => onToggle(model)}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                                    visibleModels.includes(model) ? 'bg-[var(--text-main)]' : 'bg-[var(--border)]'
                                }`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--bg-primary)] transition-all ${
                                    visibleModels.includes(model) ? 'left-5' : 'left-0.5 bg-[var(--text-dim)]'
                                }`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  settings, 
  onUpdateSettings,
  labels,
  onUpdateLabels,
  onClearData,
  onRepairWorkspace
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [newLabelName, setNewLabelName] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const predefinedColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  const handleAddLabel = () => {
      if(newLabelName.trim()) {
          const color = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
          onUpdateLabels([...labels, { id: Date.now().toString(), name: newLabelName.trim(), color }]);
          setNewLabelName('');
          setIsAddingLabel(false);
      }
  };

  const handleDeleteLabel = (id: string) => {
      onUpdateLabels(labels.filter(l => l.id !== id));
  };

  const tabs = [
      { id: 'general', label: 'General', icon: Briefcase },
      { id: 'ai', label: 'AI Providers', icon: Monitor },
      { id: 'chat', label: 'Chat & Personalization', icon: MessageSquare },
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'labels', label: 'Labels', icon: Tag },
  ];

  const updateApiKey = (provider: keyof UserSettings['apiKeys'], value: string) => {
      onUpdateSettings({
          ...settings,
          apiKeys: {
              ...settings.apiKeys,
              [provider]: value
          }
      });
  };

  const toggleModel = (model: string) => {
      const newVisible = settings.visibleModels.includes(model) 
          ? settings.visibleModels.filter(m => m !== model)
          : [...settings.visibleModels, model];
      onUpdateSettings({ ...settings, visibleModels: newVisible });
  };

  return (
    <div className="flex-1 flex h-full bg-[var(--bg-primary)] text-[var(--text-main)] font-inter">
      <div className="w-64 border-r border-[var(--border)] pt-8 px-4 flex flex-col gap-1">
         <h2 className="text-sm font-semibold mb-4 px-2 text-[var(--text-dim)] uppercase tracking-wider">Settings</h2>
         {tabs.map(tab => (
             <div 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    activeTab === tab.id 
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-main)]' 
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'
                }`}
             >
                 <tab.icon className="w-4 h-4" />
                 <span className="text-sm font-medium">{tab.label}</span>
             </div>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto py-12 px-8">
              <h1 className="text-2xl font-semibold mb-8 capitalize">{activeTab}</h1>

              {activeTab === 'general' && (
                  <div className="space-y-8">
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
                          <div>
                              <h3 className="font-medium text-lg mb-1">Workspace & Profile</h3>
                              <p className="text-sm text-[var(--text-dim)]">Customize how Shuper looks and feels for you.</p>
                          </div>
                          
                          <div className="space-y-4">
                              <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wide">Workspace Name</label>
                                  <input 
                                      value={settings.workspaceName}
                                      onChange={(e) => onUpdateSettings({...settings, workspaceName: e.target.value})}
                                      placeholder="e.g. Acme Corp"
                                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--text-main)] text-[var(--text-main)]"
                                  />
                              </div>

                              <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wide">Your Name</label>
                                  <input 
                                      value={settings.userName}
                                      onChange={(e) => onUpdateSettings({...settings, userName: e.target.value})}
                                      placeholder="e.g. John Doe"
                                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--text-main)] text-[var(--text-main)]"
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
                          <div className="flex items-center gap-3 text-blue-500 mb-2">
                              <Wrench className="w-5 h-5" />
                              <h3 className="font-medium text-lg">Maintenance</h3>
                          </div>
                          <p className="text-sm text-gray-400 mb-6">Repair workspace will clear all chats and labels, but keep your API keys and settings safe. Use this if the app feels slow or cluttered.</p>
                          <button 
                            onClick={onRepairWorkspace}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors"
                          >
                              Repair Workspace
                          </button>
                      </div>

                      <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-6">
                          <div className="flex items-center gap-3 text-red-500 mb-2">
                              <AlertTriangle className="w-5 h-5" />
                              <h3 className="font-medium text-lg">Danger Zone</h3>
                          </div>
                          <p className="text-sm text-gray-400 mb-6">Clearing data will remove all sessions, local AI instructions, and API keys. This action cannot be undone.</p>
                          <button 
                            onClick={onClearData}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors"
                          >
                              Clear All Data
                          </button>
                      </div>
                  </div>
              )}

              {activeTab === 'chat' && (
                  <div className="space-y-8">
                       <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
                          <div>
                              <h3 className="font-medium text-lg mb-1">Global Knowledge & Instructions</h3>
                              <p className="text-sm text-[var(--text-dim)]">Information provided to the AI in every conversation.</p>
                          </div>
                          <div className="space-y-1.5">
                              <textarea 
                                  value={settings.baseKnowledge}
                                  onChange={(e) => onUpdateSettings({...settings, baseKnowledge: e.target.value})}
                                  placeholder="e.g. I am a software engineer preferring TypeScript. Always be concise."
                                  className="w-full h-40 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-main)] text-[var(--text-main)] resize-none"
                              />
                          </div>
                      </div>

                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
                          <div>
                              <h3 className="font-medium text-lg mb-1">Input Preferences</h3>
                              <p className="text-sm text-[var(--text-dim)]">Customize your typing experience.</p>
                          </div>
                          
                          <div className="space-y-3">
                              <label className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wide">Send Message Shortcut</label>
                              <div className="flex items-center gap-4">
                                  <div 
                                      onClick={() => onUpdateSettings({...settings, sendKey: 'Enter'})}
                                      className={`flex-1 p-3 rounded-lg border cursor-pointer flex items-center justify-between ${settings.sendKey === 'Enter' ? 'border-[var(--text-main)] bg-[var(--bg-elevated)]' : 'border-[var(--border)]'}`}
                                  >
                                      <span className="text-sm font-medium">Enter</span>
                                      <Keyboard className="w-4 h-4 text-[var(--text-dim)]" />
                                  </div>
                                  <div 
                                      onClick={() => onUpdateSettings({...settings, sendKey: 'Ctrl+Enter'})}
                                      className={`flex-1 p-3 rounded-lg border cursor-pointer flex items-center justify-between ${settings.sendKey === 'Ctrl+Enter' ? 'border-[var(--text-main)] bg-[var(--bg-elevated)]' : 'border-[var(--border)]'}`}
                                  >
                                      <span className="text-sm font-medium">Ctrl + Enter</span>
                                      <Keyboard className="w-4 h-4 text-[var(--text-dim)]" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'ai' && (
                  <div className="space-y-8">
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
                          <div>
                              <h3 className="font-medium text-lg mb-1">API Configuration</h3>
                              <p className="text-sm text-[var(--text-dim)]">Manage your API keys to access different models.</p>
                          </div>
                          
                          <div className="space-y-4">
                              <ApiKeyInput 
                                  label="Google Gemini API Key" 
                                  value={settings.apiKeys.gemini}
                                  onChange={(v) => updateApiKey('gemini', v)}
                                  placeholder="AIzaSy..."
                              />
                              <ApiKeyInput 
                                  label="OpenRouter API Key" 
                                  value={settings.apiKeys.openRouter}
                                  onChange={(v) => updateApiKey('openRouter', v)}
                                  placeholder="sk-or-..."
                              />
                              <ApiKeyInput 
                                  label="DeepSeek API Key" 
                                  value={settings.apiKeys.deepSeek}
                                  onChange={(v) => updateApiKey('deepSeek', v)}
                                  placeholder="sk-..."
                              />
                              <ApiKeyInput 
                                  label="Moonshot AI API Key" 
                                  value={settings.apiKeys.moonshot}
                                  onChange={(v) => updateApiKey('moonshot', v)}
                                  placeholder="sk-..."
                              />
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="font-medium mb-2">Model Visibility</h3>
                          <p className="text-xs text-[var(--text-dim)] mb-4">Select which models appear in your selector.</p>
                          
                          <ModelList 
                              title="Google Gemini" 
                              models={GEMINI_MODELS} 
                              visibleModels={settings.visibleModels} 
                              onToggle={toggleModel} 
                          />
                          
                          <ModelList 
                              title="OpenRouter (Free)" 
                              models={OPENROUTER_FREE_MODELS} 
                              visibleModels={settings.visibleModels} 
                              onToggle={toggleModel} 
                          />
                          
                          <ModelList 
                              title="DeepSeek" 
                              models={DEEPSEEK_MODELS} 
                              visibleModels={settings.visibleModels} 
                              onToggle={toggleModel} 
                          />
                          
                          <ModelList 
                              title="Moonshot AI" 
                              models={MOONSHOT_MODELS} 
                              visibleModels={settings.visibleModels} 
                              onToggle={toggleModel} 
                          />
                      </div>
                  </div>
              )}

              {activeTab === 'appearance' && (
                  <div className="space-y-6">
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
                          <h3 className="font-medium mb-4">Theme</h3>
                          <div className="flex gap-4">
                              <div 
                                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                                className={`flex-1 p-4 rounded border cursor-pointer ${settings.theme === 'light' ? 'border-[var(--text-main)] bg-[var(--text-main)] text-[var(--bg-primary)]' : 'border-[var(--border)] hover:bg-[var(--bg-elevated)]'}`}
                              >
                                  <div className="text-center font-medium">Light</div>
                              </div>
                              <div 
                                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                                className={`flex-1 p-4 rounded border cursor-pointer ${settings.theme === 'dark' ? 'border-[var(--text-main)] bg-[var(--bg-elevated)]' : 'border-[var(--border)] hover:bg-[var(--bg-elevated)]'}`}
                              >
                                  <div className="text-center font-medium">Dark</div>
                              </div>
                          </div>
                      </div>
                       <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
                          <h3 className="font-medium mb-4">Accent Color</h3>
                          <div className="flex gap-3">
                              {predefinedColors.map(color => (
                                  <div 
                                    key={color}
                                    onClick={() => onUpdateSettings({ ...settings, accentColor: color })}
                                    className={`w-8 h-8 rounded-full cursor-pointer ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ${settings.accentColor === color ? 'ring-[var(--text-main)]' : 'ring-transparent'}`}
                                    style={{ backgroundColor: color }}
                                  ></div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'labels' && (
                  <div className="space-y-6">
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Manage Labels</h3>
                            <button 
                                onClick={() => setIsAddingLabel(true)}
                                className="text-xs flex items-center gap-1 bg-[var(--bg-elevated)] px-2 py-1 rounded hover:bg-[var(--border)]"
                            >
                                <Plus className="w-3 h-3" /> Add Label
                            </button>
                          </div>
                          
                          {isAddingLabel && (
                              <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                                  <input 
                                    autoFocus
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    placeholder="Label Name"
                                    className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none text-[var(--text-main)]"
                                  />
                                  <button onClick={handleAddLabel} className="text-[#10B981]"><Check className="w-4 h-4" /></button>
                                  <button onClick={() => setIsAddingLabel(false)} className="text-[#EF4444]"><X className="w-4 h-4" /></button>
                              </div>
                          )}

                          <div className="space-y-1">
                              {labels.map(label => (
                                  <div key={label.id} className="flex items-center justify-between p-2 hover:bg-[var(--bg-elevated)] rounded group">
                                      <div className="flex items-center gap-3">
                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }}></div>
                                          <span className="text-sm">{label.name}</span>
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteLabel(label.id)}
                                        className="text-[var(--text-dim)] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};