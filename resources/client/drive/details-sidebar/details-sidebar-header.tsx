import React, {ReactNode, useContext} from 'react';
import {IconButton} from '@ui/buttons/icon-button';
import {CloseIcon} from '@ui/icons/material/Close';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {FileTypeIcon} from '@common/uploads/components/file-type-icon/file-type-icon';

interface HeaderProps {
  entryType: string;
  entryName: ReactNode;
}
export function DetailsSidebarHeader({entryType, entryName}: HeaderProps) {
  const {setRightSidenavStatus} = useContext(DashboardLayoutContext);
  return (
    <div className="mb-38 flex items-center gap-16 text-text-main">
      <FileTypeIcon className="h-24 w-24" type={entryType} />
      <div className="mr-auto min-w-0 flex-auto text-ellipsis break-words text-xl font-normal">
        {entryName}
      </div>
      <IconButton
        size="md"
        className="flex-shrink-0"
        onClick={() => {
          setRightSidenavStatus('closed');
        }}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
}
