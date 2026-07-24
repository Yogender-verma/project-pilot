'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { restoreAccount } from '@/app/actions/user';
import { toast } from 'sonner';

interface AccountRecoveryPromptProps {
  daysRemaining: number;
  onRestored: () => void;
  onDismiss: () => void;
}

export function AccountRecoveryPrompt({ daysRemaining, onRestored, onDismiss }: AccountRecoveryPromptProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreAccount();
      toast.success('Welcome back! Your account has been restored.');
      onRestored();
    } catch (error) {
      console.error('Failed to restore account:', error);
      toast.error('Something went wrong restoring your account.');
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-[#0a071a] text-center space-y-4 shadow-2xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Restore Your Account?</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your account is scheduled for permanent deletion in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}.
          Would you like to cancel the deletion and restore it?
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="premium"
            className="w-full h-10 text-xs font-semibold"
            onClick={handleRestore}
            disabled={isRestoring}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isRestoring ? 'Restoring...' : 'Restore My Account'}
          </Button>
          <Button
            variant="outline"
            className="w-full h-10 text-xs font-semibold"
            onClick={onDismiss}
            disabled={isRestoring}
          >
            Keep It Deleted
          </Button>
        </div>
      </motion.div>
    </div>
  );
}