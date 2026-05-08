import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Trash2 } from 'lucide-react';
import { HfInference } from '@huggingface/inference';

const STORAGE_KEY = 'dashboard_chat_history';
const MAX_MESSAGES = 30;
const MODEL = 'meta-llama/Llama-3.2-1B-Instruct';

const ChatbotUI = ({ issData, newsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Hello! I'm your Dashboard Assistant. Ask me anything about the ISS or today's news.", sender: 'bot', timestamp: new Date().toISOString() }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Initialize Hugging Face Client
  const hf = new HfInference(import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_AI_TOKEN);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  const buildContextString = () => {
    const { currentPosition, speedHistory, astronauts } = issData;
    const pos = currentPosition ? `Lat ${currentPosition[0].toFixed(2)}, Lon ${currentPosition[1].toFixed(2)}` : 'Unknown';
    const latestSpeed = speedHistory.length > 0 ? `${speedHistory[speedHistory.length - 1].speed.toFixed(2)} km/h` : 'Calculating';
    
    const newsItems = newsData.news.slice(0, 5).map((n, i) => `${i + 1}. ${n.title}`).join(' | ');

    return `CURRENT DASHBOARD DATA:
ISS POSITION: ${pos}
ISS SPEED: ${latestSpeed}
ASTRONAUT COUNT: ${astronauts.count}
TOP NEWS HEADLINES: [${newsItems}]`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const context = buildContextString();
      
      // Using chatCompletion (conversational task) which Llama 3.2 expects
      const response = await hf.chatCompletion({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are a specialized Dashboard Assistant. Use the following LIVE DATA to answer user questions. 
            RULES:
            1. Use ONLY the data provided.
            2. If information is missing, say "I can only answer based on dashboard data."
            3. Be concise and professional.
            
            ${context}` 
          },
          ...messages.slice(-5).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: "user", content: userText }
        ],
        max_tokens: 150,
        temperature: 0.1,
      });

      const aiResponse = response.choices[0].message.content;

      const botMsg = {
        id: Date.now() + 1,
        text: aiResponse.trim(),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('AI Error:', err);
      
      // Fallback for specific provider errors or if chatCompletion is not available
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I encountered an error processing your request. This usually happens if the AI provider is busy or the model task is mismatched. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear your chat history?')) {
      const initialMsg = [{ id: 1, text: "History cleared. How can I help you today?", sender: 'bot', timestamp: new Date().toISOString() }];
      setMessages(initialMsg);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <h3 className="text-sm font-bold leading-none">Mission Assistant</h3>
                <p className="text-[10px] opacity-80 mt-1">Online • Powered by Llama 3.2</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={clearChat} className="p-1 hover:bg-white/10 rounded transition-colors" title="Clear Chat">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg-main)]/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the ISS or news..."
              className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-slate-700 rotate-90' : 'bg-blue-600'
        }`}
      >
        {isOpen ? <X className="text-white" size={24} /> : <MessageSquare className="text-white" size={24} />}
      </button>
    </div>
  );
};

export default ChatbotUI;
