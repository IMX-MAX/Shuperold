import React from 'react';

export type SessionStatus = 'backlog' | 'todo' | 'needs_review' | 'done' | 'cancelled' | 'archive';
export type SessionMode = 'explore' | 'execute';

export interface Label {
  id: string;
  name: string;
  color: string; // hex code
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  thoughtProcess?: string; // New field for thinking steps
}

export interface Session {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string; // e.g., "0s", "14h"
  category: 'TODAY' | 'YESTERDAY' | 'PREVIOUS';
  status: SessionStatus;
  labelIds: string[];
  isSelected?: boolean;
  hasNewResponse?: boolean; // Notification badge
  isFlagged?: boolean; // New flagged property
  mode?: SessionMode;
}

export interface Agent {
  id: string;
  name: string;
  baseModel: string;
  systemInstruction: string;
  description?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  accentColor: string;
  workspaceName: string;
  visibleModels: string[];
  userName: string;
  timezone: string;
  language: string;
  city: string;
  country: string;
  baseKnowledge: string;
  sendKey: 'Enter' | 'Ctrl+Enter';
  apiKeys: {
      gemini: string;
      openRouter: string;
      deepSeek: string;
      moonshot: string;
  };
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
}

export const OPENROUTER_FREE_MODELS = [
    'arcee-ai/trinity-large-preview:free',
    'stepfun/step-3.5-flash:free',
    'z-ai/glm-4.5-air:free',
    'openai/gpt-oss-120b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'arcee-ai/trinity-mini:free'
];

export const GEMINI_MODELS = [
    'gemini-3-flash-preview', 
    'gemini-3-pro-preview', 
    'gemini-2.0-flash-thinking-exp-01-21', 
    'gemini-1.5-pro'
];

export const DEEPSEEK_MODELS = [
    'deepseek-chat',
    'deepseek-reasoner'
];

export const MOONSHOT_MODELS = [
    'moonshot-v1-8k',
    'moonshot-v1-32k'
];