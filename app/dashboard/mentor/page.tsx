'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Terminal, 
  Trash2, 
  Plus, 
  Paperclip, 
  CornerDownLeft,
  Copy,
  CheckCircle,
  FileText,
  User as UserIcon,
  Compass,
  X,
  Maximize2,
  Minimize2,
  Flame
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AiMentorChatPage() {
  const { 
    conversations, 
    activeConversationId, 
    sendMessage, 
    createNewConversation, 
    selectConversation, 
    deleteConversation,
    isReadingMode,
    activeReadingMessageId,
    setReadingMode,
    isRoastMode,
    toggleRoastMode
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Retrieve active conversation
  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // early return for distraction-free Reading Mode
  if (isReadingMode && activeReadingMessageId) {
    const readingMsg = activeConv?.messages.find((m) => m.id === activeReadingMessageId);
    if (readingMsg) {
      return (
        <div className="flex flex-col h-screen w-full relative bg-[#030014] text-slate-100 overflow-y-auto">
          {/* Glowing Background Mesh */}
          <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

          {/* Top Control Bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 backdrop-blur-md border-b border-white/5 bg-[#030014]/75">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-indigo-500/15 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-md">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-white">AI Mentor Reading Focus</h2>
                <p className="text-[10px] text-slate-400">Distraction-free deep study mode</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer border-white/10 hover:border-indigo-500/30"
              onClick={() => setReadingMode(false, null)}
              leftIcon={<Minimize2 className="w-4 h-4" />}
            >
              Exit Reading Mode
            </Button>
          </header>

          {/* Centered Scrollable Reading Canvas */}
          <main className="flex-grow max-w-3xl w-full mx-auto px-6 py-12 md:py-20 relative z-10">
            <div className="space-y-8">
              {/* Metadata Badge Row */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-semibold">AI Assistant</span>
                  <span>•</span>
                  <span>Roadmap & Advice</span>
                </div>
                <button
                  onClick={() => handleCopyCode(readingMsg.content, readingMsg.id)}
                  className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {copiedCodeIdx === readingMsg.id ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Text</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Content</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main long-form body content */}
              <article className="max-w-none text-sm sm:text-base leading-relaxed text-slate-200 whitespace-pre-line tracking-wide">
                {readingMsg.content}
              </article>

              {/* Attachments if any */}
              {readingMsg.attachments && readingMsg.attachments.length > 0 && (
                <div className="space-y-2 pt-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attached References</h3>
                  {readingMsg.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs max-w-md">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-300">{file.name}</span>
                      <span className="text-[10px] text-slate-500">({file.size})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Code Snippet if any */}
              {readingMsg.codeSnippet && (
                <div className="space-y-3 pt-6">
                  <div className="flex justify-between items-center bg-[#050214] border border-white/5 border-b-0 px-4 py-3 rounded-t-xl font-mono text-[10px] text-slate-400">
                    <span>{readingMsg.codeSnippet.language.toUpperCase()} ATTACHED CODE</span>
                    <button
                      onClick={() => handleCopyCode(readingMsg.codeSnippet!.code, readingMsg.id + '-code')}
                      className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCodeIdx === readingMsg.id + '-code' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Code</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-indigo-300 border border-white/5 bg-[#050214]/50 overflow-x-auto p-5 rounded-b-xl rounded-t-none leading-relaxed">
                    {readingMsg.codeSnippet.code}
                  </pre>
                </div>
              )}
            </div>
          </main>

          {/* Floating Escape button at the bottom center */}
          <div className="sticky bottom-6 flex justify-center py-4 pointer-events-none z-20">
            <button
              onClick={() => setReadingMode(false, null)}
              className="pointer-events-auto flex items-center space-x-2 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Reading Mode</span>
            </button>
          </div>
        </div>
      );
    }
  }



  // Handle typing input submit
  const handleSend = () => {
    const clean = inputMessage.trim();
    if (!clean && !attachment) return;

    sendMessage(
      clean || `Sent attachment: ${attachment?.name}`,
      undefined,
      attachment ? [{ name: attachment.name, size: attachment.size, type: 'file' }] : undefined
    );
    
    setInputMessage('');
    setAttachment(null);
  };

  // Keyboard shortcut (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle Mock file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`
      });
    }
  };

  // Copy code snippet helper
  const handleCopyCode = (code: string, msgId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(msgId);
    setTimeout(() => setCopiedCodeIdx(null), 1500);
  };

  // Prompt suggestions
  const suggestedPrompts = [
    { label: 'How to build custom whiteboard curves?', value: 'How can I build a custom whiteboard drawing canvas with SVG lines?' },
    { label: 'Help me write my Docker-compose', value: 'Help me draft a docker-compose file for a Golang collector and Redis cache.' },
    { label: 'Suggest vector database steps', value: 'How should I configure Pinecone to index and match vector action logs?' }
  ];

  return (
    <div className="flex h-[80vh] border rounded-3xl overflow-hidden glass-panel" style={{ borderColor: 'var(--border-subtle)' }}>
      {/* Left panel: Conversation History */}
      <div className="hidden md:flex flex-col w-64 border-r h-full" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-secondary)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Button 
            variant="glow" 
            className="w-full text-xs h-10" 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => createNewConversation()}
          >
            New Session Guidance
          </Button>
        </div>

        {/* Scrollable thread list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => {
            const isActive = activeConversationId === c.id;
            return (
              <div
                key={c.id}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group text-xs font-semibold ${
                  isActive ? 'bg-indigo-600/15 text-indigo-400' : 'hover:bg-indigo-500/5'
                }`}
                style={!isActive ? { color: 'var(--text-secondary)' } : {}}
                onClick={() => selectConversation(c.id)}
              >
                <div className="flex items-center space-x-2 truncate pr-2">
                  <MessageSquareCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Active chat window */}
      <div className="flex-1 flex flex-col justify-between h-full bg-gradient-to-b from-transparent to-[#0a0728]/10 relative">
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Chat top info header */}
        <div className="h-16 border-b px-6 flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold truncate max-w-md" style={{ color: 'var(--text-primary)' }}>
                {activeConv?.title || 'Mentor Guidance'}
              </h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {isRoastMode ? '🔥 Roast Mode Active' : 'Context: Active Match Blueprint and Roadmap'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <button
              type="button"
              onClick={toggleRoastMode}
              title={isRoastMode ? "Disable Roast Mode" : "Enable AI Code Roast Mode"}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all transform active:scale-95 border cursor-pointer ${
                isRoastMode
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse font-extrabold'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-300'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isRoastMode ? 'text-rose-400 animate-bounce' : ''}`} />
              <span>{isRoastMode ? 'ROAST MODE ON' : 'ROAST MODE'}</span>
            </button>

            <Badge variant="glow" className="text-[10px] font-mono">
              ONLINE
            </Badge>
          </div>
        </div>

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeConv?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            
            return (
              <div 
                key={msg.id}
                className={`flex space-x-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Compass className="w-4.5 h-4.5" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`relative max-w-xl space-y-3.5 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 rounded-tr-none'
                    : 'border rounded-tl-none pr-10'
                }`}
                style={!isUser ? { backgroundColor: 'var(--hover-bg-strong)', borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' } : {}}
                >
                  {!isUser && (
                    <button
                      onClick={() => setReadingMode(true, msg.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg border border-white/5 hover:border-indigo-500/30 bg-white/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer shadow-sm"
                      title="Open in distraction-free Reading Mode"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  {/* Text content rendering */}
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Render attachments if any */}
                  {msg.attachments && msg.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 p-2 bg-white/5 border border-white/5 rounded-xl text-xs">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-300">{file.name}</span>
                      <span className="text-[10px] text-slate-500">({file.size})</span>
                    </div>
                  ))}

                  {/* Render Code Snippet with Copy block if any */}
                  {msg.codeSnippet && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-[#050214] border-b border-white/5 px-4 py-2 rounded-t-lg font-mono text-[10px] text-slate-400">
                        <span>{msg.codeSnippet.language.toUpperCase()} FILE CODE</span>
                        <button
                          onClick={() => handleCopyCode(msg.codeSnippet!.code, msg.id)}
                          className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedCodeIdx === msg.id ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="font-mono text-xs text-indigo-300 overflow-x-auto p-4 rounded-b-lg rounded-t-none leading-relaxed">
                        {msg.codeSnippet.code}
                      </pre>
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Dynamic prompt suggestions list at the bottom */}
        {activeConv?.messages.length <= 1 && (
          <div className="px-6 py-2 flex flex-wrap gap-2 shrink-0">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(p.value);
                  handleSend();
                }}
            className="px-3 py-2 border rounded-xl text-left text-[11px] text-indigo-400 font-semibold cursor-pointer max-w-sm transition-all"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                ★ {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input box form container */}
        <div className="p-6 border-t shrink-0" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-secondary)' }}>
          
          {/* File attachment preview */}
          {attachment && (
            <div className="flex items-center space-x-2.5 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs w-fit mb-3">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold text-slate-300">{attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="hover:text-rose-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="relative">
            <label htmlFor="mentor-chat-input" className="sr-only">
              Ask AI Mentor for architectural guidelines
            </label>
            <textarea
              id="mentor-chat-input"
              placeholder="Ask AI Mentor for architectural guidelines..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Ask AI Mentor for architectural guidelines"
              rows={2}
              className="w-full text-xs sm:text-sm rounded-2xl border p-4 pr-32 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none glass-panel"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
              }}
            />
            
            {/* Input Action tools (File attach & Send button) */}
            <div className="absolute right-4.5 bottom-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach code or context file"
                title="Attach code or context file"
                className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Paperclip className="w-4 h-4" aria-hidden="true" />
              </button>
              <Button
                type="button"
                variant="premium"
                size="sm"
                onClick={handleSend}
                aria-label="Send message to AI mentor"
                title="Send message to AI mentor"
                className="h-10 px-4 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                rightIcon={<CornerDownLeft className="w-4.5 h-4.5" />}
              >
                Send
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
