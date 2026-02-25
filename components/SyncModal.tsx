import React from 'react';
import { X, Flame, CloudOff, Database, Upload, Download, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { SyncStatus } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  isFirebaseReady: boolean;
  onMigrate: () => void;
  onRestore: () => void;
}

const SyncModal: React.FC<SyncModalProps> = ({
  isOpen, onClose, syncStatus, isFirebaseReady, onMigrate, onRestore
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-orange-50/50 dark:bg-orange-500/5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Flame className="mr-2 text-orange-500" size={20} />
            Firebase Cloud Sync
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`flex items-center p-4 rounded-xl border ${isFirebaseReady
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
              : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
            }`}>
            {isFirebaseReady ? (
              <>
                <CheckCircle2 className="text-emerald-500 mr-3 shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">Connected to Firebase</p>
                  <p className="text-emerald-600 dark:text-emerald-500 text-xs mt-0.5">
                    Status: {syncStatus === 'synced' ? '✅ All data synced' :
                      syncStatus === 'syncing' ? '🔄 Syncing...' :
                        syncStatus === 'error' ? '⚠️ Sync error' : '📴 Offline'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="text-red-500 mr-3 shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Firebase Not Connected</p>
                  <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">
                    Add VITE_FIREBASE_* variables to .env.local
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
              <Database size={14} className="mr-2" /> Cloud Operations
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={onMigrate}
                disabled={!isFirebaseReady}
                className="flex items-center justify-center w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:text-orange-600 rounded-xl transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={16} className="mr-2" />
                Push Local Data to Cloud
              </button>
              <button
                onClick={onRestore}
                disabled={!isFirebaseReady}
                className="flex items-center justify-center w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 rounded-xl transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} className="mr-2" />
                Restore From Cloud
              </button>
            </div>
          </div>

          <div className="flex items-center text-[11px] text-gray-400 bg-blue-50/50 dark:bg-blue-500/5 p-3 rounded-lg border border-blue-100 dark:border-blue-500/20">
            <Info size={14} className="mr-2 text-blue-500 shrink-0" />
            Data automatically syncs to Firebase Firestore on every change.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
