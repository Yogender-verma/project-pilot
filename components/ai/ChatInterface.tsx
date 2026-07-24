'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/Button';
import { Send, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ChatInterface() {
  const { messages, status, sendMessage, reload, error } = useChat();
  const [input, setInput] = useState('');
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  const isLoading = status !== 'ready' && status !== 'error';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ content: input, role: 'user' } as any);
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new text streams in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timeout monitoring (15-second threshold)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setIsTimedOut(false);
      timer = setTimeout(() => {
        setIsTimedOut(true);
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleRetry = () => {
    setIsTimedOut(false);
    reload();
  };

  return (
    <div className="flex flex-col h-full bg-[#070514] text-slate-100 p-6 rounded-2xl border border-white/15">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m: any) => (
          <div
            key={m.id}
            className={`flex flex-col space-y-1.5 p-4 rounded-xl text-xs sm:text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-indigo-600/20 border border-indigo-500/30 text-white max-w-[80%]'
                : 'mr-auto bg-white/5 border border-white/15 text-slate-200 max-w-[80%]'
            }`}
          >
            <span className="font-bold text-[10px] text-indigo-300 uppercase tracking-wider">
              {m.role === 'user' ? 'You' : 'ProjectPilot AI'}
            </span>
            <div className="prose prose-invert max-w-none text-xs leading-relaxed">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Friendly Error State & Timeout Fallback UI */}
        {(error || isTimedOut) && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex flex-col space-y-3 my-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs font-medium">
                {isTimedOut
                  ? 'The request took too long and timed out.'
                  : 'The AI Mentor is currently unavailable or experiencing high latency.'}
              </p>
            </div>
            <p className="text-[11px] text-slate-300">
              The AI Mentor is currently unavailable or taking too long. Please try again later. The rest of your dashboard remains fully operational.
            </p>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="h-8 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry Request
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 pt-2 border-t border-white/10">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything about your architecture or roadmaps..."
          className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
        />
        <Button type="submit" disabled={isLoading} variant="premium" className="h-10 px-4 text-xs">
          <Send className="w-4 h-4 mr-1.5" />
          {isLoading ? 'Thinking...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
