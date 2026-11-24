'use client';

import React from 'react';
import ShellLayout from '@/src/components/ShellLayout';
import CatalogSection from '@/src/components/CatalogSection';
import ShellBagConsumer from '@/src/components/ShellBagConsumer';

export default function CatalogPage() {
  return (
    <ShellLayout activeSection="catalog">
      <ShellBagConsumer>
        {({ bag, toggleBagItem, showToast }) => (
          <div className="catalog-page-wrapper">
            <CatalogSection
              bag={bag}
              onToggleBagItem={toggleBagItem}
              onShowToast={showToast}
            />
          </div>
        )}
      </ShellBagConsumer>
    </ShellLayout>
  );
}
