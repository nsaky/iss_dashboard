import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateSpeed } from '../utils/haversine';

// Using WhereTheISS API: HTTPS native, built-in CORS, works in production (Vercel)
const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';
const ASTROS_API = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('http://api.open-notify.org/astros.json');
const UPDATE_INTERVAL = 15000;

export const useISS = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astronauts, setAstronauts] = useState({ count: 0, names: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const isFetchingRef = useRef(false);

  const fetchISSLocation = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const res = await fetch(ISS_API);
      if (!res.ok) throw new Error(`ISS Fetch Error: ${res.status}`);
      
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      const velocity = parseFloat(data.velocity); // km/h
      const newPos = [lat, lng];

      setCurrentPosition(newPos);
      setTrajectory((prev) => [...prev.slice(-49), newPos]);
      setSpeedHistory((prev) => [
        ...prev.slice(-29), 
        { speed: velocity, time: new Date().toLocaleTimeString() }
      ]);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching ISS location:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const fetchAstronauts = useCallback(async () => {
    try {
      const res = await fetch(ASTROS_API);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.people) {
        setAstronauts({
          count: data.number || 0,
          names: data.people.map((p) => p.name),
        });
      }
    } catch (err) {
      console.error('Error fetching astronauts:', err);
    }
  }, []);

  useEffect(() => {
    fetchAstronauts();
    fetchISSLocation();
    const intervalId = setInterval(fetchISSLocation, UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchISSLocation, fetchAstronauts]);

  return { currentPosition, trajectory, speedHistory, astronauts, isLoading };
};