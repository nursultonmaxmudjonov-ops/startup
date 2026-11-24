'use client';

import React from 'react';
import { useShellBag } from '@/src/components/ShellLayout';

export default function ShellBagConsumer({
  children,
}: {
  children: (ctx: ReturnType<typeof useShellBag>) => React.ReactNode;
}) {
  const ctx = useShellBag();
  return <>{children(ctx)}</>;
}
