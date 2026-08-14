import React, {ComponentPropsWithoutRef, ReactNode} from 'react';
import clsx from 'clsx';
import {FileThumbnail} from '@common/uploads/components/file-type-icon/file-thumbnail';
import {DriveEntry} from '../../files/drive-entry';

interface BaseFileGridItemProps extends ComponentPropsWithoutRef<'div'> {
  entry: DriveEntry;
  className?: string;
  isSelected?: boolean;
  isMobileMode?: boolean;
  footerAdornment?: ReactNode;
}

export const BaseFileGridItem = React.forwardRef<
  HTMLDivElement,
  BaseFileGridItemProps
>(
  (
    {entry, className, isSelected, isMobileMode, footerAdornment, ...domProps},
    ref,
  ) => {
    return (
      <div
        {...domProps}
        ref={ref}
        className={clsx(
          'grid-item flex aspect-square select-none flex-col overflow-hidden rounded border shadow outline-none transition-shadow-opacity dark:bg-alt',
          isSelected && 'border-primary',
          className,
        )}
      >
        <div className="relative min-h-0 flex-auto">
          <FileThumbnail
            className="h-full w-full"
            iconClassName="block w-70 h-70 absolute m-auto inset-0"
            file={entry}
          />
        </div>
        <Footer
          entry={entry}
          isSelected={isSelected}
          isMobile={isMobileMode}
          adornment={footerAdornment}
        />
      </div>
    );
  },
);

interface FooterProps {
  entry: DriveEntry;
  isSelected?: boolean;
  isMobile?: boolean;
  adornment?: ReactNode;
}
function Footer({entry, isSelected, isMobile, adornment}: FooterProps) {
  return (
    <div
      className={clsx(
        'flex h-48 flex-shrink-0 items-center text-sm',
        isMobile ? 'justify-between gap-10 pl-18 pr-2' : 'justify-center px-16',
        isSelected && 'bg-primary-light/20',
      )}
    >
      <div className="min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap">
        {entry.name}
      </div>
      {adornment}
    </div>
  );
}
