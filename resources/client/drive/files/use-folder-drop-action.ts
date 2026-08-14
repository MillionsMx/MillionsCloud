import {useMoveEntries} from './queries/use-move-entries';
import {useDriveUploadQueue} from '../uploading/use-drive-upload-queue';
import {canMoveEntriesInto} from './utils/can-move-entries-into';
import {
  ConnectedDraggable,
  MixedDraggable,
} from '@ui/interactions/dnd/use-draggable';
import {NativeFileDraggable} from '@ui/interactions/dnd/use-droppable';
import {driveState} from '@app/drive/drive-store';
import {DriveEntry, DriveFolder} from '@app/drive/files/drive-entry';

export function useFolderDropAction(folder: DriveEntry) {
  const moveEntries = useMoveEntries();
  const {uploadFiles} = useDriveUploadQueue();

  const onDrop = async (target: ConnectedDraggable | NativeFileDraggable) => {
    if (folder.type !== 'folder') return;
    if (target.type === 'nativeFile') {
      uploadFiles(await target.getData(), {
        metadata: {parentId: folder.id},
      });
    } else if (target.type === 'fileEntry') {
      const entries = target.getData() as DriveEntry[];
      if (
        entries?.length &&
        canMoveEntriesInto(entries, folder as DriveFolder)
      ) {
        moveEntries.mutate({
          destinationId: folder.id,
          entryIds: entries.map(e => e.id),
        });
        driveState().deselectEntries('all');
      }
    }
  };

  return {onDrop};
}

export function folderAcceptsDrop(
  target: MixedDraggable,
  destination: DriveFolder,
) {
  if (target.type === 'fileEntry') {
    const entries = target.getData() as DriveEntry[];
    return canMoveEntriesInto(entries, destination);
  }
  return true;
}
