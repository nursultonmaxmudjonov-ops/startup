'use client';

import ShellLayout from '@/src/components/ShellLayout';
import RunwaySection from '@/src/components/RunwaySection';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';

export default function RunwayPage() {
  return (
    <ShellLayout activeSection="stage">
      <ShellBagConsumer>
        {({ bag, toggleBagItem, showToast }) => (
          <RunwaySection
            bag={bag}
            onToggleBagItem={toggleBagItem}
            onAddFullLook={() => undefined}
            onShowToast={showToast}
          />
        )}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
