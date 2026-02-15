import React, { useState, useRef } from 'react';
import { Agent, GEMINI_MODELS, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS } from '../types';
import { Plus, Bot, ChevronRight, Save, Trash2, Edit2, Copy, ChevronDown, ArrowRight, History, Camera, Image as ImageIcon, X, Sparkles, Network, Hexagon, Moon } from 'lucide-react';

interface AgentsViewProps {
  agents: Agent[];
  onCreateAgent: (agent: Agent) => void;
  onDeleteAgent: (id: string) => void;
  onUpdateAgent: (agent: Agent) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({ agents, onCreateAgent, onDeleteAgent, onUpdateAgent }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [agentContextMenu, setAgentContextMenu] = useState<{ x: number, y: number, agentId: string } | null>(null);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [baseModel, setBaseModel] = useState('gemini-3-flash-preview');
  const [instructions, setInstructions] = useState('');
  const [icon, setIcon] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setInstructions('');
    setBaseModel('gemini-3-flash-preview');
    setIcon(undefined);
    setIsCreating(false);
    setEditingAgent(null);
  };

  const handleCreateOrUpdate = () => {
      if (instructions.trim()) {
          const finalName = name.trim() || (editingAgent ? editingAgent.name : "New agent");
          if (editingAgent) {
              onUpdateAgent({
                  ...editingAgent,
                  name: finalName,
                  baseModel,
                  systemInstruction: instructions.trim(),
                  icon
              });
          } else {
              onCreateAgent({
                  id: Date.now().toString(),
                  name: finalName,
                  baseModel,
                  systemInstruction: instructions.trim(),
                  icon
              });
          }
          resetForm();
      }
  };

  const handleEdit = (agent: Agent) => {
      setEditingAgent(agent);
      setName(agent.name);
      setBaseModel(agent.baseModel);
      setInstructions(agent.systemInstruction);
      setIcon(agent.icon);
      setIsCreating(true);
      setAgentContextMenu(null);
  };

  const handleAgentContextMenu = (e: React.MouseEvent, agentId: string) => {
      e.preventDefault();
      setAgentContextMenu({ x: e.clientX, y: e.clientY, agentId });
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => { 
          if (re.target?.result) setIcon(re.target.result as string); 
          e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const getModelLabel = (m: string) => {
      if (m.includes('/')) return m.split('/')[1].split(':')[0];
      return m;
  };

  return (
    <div className="flex-1 flex h-full bg-[var(--bg-primary)] text-[var(--text-main)] font-inter select-none">
      {/* Agent Context Menu */}
      {agentContextMenu && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setAgentContextMenu(null)} />
            <div 
                className="fixed z-[110] w-48 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100 origin-top-left backdrop-blur-md"
                style={{ top: agentContextMenu.y, left: agentContextMenu.x }}
            >
                <div 
                    onClick={() => {
                        const agent = agents.find(a => a.id === agentContextMenu.agentId);
                        if (agent) handleEdit(agent);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer rounded-lg mx-1 transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Agent</span>
                </div>
                <div 
                    onClick={() => {
                        const agent = agents.find(a => a.id === agentContextMenu.agentId);
                        if (agent) {
                            onCreateAgent({
                                ...agent,
                                id: Date.now().toString(),
                                name: `${agent.name} (Copy)`
                            });
                        }
                        setAgentContextMenu(null);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer rounded-lg mx-1 transition-colors"
                >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                </div>
                <div className="h-[1px] bg-[var(--border)] my-1 mx-2" />
                <div 
                    onClick={() => {
                        onDeleteAgent(agentContextMenu.agentId);
                        setAgentContextMenu(null);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 text-red-400 cursor-pointer rounded-lg mx-1 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Agent</span>
                </div>
            </div>
          </>
      )}

      {/* Agents List Sidebar */}
      <div className="w-[300px] border-r border-[var(--border)] flex flex-col bg-[var(--bg-secondary)]/10">
          <div className="h-14 px-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]/30">
              <h2 className="text-sm font-semibold text-[var(--text-main)]">My Agents</h2>
              <button 
                onClick={() => { resetForm(); setIsCreating(true); }}
                className="p-1.5 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                  <Plus className="w-4 h-4" />
              </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {agents.map(agent => (
                  <div 
                    key={agent.id} 
                    onContextMenu={(e) => handleAgentContextMenu(e, agent.id)}
                    onClick={() => handleEdit(agent)}
                    className={`group p-3 rounded-lg hover:bg-[var(--bg-secondary)] border border-transparent transition-all ${editingAgent?.id === agent.id ? 'bg-[var(--bg-elevated)]' : ''}`}
                  >
                      <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                              {agent.icon ? (
                                <img src={agent.icon} className="w-4 h-4 rounded-full object-cover" alt="" />
                              ) : (
                                <Bot className="w-4 h-4 text-[var(--text-muted)]" />
                              )}
                              <span className="font-medium text-[14px] truncate lowercase">{agent.name}</span>
                          </div>
                      </div>
                      <p className="text-xs text-[var(--text-dim)] line-clamp-1">{getModelLabel(agent.baseModel)}</p>
                  </div>
              ))}
              {agents.length === 0 && !isCreating && (
                  <div className="text-center py-12 px-6">
                      <div className="w-12 h-12 bg-[var(--bg-elevated)]/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
                          <Bot className="w-6 h-6 text-[var(--text-dim)]" />
                      </div>
                      <p className="text-[13px] text-[var(--text-dim)] font-medium">No agents created yet.</p>
                      <button onClick={() => setIsCreating(true)} className="mt-4 text-[var(--text-main)] text-xs font-bold uppercase tracking-widest hover:underline">Build One</button>
                  </div>
              )}
          </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
          {isCreating ? (
              <div className="max-w-[800px] mx-auto py-24 px-12 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="mb-12">
                      <div className="flex items-center gap-6 mb-10">
                          {/* Agent Icon Uploader */}
                          <div className="relative group/icon">
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-16 h-16 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center cursor-pointer overflow-hidden transition-all group-hover/icon:border-[var(--text-muted)]"
                              >
                                  {icon ? (
                                    <img src={icon} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-[var(--text-dim)]" />
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center transition-opacity">
                                      <Camera className="w-5 h-5 text-white" />
                                  </div>
                              </div>
                              <input 
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleIconUpload}
                              />
                              {icon && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setIcon(undefined); }}
                                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                          </div>

                          <input 
                             type="text"
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             placeholder="New agent"
                             className="text-4xl font-bold bg-transparent border-none outline-none text-[var(--text-main)] tracking-tight w-full placeholder:opacity-30 focus:ring-0 lowercase"
                          />
                      </div>
                      
                      <div className="space-y-1.5 mb-2">
                          <label className="text-[14px] font-medium text-[var(--text-muted)]">Description</label>
                      </div>

                      {/* Main Input Card - theme-aware background */}
                      <div className="relative bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-[24px] overflow-visible focus-within:border-[var(--text-dim)]/50 transition-colors shadow-sm">
                          <textarea 
                             autoFocus
                             value={instructions}
                             onChange={(e) => {
                               setInstructions(e.target.value);
                               e.target.style.height = 'auto';
                               e.target.style.height = e.target.scrollHeight + 'px';
                             }}
                             placeholder="Add instructions about how this agent will run."
                             className="w-full min-h-[140px] bg-transparent p-6 pb-20 text-[18px] text-[var(--text-main)] placeholder-[var(--text-dim)]/60 focus:outline-none resize-none leading-relaxed"
                          />
                          
                          {/* Bottom Row Actions */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                  <button className="p-2 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
                                      <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--bg-secondary)]/50">
                                          <Plus className="w-4 h-4" />
                                      </div>
                                  </button>
                              </div>

                              <div className="flex items-center gap-4">
                                  <div className="relative">
                                      <button 
                                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                        className="flex items-center gap-2 text-[15px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors py-2 px-3 rounded-xl bg-[var(--bg-secondary)]/50"
                                      >
                                          <span className="truncate max-w-[140px] lowercase">{getModelLabel(baseModel)}</span>
                                          <ChevronDown className="w-4 h-4 opacity-50" />
                                      </button>
                                      
                                      {isModelMenuOpen && (
                                          <div className="absolute bottom-full right-0 mb-3 w-64 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 overflow-y-auto max-h-[400px] custom-scrollbar backdrop-blur-xl">
                                              <div className="px-4 py-1.5 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider sticky top-0 bg-[var(--bg-elevated)]/90 backdrop-blur-md">Google Gemini</div>
                                              {GEMINI_MODELS.map(m => (
                                                  <div 
                                                    key={m} 
                                                    onClick={() => { setBaseModel(m); setIsModelMenuOpen(false); }}
                                                    className="px-4 py-2.5 hover:bg-[var(--bg-secondary)] text-[13px] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors flex items-center gap-2"
                                                  >
                                                      <Sparkles className="w-3 h-3 text-blue-400" />
                                                      <span>{m}</span>
                                                  </div>
                                              ))}

                                              <div className="px-4 py-1.5 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider sticky top-[110px] bg-[var(--bg-elevated)]/90 backdrop-blur-md mt-2 border-t border-[var(--border)]">OpenRouter (Free)</div>
                                              {OPENROUTER_FREE_MODELS.map(m => (
                                                  <div 
                                                    key={m} 
                                                    onClick={() => { setBaseModel(m); setIsModelMenuOpen(false); }}
                                                    className="px-4 py-2.5 hover:bg-[var(--bg-secondary)] text-[13px] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors flex items-center gap-2"
                                                  >
                                                      <Network className="w-3 h-3 text-emerald-400" />
                                                      <span className="truncate">{getModelLabel(m)}</span>
                                                  </div>
                                              ))}

                                              <div className="px-4 py-1.5 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider sticky top-[200px] bg-[var(--bg-elevated)]/90 backdrop-blur-md mt-2 border-t border-[var(--border)]">DeepSeek</div>
                                              {DEEPSEEK_MODELS.map(m => (
                                                  <div 
                                                    key={m} 
                                                    onClick={() => { setBaseModel(m); setIsModelMenuOpen(false); }}
                                                    className="px-4 py-2.5 hover:bg-[var(--bg-secondary)] text-[13px] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors flex items-center gap-2"
                                                  >
                                                      <Hexagon className="w-3 h-3 text-blue-500" />
                                                      <span>{m}</span>
                                                  </div>
                                              ))}

                                              <div className="px-4 py-1.5 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider sticky top-[280px] bg-[var(--bg-elevated)]/90 backdrop-blur-md mt-2 border-t border-[var(--border)]">Moonshot AI</div>
                                              {MOONSHOT_MODELS.map(m => (
                                                  <div 
                                                    key={m} 
                                                    onClick={() => { setBaseModel(m); setIsModelMenuOpen(false); }}
                                                    className="px-4 py-2.5 hover:bg-[var(--bg-secondary)] text-[13px] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors flex items-center gap-2"
                                                  >
                                                      <Moon className="w-3 h-3 text-orange-400" />
                                                      <span>{m}</span>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>

                                  <button 
                                     onClick={handleCreateOrUpdate}
                                     disabled={!instructions.trim()}
                                     className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${instructions.trim() ? 'bg-[var(--text-main)] text-[var(--bg-primary)] hover:scale-105 active:scale-95' : 'bg-[var(--bg-elevated)] text-[var(--text-dim)] cursor-not-allowed border border-[var(--border)]'}`}
                                  >
                                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* My Threads Footer */}
                  <div className="mt-12">
                      <div 
                        onClick={() => setIsCreating(false)}
                        className="inline-flex items-center gap-2 pb-1 cursor-pointer border-b-2 border-[var(--text-main)] group"
                      >
                          <History className="w-4 h-4 text-[var(--text-main)]" />
                          <span className="text-[14px] font-semibold text-[var(--text-main)] group-hover:opacity-80 transition-opacity">My threads</span>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)]">
                  <div className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-[var(--bg-elevated)]/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-xl">
                        <Bot className="w-10 h-10 text-[var(--text-dim)]" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-main)] mb-3">Intelligence Factory</h2>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-8">Select an agent from the left to calibrate its parameters, or build a new specialized model.</p>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="px-8 py-3.5 bg-[var(--text-main)] text-[var(--bg-primary)] font-black rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-black/20"
                    >
                        New Agent
                    </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};