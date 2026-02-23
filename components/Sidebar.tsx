
import React from 'react';
import { Plus, Settings, ChevronRight, ExternalLink } from 'lucide-react';
import { Category } from '../types';
import { getCategoryIcon, QUICK_ACCESS_GROUPS } from '../constants';
import { formatUrl } from '../utils/url';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onAddCategory: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory, 
  onAddCategory 
}) => {
  return (
    <div className="w-64 flex flex-col border-r border-gray-200 bg-white h-full fixed left-0 top-0 pt-20 pb-6">
      <div className="px-6 mb-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Themes Section */}
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Themes</h2>
        <div className="space-y-1 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategoryId === cat.id 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${selectedCategoryId === cat.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {getCategoryIcon(cat.icon, "w-4 h-4")}
                </span>
                {cat.name}
              </div>
              {selectedCategoryId === cat.id && <ChevronRight size={14} />}
            </button>
          ))}
          <button 
            onClick={onAddCategory}
            className="flex items-center w-full px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-xs font-semibold mt-2"
          >
            <Plus size={14} className="mr-2" />
            Create Theme
          </button>
        </div>

        {/* Quick Access Section */}
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Access</h2>
        <div className="space-y-6">
          {QUICK_ACCESS_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-bold text-indigo-400 mb-2 px-1">{group.title}</h3>
              <div className="grid grid-cols-1 gap-1">
                {group.links.map((link) => (
                  <a
                    key={link.name}
                    href={formatUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-indigo-50 transition-all text-xs text-gray-600 hover:text-indigo-700"
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-400 group-hover:text-indigo-500 transition-colors">
                        {link.icon}
                      </span>
                      {link.name}
                    </div>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-40" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mt-auto pt-4 border-t border-gray-100">
        <button className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <Settings size={18} className="mr-2" />
          Settings
        </button>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
