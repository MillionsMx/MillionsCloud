import React from 'react';
import {useStorageSummary} from './storage-summary';
import {StorageIcon} from '@ui/icons/material/Storage';
import {Meter} from '@ui/progress/meter';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';

export function StorageMeter() {
  const {isLoading, data} = useStorageSummary();

  // prevent translation placeholders from showing if summary is not loaded yet
  const label = (
    <span className={clsx('whitespace-nowrap', isLoading && 'invisible')}>
      <Trans
        message=":used of :available used"
        values={{
          used: data?.usedFormatted,
          available: data?.availableFormatted,
        }}
      />
    </span>
  );
  return (
    <div className="mt-24 flex items-start gap-16 border-t pl-24 pt-24">
      <StorageIcon className="-mt-4 icon-md" />
      <Meter
        className="max-w-144 flex-auto"
        size="xs"
        value={data?.percentage}
        label={label}
        showValueLabel={false}
        labelPosition="bottom"
      />
    </div>
  );
}
