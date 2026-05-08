import { useState, useEffect } from 'react';

const CACHE_KEY = 'dashboard_news_cache';
const CACHE_EXPIRY = 900000; // 15 minutes in milliseconds

export const useNews = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check Cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { timestamp, articles } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          console.log('Serving news from cache');
          setNews(articles);
          setIsLoading(false);
          return;
        }
      }

      // 2. Fetch from API
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`News API Error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.results) {
        const topArticles = data.results.slice(0, 10);
        
        // 3. Update State and Cache
        setNews(topArticles);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          articles: topArticles
        }));
      } else {
        throw new Error('No news results found');
      }
    } catch (err) {
      console.error('Fetch News Error:', err);
      setError(err.message);
      
      // Fallback to expired cache if available
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { articles } = JSON.parse(cachedData);
        setNews(articles);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, isLoading, error, refreshNews: fetchNews };
};
