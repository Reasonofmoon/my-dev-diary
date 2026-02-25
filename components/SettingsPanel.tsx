import React from 'react';
import { X, Moon, Sun, Monitor } from 'lucide-react';
import { ThemeMode } from '../types';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    theme: ThemeMode;
    onThemeChange: (theme: ThemeMode) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, theme, onThemeChange }) => {
    if (!isOpen) return null;

    const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
        { value: 'light', label: 'Light', icon: <Sun size={16} /> },
        { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
        { value: 'system', label: 'System', icon: <Monitor size={16} /> },
    ];

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Appearance</label>
                        <div className="grid grid-cols-3 gap-2">
                            {themes.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => onThemeChange(t.value)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${theme === t.value
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    {t.icon}
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-4">
                        DevHub v2.0 — Firebase Edition
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
