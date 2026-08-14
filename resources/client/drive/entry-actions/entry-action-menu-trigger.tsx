import React, {createElement, ReactElement} from 'react';
import {Trans} from '@ui/i18n/trans';
import {DriveEntry} from '../files/drive-entry';
import {useEntryActions} from './use-entry-actions';
import {EntryAction} from './entry-action';
import {DrivePage, RootFolderPage, TrashPage} from '../drive-page/drive-page';
import {useDrivePageActions} from './use-drive-page-actions';
import {Menu, MenuItem, MenuTrigger} from '@ui/menu/menu-trigger';

interface Props {
  children: ReactElement;
  entries?: DriveEntry[];
  page?: DrivePage;
  showIfNoActions?: boolean;
}
export function EntryActionMenuTrigger({
  children,
  entries,
  page,
  showIfNoActions,
}: Props) {
  if (page?.name === RootFolderPage.name) {
    return (
      <PageMenu page={RootFolderPage} showIfNoActions={showIfNoActions}>
        {children}
      </PageMenu>
    );
  }

  if (page === TrashPage) {
    return (
      <PageMenu page={TrashPage} showIfNoActions={showIfNoActions}>
        {children}
      </PageMenu>
    );
  }

  if (page?.folder) {
    return (
      <EntriesMenu entries={[page.folder]} showIfNoActions={showIfNoActions}>
        {children}
      </EntriesMenu>
    );
  }

  if (entries?.length) {
    return (
      <EntriesMenu entries={entries} showIfNoActions={showIfNoActions}>
        {children}
      </EntriesMenu>
    );
  }

  return null;
}

interface EntriesContextMenuProps extends Omit<BaseMenuProps, 'actions'> {
  entries: DriveEntry[];
}
function EntriesMenu({
  entries,
  children,
  showIfNoActions,
}: EntriesContextMenuProps) {
  const actions = useEntryActions(entries);
  return (
    <BaseMenu actions={actions} showIfNoActions={showIfNoActions}>
      {children}
    </BaseMenu>
  );
}

interface PageContextMenuProps extends Omit<BaseMenuProps, 'actions'> {
  page: DrivePage;
  showIfNoActions?: boolean;
}
function PageMenu({page, children, showIfNoActions}: PageContextMenuProps) {
  const actions = useDrivePageActions(page);
  return (
    <BaseMenu actions={actions} showIfNoActions={showIfNoActions}>
      {children}
    </BaseMenu>
  );
}

interface BaseMenuProps {
  actions: EntryAction[];
  children: ReactElement;
  showIfNoActions?: boolean;
}
function BaseMenu({actions, children, showIfNoActions}: BaseMenuProps) {
  if (!actions.length && !showIfNoActions) {
    return null;
  }
  return (
    <MenuTrigger>
      {children}
      <Menu>
        {actions.map(action => {
          return (
            <MenuItem
              onSelected={() => {
                action.execute();
              }}
              key={action.key}
              value={action.key}
              startIcon={createElement(action.icon)}
            >
              <Trans {...action.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </MenuTrigger>
  );
}
