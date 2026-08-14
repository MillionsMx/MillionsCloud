import {Button} from '@ui/buttons/button';
import {ArrowDropDownIcon} from '@ui/icons/material/ArrowDropDown';
import {
  DRIVE_ENTRY_FULL_PERMISSIONS,
  DriveEntryPermissions,
  DriveEntryUser,
} from '../files/drive-entry';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Menu, MenuItem, MenuTrigger} from '@ui/menu/menu-trigger';

export interface PermissionSelectorItem {
  key: keyof DriveEntryPermissions;
  value: DriveEntryPermissions;
  label: MessageDescriptor;
}

export const PermissionSelectorItems: PermissionSelectorItem[] = [
  {
    key: 'view',
    value: {view: true},
    label: message('Can view'),
  },
  {
    key: 'download',
    value: {view: true, download: true},
    label: message('Can Download'),
  },
  {
    key: 'edit',
    value: DRIVE_ENTRY_FULL_PERMISSIONS,
    label: message('Can edit'),
  },
];

interface Props {
  onChange: (value: PermissionSelectorItem) => void;
  value: PermissionSelectorItem;
  isDisabled?: boolean;
}
export function PermissionSelector({value, onChange, isDisabled}: Props) {
  return (
    <MenuTrigger
      selectedValue={value.key}
      selectionMode="single"
      onSelectionChange={key => {
        if (key !== value.key) {
          onChange(PermissionSelectorItems.find(p => p.key === key)!);
        }
      }}
    >
      <Button
        variant="flat"
        color="chip"
        size="xs"
        endIcon={<ArrowDropDownIcon />}
        disabled={isDisabled}
      >
        <Trans {...value.label} />
      </Button>
      <Menu>
        {PermissionSelectorItems.map(item => {
          return (
            <MenuItem key={item.key} value={item.key}>
              <Trans {...item.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </MenuTrigger>
  );
}

export function getPermissionItemForUser(
  user: DriveEntryUser,
): PermissionSelectorItem {
  const {download, edit} = user.entry_permissions;
  if (edit) {
    return PermissionSelectorItems.find(item => item.key === 'edit')!;
  }
  if (download) {
    return PermissionSelectorItems.find(item => item.key === 'download')!;
  }
  return PermissionSelectorItems.find(item => item.key === 'view')!;
}
