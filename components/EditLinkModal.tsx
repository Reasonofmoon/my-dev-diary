import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { LinkItem, Category } from '../types';
import { enhanceLinkInfo } from '../services/geminiService';

interface EditLinkModalProps {
    isOpen: boolean;
    link: LinkItem | null;
    categories: Category[];
    onClose: () => void;
    onSave: (updated: LinkItem) => void;
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({ isOpen, link, categories, onClose, onSave }) => {
    const [form, setForm] = useState({ name: '', url: '', description: '', categoryId: 'all' });
    const [isEnhancing, setIsEnhancing] = useState(false);

    useEffect(() => {
        if (link) {
            setForm({ name: link.name, url: link.url, description: link.description, categoryId: link.categoryId });
        }
    }, [link]);

    if (!isOpen || !link) return null;

    const handleEnhance = async () => {
        if (!form.name || !form.url) return;
        setIsEnhancing(true);
        try {
            const { description, categoryId } = await enhanceLinkInfo(form.name, form.url);
            setForm(prev => ({
                ...prev,
                description,
                categoryId: categories.some(c => c.id === categoryId) ? categoryId : prev.categoryId
            }));
        } catch (e) {
            console.error('Enhancement failed', e);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleSave = () => {
        if (!form.name || !form.url) return;
        onSave({ ...link, ...form });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-500/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Resource</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                        <input type="text" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm dark:text-white" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">URL</label>
                        <div className="relative">
                            <input type="text" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm dark:text-white" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                            <button onClick={handleEnhance} disabled={isEnhancing || !form.url || !form.name} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-500/30 disabled:opacity-50">
                                {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Theme</label>
                        <select className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm dark:text-white" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                        <textarea rows={3} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm resize-none dark:text-white" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Cancel</button>
                    <button onClick={handleSave} disabled={!form.name || !form.url} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditLinkModal;
