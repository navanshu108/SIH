import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Leaf, Loader2, AlertCircle } from 'lucide-react';

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        if (res.status === 429) {
          // Throttled, wait and retry
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

export default function AgriRecoverChatbot() {
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      text: 'Hello! I am the Agri-Recover AI Assistant. I can help you identify crop diseases, suggest recovery methods, and provide farming advice. How can I help you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    // API Key is automatically provided by the environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    try {
      // Map local message history to the format expected by the Gemini API
      const history = newMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const payload = {
        contents: history,
        systemInstruction: {
          parts: [{ 
            text: "You are an agricultural expert AI assistant for a platform called Agri-Recover. Your goal is to help farmers and agricultural workers identify crop diseases, suggest organic and chemical recovery methods, provide general farming advice, and promote sustainable agriculture. Be polite, knowledgeable, concise, and practical in your advice." 
          }]
        }
      };

      const response = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (modelResponse) {
        setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      console.error("Chat API Error:", err);
      setError("Failed to connect to the AI. Please try again later.");
      // Remove the optimistic user message if the API call failed entirely
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    // Split by ** to find bold sections
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-stone-50 font-sans selection:bg-green-200">
      
      {/* Header Area */}
      <header className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 sm:p-5 flex items-center shadow-md z-10">
        <div className="bg-white/20 p-2 rounded-xl mr-4 backdrop-blur-sm border border-white/10">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">Agri-Recover</h1>
          <p className="text-green-100 text-xs sm:text-sm font-medium tracking-wide uppercase">Expert Agricultural Assistant</p>
        </div>
      </header>

      {/* Main Chat Feed */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[90%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 sm:gap-3`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white border-2 border-green-100 text-green-700'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
              </div>

              {/* Message Bubble */}
              <div className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-sm text-sm sm:text-base ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-white text-stone-700 border border-stone-200 rounded-bl-none'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {formatText(msg.text)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-row items-end gap-2 sm:gap-3">
              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white border-2 border-green-100 text-green-700 flex items-center justify-center shadow-sm">
                <Bot size={20} />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-bl-none bg-white border border-stone-200 shadow-sm flex items-center gap-1.5 h-[52px]">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-green-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="flex justify-center my-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px" />
      </main>

      {/* Input Form Area */}
      <footer className="bg-white p-4 sm:p-6 border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crop diseases, treatments, or farming tips..."
            className="w-full bg-stone-50 border border-stone-300 text-stone-800 text-sm sm:text-base rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 block pl-6 pr-14 py-3.5 sm:py-4 transition-all shadow-inner outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 shadow-sm hover:shadow-md active:scale-95"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
          </button>
        </form>
        <div className="text-center mt-3 text-[11px] sm:text-xs text-stone-400 font-medium">
          AI can make mistakes. Please verify critical agricultural advice with local experts.
        </div>
      </footer>
    </div>
  );
}