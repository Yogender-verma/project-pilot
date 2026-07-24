import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';

// Isolated component for handling individual code block copying and state
const CodeBlock = ({ language, codeString, ...props }: { language: string; codeString: string; [key: string]: any }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      // Reset button feedback state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-indigo-500/20 bg-[#0d0927]">
      {/* Code Block Header with Language Badge & Copy Button */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-white/5 text-[11px] font-mono text-slate-400">
        <span className="uppercase font-semibold tracking-wider text-indigo-400">
          {language || 'text'}
        </span>
        
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 hover:text-slate-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer text-slate-300"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied ✓</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-medium">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Container */}
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
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

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
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            return !inline && language ? (
              <CodeBlock language={language} codeString={codeString} {...props} />
            ) : (
              <code
                className="px-1.5 py-0.5 text-xs font-mono rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                {...props}
              >
                {children}
              </code>
            );
          },

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

          h1: ({ children }) => <h1 className="text-lg font-bold text-slate-100 mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-slate-100 mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-indigo-300 mt-2 mb-1">{children}</h3>,

          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-slate-300">{children}</ol>,

          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500/50 pl-3 my-2 italic text-slate-400 bg-indigo-500/5 py-1 rounded-r">
              {children}
            </blockquote>
          ),

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