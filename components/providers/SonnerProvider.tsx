'use client';

import { useTheme } from '@/lib/ThemeProvider';
import { Toaster } from 'sonner';

export default function SonnerProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme={theme}
    />
  );
}