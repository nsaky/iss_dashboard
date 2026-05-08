import { useState, useEffect, useCallback, useRef } from 'react';

// Using a cache-busting timestamp to prevent stale 429 responses
const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';
const ASTROS_API = 'https://api.allorigins.win/get?url=' + encodeURIComponent('http://api.open-notify.org/astros.json');
const UPDATE_INTERVAL = 20000; // 20s for maximum production safety

export const useISS = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astronauts, setAstronauts] = useState({ count: 7, names: [] });
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchISSLocation = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // Adding a dynamic timestamp helps bypass some intermediate caching of 429 errors
      const res = await fetch(`${ISS_API}?t=${Date.now()}`);
      
      if (res.status === 429) {
        console.warn('ISS API Rate limit (429). Retrying in next cycle...');
        return;
      }
      
      if (!res.ok) throw new Error(`ISS Fetch Error: ${res.status}`);
      
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      const velocity = parseFloat(data.velocity);
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
      const json = await res.json();
      const data = JSON.parse(json.contents);
      
      if (data && data.people) {
        setAstronauts({
          count: data.number || 7,
          names: data.people.map((p) => p.name),
        });
      }
    } catch (err) {
      console.error('Error fetching astronauts:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (isMounted) {
        await fetchAstronauts();
        await fetchISSLocation();
      }
    };

    init();
    const intervalId = setInterval(() => {
      if (isMounted) fetchISSLocation();
    }, UPDATE_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchISSLocation, fetchAstronauts]);

  return { currentPosition, trajectory, speedHistory, astronauts, isLoading };
};