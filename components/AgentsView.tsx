import React, { useState } from 'react';
import { Agent, GEMINI_MODELS, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS } from '../types';
import { Plus, Bot, ChevronRight, Save, Trash2, Edit2, Copy, ChevronDown, ArrowRight, History } from 'lucide-react';

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

  const resetForm = () => {
    setName('');
    setInstructions('');
    setBaseModel('gemini-3-flash-preview');
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
                  systemInstruction: instructions.trim()
              });
          } else {
              onCreateAgent({
                  id: Date.now().toString(),
                  name: finalName,
                  baseModel,
                  systemInstruction: instructions.trim()
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
      setIsCreating(true);
      setAgentContextMenu(null);
  };

  const handleAgentContextMenu = (e: React.MouseEvent, agentId: string) => {
      e.preventDefault();
      setAgentContextMenu({ x: e.clientX, y: e.clientY, agentId });
  };

  // Simplified model list to match screenshot
  const QUICK_MODELS = [
      'gemini-flash-lite-latest',
      'deepseek-chat',
      'deepseek-reasoner'
  ];

  return (
    <div className="flex-1 flex h-full bg-[var(--bg-primary)] text-[var(--text-main)] font-inter select-none">
      {/* Agent Context Menu */}
      {agentContextMenu && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setAgentContextMenu(null)} />
            <div 
                className="fixed z-[110] w-48 bg-[#1F1F1F] border border-[#333] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                style={{ top: agentContextMenu.y, left: agentContextMenu.x }}
            >
                <div 
                    onClick={() => {
                        const agent = agents.find(a => a.id === agentContextMenu.agentId);
                        if (agent) handleEdit(agent);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1 transition-colors"
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
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1 transition-colors"
                >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                </div>
                <div className="h-[1px] bg-[#2A2A2A] my-1 mx-2" />
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
                              <Bot className="w-4 h-4 text-[var(--text-muted)]" />
                              <span className="font-medium text-[14px] truncate">{agent.name}</span>
                          </div>
                      </div>
                      <p className="text-xs text-[var(--text-dim)] line-clamp-1">{agent.baseModel}</p>
                  </div>
              ))}
              {agents.length === 0 && !isCreating && (
                  <div className="text-center py-12 px-6">
                      <div className="w-12 h-12 bg-[var(--bg-elevated)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
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
                      {/* Name Textbox - as requested */}
                      <input 
                         type="text"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         placeholder="New agent"
                         className="text-4xl font-bold bg-transparent border-none outline-none text-[var(--text-main)] mb-10 tracking-tight w-full placeholder:opacity-30 focus:ring-0"
                      />
                      
                      <div className="space-y-1.5 mb-2">
                          <label className="text-[14px] font-medium text-[var(--text-muted)]">Description</label>
                      </div>

                      {/* Main Input Card */}
                      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-[24px] overflow-visible focus-within:border-[#3A3A3A] transition-colors">
                          <textarea 
                             autoFocus
                             value={instructions}
                             onChange={(e) => {
                               setInstructions(e.target.value);
                               e.target.style.height = 'auto';
                               e.target.style.height = e.target.scrollHeight + 'px';
                             }}
                             placeholder="Add instructions about how this agent will run."
                             className="w-full min-h-[140px] bg-transparent p-6 pb-20 text-[18px] text-[var(--text-main)] placeholder-[#444] focus:outline-none resize-none leading-relaxed"
                          />
                          
                          {/* Bottom Row Actions */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                  <button className="p-2 text-[#666] hover:text-white transition-colors">
                                      <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center">
                                          <Plus className="w-4 h-4" />
                                      </div>
                                  </button>
                              </div>

                              <div className="flex items-center gap-4">
                                  <div className="relative">
                                      <button 
                                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                        className="flex items-center gap-1.5 text-[15px] font-medium text-[#888] hover:text-white transition-colors py-2 px-3 rounded-xl"
                                      >
                                          <span className="truncate max-w-[120px]">{baseModel === 'gemini-3-flash-preview' ? 'Model' : baseModel}</span>
                                          <ChevronDown className="w-4 h-4" />
                                      </button>
                                      
                                      {isModelMenuOpen && (
                                          <div className="absolute bottom-full right-0 mb-3 w-64 bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                                              {QUICK_MODELS.map(m => (
                                                  <div 
                                                    key={m} 
                                                    onClick={() => { setBaseModel(m); setIsModelMenuOpen(false); }}
                                                    className="px-4 py-2.5 hover:bg-[#222] text-[13px] text-[#A1A1A1] hover:text-white cursor-pointer transition-colors"
                                                  >
                                                      {m}
                                                  </div>
                                              ))}
                                              <div className="h-[1px] bg-[#2A2A2A] my-1 mx-2" />
                                              <div className="px-4 py-2 text-[10px] font-bold text-[#444] uppercase tracking-widest">More</div>
                                              {GEMINI_MODELS.filter(m => !QUICK_MODELS.includes(m)).map(m => (
                                                   <div 
                                                   key={m} 
                                                   onClick={() => { setBaseModel(m); setIsModelMenuOpen(false); }}
                                                   className="px-4 py-2.5 hover:bg-[#222] text-[13px] text-[#A1A1A1] hover:text-white cursor-pointer transition-colors"
                                                 >
                                                     {m}
                                                 </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>

                                  {/* Mic button removed as per 'X' edit */}

                                  <button 
                                     onClick={handleCreateOrUpdate}
                                     disabled={!instructions.trim()}
                                     className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${instructions.trim() ? 'bg-white text-black hover:scale-105 active:scale-95' : 'bg-[#222] text-[#444] cursor-not-allowed'}`}
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
                        className="inline-flex items-center gap-2 pb-1 cursor-pointer border-b-2 border-white/80 group"
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
                        className="px-8 py-3.5 bg-white text-black font-black rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-black/20"
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