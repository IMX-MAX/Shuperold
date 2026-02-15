import React, { useState } from 'react';
import { Agent, GEMINI_MODELS, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS } from '../types';
import { Plus, Bot, ChevronRight, Save, Trash2, Edit2, Copy } from 'lucide-react';

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
  
  // Form State
  const [name, setName] = useState('');
  const [baseModel, setBaseModel] = useState('gemini-2.0-flash');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setInstructions('');
    setBaseModel('gemini-2.0-flash');
    setIsCreating(false);
    setEditingAgent(null);
  };

  const handleCreateOrUpdate = () => {
      if (name.trim() && instructions.trim()) {
          if (editingAgent) {
              onUpdateAgent({
                  ...editingAgent,
                  name: name.trim(),
                  baseModel,
                  description: description.trim(),
                  systemInstruction: instructions.trim()
              });
          } else {
              onCreateAgent({
                  id: Date.now().toString(),
                  name: name.trim(),
                  baseModel,
                  description: description.trim(),
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
      setDescription(agent.description || '');
      setInstructions(agent.systemInstruction);
      setIsCreating(true);
      setAgentContextMenu(null);
  };

  const handleAgentContextMenu = (e: React.MouseEvent, agentId: string) => {
      e.preventDefault();
      setAgentContextMenu({ x: e.clientX, y: e.clientY, agentId });
  };

  return (
    <div className="flex-1 flex h-full bg-[var(--bg-primary)] text-[var(--text-main)] font-inter">
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
      <div className="w-80 border-r border-[var(--border)] flex flex-col">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[var(--text-main)]">My Agents</h2>
              <button 
                onClick={() => { resetForm(); setIsCreating(true); }}
                className="p-1.5 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                  <Plus className="w-4 h-4" />
              </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {agents.map(agent => (
                  <div 
                    key={agent.id} 
                    onContextMenu={(e) => handleAgentContextMenu(e, agent.id)}
                    onClick={() => handleEdit(agent)}
                    className={`group p-3 rounded-lg hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border)] cursor-pointer transition-all ${editingAgent?.id === agent.id ? 'bg-[var(--bg-secondary)] border-[var(--border)]' : ''}`}
                  >
                      <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-[#A78BFA]" />
                              <span className="font-medium text-sm">{agent.name}</span>
                          </div>
                          <button 
                             onClick={(e) => {
                                 e.stopPropagation();
                                 onDeleteAgent(agent.id);
                             }}
                             className="opacity-0 group-hover:opacity-100 text-[var(--text-dim)] hover:text-[#EF4444]"
                          >
                              <Trash2 className="w-3.5 h-3.5" />
                          </button>
                      </div>
                      <p className="text-xs text-[var(--text-dim)] line-clamp-2">{agent.description || "No description"}</p>
                  </div>
              ))}
              {agents.length === 0 && (
                  <div className="text-center py-8 text-xs text-[var(--text-dim)]">
                      No agents created yet.
                  </div>
              )}
          </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
          {isCreating ? (
              <div className="max-w-2xl mx-auto py-12 px-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-8">
                      <h1 className="text-2xl font-semibold">{editingAgent ? `Edit ${editingAgent.name}` : 'Create New Agent'}</h1>
                  </div>

                  <div className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--text-muted)]">Agent Name</label>
                          <input 
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             placeholder="e.g. Coding Assistant"
                             className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--text-dim)] text-[var(--text-main)]"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--text-muted)]">Base Model</label>
                          <select 
                             value={baseModel}
                             onChange={(e) => setBaseModel(e.target.value)}
                             className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--text-dim)] appearance-none text-[var(--text-main)]"
                          >
                              <optgroup label="Gemini">
                                  {GEMINI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                              </optgroup>
                              <optgroup label="OpenRouter">
                                  {OPENROUTER_FREE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                              </optgroup>
                              <optgroup label="DeepSeek">
                                  {DEEPSEEK_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                              </optgroup>
                              <optgroup label="Moonshot">
                                  {MOONSHOT_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                              </optgroup>
                          </select>
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--text-muted)]">Description</label>
                          <input 
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                             placeholder="What does this agent do?"
                             className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--text-dim)] text-[var(--text-main)]"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--text-muted)]">System Instructions (Prompt)</label>
                          <textarea 
                             value={instructions}
                             onChange={(e) => setInstructions(e.target.value)}
                             placeholder="You are a helpful assistant..."
                             className="w-full h-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--text-dim)] resize-none font-mono text-[var(--text-main)]"
                          />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                          <button 
                             onClick={resetForm}
                             className="px-4 py-2 rounded-lg hover:bg-[var(--bg-elevated)] text-sm text-[var(--text-muted)]"
                          >
                              Cancel
                          </button>
                          <button 
                             onClick={handleCreateOrUpdate}
                             disabled={!name.trim() || !instructions.trim()}
                             className="px-4 py-2 rounded-lg bg-[var(--text-main)] hover:opacity-90 text-[var(--bg-primary)] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                              <Save className="w-4 h-4" />
                              {editingAgent ? 'Update Agent' : 'Create Agent'}
                          </button>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)]">
                  <Bot className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select an agent to edit or create a new one.</p>
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="mt-4 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] text-[var(--text-main)] text-sm transition-colors"
                  >
                      Create New Agent
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};