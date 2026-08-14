import React, {Fragment, ReactElement} from 'react';
import {FileTypeIcon} from '@common/uploads/components/file-type-icon/file-type-icon';
import {ChevronRightIcon} from '@ui/icons/material/ChevronRight';
import {Trans} from '@ui/i18n/trans';
import myFilesSvg from './my-files.svg';
import {useMoveEntriesDialogFolders} from '@app/drive/files/dialogs/move-entries-dialog/use-move-entries-dialog-folders';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {DriveFolder} from '@app/drive/files/drive-entry';
import {SvgImage} from '@ui/images/svg-image';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {List, ListItem} from '@ui/list/list';

interface Props {
  selectedFolder: DriveFolder;
  onFolderSelected: (folder: DriveFolder) => void;
  movingSharedFiles: boolean;
}
export function MoveEntriesDialogFolderList({
  onFolderSelected,
  selectedFolder,
  movingSharedFiles,
}: Props) {
  const query = useMoveEntriesDialogFolders({
    selectedFolder,
    movingSharedFiles,
  });
  let content: ReactElement;

  if (query.isLoading) {
    content = (
      <div className="flex h-full w-full items-center justify-center">
        <ProgressCircle isIndeterminate size="md" />
      </div>
    );
  } else if (query.data?.pages[0]?.data.length === 0) {
    content = (
      <IllustratedMessage
        size="xs"
        className="pb-20 pt-64"
        image={<SvgImage src={myFilesSvg} />}
        title={
          <Trans
            message={`There are no subfolders in ":folder"`}
            values={{folder: selectedFolder.name}}
          />
        }
      />
    );
  } else {
    content = (
      <Fragment>
        <List>
          {query.data?.pages
            .flatMap(r => r.data)
            .map(folder => (
              <ListItem
                className="min-h-48 border-b"
                key={folder.id}
                onSelected={() => {
                  onFolderSelected(folder);
                }}
                startIcon={<FileTypeIcon type="folder" />}
                endIcon={<ChevronRightIcon size="md" />}
              >
                {folder.name}
              </ListItem>
            ))}
        </List>
        <InfiniteScrollSentinel query={query} />
      </Fragment>
    );
  }

  return <div className="h-288 overflow-y-auto">{content}</div>;
}
