'use client';

import ShellLayout from '@/src/components/ShellLayout';
import JournalSection from '@/src/components/JournalSection';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';

export default function JournalPage() {
  return (
    <ShellLayout activeSection="journal">
      <ShellBagConsumer>
        {({ showToast }) => <JournalSection onShowToast={showToast} />}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
