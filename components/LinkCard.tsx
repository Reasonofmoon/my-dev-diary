import React from 'react';
import { ExternalLink, Trash2, Info, Pin, Pencil } from 'lucide-react';
import { LinkItem, Category, LayoutType } from '../types';
import { getCategoryIcon, COLOR_MAP } from '../constants';
import { formatUrl } from '../utils/url';

interface LinkCardProps {
  link: LinkItem;
  category: Category;
  layout: LayoutType;
  onDelete: (id: string) => void;
  onEdit: (link: LinkItem) => void;
  onTogglePin: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, category, layout, onDelete, onEdit, onTogglePin }) => {
  const normalizedUrl = formatUrl(link.url);

  if (layout === 'list') {
    return (
      <div className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
        <div className={`p-2 rounded-lg shrink-0 ${COLOR_MAP[category.color] || COLOR_MAP.slate}`}>
          {getCategoryIcon(category.icon, "w-4 h-4")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {link.isPinned && <Pin size={12} className="text-amber-500 shrink-0" />}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{link.name}</h3>
          </div>
          <p className="text-xs text-gray-400 truncate font-mono">{link.url}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 hidden sm:block">{category.name}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onTogglePin(link.id)} className={`p-1.5 rounded-md transition-colors ${link.isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}><Pin size={14} /></button>
          <button onClick={() => onEdit(link)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"><Pencil size={14} /></button>
          <button onClick={() => onDelete(link.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={14} /></button>
          <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"><ExternalLink size={14} /></a>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 overflow-hidden h-full flex flex-col min-h-[160px]">
      {link.isPinned && (
        <div className="absolute top-3 left-3 z-20">
          <Pin size={14} className="text-amber-500 fill-amber-500" />
        </div>
      )}

      <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={`Open ${link.name}`} />

      <div className="p-4 flex flex-col flex-1 pointer-events-none">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${COLOR_MAP[category.color] || COLOR_MAP.slate}`}>
            {getCategoryIcon(category.icon, "w-5 h-5")}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate mb-1">{link.name}</h3>
          <p className="text-xs text-gray-400 truncate font-mono">{link.url}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{category.name}</span>
          <div className="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
            Open <ExternalLink size={14} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-3 right-3 z-30 flex gap-1">
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTogglePin(link.id); }} className={`p-1.5 rounded-md pointer-events-auto backdrop-blur-sm transition-colors ${link.isPinned ? 'text-amber-500 bg-amber-50/80 dark:bg-amber-500/20' : 'text-gray-400 bg-white/80 dark:bg-gray-800/80 hover:text-amber-500'}`}><Pin size={14} /></button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(link); }} className="p-1.5 text-gray-400 hover:text-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md pointer-events-auto transition-colors"><Pencil size={14} /></button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(link.id); }} className="p-1.5 text-gray-400 hover:text-red-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md pointer-events-auto transition-colors"><Trash2 size={14} /></button>
      </div>

      {/* Info overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-900/95 p-6 flex flex-col justify-center backdrop-blur-[2px]">
          <div className="flex items-center text-indigo-200 mb-2">
            <Info size={14} className="mr-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">About Resource</span>
          </div>
          <p className="text-white text-xs leading-relaxed line-clamp-5">
            {link.description || "No specific description. Click to visit this developer resource."}
          </p>
          <div className="mt-4 flex items-center text-white/60 text-[10px] font-medium uppercase tracking-tighter">
            Click anywhere to open site <ExternalLink size={10} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
