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
  X
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
    deleteConversation 
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
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Context: Active Match Blueprint and Roadmap</p>
            </div>
          </div>
          <Badge variant="glow" className="text-[10px] font-mono">ONLINE</Badge>
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
                <div className={`max-w-xl space-y-3.5 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 rounded-tr-none'
                    : 'border rounded-tl-none'
                }`}
                style={!isUser ? { backgroundColor: 'var(--hover-bg-strong)', borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' } : {}}
                >
                  
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
            <textarea
              placeholder="Ask AI Mentor for architectural guidelines..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="w-full text-xs sm:text-sm rounded-2xl border p-4 pr-32 focus:outline-none resize-none glass-panel"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
              }}
            />
            
            {/* Input Action tools (File attach & Send button) */}
            <div className="absolute right-4.5 bottom-4 flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <Button
                variant="premium"
                size="sm"
                onClick={handleSend}
                className="h-10 px-4 text-xs font-semibold"
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
