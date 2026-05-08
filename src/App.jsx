import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Sun, Moon, FilterX } from 'lucide-react';

// Import hooks
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';

// Import components
import ISSTrackingCard from './components/ISSTrackingCard';
import SpeedChartCard from './components/SpeedChartCard';
import NewsGrid from './components/NewsGrid';
import NewsDistributionCard from './components/NewsDistributionCard';
import ChatbotUI from './components/ChatbotUI';

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const issData = useISS();
  const newsData = useNews();
  const [newsSourceFilter, setNewsSourceFilter] = useState('');

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-blue-500 font-bold text-xs tracking-widest uppercase mb-1">
            Mission Control Dashboard
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Real-Time ISS and News Intelligence
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {newsSourceFilter && (
            <button
              onClick={() => setNewsSourceFilter('')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold hover:bg-blue-500/20 transition-all"
            >
              <FilterX size={14} />
              <span>Filter: {newsSourceFilter}</span>
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:shadow-md transition-all text-sm font-medium"
          >
            {theme === 'light' ? (
              <>
                <Moon size={16} className="text-slate-700" />
                <span>Switch to Dark</span>
              </>
            ) : (
              <>
                <Sun size={16} className="text-yellow-400" />
                <span>Switch to Light</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Left: ISS Tracking (Large) */}
        <div className="lg:col-span-8">
          <ISSTrackingCard data={issData} />
        </div>

        {/* Top Right: Speed Trend (Medium) */}
        <div className="lg:col-span-4">
          <SpeedChartCard data={issData} />
        </div>

        {/* Bottom Left: News Grid (Large) */}
        <div className="lg:col-span-8">
          <NewsGrid newsData={newsData} sourceFilter={newsSourceFilter} />
        </div>

        {/* Bottom Right: News Sources (Small/Medium) */}
        <div className="lg:col-span-4">
          <NewsDistributionCard 
            news={newsData.news} 
            isLoading={newsData.isLoading} 
            onSourceClick={setNewsSourceFilter} 
            currentFilter={newsSourceFilter}
          />
        </div>

      </div>

      <footer className="mt-12 text-center text-[var(--text-muted)] text-xs border-top border-[var(--border-color)] pt-8">
        <p>&copy; 2026 ISS Mission Control Dashboard • Real-time Data Intelligence</p>
      </footer>

      {/* Floating Chatbot */}
      <ChatbotUI issData={issData} newsData={newsData} />
    </div>
  );
};

export default App;
