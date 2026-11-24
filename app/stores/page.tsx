'use client';

import ShellLayout from '@/src/components/ShellLayout';
import StoresSection from '@/src/components/StoresSection';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';

export default function StoresPage() {
  return (
    <ShellLayout activeSection="stores">
      <ShellBagConsumer>
        {({ showToast }) => <StoresSection onShowToast={showToast} />}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
