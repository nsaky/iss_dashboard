import React from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

const NewsCard = ({ article, index, isExpanded, onToggle, isLoading }) => {
  if (isLoading) {
    return (
      <div className="border border-[var(--border-color)] rounded-xl p-3 flex gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
        <div className="flex-1 space-y-3 py-1">
          <div className="flex justify-between">
            <div className="h-2 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  const { title, source_id, pubDate, image_url, link, description } = article;

  // Format date
  const formattedDate = new Date(pubDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const placeholderImg = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop';

  return (
    <div 
      onClick={onToggle}
      className={`border border-[var(--border-color)] rounded-xl p-3 flex gap-4 transition-all hover:border-blue-500/30 cursor-pointer group ${isExpanded ? 'bg-[var(--bg-main)] ring-1 ring-blue-500/20 shadow-lg' : 'bg-[var(--bg-card)]'}`}
    >
      <div className="w-16 h-16 rounded-lg bg-[var(--bg-main)] flex-shrink-0 relative overflow-hidden">
        <span className="absolute top-1 left-1 z-10 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold">{index}</span>
        <img 
          src={image_url || placeholderImg} 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          onError={(e) => { e.target.src = placeholderImg; }}
        />
      </div>
      
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-blue-500 uppercase tracking-wider truncate mr-2">{source_id}</span>
          <span className="text-[var(--text-muted)] flex-shrink-0">{formattedDate}</span>
        </div>
        <h3 className="text-sm font-bold leading-tight line-clamp-2 text-[var(--text-main)]">
          {title}
        </h3>
        
        {isExpanded && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              {description || 'No description available for this article.'}
            </p>
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors uppercase tracking-wider"
            >
              Read Full Article
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
      
      <div className="flex items-start">
        <ChevronDown 
          size={16} 
          className={`text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} 
        />
      </div>
    </div>
  );
};

export default NewsCard;
