'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React from 'react';

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

export default function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={8}
            className="z-50 max-w-xs rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
          >
            {content}

            <TooltipPrimitive.Arrow className="fill-slate-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}