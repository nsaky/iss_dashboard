import React, { useState, useMemo } from 'react';
import { Radio, Search, ChevronDown, RefreshCcw, AlertCircle } from 'lucide-react';
import NewsCard from './NewsCard';

const NewsGrid = ({ newsData, sourceFilter }) => {
  const { news, isLoading, error, refreshNews } = newsData;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredAndSortedNews = useMemo(() => {
    if (!news) return [];

    return news
      .filter((article) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          article.title?.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query)
        );
        
        const matchesSource = sourceFilter 
          ? article.source_id === sourceFilter 
          : true;

        return matchesSearch && matchesSource;
      })
      .sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [news, searchQuery, sortOrder, sourceFilter]);

  return (
    <section className="card p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Radio className="text-red-500 animate-pulse" size={20} />
          <h2 className="text-xl font-bold">Breaking News</h2>
        </div>
        <button 
          onClick={refreshNews}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--border-color)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, source, author..." 
            className="input-field pl-10"
          />
        </div>
        <div className="relative min-w-[150px]">
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-field appearance-none pr-10 cursor-pointer"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" size={16} />
        </div>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={18} />
          <p>Failed to fetch latest news. Displaying cached content.</p>
        </div>
      )}

      {/* News List */}
      <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar max-h-[600px]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <NewsCard key={i} isLoading={true} />
          ))
        ) : filteredAndSortedNews.length > 0 ? (
          filteredAndSortedNews.map((article, index) => (
            <NewsCard 
              key={article.article_id || index} 
              index={index + 1}
              article={article}
              isLoading={false}
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            />
          ))
        ) : (
          <div className="py-12 text-center">
            <Search size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
            <p className="text-[var(--text-muted)] font-medium">
              No results found for {sourceFilter ? `"${sourceFilter}"` : ''} {searchQuery ? `containing "${searchQuery}"` : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsGrid;
