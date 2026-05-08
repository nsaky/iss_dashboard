import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default marker icons in React/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Utility component to handle dynamic map panning
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
};

const ISSTrackingCard = ({ data }) => {
  const { currentPosition, trajectory, speedHistory, astronauts } = data || {};

  const isInitializing = !currentPosition || !Array.isArray(currentPosition) || currentPosition.length < 2;

  // Safely extract speed
  let currentSpeed = 'Calculating...';
  if (Array.isArray(speedHistory) && speedHistory.length > 0) {
    const last = speedHistory[speedHistory.length - 1];
    if (last && typeof last.speed === 'number' && !isNaN(last.speed)) {
      currentSpeed = `${last.speed.toFixed(2)} km/h`;
    }
  }

  // Safely extract position strings
  let latLonDisplay = '---';
  if (!isInitializing) {
    latLonDisplay = `${currentPosition[0].toFixed(3)}, ${currentPosition[1].toFixed(3)}`;
  }

  const astroCount = astronauts?.count ?? 0;
  const pathPoints = Array.isArray(trajectory) ? trajectory.length : 0;

  return (
    <section className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Globe className="text-blue-500" size={20} />
          <h2 className="text-xl font-bold">ISS Live Tracking</h2>
        </div>
        <div className="flex gap-2">
          <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
            isInitializing 
              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
              : 'bg-green-500/10 text-green-500 border-green-500/20'
          }`}>
            {isInitializing ? 'Connecting...' : '● Live'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox label="Latitude / Longitude" value={latLonDisplay} isLoading={isInitializing} />
        <StatBox label="Estimated Speed" value={currentSpeed} isLoading={isInitializing} />
        <StatBox label="Astronauts Onboard" value={String(astroCount)} isLoading={false} />
        <StatBox label="Path Points" value={String(pathPoints)} isLoading={false} />
      </div>

      {/* Map Area */}
      <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-900 rounded-xl border border-[var(--border-color)] overflow-hidden relative z-0">
        {isInitializing ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-[var(--text-muted)] animate-pulse uppercase tracking-widest">
              Initializing Tracking...
            </p>
          </div>
        ) : (
          <MapContainer 
            center={currentPosition} 
            zoom={3} 
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={currentPosition} />
            <Polyline positions={trajectory} color="#ef4444" weight={3} opacity={0.6} dashArray="5, 10" />
            <RecenterAutomatically lat={currentPosition[0]} lng={currentPosition[1]} />
          </MapContainer>
        )}
      </div>
    </section>
  );
};

const StatBox = ({ label, value, isLoading }) => (
  <div className="stat-box">
    <p className="text-[10px] uppercase font-bold text-blue-500/70 tracking-wider mb-1">{label}</p>
    {isLoading ? (
      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
    ) : (
      <p className="text-sm font-bold truncate">{value}</p>
    )}
  </div>
);

export default ISSTrackingCard;
