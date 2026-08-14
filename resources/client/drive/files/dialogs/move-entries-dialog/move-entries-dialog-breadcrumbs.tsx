import React from 'react';
import {IconButton} from '@ui/buttons/icon-button';
import {ArrowBackIcon} from '@ui/icons/material/ArrowBack';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {FolderIcon} from '@ui/icons/material/Folder';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {useFolderPath} from '@app/drive/files/queries/use-folder-path';
import {RootFolderPage} from '@app/drive/drive-page/drive-page';
import {Trans} from '@ui/i18n/trans';
import {DriveFolder} from '@app/drive/files/drive-entry';

interface FolderBreadCrumbsProps {
  selectedFolder: DriveFolder;
  onFolderSelected: (folder: DriveFolder) => void;
}
export function MoveEntriesDialogBreadcrumbs({
  selectedFolder,
  onFolderSelected,
}: FolderBreadCrumbsProps) {
  const {data} = useFolderPath({
    hash: selectedFolder.hash,
    isEnabled: selectedFolder?.hash !== RootFolderPage.folder.hash,
  });

  let previous: DriveFolder | null = null;
  if (data?.path) {
    if (data.path.length === 1) {
      previous = RootFolderPage.folder;
    } else {
      previous = data.path[data.path.length - 2];
    }
  }

  return (
    <div className="flex items-center gap-6 border-b pb-10">
      <IconButton
        className="flex-shrink-0"
        variant="outline"
        size="xs"
        disabled={!previous}
        onClick={() => {
          if (previous) {
            onFolderSelected(previous);
          }
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Breadcrumb size="sm" className="flex-auto">
        <BreadcrumbItem
          onSelected={() => {
            onFolderSelected(RootFolderPage.folder);
          }}
          className="flex items-center gap-8"
        >
          <FolderIcon className="icon-sm" />
          <Trans message={RootFolderPage.folder.name} />
        </BreadcrumbItem>
        {data?.path.map(item => (
          <BreadcrumbItem
            onSelected={() => {
              onFolderSelected(item);
            }}
            key={item.id || 'root'}
            className="flex items-center gap-8"
          >
            {!item.id && <FolderIcon className="icon-sm" />}
            {item.name}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </div>
  );
}
