'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { generateProjectTweet, ProjectTweetInput } from '@/app/actions/generateTweet';
import { toast } from 'sonner';

interface ShareToXModalProps {
  project: ProjectTweetInput;
  onClose: () => void;
}

const TWEET_CHAR_LIMIT = 280;

export function ShareToXModal({ project, onClose }: ShareToXModalProps) {
  const [tweetText, setTweetText] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function generate() {
      setIsGenerating(true);
      try {
        const result = await generateProjectTweet(project);
        if (!cancelled && result.success && result.tweet) {
          setTweetText(result.tweet);
        } else if (!cancelled) {
          toast.error('Could not generate a tweet. Try editing it manually.');
        }
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }

    generate();
    return () => { cancelled = true; };
  }, [project]);

  const handlePost = () => {
    const text = encodeURIComponent(tweetText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    onClose();
  };

  const isOverLimit = tweetText.length > TWEET_CHAR_LIMIT;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full p-6 rounded-2xl border border-white/10 bg-[#0a071a] space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" /> Share to X
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Generating your tweet...
          </div>
        ) : (
          <>
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-[#08051e] px-3.5 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500/55 resize-none"
            />
            <div className={`text-[10px] text-right font-mono ${isOverLimit ? 'text-rose-400' : 'text-slate-500'}`}>
              {tweetText.length}/{TWEET_CHAR_LIMIT}
            </div>
            <Button
              variant="premium"
              className="w-full h-10 text-xs font-semibold"
              onClick={handlePost}
              disabled={isOverLimit || tweetText.trim().length === 0}
            >
              Post to X
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}