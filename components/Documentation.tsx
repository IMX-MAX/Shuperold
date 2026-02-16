import React, { useState } from 'react';
import { Book, Code, Shield, Terminal, ChevronRight, ListTodo, GraduationCap, Microscope, Bot, ToggleRight, Settings, PlusCircle, CheckCircle2, Layout, Archive } from 'lucide-react';
import { HandDrawnUnderline, HandDrawnHighlight, HandDrawnArrow, HandDrawnCircle } from './HandDrawn';

const docs = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: <Book className="w-4 h-4" />,
    content: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight inline-block relative z-10">
            What is Shuper?
            <HandDrawnUnderline className="text-black/20 w-[120%] -left-[10%]" />
          </h1>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Shuper is a privacy-first, local-execution AI workspace. Unlike standard AI chatbots that process your logic on their servers, Shuper runs the application logic entirely in your browser.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield className="w-24 h-24" />
                </div>
                <h3 className="font-bold text-lg mb-2 relative z-10">Core Philosophy</h3>
                <p className="text-gray-600 relative z-10">
                    We believe you shouldn't have to choose between a great UI and data sovereignty. Shuper gives you the best of both worlds.
                </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-center text-center">
                 <p className="text-gray-500 italic font-mono text-sm">
                    "Your prompts stay yours. Your keys stay yours."
                 </p>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Terminal className="w-4 h-4" />,
    content: (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Setup Guide</h1>
            <p className="text-lg text-gray-600">
            Get started in under two minutes. No login or onboarding required.
            </p>
        </div>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="group relative bg-white border border-gray-200 hover:border-black/50 transition-all duration-300 rounded-2xl p-6 shadow-sm">
            <div className="absolute -left-3 top-6 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">1</div>
            <div className="pl-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    Get an API Key
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide border border-gray-200">Required</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  We recommend <strong>OpenRouter</strong> for the best experience as it gives access to the widest range of models.
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
                    <li>Go to <a href="https://openrouter.ai/" target="_blank" className="text-blue-600 hover:underline">openrouter.ai</a> and sign up or sign in.</li>
                    <li>Navigate to the Keys section and generate a new key.</li>
                    <li>Copy the key (starts with <code>sk-or-</code>).</li>
                </ol>
                <div className="flex gap-4 text-sm">
                    <a href="https://openrouter.ai/" target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline font-medium bg-blue-50 px-3 py-1.5 rounded-lg">
                        Go to OpenRouter
                    </a>
                </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group relative bg-white border border-gray-200 hover:border-black/50 transition-all duration-300 rounded-2xl p-6 shadow-sm">
            <div className="absolute -left-3 top-6 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">2</div>
            <div className="pl-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    Enter Keys in Settings
                    <Settings className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="space-y-2 text-gray-600">
                    <p>1. Click the gear icon <Settings className="w-3 h-3 inline mx-1" /> in the bottom left of the app.</p>
                    <p>2. Select the <strong>AI</strong> tab.</p>
                    <p>3. Paste your key into the OpenRouter field.</p>
                </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group relative bg-white border border-gray-200 hover:border-black/50 transition-all duration-300 rounded-2xl p-6 shadow-sm">
            <div className="absolute -left-3 top-6 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">3</div>
            <div className="pl-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    Enable Your Models
                    <ToggleRight className="w-4 h-4 text-green-500" />
                </h3>
                <p className="text-gray-600 mb-4">
                    Adding a key does not automatically enable models. You must:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                    <li>Select a <strong>Default Model</strong> from the dropdown.</li>
                    <li>Scroll down and toggle <span className="text-green-600 font-bold">ON</span> any other models you want to appear in your quick-select menu.</li>
                </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="group relative bg-white border-2 border-black transition-all duration-300 rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
             <div className="absolute -top-3 -right-3">
                <HandDrawnCircle className="w-12 h-12 text-red-500 animate-pulse" />
             </div>
            <div className="absolute -left-3 top-6 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">4</div>
            <div className="pl-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    Start Chatting
                    <Layout className="w-4 h-4 text-gray-400" />
                </h3>
                <p className="text-gray-600 mb-4">
                    Choose one of the three modes to begin:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-bold text-black block mb-1">Explore</span>
                        <span className="text-xs text-gray-500">Standard, quick conversational AI. Best for general queries.</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-bold text-black block mb-1">Execute</span>
                        <span className="text-xs text-gray-500">Thinking AI mode designed for complex tasks.</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-bold text-black block mb-1">Council</span>
                        <span className="text-xs text-gray-500">Multi-agent mode. Cite multiple models at once.</span>
                    </div>
                </div>
                
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                    <Archive className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        <strong>Pro Tip:</strong> Keep your workspace clean by <span className="font-bold">Archiving</span> chats you're done with. They'll be hidden from the main list but accessible in the "All Sessions" view under Archive.
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'statuses',
    title: 'Workflows & Statuses',
    icon: <ListTodo className="w-4 h-4" />,
    content: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Chat Workflows</h1>
          <p className="text-lg text-gray-600">
            In Shuper, a chat isn't just a conversation—it's a unit of work. 
            You can tag each chat with a status to track its lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Lifecycle Statuses</h3>
            <ul className="space-y-3">
               <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"><span className="w-3 h-3 rounded-full bg-gray-400"></span> <strong>Backlog</strong> – Ideas and future tasks</li>
               <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"><span className="w-3 h-3 rounded-full bg-blue-500"></span> <strong>Todo</strong> – Ready to start</li>
               <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> <strong>In Progress</strong> – Active research/coding</li>
               <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"><span className="w-3 h-3 rounded-full bg-purple-500"></span> <strong>Needs Review</strong> – AI summarizing findings</li>
               <li className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"><span className="w-3 h-3 rounded-full bg-green-500"></span> <strong>Done</strong> – Completed and archived</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
             {/* Decorative background */}
             <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <ListTodo className="w-32 h-32" />
             </div>
            <h3 className="font-bold text-lg mb-4">Project Tracking</h3>
            <p className="text-gray-600 mb-4 text-sm">Visualize progress for complex subjects by organizing chats as tree structures.</p>
            <div className="font-mono text-sm space-y-2 bg-gray-50 p-4 rounded border border-gray-200 shadow-inner">
               <div className="font-bold">Project: "Organic Chemistry"</div>
               <div className="pl-4 text-green-600 flex items-center gap-2"><span>├──</span> Topic 1: Bonding (Done)</div>
               <div className="pl-4 text-orange-500 flex items-center gap-2"><span>├──</span> Topic 2: Reactions (Review)</div>
               <div className="pl-4 text-blue-500 flex items-center gap-2"><span>├──</span> Topic 3: Mechanisms (Todo)</div>
               <div className="pl-4 text-gray-400 flex items-center gap-2"><span>└──</span> Topic 4: Synthesis (Backlog)</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Powerful Organization</h3>
          <div className="bg-black text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
             
             <h4 className="font-mono text-xs text-gray-400 mb-6 uppercase tracking-wider border-b border-white/20 pb-2">Example Workflow</h4>
             <ol className="space-y-4 text-sm md:text-base relative z-10">
               <li className="flex gap-4 items-start">
                 <span className="font-mono text-gray-500 mt-1">01</span>
                 <span>Create chat labeled <span className="text-yellow-400 font-medium">"Organic Chemistry"</span> with status <span className="text-gray-400 font-medium">"Backlog"</span></span>
               </li>
               <li className="flex gap-4 items-start">
                 <span className="font-mono text-gray-500 mt-1">02</span>
                 <span>Assign to custom <span className="text-blue-300 font-medium">"Study Agent"</span></span>
               </li>
               <li className="flex gap-4 items-start">
                 <span className="font-mono text-gray-500 mt-1">03</span>
                 <span>When finished, move to <span className="text-green-400 font-medium">"Done"</span></span>
               </li>
               <li className="flex gap-4 items-start pt-4 border-t border-white/10 mt-2">
                 <span className="font-mono text-gray-500 mt-1">{'->'}</span>
                 <span><strong>Filter:</strong> "Show all Done chats from Study Agent in Organic Chemistry" to generate a study guide.</span>
               </li>
             </ol>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: <Shield className="w-4 h-4" />,
    content: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Architecture</h1>
        
        <div className="p-8 bg-green-50 border border-green-100 rounded-2xl relative overflow-hidden">
             <div className="absolute top-4 right-4">
                 <CheckCircle2 className="w-6 h-6 text-green-600" />
             </div>
             <p className="text-xl text-green-900 font-medium leading-relaxed">
               Shuper is designed to be trustless. You don't need to trust us with your data because we never see it.
             </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
                <h3 className="text-xl font-bold mt-4 mb-2 flex items-center gap-2">
                    <span className="w-2 h-8 bg-black rounded-full"></span>
                    Where is my data?
                </h3>
                <p className="text-gray-600 pl-4 border-l border-gray-200 ml-1">
                All conversations, folders, tags, and agent configurations are stored in <strong>IndexedDB</strong> within your web browser. 
                </p>
            </div>
            <div className="group">
                <h3 className="text-xl font-bold mt-4 mb-2 flex items-center gap-2">
                    <span className="w-2 h-8 bg-black rounded-full"></span>
                    Backup Policy
                </h3>
                <p className="text-gray-600 pl-4 border-l border-gray-200 ml-1">
                If you clear your browser data, you lose your chats. We recommend using the "Export" feature regularly to back up your workspace.
                </p>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    icon: <Code className="w-4 h-4" />,
    content: (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Tutorials</h1>
            <p className="text-lg text-gray-600">
                Master the advanced features of Shuper to unlock productivity superpowers.
            </p>
        </div>

        {/* Tutorial: Create Agent */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-black/50 transition-all duration-300 group">
            <div className="bg-gray-50 p-6 border-b border-gray-200 group-hover:bg-white transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Bot className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="text-xl font-bold">Creating Custom Agents</h3>
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider self-start md:self-auto border border-blue-200">Core Feature</span>
                </div>
                <p className="text-gray-600">Stop repeating yourself. Create a specialized persona (e.g., "Python Expert") that remembers your preferences.</p>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Open Agents Panel</h4>
                        <p className="text-gray-600 text-sm">In the left sidebar, click the <span className="font-mono bg-gray-100 px-1 rounded text-xs">Agents</span> icon (robot face). This opens your agent library.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Create New Agent</h4>
                        <p className="text-gray-600 text-sm">Click the <span className="font-bold"><PlusCircle className="w-3 h-3 inline" /> Create Agent</span> button. Give your agent a name like "Code Refactorer".</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Define System Instructions</h4>
                        <p className="text-gray-600 text-sm mb-2">This is the most important part. Tell the AI how to behave.</p>
                        <div className="bg-gray-800 text-gray-200 p-3 rounded-lg font-mono text-xs shadow-inner">
                            "You are a Senior React Engineer. You prefer functional components and TypeScript. Always explain your code with comments."
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tutorial 1: Agent Council */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-black/50 transition-all duration-300 group">
            <div className="bg-gray-50 p-6 border-b border-gray-200 group-hover:bg-white transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <GraduationCap className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="text-xl font-bold">Building an Agent Council</h3>
                    </div>
                    <span className="inline-block bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider self-start md:self-auto">Advanced</span>
                </div>
                <p className="text-gray-600">Orchestrate a debate between two AI personas to refine a solution or critique code.</p>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Create a New Council Session</h4>
                        <p className="text-gray-600 text-sm">Click the <span className="font-mono bg-gray-100 px-1 rounded">New Chat</span> button. In the chat header, select <span className="font-mono bg-gray-100 px-1 rounded">Council</span> mode.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Configure Your Agents</h4>
                        <p className="text-gray-600 text-sm mb-3">Configure two slots with opposing goals:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="p-3 bg-blue-50 rounded border border-blue-100">
                                <div className="font-bold text-blue-900 text-xs uppercase mb-1">Agent A (The Builder)</div>
                                <p className="text-xs text-blue-800 italic">"You are an optimistic software architect..."</p>
                             </div>
                             <div className="p-3 bg-red-50 rounded border border-red-100">
                                <div className="font-bold text-red-900 text-xs uppercase mb-1">Agent B (The Critic)</div>
                                <p className="text-xs text-red-800 italic">"You are a senior security engineer..."</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tutorial 2: Research Workflow */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-black/50 transition-all duration-300 group">
            <div className="bg-gray-50 p-6 border-b border-gray-200 group-hover:bg-white transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                         <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Microscope className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="text-xl font-bold">Deep Research Workflows</h3>
                    </div>
                    <span className="inline-block bg-gray-200 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider self-start md:self-auto border border-gray-300">Beginner</span>
                </div>
                <p className="text-gray-600">Using the 'Explore' mode and tagging system to deep dive into academic topics efficiently.</p>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Initialize Explore Mode</h4>
                        <p className="text-gray-600 text-sm">Ensure you are in <span className="font-mono bg-gray-100 px-1 rounded">Explore</span> mode. This optimizes the system prompt for broad information gathering.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Tagging & Status</h4>
                        <p className="text-gray-600 text-sm">
                           Add a tag like <span className="font-mono bg-gray-100 px-1 rounded">#thesis</span> and set status to <span className="font-mono bg-blue-100 text-blue-800 px-1 rounded">In Progress</span>.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                        <h4 className="font-bold mb-1 text-base">Exporting Insights</h4>
                        <p className="text-gray-600 text-sm">
                           Pin key messages and use <strong>Export Pinned Messages</strong> to create a summary document.
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    )
  }
];

export const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState(docs[0].id);

  const activeContent = docs.find(d => d.id === activeTab)?.content;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 py-12">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h4 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Documentation</h4>
              <nav className="space-y-1">
                {docs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      activeTab === item.id 
                        ? 'bg-black text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {item.title}
                    {activeTab === item.id && <ChevronRight className="w-3 h-3 ml-auto animate-in fade-in" />}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
                <p className="font-bold text-black mb-1">Need help?</p>
                <p>Join the discussion on GitHub.</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[600px]">
             <div className="prose prose-lg max-w-none">
                {activeContent}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};