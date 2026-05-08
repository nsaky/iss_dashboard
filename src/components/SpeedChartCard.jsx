import React from 'react';
import { Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const SpeedChartCard = ({ data }) => {
  const { speedHistory, isLoading } = data;

  const chartData = {
    labels: speedHistory.map(entry => entry.time),
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: speedHistory.map(entry => entry.speed),
        fill: true,
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 12 },
        bodyFont: { size: 13, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          color: 'rgba(148, 163, 184, 0.5)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 5,
          font: { size: 10 }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.5)',
          font: { size: 10 },
          callback: (value) => `${(value / 1000).toFixed(1)}k`
        }
      }
    }
  };

  return (
    <section className="card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="text-orange-500" size={20} />
          <h2 className="text-xl font-bold">ISS Speed Trend</h2>
        </div>
        {!isLoading && speedHistory.length > 0 && (
          <div className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
            Live Telemetry
          </div>
        )}
      </div>
      
      <div className="flex-1 min-h-[300px] w-full relative">
        {isLoading || speedHistory.length === 0 ? (
          <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse rounded-xl flex items-center justify-center">
            <p className="text-xs font-bold opacity-30 uppercase tracking-tighter">Waiting for data...</p>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </section>
  );
};

export default SpeedChartCard;
