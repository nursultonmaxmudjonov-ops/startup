'use client';

import ShellLayout from '@/src/components/ShellLayout';
import FittingRoomSection from '@/src/components/FittingRoomSection';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';

export default function FittingPage() {
  return (
    <ShellLayout activeSection="studio">
      <ShellBagConsumer>
        {({ bag, toggleBagItem, showToast }) => (
          <FittingRoomSection
            bag={bag}
            onToggleBagItem={toggleBagItem}
            onAddOutfitToBag={(picks, thumbs) => {
              // Toggle picks; toast when the full outfit discount applies
              picks.forEach(([li, pi], idx) => toggleBagItem(li, pi, thumbs[idx]));
              if (picks.length >= 2) showToast('Full outfit added — 10% off at checkout');
            }}
            onShowToast={showToast}
          />
        )}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
