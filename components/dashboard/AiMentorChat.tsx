'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Trash2, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiMentorChatProps {
  userContext?: {
    name?: string;
    careerGoal?: string;
    skills?: string[];
  };
}

export function AiMentorChat({ userContext }: AiMentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch previous conversation history on mount (Session Restoration)
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(updatedMessages);
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          userContext,
        }),
      });

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantReply += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: assistantReply };
          return newMsgs;
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // 2. Clear Chat History handler
  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/chat', { method: 'DELETE' });
      if (res.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center bg-[#090620] rounded-2xl border border-white/10">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[650px] rounded-2xl border border-white/10 bg-[#090620] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-300">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Mentor Workspace</h2>
            <p className="text-xs text-slate-400">Context-aware career & code guidance</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear History
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="rounded-2xl bg-white/5 p-4 mb-3">
              <Bot className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-white">Start a conversation with your AI Mentor</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Ask for architectural feedback, debugging assistance, or a custom study roadmap. Your history is securely saved across sessions.
            </p>
          </div>
        ) : (
          messages.map((m, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${
                m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`rounded-xl p-2 shrink-0 ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-indigo-300'
                }`}
              >
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4 bg-white/[0.02] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI mentor anything..."
          disabled={isSending}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
