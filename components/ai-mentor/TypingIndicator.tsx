import React from 'react';

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-start gap-3 my-2 transition-opacity duration-200 ease-in-out ${className}`}>
      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-indigo-400">AI</span>
      </div>

      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-800/80 dark:bg-slate-900/90 border border-indigo-500/20 shadow-sm shadow-indigo-500/5 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.32s]" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s]" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
      </div>
    </div>
  );
};

export default TypingIndicator;