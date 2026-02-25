
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus, Search, LayoutGrid, List, Sparkles, Zap, Loader2, X,
  ClipboardList, ExternalLink, Cloud, CloudOff, Flame, Menu
} from 'lucide-react';
import { LinkItem, Category, TodoItem, SyncStatus, LayoutType, ThemeMode } from './types';
import { DEFAULT_CATEGORIES, QUICK_ACCESS_GROUPS } from './constants';
import Sidebar from './components/Sidebar';
import LinkCard from './components/LinkCard';
import TodoPanel from './components/TodoPanel';
import SyncModal from './components/SyncModal';
import EditLinkModal from './components/EditLinkModal';
import SettingsPanel from './components/SettingsPanel';
import { useToast } from './components/Toast';
import { enhanceLinkInfo } from './services/geminiService';
import { formatUrl } from './utils/url';
import {
  saveLinks, loadLinks,
  saveTodos, loadTodos,
  saveCategories, loadCategories,
  checkFirebaseConnection
} from './services/firebaseService';

const App: React.FC = () => {
  // Data State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // UI State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Modal State
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  // Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const isInitialLoad = useRef(true);

  // Form State
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '', categoryId: 'all' });

  const { showToast } = useToast();

  // ─── Theme ─────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem('devhub-theme') as ThemeMode | null;
    if (savedTheme) setTheme(savedTheme);
    const savedLayout = localStorage.getItem('devhub-layout') as LayoutType | null;
    if (savedLayout) setLayout(savedLayout);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('devhub-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('devhub-layout', layout);
  }, [layout]);

  // ─── Init ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const savedLinks = localStorage.getItem('devhub-links');
      const savedCats = localStorage.getItem('devhub-categories');
      const savedTodos = localStorage.getItem('devhub-todos');
      if (savedLinks) setLinks(JSON.parse(savedLinks));
      if (savedCats) setCategories(JSON.parse(savedCats));
      if (savedTodos) setTodos(JSON.parse(savedTodos));

      const connected = await checkFirebaseConnection();
      if (connected) {
        setIsFirebaseReady(true);
        setSyncStatus('synced');
        const [cloudLinks, cloudTodos, cloudCats] = await Promise.all([loadLinks(), loadTodos(), loadCategories()]);
        if (cloudLinks && cloudLinks.length > 0) setLinks(cloudLinks);
        if (cloudTodos && cloudTodos.length > 0) setTodos(cloudTodos);
        if (cloudCats && cloudCats.length > 0) setCategories(cloudCats);
      } else {
        setSyncStatus('offline');
      }
      isInitialLoad.current = false;
    };
    init();
  }, []);

  // ─── Sync ──────────────────────────────────────────────
  const syncToFirebase = useCallback(async (cl: LinkItem[], ct: TodoItem[], cc: Category[]) => {
    localStorage.setItem('devhub-links', JSON.stringify(cl));
    localStorage.setItem('devhub-categories', JSON.stringify(cc));
    localStorage.setItem('devhub-todos', JSON.stringify(ct));
    if (!isFirebaseReady) return;
    setSyncStatus('syncing');
    try {
      await Promise.all([saveLinks(cl), saveTodos(ct), saveCategories(cc)]);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, [isFirebaseReady]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    syncToFirebase(links, todos, categories);
  }, [links, todos, categories, syncToFirebase]);

  // ─── Handlers ──────────────────────────────────────────
  const handleMigrate = async () => {
    if (!isFirebaseReady) { showToast('Firebase not connected', 'error'); return; }
    setSyncStatus('syncing');
    try {
      await Promise.all([saveLinks(links), saveTodos(todos), saveCategories(categories)]);
      setSyncStatus('synced');
      showToast('Data migrated to Firebase Cloud!', 'success');
    } catch { setSyncStatus('error'); showToast('Migration failed', 'error'); }
  };

  const handleRestore = async () => {
    if (!isFirebaseReady) { showToast('Firebase not connected', 'error'); return; }
    setSyncStatus('syncing');
    const [cl, ct, cc] = await Promise.all([loadLinks(), loadTodos(), loadCategories()]);
    if (cl) setLinks(cl);
    if (ct) setTodos(ct);
    if (cc) setCategories(cc);
    setSyncStatus('synced');
    showToast('Data restored from Cloud!', 'success');
  };

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesCat = selectedCategoryId === 'all' || link.categoryId === selectedCategoryId;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || link.name.toLowerCase().includes(q) || link.url.toLowerCase().includes(q) || link.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  }, [links, selectedCategoryId, searchQuery]);

  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) return;
    const link: LinkItem = { id: crypto.randomUUID(), ...newLink, isPinned: false, createdAt: Date.now() };
    setLinks(prev => [link, ...prev]);
    setNewLink({ name: '', url: '', description: '', categoryId: 'all' });
    setIsAddingLink(false);
    showToast(`Added "${link.name}"`, 'success');
  };

  const handleEnhance = async () => {
    if (!newLink.name || !newLink.url) return;
    setIsEnhancing(true);
    try {
      const { description, categoryId } = await enhanceLinkInfo(newLink.name, newLink.url);
      setNewLink(prev => ({ ...prev, description, categoryId: categories.some(c => c.id === categoryId) ? categoryId : 'all' }));
      showToast('AI enhanced!', 'success');
    } catch { showToast('Enhancement failed', 'error'); }
    finally { setIsEnhancing(false); }
  };

  const handleDeleteLink = (id: string) => {
    const name = links.find(l => l.id === id)?.name;
    setLinks(prev => prev.filter(l => l.id !== id));
    showToast(`Deleted "${name}"`, 'info');
  };

  const handleEditLink = (updated: LinkItem) => {
    setLinks(prev => prev.map(l => l.id === updated.id ? updated : l));
    showToast(`Updated "${updated.name}"`, 'success');
  };

  const handleTogglePin = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, isPinned: !l.isPinned } : l));
  };

  const handleAddCategory = () => {
    const name = prompt("Enter theme name:");
    if (!name) return;
    const newCat: Category = { id: name.toLowerCase().replace(/\s+/g, '-'), name, icon: 'Folder', color: 'slate' };
    setCategories(prev => [...prev, newCat]);
    showToast(`Created "${name}" theme`, 'success');
  };

  const handleAddTodo = (text: string) => { setTodos(prev => [{ id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() }, ...prev]); };
  const handleToggleTodo = (id: string) => { setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)); };
  const handleDeleteTodo = (id: string) => { setTodos(prev => prev.filter(t => t.id !== id)); };

  const activeTodoCount = todos.filter(t => !t.completed).length;
  const getSyncLabel = () => {
    switch (syncStatus) {
      case 'synced': return 'SYNCED';
      case 'syncing': return 'SYNCING';
      case 'error': return 'ERROR';
      default: return 'OFFLINE';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-30 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-2 text-gray-500 hover:text-gray-800 dark:text-gray-400">
            <Menu size={22} />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-indigo-200 dark:shadow-indigo-500/20">
            <Zap size={24} fill="white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">DevHub</h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <button onClick={() => setIsSyncModalOpen(true)}
            className={`flex items-center px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all ${syncStatus === 'synced' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/30 text-orange-600' :
                syncStatus === 'syncing' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/30 text-amber-600' :
                  syncStatus === 'error' ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/30 text-red-600' :
                    'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
              }`}
          >
            {syncStatus === 'synced' ? <Flame size={14} className="mr-1.5" /> :
              syncStatus === 'syncing' ? <Loader2 size={14} className="mr-1.5 animate-spin" /> :
                syncStatus === 'error' ? <CloudOff size={14} className="mr-1.5" /> :
                  <Cloud size={14} className="mr-1.5" />}
            {getSyncLabel()}
          </button>

          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-sm w-52 lg:w-64 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none text-gray-800 dark:text-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <button onClick={() => setIsTodoOpen(true)} className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all" title="Tasks">
            <ClipboardList size={22} />
            {activeTodoCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />}
          </button>

          <button onClick={() => setIsAddingLink(true)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md font-medium text-sm">
            <Plus size={18} className="mr-1.5" />
            <span className="hidden sm:inline">Add Link</span>
          </button>
        </div>
      </header>

      {/* Mobile search */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm outline-none text-gray-800 dark:text-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen pt-16 md:pt-16">
        <Sidebar categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} onAddCategory={handleAddCategory} onOpenSettings={() => setIsSettingsOpen(true)} isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Quick Launch */}
            {selectedCategoryId === 'all' && (
              <div className="mb-10">
                <div className="flex items-center mb-4">
                  <Sparkles className="text-amber-500 mr-2" size={20} />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Quick Launch</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  {QUICK_ACCESS_GROUPS.map(group => (
                    <div key={group.title} className="space-y-3">
                      <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-1">{group.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.links.map(link => (
                          <a key={link.name} href={formatUrl(link.url)} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all shadow-sm group">
                            <span className="mr-2 opacity-70 group-hover:scale-110 transition-transform">{link.icon}</span>
                            {link.name}
                            <ExternalLink size={10} className="ml-1.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {categories.find(c => c.id === selectedCategoryId)?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{filteredLinks.length} items</p>
              </div>
              <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                <button onClick={() => setLayout('grid')} className={`p-1.5 rounded-md transition-all ${layout === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white shadow-sm' : 'text-gray-400'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setLayout('list')} className={`p-1.5 rounded-md transition-all ${layout === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white shadow-sm' : 'text-gray-400'}`}><List size={18} /></button>
              </div>
            </div>

            {filteredLinks.length > 0 ? (
              <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6' : 'flex flex-col gap-2'}>
                {filteredLinks.map(link => (
                  <LinkCard key={link.id} link={link} layout={layout} category={categories.find(c => c.id === link.categoryId) || categories[0]} onDelete={handleDeleteLink} onEdit={setEditingLink} onTogglePin={handleTogglePin} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4"><Search size={40} /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No links found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2">Try adjusting your search or category filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Panels & Modals */}
      <TodoPanel isOpen={isTodoOpen} onClose={() => setIsTodoOpen(false)} todos={todos} onAddTodo={handleAddTodo} onToggleTodo={handleToggleTodo} onDeleteTodo={handleDeleteTodo} />
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} syncStatus={syncStatus} isFirebaseReady={isFirebaseReady} onMigrate={handleMigrate} onRestore={handleRestore} />
      <EditLinkModal isOpen={!!editingLink} link={editingLink} categories={categories} onClose={() => setEditingLink(null)} onSave={handleEditLink} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} onThemeChange={setTheme} />

      {/* Add Link Modal */}
      {isAddingLink && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-500/5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center"><Plus className="mr-2 text-indigo-600" size={20} />Add New Resource</h3>
              <button onClick={() => setIsAddingLink(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                <input type="text" placeholder="e.g. User Auth API" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm dark:text-white" value={newLink.name} onChange={e => setNewLink({ ...newLink, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">URL</label>
                <div className="relative">
                  <input type="text" placeholder="https://..." className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm dark:text-white" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
                  <button onClick={handleEnhance} disabled={isEnhancing || !newLink.url || !newLink.name} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-lg disabled:opacity-50">
                    {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Theme</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm dark:text-white" value={newLink.categoryId} onChange={e => setNewLink({ ...newLink, categoryId: e.target.value })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea rows={3} placeholder="What is this for?" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm resize-none dark:text-white" value={newLink.description} onChange={e => setNewLink({ ...newLink, description: e.target.value })} />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
              <button onClick={() => setIsAddingLink(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Cancel</button>
              <button onClick={handleAddLink} disabled={!newLink.name || !newLink.url} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50">Save Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
