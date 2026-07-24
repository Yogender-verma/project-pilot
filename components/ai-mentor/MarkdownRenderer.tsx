// components/ai-mentor/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  return (
    <div className={`prose prose-invert max-w-none text-sm leading-relaxed space-y-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom Code Block & Inline Code Rendering
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
              <div className="relative my-3 rounded-xl overflow-hidden border border-indigo-500/20 bg-[#0d0927]">
                {/* Code Block Header / Language Badge */}
                <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/80 border-b border-white/5 text-[11px] font-mono text-slate-400">
                  <span className="uppercase font-semibold tracking-wider text-indigo-400">
                    {language}
                  </span>
                </div>
                {/* Syntax Highlighted Body */}
                <div className="p-1 overflow-x-auto text-xs">
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '0.85rem',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code
                className="px-1.5 py-0.5 text-xs font-mono rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Styled Links
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors font-medium"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Styled Headings
          h1: ({ children }) => <h1 className="text-lg font-bold text-slate-100 mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-slate-100 mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-indigo-300 mt-2 mb-1">{children}</h3>,

          // Styled Lists
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-slate-300">{children}</ol>,

          // Styled Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500/50 pl-3 my-2 italic text-slate-400 bg-indigo-500/5 py-1 rounded-r">
              {children}
            </blockquote>
          ),

          // Styled Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-white/10 rounded-xl">
              <table className="min-w-full divide-y divide-white/10 text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="px-3 py-2 bg-white/5 text-left font-semibold text-slate-200">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border-t border-white/5 text-slate-300">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;