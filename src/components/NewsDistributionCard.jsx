import React, { useMemo } from 'react';
import { PieChart, RotateCcw } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const NewsDistributionCard = ({ news, onSourceClick, isLoading, currentFilter }) => {
  
  const distributionData = useMemo(() => {
    if (!news || news.length === 0) return { labels: [], datasets: [] };

    const counts = news.reduce((acc, article) => {
      const source = article.source_id || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: 'Articles',
          data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // blue
            'rgba(16, 185, 129, 0.8)', // green
            'rgba(249, 115, 22, 0.8)', // orange
            'rgba(139, 92, 246, 0.8)', // purple
            'rgba(239, 68, 68, 0.8)',  // red
            'rgba(234, 179, 8, 0.8)',  // yellow
            'rgba(20, 184, 166, 0.8)', // teal
            'rgba(236, 72, 153, 0.8)', // pink
          ],
          borderColor: 'transparent',
          hoverOffset: 10,
          cutout: '70%',
          borderRadius: 4,
        },
      ],
    };
  }, [news]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onSourceClick) {
        const index = elements[0].index;
        const sourceName = distributionData.labels[index];
        onSourceClick(sourceName);
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: 'rgba(148, 163, 184, 0.8)', // slate-400 equivalent
          font: {
            size: 10,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 13, weight: 'bold' },
      },
    },
  };

  return (
    <section className="card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieChart className="text-purple-500" size={20} />
          <h2 className="text-xl font-bold">News Sources</h2>
        </div>
        {currentFilter ? (
          <button 
            onClick={() => onSourceClick('')}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded-full transition-all border border-blue-500/20 active:scale-95"
          >
            <RotateCcw size={12} />
            Show All
          </button>
        ) : (
          !isLoading && news.length > 0 && (
            <div className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded">
              Click slice to filter
            </div>
          )
        )}
      </div>

      <div className="flex-1 min-h-[300px] w-full relative">
        {isLoading || news.length === 0 ? (
          <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse rounded-xl flex items-center justify-center">
            <p className="text-xs font-bold opacity-30 uppercase tracking-tighter">Analyzing sources...</p>
          </div>
        ) : (
          <Doughnut data={distributionData} options={options} />
        )}
      </div>
    </section>
  );
};

export default NewsDistributionCard;
