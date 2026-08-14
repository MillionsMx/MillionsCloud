import {PageBreadcrumbs} from '../page-breadcrumbs';
import React, {useContext} from 'react';
import {driveState, useDriveStore} from '../drive-store';
import {Trans} from '@ui/i18n/trans';
import {Tooltip} from '@ui/tooltip/tooltip';
import {IconButton} from '@ui/buttons/icon-button';
import {ViewListIcon} from '@ui/icons/material/ViewList';
import {ViewModuleIcon} from '@ui/icons/material/ViewModule';
import {InfoIcon} from '@ui/icons/material/Info';
import {DriveSortButton} from './sorting/drive-sort-button';
import {DashboardContentHeader} from '@common/ui/dashboard-layout/dashboard-content-header';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';

export function DriveContentHeader() {
  const {isMobileMode} = useContext(DashboardLayoutContext);
  const activePage = useDriveStore(s => s.activePage);
  return (
    <DashboardContentHeader className="flex h-60 items-center gap-20 border-b px-8 py-4 md:px-26">
      {isMobileMode ? (
        <DriveSortButton isDisabled={activePage?.disableSort} />
      ) : (
        <PageBreadcrumbs />
      )}
      <div className="ml-auto flex-shrink-0 text-muted">
        <ToggleViewModeButton />
        <ToggleDetailsButton />
      </div>
    </DashboardContentHeader>
  );
}

function ToggleViewModeButton() {
  const viewMode = useDriveStore(s => s.viewMode);
  const tooltip =
    viewMode === 'grid' ? (
      <Trans message="List view" />
    ) : (
      <Trans message="Grid view" />
    );
  return (
    <Tooltip label={tooltip}>
      <IconButton
        size="md"
        onClick={() => {
          driveState().setViewMode(
            driveState().viewMode === 'list' ? 'grid' : 'list',
          );
        }}
      >
        {viewMode === 'list' ? <ViewListIcon /> : <ViewModuleIcon />}
      </IconButton>
    </Tooltip>
  );
}

function ToggleDetailsButton() {
  const {rightSidenavStatus: status, setRightSidenavStatus} = useContext(
    DashboardLayoutContext,
  );
  const tooltip = status ? (
    <Trans message="Hide details" />
  ) : (
    <Trans message="Show details" />
  );
  return (
    <Tooltip label={tooltip}>
      <IconButton
        size="md"
        color={status === 'open' ? 'primary' : null}
        onClick={() => {
          setRightSidenavStatus(status === 'open' ? 'closed' : 'open');
        }}
      >
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
}
