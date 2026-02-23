
import React from 'react';
import { ExternalLink, Trash2, Info } from 'lucide-react';
import { LinkItem, Category } from '../types';
import { getCategoryIcon, COLOR_MAP } from '../constants';
import { formatUrl } from '../utils/url';

interface LinkCardProps {
  link: LinkItem;
  category: Category;
  onDelete: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, category, onDelete }) => {
  const normalizedUrl = formatUrl(link.url);

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-indigo-300 overflow-hidden h-full flex flex-col min-h-[160px]">
      {/* 
          OVERLAY ANCHOR 
          This anchor covers the entire card to handle navigation.
          It uses z-index 10 to stay below the delete button (z-30) but above content.
      */}
      <a 
        href={normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
        aria-label={`Open ${link.name}`}
      />

      {/* Card Content (z-0) - pointer-events-none so it doesn't block the anchor */}
      <div className="p-4 flex flex-col flex-1 pointer-events-none">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${COLOR_MAP[category.color] || COLOR_MAP.slate}`}>
            {getCategoryIcon(category.icon, "w-5 h-5")}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate mb-1">
            {link.name}
          </h3>
          <p className="text-xs text-gray-400 truncate font-mono">{link.url}</p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
            {category.name}
          </span>
          <div className="text-indigo-600 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
            Open <ExternalLink size={14} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Delete Button (z-30) - Must explicitly enable pointer-events to be clickable over the anchor */}
      <div className="absolute top-4 right-4 z-30">
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            onDelete(link.id); 
          }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-md bg-white/80 backdrop-blur-sm pointer-events-auto"
          title="Remove Link"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Info Overlay (z-20) - Purely visual with pointer-events disabled */}
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
