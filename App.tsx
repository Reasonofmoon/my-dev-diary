
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  Loader2,
  X,
  ClipboardList,
  ExternalLink,
  Cloud,
  CloudOff,
  Flame
} from 'lucide-react';
import { LinkItem, Category, TodoItem, SyncStatus } from './types';
import { DEFAULT_CATEGORIES, QUICK_ACCESS_GROUPS } from './constants';
import Sidebar from './components/Sidebar';
import LinkCard from './components/LinkCard';
import TodoPanel from './components/TodoPanel';
import SyncModal from './components/SyncModal';
import { enhanceLinkInfo } from './services/geminiService';
import { formatUrl } from './utils/url';
import {
  saveLinks, loadLinks,
  saveTodos, loadTodos,
  saveCategories, loadCategories,
  checkFirebaseConnection
} from './services/firebaseService';

const App: React.FC = () => {
  // State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Firebase Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const isInitialLoad = useRef(true);

  // Form State
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    description: '',
    categoryId: 'all'
  });

  // Load from Firebase on init (fallback to localStorage)
  useEffect(() => {
    const init = async () => {
      // First load from localStorage as immediate fallback
      const savedLinks = localStorage.getItem('devhub-links');
      const savedCats = localStorage.getItem('devhub-categories');
      const savedTodos = localStorage.getItem('devhub-todos');
      if (savedLinks) setLinks(JSON.parse(savedLinks));
      if (savedCats) setCategories(JSON.parse(savedCats));
      if (savedTodos) setTodos(JSON.parse(savedTodos));

      // Then try Firebase
      const connected = await checkFirebaseConnection();
      if (connected) {
        setIsFirebaseReady(true);
        setSyncStatus('synced');

        const [cloudLinks, cloudTodos, cloudCats] = await Promise.all([
          loadLinks(),
          loadTodos(),
          loadCategories()
        ]);

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

  // Save to localStorage always + Firebase when ready
  const syncToFirebase = useCallback(async (
    currentLinks: LinkItem[],
    currentTodos: TodoItem[],
    currentCategories: Category[]
  ) => {
    // Always save to localStorage
    localStorage.setItem('devhub-links', JSON.stringify(currentLinks));
    localStorage.setItem('devhub-categories', JSON.stringify(currentCategories));
    localStorage.setItem('devhub-todos', JSON.stringify(currentTodos));

    if (!isFirebaseReady) return;

    setSyncStatus('syncing');
    try {
      await Promise.all([
        saveLinks(currentLinks),
        saveTodos(currentTodos),
        saveCategories(currentCategories)
      ]);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, [isFirebaseReady]);

  // Auto-sync on data changes (skip initial load)
  useEffect(() => {
    if (isInitialLoad.current) return;
    syncToFirebase(links, todos, categories);
  }, [links, todos, categories, syncToFirebase]);

  const handleMigrateToCloud = async () => {
    if (!isFirebaseReady) {
      alert('Firebase is not connected. Please check your configuration.');
      return;
    }
    setSyncStatus('syncing');
    try {
      await Promise.all([
        saveLinks(links),
        saveTodos(todos),
        saveCategories(categories)
      ]);
      setSyncStatus('synced');
      alert('All local data has been migrated to Firebase Cloud!');
    } catch {
      setSyncStatus('error');
      alert('Migration failed. Please try again.');
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!isFirebaseReady) {
      alert('Firebase is not connected.');
      return;
    }
    setSyncStatus('syncing');
    const [cloudLinks, cloudTodos, cloudCats] = await Promise.all([
      loadLinks(),
      loadTodos(),
      loadCategories()
    ]);
    if (cloudLinks) setLinks(cloudLinks);
    if (cloudTodos) setTodos(cloudTodos);
    if (cloudCats) setCategories(cloudCats);
    setSyncStatus('synced');
    alert('Data restored from Firebase Cloud!');
  };

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesCategory = selectedCategoryId === 'all' || link.categoryId === selectedCategoryId;
      const matchesSearch = link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [links, selectedCategoryId, searchQuery]);

  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) return;

    const link: LinkItem = {
      id: crypto.randomUUID(),
      ...newLink,
      createdAt: Date.now()
    };

    setLinks(prev => [link, ...prev]);
    setNewLink({ name: '', url: '', description: '', categoryId: 'all' });
    setIsAddingLink(false);
  };

  const handleEnhance = async () => {
    if (!newLink.name || !newLink.url) return;
    setIsEnhancing(true);
    try {
      const { description, categoryId } = await enhanceLinkInfo(newLink.name, newLink.url);
      setNewLink(prev => ({
        ...prev,
        description,
        categoryId: categories.some(c => c.id === categoryId) ? categoryId : 'all'
      }));
    } catch (error) {
      console.error("Enhancement failed", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleAddCategory = () => {
    const name = prompt("Enter theme name:");
    if (!name) return;
    const newCat: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      icon: 'Folder',
      color: 'slate'
    };
    setCategories(prev => [...prev, newCat]);
  };

  // Todo Handlers
  const handleAddTodo = (text: string) => {
    const todo: TodoItem = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now()
    };
    setTodos(prev => [todo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const activeTodoCount = todos.filter(t => !t.completed).length;

  const getSyncLabel = () => {
    switch (syncStatus) {
      case 'synced': return 'FIREBASE SYNCED';
      case 'syncing': return 'SYNCING...';
      case 'error': return 'SYNC ERROR';
      default: return 'OFFLINE';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-indigo-200">
            <Zap size={24} fill="white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            DevHub
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Firebase Sync Status Button */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className={`flex items-center px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all ${syncStatus === 'synced' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                syncStatus === 'syncing' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                  syncStatus === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
                    'bg-gray-100 border-gray-200 text-gray-500'
              }`}
          >
            {syncStatus === 'synced' ? <Flame size={14} className="mr-1.5" /> :
              syncStatus === 'syncing' ? <Loader2 size={14} className="mr-1.5 animate-spin" /> :
                syncStatus === 'error' ? <CloudOff size={14} className="mr-1.5" /> :
                  <Cloud size={14} className="mr-1.5" />}
            {getSyncLabel()}
          </button>

          <div className="relative group hidden md:block text-slate-800">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search apps, urls, or data..."
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsTodoOpen(true)}
            className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Project Tasks"
          >
            <ClipboardList size={22} />
            {activeTodoCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          <button
            onClick={() => setIsAddingLink(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md shadow-indigo-100 font-medium text-sm"
          >
            <Plus size={18} className="mr-1.5" />
            <span className="hidden sm:inline">Add Link</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-screen pt-16">
        <Sidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onAddCategory={handleAddCategory}
        />

        {/* Content Area */}
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Quick Launch Dashboard */}
            {selectedCategoryId === 'all' && (
              <div className="mb-10">
                <div className="flex items-center mb-4">
                  <Sparkles className="text-amber-500 mr-2" size={20} />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Quick Launch Dashboard</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  {QUICK_ACCESS_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <h3 className="text-xs font-bold text-indigo-600 px-1">{group.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.links.map((link) => (
                          <a
                            key={link.name}
                            href={formatUrl(link.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-lg text-xs font-medium text-gray-600 hover:text-indigo-700 transition-all shadow-sm group"
                          >
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

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {categories.find(c => c.id === selectedCategoryId)?.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {filteredLinks.length} items found in this theme
                </p>
              </div>
              <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
                <button className="p-1.5 bg-gray-100 rounded-md text-gray-700 shadow-sm"><LayoutGrid size={18} /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600"><List size={18} /></button>
              </div>
            </div>

            {filteredLinks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLinks.map(link => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    category={categories.find(c => c.id === link.categoryId) || categories[0]}
                    onDelete={handleDeleteLink}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  <Search size={40} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No links found</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">
                  Try adjusting your search or category filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <TodoPanel
        isOpen={isTodoOpen}
        onClose={() => setIsTodoOpen(false)}
        todos={todos}
        onAddTodo={handleAddTodo}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
      />

      {/* Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
        isFirebaseReady={isFirebaseReady}
        onMigrate={handleMigrateToCloud}
        onRestore={handleRestoreFromCloud}
      />

      {/* Add Link Modal */}
      {isAddingLink && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Plus className="mr-2 text-indigo-600" size={20} />
                Add New Resource
              </h3>
              <button onClick={() => setIsAddingLink(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">App / Dataset Name</label>
                <input
                  type="text"
                  placeholder="e.g. User Auth API"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">URL / Endpoint</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://api.example.com/v1"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  />
                  <button
                    onClick={handleEnhance}
                    disabled={isEnhancing || !newLink.url || !newLink.name}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Theme</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={newLink.categoryId}
                    onChange={(e) => setNewLink({ ...newLink, categoryId: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Brief Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this for?"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingLink(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                disabled={!newLink.name || !newLink.url}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md shadow-indigo-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
