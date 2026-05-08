import { useState, useEffect, useRef } from 'react';
import { calculateSpeed } from '../utils/haversine';

// These hit Vite's dev proxy, which forwards to http://api.open-notify.org
const ISS_API = '/api/iss-now';
const ASTROS_API = '/api/astros';
const UPDATE_INTERVAL = 15000; // 15 seconds

export const useISS = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astronauts, setAstronauts] = useState({ count: 0, names: [] });
  const [isLoading, setIsLoading] = useState(true);

  const prevPositionRef = useRef(null); // { lat, lng, timestamp }
  const isFetchingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchAstronauts = async () => {
      try {
        const res = await fetch(ASTROS_API);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data && data.people) {
          setAstronauts({
            count: data.number || 0,
            names: data.people.map((p) => p.name),
          });
        }
      } catch (err) {
        console.error('Astronaut fetch error:', err.message);
      }
    };

    const fetchISS = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const res = await fetch(ISS_API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!isMounted || !data.iss_position) return;

        const lat = parseFloat(data.iss_position.latitude);
        const lng = parseFloat(data.iss_position.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const newPos = [lat, lng];
        const timestamp = data.timestamp;

        // Calculate speed using Haversine if we have a previous position
        if (prevPositionRef.current) {
          const prev = prevPositionRef.current;
          const timeDiff = timestamp - prev.timestamp;

          if (timeDiff > 0) {
            const speed = calculateSpeed(
              { lat: prev.lat, lng: prev.lng },
              { lat, lng },
              timeDiff
            );

            setSpeedHistory((prevHistory) => [
              ...prevHistory.slice(-29),
              { speed, time: new Date().toLocaleTimeString() },
            ]);
          }
        }

        prevPositionRef.current = { lat, lng, timestamp };
        setCurrentPosition(newPos);
        setTrajectory((prev) => [...prev.slice(-49), newPos]);
        setIsLoading(false);
      } catch (err) {
        console.error('ISS fetch error:', err.message);
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Fire immediately on mount
    fetchAstronauts();
    fetchISS();

    // Set up interval
    intervalId = setInterval(fetchISS, UPDATE_INTERVAL);

    // Cleanup
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { currentPosition, trajectory, speedHistory, astronauts, isLoading };
};