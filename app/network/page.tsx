'use client';

import ShellLayout from '@/src/components/ShellLayout';
import NetworkPanel from '@/src/components/NetworkPanel';

export default function NetworkPage() {
  return (
    <ShellLayout activeSection="network">
      <NetworkPanel />
    </ShellLayout>
  );
}
