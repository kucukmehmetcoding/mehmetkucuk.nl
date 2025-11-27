"use client";

import {useTranslations, useLocale} from 'next-intl';
import { Search, Code, Monitor, Bot, Send, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {Link} from '@/i18n/routing';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function Home() {
  const t = useTranslations('HomePage');
  const tServices = useTranslations('Services');
  const locale = useLocale();
  
  const [query, setQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isLoading]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('');
    setIsChatOpen(true);
    
    // Add user message to state
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, locale }),
      });

      const data = await response.json();
      
      // Fal.ai any-llm response structure
      const assistantContent = data.output || data.content || "Üzgünüm, şu an cevap veremiyorum.";

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Bir hata oluştu, lütfen tekrar deneyin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 p-4 relative">
      <main className={`flex flex-col items-center w-full max-w-3xl transition-all duration-500 px-4 ${isChatOpen ? 'mt-10' : 'mt-20 space-y-8'}`}>
        {/* Main Headline */}
        <h1 className={`font-bold text-center text-gray-900 transition-all duration-500 ${isChatOpen ? 'text-2xl mb-4' : 'text-3xl md:text-4xl mb-4'}`}>
          {t('title')}
        </h1>

        {!isChatOpen ? (
          <>
            {/* Search-like Input */}
            <form onSubmit={handleSearch} className="w-full relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-14 pr-6 py-5 bg-white border border-gray-200 rounded-full text-xl shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 outline-none"
                placeholder={t('searchPlaceholder')}
              />
            </form>
            
            {/* Helper Text */}
            <p className="text-base text-gray-500 text-center max-w-xl -mt-4">
              {t('helperText')}
              <br className="hidden md:block" />
              <span className="text-sm text-gray-400 mt-1 block">{t('exampleText')}</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 w-full sm:w-auto">
              <button 
                onClick={() => handleSearch()} 
                className="px-8 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
              >
                {t('searchButton')}
              </button>
              <Link href="/services" className="px-8 py-3 bg-gray-50 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200 w-full sm:w-auto text-center flex items-center justify-center">
                {t('servicesButton')}
              </Link>
            </div>
          </>
        ) : (
          /* Chat Interface */
          <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">{t('aiAssistant')}</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.filter(m => m.role !== 'system').map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSearch} className="p-4 bg-white border-t border-gray-200 flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('chatPlaceholder')}
              />
              <button 
                type="submit" 
                disabled={isLoading || !query.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* Services Grid - Only show when chat is closed or below chat */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full ${isChatOpen ? 'mt-8' : 'mt-12'}`}>
          <div className="flex flex-col items-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="p-3 bg-blue-50 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">{tServices('webDesign')}</h3>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="p-3 bg-green-50 rounded-full mb-4 group-hover:bg-green-100 transition-colors">
              <Code className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">{tServices('software')}</h3>
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="p-3 bg-purple-50 rounded-full mb-4 group-hover:bg-purple-100 transition-colors">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">{tServices('aiBots')}</h3>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 w-full bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between text-sm text-gray-600">
          <div className="flex space-x-6">
            <a href="#" className="hover:underline">{t('aboutLink')}</a>
            <a href="#" className="hover:underline">{t('contactLink')}</a>
          </div>
          <div className="flex space-x-6">
            <span>{t('countryName')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
