import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, Moon, Sun, LayoutGrid, List, Cloud, Sparkles, ExternalLink, ArrowRight, Command } from 'lucide-react';
import { LinkItem, Category, ThemeMode, LayoutType } from '../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    links: LinkItem[];
    categories: Category[];
    onSelectLink: (url: string) => void;
    onSelectCategory: (id: string) => void;
    onAction: (action: string) => void;
}

interface CommandItem {
    id: string;
    label: string;
    sublabel?: string;
    icon: React.ReactNode;
    type: 'link' | 'action' | 'category';
    onSelect: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen, onClose, links, categories, onSelectLink, onSelectCategory, onAction
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Global keyboard shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onAction('toggle-palette');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onAction]);

    const actions: CommandItem[] = useMemo(() => [
        { id: 'add-link', label: 'Add New Link', icon: <Plus size={16} />, type: 'action', onSelect: () => { onAction('add-link'); onClose(); } },
        { id: 'toggle-theme', label: 'Toggle Dark Mode', icon: <Moon size={16} />, type: 'action', onSelect: () => { onAction('toggle-theme'); onClose(); } },
        { id: 'toggle-layout', label: 'Toggle Grid/List View', icon: <LayoutGrid size={16} />, type: 'action', onSelect: () => { onAction('toggle-layout'); onClose(); } },
        { id: 'sync', label: 'Open Cloud Sync', icon: <Cloud size={16} />, type: 'action', onSelect: () => { onAction('open-sync'); onClose(); } },
        { id: 'todo', label: 'Open Tasks', icon: <Sparkles size={16} />, type: 'action', onSelect: () => { onAction('open-todo'); onClose(); } },
        { id: 'settings', label: 'Open Settings', icon: <Sun size={16} />, type: 'action', onSelect: () => { onAction('open-settings'); onClose(); } },
        { id: 'export', label: 'Export Data (JSON)', icon: <ArrowRight size={16} />, type: 'action', onSelect: () => { onAction('export'); onClose(); } },
        { id: 'import', label: 'Import Data (JSON)', icon: <ArrowRight size={16} className="rotate-180" />, type: 'action', onSelect: () => { onAction('import'); onClose(); } },
    ], [onAction, onClose]);

    const items: CommandItem[] = useMemo(() => {
        const q = query.toLowerCase().trim();
        const result: CommandItem[] = [];

        // Actions
        const filteredActions = actions.filter(a => !q || a.label.toLowerCase().includes(q));
        if (filteredActions.length > 0 && (!q || q.length < 3)) {
            result.push(...filteredActions.slice(0, 4));
        } else if (filteredActions.length > 0) {
            result.push(...filteredActions);
        }

        // Categories
        const filteredCats = categories.filter(c => c.id !== 'all' && (!q || c.name.toLowerCase().includes(q)));
        filteredCats.forEach(cat => {
            result.push({
                id: `cat-${cat.id}`,
                label: cat.name,
                sublabel: 'Category',
                icon: <List size={16} />,
                type: 'category',
                onSelect: () => { onSelectCategory(cat.id); onClose(); }
            });
        });

        // Links
        const filteredLinks = links.filter(l => !q || l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q));
        filteredLinks.slice(0, 10).forEach(link => {
            result.push({
                id: `link-${link.id}`,
                label: link.name,
                sublabel: link.url,
                icon: <ExternalLink size={16} />,
                type: 'link',
                onSelect: () => { onSelectLink(link.url); onClose(); }
            });
        });

        return result;
    }, [query, links, categories, actions, onSelectLink, onSelectCategory, onClose]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].onSelect();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[20vh]" onClick={onClose}>
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Input */}
                <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
                    <Search size={18} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search links, actions..."
                        className="w-full px-3 py-4 bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-80 overflow-y-auto py-2 px-2">
                    {items.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">No results found</div>
                    ) : (
                        items.map((item, i) => (
                            <button
                                key={item.id}
                                onClick={item.onSelect}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${i === selectedIndex
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className={`shrink-0 ${i === selectedIndex ? 'text-indigo-500' : 'text-gray-400'}`}>
                                    {item.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{item.label}</div>
                                    {item.sublabel && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate font-mono">{item.sublabel}</div>
                                    )}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${item.type === 'action' ? 'bg-violet-100 dark:bg-violet-500/10 text-violet-600' :
                                        item.type === 'category' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                    }`}>
                                    {item.type}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[9px]">↑↓</kbd> Navigate</span>
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[9px]">↵</kbd> Select</span>
                    </div>
                    <span className="flex items-center gap-1"><Command size={10} /> <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[9px]">K</kbd> Toggle</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
