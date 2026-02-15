import React, { useState, useRef } from 'react';
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
  Wrench,
  Zap,
  Image as ImageIcon,
  Camera,
  ArrowUp,
  ListTodo,
  Shield,
  Smartphone,
  Layers,
  MousePointer2,
  Lock,
  Menu,
  Brain
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
    placeholder,
    description
}: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void,
    placeholder: string,
    description?: string
}) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">{label}</label>
                {description && <span className="text-[10px] text-[var(--accent)] font-bold opacity-80">{description}</span>}
            </div>
            <div className="relative flex items-center group">
                <div className="absolute left-3 text-[var(--text-dim)] group-focus-within:text-[var(--text-muted)] transition-colors">
                    <Shield className="w-3.5 h-3.5" />
                </div>
                <input 
                    type={isVisible ? "text" : "password"} 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder={placeholder} 
                    className="w-full bg-[var(--bg-elevated)]/50 border border-[var(--border)] rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-[var(--text-muted)] text-[var(--text-main)] placeholder-[var(--text-dim)] transition-all" 
                />
                <button 
                    onClick={() => setIsVisible(!isVisible)} 
                    className="absolute right-3 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
                >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

const ModelList = ({ title, models, visibleModels, onToggle }: { title: string, models: string[], visibleModels: string[], onToggle: (model: string) => void }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-secondary)]/30">
            <div 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elevated)]/50 transition-colors"
            >
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-[var(--text-muted)]">{title}</h4>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-dim)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />}
            </div>
            {isExpanded && (
                <div className="p-1 space-y-0.5">
                    {models.map(model => (
                        <div 
                            key={model} 
                            onClick={() => onToggle(model)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--bg-elevated)]/50 transition-all cursor-pointer group"
                        >
                            <span className="text-[13px] font-medium truncate max-w-[80%] text-[var(--text-muted)] group-hover:text-[var(--text-main)]">{model}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${visibleModels.includes(model) ? 'bg-[var(--accent)]/40' : 'bg-[var(--bg-elevated)]'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${visibleModels.includes(model) ? 'left-4.5 bg-[var(--accent)] shadow-sm' : 'left-0.5 bg-[var(--text-dim)]'}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, labels, onUpdateLabels, onClearData, onRepairWorkspace }) => {
  const [activeTab, setActiveTab] = useState('ai');
  const [newLabelName, setNewLabelName] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const predefinedColors = ['#A1A1A1', '#737373', '#525252', '#3B82F6', '#2563EB', '#1D4ED8'];

  const sidebarItems = [
    { id: 'ai', title: 'AI', subtitle: 'Model, thinking, connections', icon: Zap },
    { id: 'appearance', title: 'Appearance', subtitle: 'Theme, font, tool icons', icon: Palette },
    { id: 'input', title: 'Input', subtitle: 'Send key, spell check', icon: Keyboard },
    { id: 'workspace', title: 'Workspace', subtitle: 'Name, icon, working directory', icon: Briefcase },
    { id: 'permissions', title: 'Permissions', subtitle: 'Explore mode rules', icon: Shield },
    { id: 'labels', title: 'Labels', subtitle: 'Manage session labels', icon: Tag },
    { id: 'shortcuts', title: 'Shortcuts', subtitle: 'Keyboard shortcuts', icon: Keyboard },
    { id: 'preferences', title: 'Preferences', subtitle: 'User preferences', icon: MousePointer2 },
  ];

  const handleAddLabel = () => {
      if(newLabelName.trim()) {
          const color = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
          onUpdateLabels([...labels, { id: Date.now().toString(), name: newLabelName.trim(), color }]);
          setNewLabelName('');
          setIsAddingLabel(false);
      }
  };

  const updateApiKey = (provider: keyof UserSettings['apiKeys'], value: string) => {
      onUpdateSettings({ ...settings, apiKeys: { ...settings.apiKeys, [provider]: value } });
  };

  const toggleModel = (model: string) => {
      const newVisible = settings.visibleModels.includes(model) ? settings.visibleModels.filter(m => m !== model) : [...settings.visibleModels, model];
      onUpdateSettings({ ...settings, visibleModels: newVisible });
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => { if (re.target?.result) onUpdateSettings({ ...settings, workspaceIcon: re.target.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const ShortcutItem = ({ keys, label }: { keys: string[], label: string }) => (
    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl group transition-all hover:border-[var(--text-dim)]">
        <span className="text-[13px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{label}</span>
        <div className="flex gap-1.5">
            {keys.map((k, i) => (
                <React.Fragment key={i}>
                    <kbd className="min-w-[28px] px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-[10px] font-bold text-[var(--text-main)] shadow-sm flex items-center justify-center uppercase tracking-tighter">{k}</kbd>
                    {i < keys.length - 1 && <span className="text-[var(--text-dim)] font-bold self-center text-[10px]">+</span>}
                </React.Fragment>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex-1 flex h-full bg-[var(--bg-primary)] text-[var(--text-main)] font-inter">
      <div className="w-[300px] border-r border-[var(--border)] flex flex-col bg-[var(--bg-secondary)]/20">
         <div className="h-14 flex items-center justify-center border-b border-[var(--border)]">
           <span className="font-bold text-sm text-white">Settings</span>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {sidebarItems.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    className={`flex items-start gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                        activeTab === item.id 
                            ? 'bg-[#1D1E22] text-white' 
                            : 'text-[#8E8E93] hover:bg-[var(--bg-elevated)]/40 hover:text-white'
                    }`}
                >
                    <item.icon className="w-5 h-5 mt-0.5 opacity-80" />
                    <div>
                        <div className="text-[14px] font-semibold leading-tight">{item.title}</div>
                        <div className="text-[11px] font-medium text-[#525252] mt-0.5">{item.subtitle}</div>
                    </div>
                </div>
            ))}
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto py-16 px-8">
              <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-2 capitalize">{activeTab}</h1>
                <p className="text-[13px] text-[var(--text-dim)] font-medium">Configure system {activeTab} parameters.</p>
              </div>

              {activeTab === 'ai' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8 space-y-8">
                          <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg tracking-tight">API Infrastructure</h3>
                              <div className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold border border-[var(--accent)]/20 uppercase tracking-widest">Encrypted</div>
                          </div>
                          <div className="space-y-6">
                              <div className="p-6 rounded-2xl bg-[var(--bg-elevated)]/20 border border-[var(--border)] space-y-6">
                                  <h4 className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em]">OpenRouter Gateway</h4>
                                  <ApiKeyInput label="Standard Primary" value={settings.apiKeys.openRouter} onChange={(v) => updateApiKey('openRouter', v)} placeholder="sk-or-v1-..." />
                                  <ApiKeyInput label="Secondary Failover" value={settings.apiKeys.openRouterAlt} onChange={(v) => updateApiKey('openRouterAlt', v)} placeholder="sk-or-v1-..." description="Active Redundancy" />
                              </div>
                              <ApiKeyInput label="DeepSeek Research" value={settings.apiKeys.deepSeek} onChange={(v) => updateApiKey('deepSeek', v)} placeholder="sk-..." />
                              <ApiKeyInput label="Moonshot AI (Kimi)" value={settings.apiKeys.moonshot} onChange={(v) => updateApiKey('moonshot', v)} placeholder="sk-..." />
                          </div>
                      </div>
                      <div className="space-y-4">
                          <h3 className="font-bold text-lg mb-1 tracking-tight px-2">Model Ecosystem</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <ModelList title="Google DeepMind" models={GEMINI_MODELS} visibleModels={settings.visibleModels} onToggle={toggleModel} />
                            <ModelList title="OpenRouter (Free Tier)" models={OPENROUTER_FREE_MODELS} visibleModels={settings.visibleModels} onToggle={toggleModel} />
                            <ModelList title="DeepSeek Research" models={DEEPSEEK_MODELS} visibleModels={settings.visibleModels} onToggle={toggleModel} />
                            <ModelList title="Moonshot Kimi" models={MOONSHOT_MODELS} visibleModels={settings.visibleModels} onToggle={toggleModel} />
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'appearance' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8">
                          <h3 className="font-bold text-lg mb-6 tracking-tight">Interface Theme</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div onClick={() => onUpdateSettings({ ...settings, theme: 'light' })} className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-4 ${settings.theme === 'light' ? 'border-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--accent)] shadow-inner' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]/50'}`}>
                                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200" /> <span className="text-[13px] font-bold">Lumina</span>
                              </div>
                              <div onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })} className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-4 ${settings.theme === 'dark' ? 'border-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--accent)] shadow-inner' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]/50'}`}>
                                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800" /><span className="text-[13px] font-bold">Midnight</span>
                              </div>
                          </div>
                      </div>
                      <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8">
                          <h3 className="font-bold text-lg mb-6 tracking-tight">Accent Spectrum</h3>
                          <div className="flex flex-wrap gap-4">
                              {predefinedColors.map(color => (
                                  <div key={color} onClick={() => onUpdateSettings({ ...settings, accentColor: color })} className={`w-10 h-10 rounded-2xl cursor-pointer transition-all border-4 ${settings.accentColor === color ? 'border-white/20 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: color }} />
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'input' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8 space-y-8">
                          <div><h3 className="font-bold text-lg mb-1 tracking-tight">Submit Interaction</h3><p className="text-[13px] text-[var(--text-muted)]">Configure how you send messages.</p></div>
                          <div className="grid grid-cols-2 gap-4">
                              <div onClick={() => onUpdateSettings({...settings, sendKey: 'Enter'})} className={`p-5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${settings.sendKey === 'Enter' ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] shadow-inner' : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'}`}><span className="text-[13px] font-bold">Enter</span><Keyboard className="w-4 h-4 opacity-50" /></div>
                              <div onClick={() => onUpdateSettings({...settings, sendKey: 'Ctrl+Enter'})} className={`p-5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${settings.sendKey === 'Ctrl+Enter' ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] shadow-inner' : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'}`}><span className="text-[13px] font-bold">Ctrl + Enter</span><Keyboard className="w-4 h-4 opacity-50" /></div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'workspace' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
                      <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8 space-y-8">
                          <div className="flex items-start justify-between">
                            <div><h3 className="font-bold text-lg mb-1 tracking-tight">Identity</h3><p className="text-[13px] text-[var(--text-muted)]">Set your workspace branding.</p></div>
                            <div onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center cursor-pointer overflow-hidden group transition-all">
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleIconUpload} />
                                {settings.workspaceIcon ? <img src={settings.workspaceIcon} alt="Icon" className="w-full h-full object-cover group-hover:opacity-40" /> : <ImageIcon className="w-6 h-6 text-[var(--text-dim)]" />}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Camera className="w-5 h-5 text-white" /></div>
                            </div>
                          </div>
                          <div className="space-y-4">
                              <div className="space-y-1.5"><label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Workspace Name</label><input value={settings.workspaceName} onChange={(e) => onUpdateSettings({...settings, workspaceName: e.target.value})} className="w-full bg-[var(--bg-elevated)]/50 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-muted)] text-[var(--text-main)]" /></div>
                          </div>
                      </div>
                      <div className="pt-4 flex flex-col gap-3">
                          <button onClick={onRepairWorkspace} className="w-full px-6 py-4 bg-[var(--bg-elevated)] hover:bg-[var(--border)] text-[var(--text-muted)] border border-[var(--border)] rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2"><Wrench className="w-4 h-4" />Repair Space</button>
                          <button onClick={onClearData} className="w-full px-6 py-4 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/20 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" />Purge Archive</button>
                      </div>
                  </div>
              )}

              {activeTab === 'permissions' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                       <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8 space-y-6">
                          <div><h3 className="font-bold text-lg mb-1 tracking-tight">System Knowledge</h3><p className="text-[13px] text-[var(--text-muted)]">Global context injected into every session.</p></div>
                          <textarea value={settings.baseKnowledge} onChange={(e) => onUpdateSettings({...settings, baseKnowledge: e.target.value})} placeholder="e.g. Always respond with technical precision..." className="w-full h-48 bg-[var(--bg-elevated)]/50 border border-[var(--border)] rounded-2xl px-5 py-5 text-[14px] focus:outline-none focus:border-[var(--text-muted)] text-[var(--text-main)] resize-none" />
                      </div>
                  </div>
              )}

              {activeTab === 'shortcuts' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                       <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8 space-y-6">
                          <div className="grid grid-cols-1 gap-3">
                              <ShortcutItem keys={['Alt', 'N']} label="Initialize New Session" />
                              <ShortcutItem keys={['Alt', 'S']} label="Search Workspace" />
                              <ShortcutItem keys={['Alt', 'P']} label="System Settings" />
                              <ShortcutItem keys={['Alt', 'A']} label="Switch Operation Mode" />
                              <ShortcutItem keys={['Alt', 'T']} label="Toggle Task Panel" />
                              <ShortcutItem keys={['ArrowUp']} label="Edit Previous Message" />
                          </div>
                       </div>
                  </div>
              )}

              {activeTab === 'labels' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8">
                          <div className="flex items-center justify-between mb-10">
                              <h3 className="font-bold text-lg mb-1 tracking-tight">Taxonomy</h3>
                              <button onClick={() => setIsAddingLabel(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                                  <Plus className="w-4 h-4" /> 
                                  Add Label
                              </button>
                          </div>
                          {isAddingLabel && (
                              <div className="flex items-center gap-3 mb-8 p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--text-muted)]/20 animate-in fade-in zoom-in-95">
                                  <input autoFocus value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Label Name" className="flex-1 bg-transparent text-[var(--text-main)] text-sm focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()} />
                                  <div className="flex gap-2"><button onClick={handleAddLabel} className="p-2 text-emerald-500 rounded-xl hover:bg-emerald-500/10"><Check className="w-4 h-4" /></button><button onClick={() => setIsAddingLabel(false)} className="p-2 text-red-500 rounded-xl hover:bg-red-500/10"><X className="w-4 h-4" /></button></div>
                              </div>
                          )}
                          <div className="space-y-1.5">
                              {labels.map(label => (
                                  <div key={label.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-elevated)]/40 rounded-2xl group transition-all border border-transparent hover:border-[var(--border)]">
                                      <div className="flex items-center gap-4">
                                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: label.color }} />
                                          <span className="text-[14px] font-semibold text-[var(--text-muted)] group-hover:text-white">{label.name}</span>
                                      </div>
                                      <button onClick={() => onUpdateLabels(labels.filter(l => l.id !== label.id))} className="text-[var(--text-dim)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-950/20 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'preferences' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-3xl p-8 space-y-6">
                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">User Handle</label><input value={settings.userName} onChange={(e) => onUpdateSettings({...settings, userName: e.target.value})} className="w-full bg-[var(--bg-elevated)]/50 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-muted)] text-[var(--text-main)]" /></div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};