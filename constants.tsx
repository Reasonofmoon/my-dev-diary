
import React from 'react';
import { 
  Folder, 
  Database, 
  Globe, 
  Code, 
  Server, 
  Layout, 
  Smartphone, 
  Cpu, 
  Layers,
  Sparkles,
  Github as GithubIcon,
  Cpu as AIBox,
  Search,
  BookOpen,
  Calendar,
  HardDrive,
  MessageSquare
} from 'lucide-react';

export const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Links', icon: 'Layers', color: 'blue' },
  { id: 'frontend', name: 'Frontend', icon: 'Layout', color: 'indigo' },
  { id: 'backend', name: 'Backend', icon: 'Server', color: 'emerald' },
  { id: 'data', name: 'Data & DB', icon: 'Database', color: 'amber' },
  { id: 'docs', name: 'Documentation', icon: 'Globe', color: 'rose' },
  { id: 'apis', name: 'APIs', icon: 'Code', color: 'violet' },
];

export const QUICK_ACCESS_GROUPS = [
  {
    title: 'LLM Models',
    links: [
      { name: 'Gemini', url: 'https://gemini.google.com', icon: <Sparkles size={14}/> },
      { name: 'ChatGPT', url: 'https://chatgpt.com', icon: <MessageSquare size={14}/> },
      { name: 'Claude', url: 'https://claude.ai', icon: <AIBox size={14}/> },
      { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: <Search size={14}/> },
    ]
  },
  {
    title: 'Platforms',
    links: [
      { name: 'GitHub', url: 'https://github.com', icon: <GithubIcon size={14}/> },
      { name: 'Hugging Face', url: 'https://huggingface.co', icon: <Cpu size={14}/> },
    ]
  },
  {
    title: 'Google Tools',
    links: [
      { name: 'Google', url: 'https://google.com', icon: <Search size={14}/> },
      { name: 'NotebookLM', url: 'https://notebooklm.google', icon: <BookOpen size={14}/> },
      { name: 'AI Studio', url: 'https://aistudio.google.com', icon: <Sparkles size={14}/> },
      { name: 'Calendar', url: 'https://calendar.google.com', icon: <Calendar size={14}/> },
      { name: 'Drive', url: 'https://drive.google.com', icon: <HardDrive size={14}/> },
    ]
  }
];

export const getCategoryIcon = (iconName: string, className?: string) => {
  switch (iconName) {
    case 'Layers': return <Layers className={className} />;
    case 'Layout': return <Layout className={className} />;
    case 'Server': return <Server className={className} />;
    case 'Database': return <Database className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Code': return <Code className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    default: return <Folder className={className} />;
  }
};

export const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 border-blue-200',
  indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  amber: 'bg-amber-100 text-amber-600 border-amber-200',
  rose: 'bg-rose-100 text-rose-600 border-rose-200',
  violet: 'bg-violet-100 text-violet-600 border-violet-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};
