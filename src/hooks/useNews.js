import { useState, useEffect } from 'react';

export const useNews = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async (force = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      
      // If no API key is present (common in fresh deployments), throw error early
      if (!apiKey) {
        throw new Error('API Key missing. Please check environment variables.');
      }

      const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`News API Error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.results) {
        const topArticles = data.results.slice(0, 10);
        setNews(topArticles);
      } else {
        throw new Error('No news results found');
      }
    } catch (err) {
      console.error('Fetch News Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, isLoading, error, refreshNews: () => fetchNews(true) };
};
