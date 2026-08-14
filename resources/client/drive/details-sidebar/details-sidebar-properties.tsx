import {useSelectedEntryParent} from '@app/drive/files/use-selected-entries';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import React, {ReactNode, useMemo} from 'react';
import {Trans} from '@ui/i18n/trans';
import {Button} from '@ui/buttons/button';
import {FolderIcon} from '@ui/icons/material/Folder';
import {
  getPathForFolder,
  RootFolderPage,
} from '@app/drive/drive-page/drive-page';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {DriveEntry} from '@app/drive/files/drive-entry';
import {GroupsIcon} from '@ui/icons/material/Groups';
import {Tooltip} from '@ui/tooltip/tooltip';
import {driveState} from '@app/drive/drive-store';
import {DetailsSidebarHeader} from '@app/drive/details-sidebar/details-sidebar-header';
import {DetailsSidebarSectionHeader} from '@app/drive/details-sidebar/details-sidebar-section-header';
import {DetailsSidebarTags} from '@app/drive/details-sidebar/details-sidebar-tags';
import {FileThumbnail} from '@common/uploads/components/file-type-icon/file-thumbnail';
import {Avatar} from '@ui/avatar/avatar';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';

interface EntryPropertiesProps {
  entry: DriveEntry;
}
export function DetailsSidebarProperties({entry}: EntryPropertiesProps) {
  return (
    <div>
      <DetailsSidebarHeader entryType={entry.type} entryName={entry.name} />
      {entry.type === 'image' && (
        <FileThumbnail className="mb-20" file={entry} />
      )}
      <div>
        <DetailsSidebarSectionHeader>
          <Trans message="Who has access" />
        </DetailsSidebarSectionHeader>
        <div className="flex items-center gap-14">
          {entry.workspace_id ? (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border">
              <GroupsIcon className="icon-md" />
            </div>
          ) : null}
          {entry.users.map(user => (
            <Tooltip label={user.name} key={user.id}>
              <Avatar src={user.image} size="md" circle />
            </Tooltip>
          ))}
        </div>
        {entry.permissions['files.update'] && (
          <Button
            className="mt-20 block"
            variant="link"
            color="primary"
            onClick={() => {
              driveState().setActiveActionDialog('share', [entry]);
            }}
          >
            <Trans message="Manage Access" />
          </Button>
        )}
      </div>
      <PropertyList entry={entry} />
      <DetailsSidebarTags entry={entry} />
    </div>
  );
}

interface Props {
  entry: DriveEntry;
}
function PropertyList({entry}: Props) {
  const parent = useSelectedEntryParent();
  const navigate = useNavigate();
  const owner = entry.users.find(user => user.owns_entry);
  const prettySize = useMemo(
    () => prettyBytes(entry.file_size),
    [entry.file_size],
  );

  return (
    <div className="mt-20 border-t pt-20">
      <DetailsSidebarSectionHeader>
        <Trans message="Properties" />
      </DetailsSidebarSectionHeader>
      <PropertyItem
        label={<Trans message="Type" />}
        value={
          <span className="capitalize">
            <Trans message={entry.type} />
          </span>
        }
      />
      <PropertyItem
        label={<Trans message="Size" />}
        value={entry.file_size ? prettySize : '-'}
      />
      <PropertyItem
        label={<Trans message="Location" />}
        value={
          <Button
            variant="link"
            startIcon={<FolderIcon />}
            onClick={() => {
              navigate(
                parent ? getPathForFolder(parent.hash) : RootFolderPage.path,
              );
            }}
          >
            {parent ? parent.name : <Trans message="Root" />}
          </Button>
        }
      />
      {owner && (
        <PropertyItem label={<Trans message="Owner" />} value={owner.name} />
      )}
      <PropertyItem
        label={<Trans message="Modified" />}
        value={<FormattedDate date={entry.updated_at} />}
      />
      <PropertyItem
        label={<Trans message="Created" />}
        value={<FormattedDate date={entry.updated_at} />}
      />
    </div>
  );
}

interface PropertyItemProps {
  label: ReactNode;
  value: ReactNode;
}
function PropertyItem({label, value}: PropertyItemProps) {
  return (
    <div className="mb-14 flex items-center">
      <div className="w-1/3 text-xs text-muted">{label}</div>
      <div className="w-2/3 text-sm text-main">{value}</div>
    </div>
  );
}
