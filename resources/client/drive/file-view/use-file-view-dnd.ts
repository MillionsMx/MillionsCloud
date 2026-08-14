import {
  ConnectedDraggable,
  useDraggable,
} from '@ui/interactions/dnd/use-draggable';
import {driveState, useDriveStore} from '../drive-store';
import {getSelectedEntries} from '../files/use-selected-entries';
import {useDroppable} from '@ui/interactions/dnd/use-droppable';
import {
  folderAcceptsDrop,
  useFolderDropAction,
} from '../files/use-folder-drop-action';
import {DriveEntry, DriveFolder} from '../files/drive-entry';
import {useRef, useState} from 'react';
import clsx from 'clsx';
import {FileEntry} from '@common/uploads/file-entry';
import {useMouseSelectable} from '@ui/interactions/dnd/mouse-selection/use-mouse-selectable';
import {TrashPage} from '@app/drive/drive-page/drive-page';
import {useIsTouchDevice} from '@ui/utils/hooks/is-touch-device';

export function useFileViewDnd<T extends HTMLElement = HTMLElement>(
  destination: DriveEntry,
) {
  const isTouchDevice = useIsTouchDevice();
  const ref = useRef<T>(null);
  const {onDrop} = useFolderDropAction(destination);
  const [isDragOver, setIsDragOver] = useState(false);
  const isDragging = useDriveStore(s =>
    s.entriesBeingDragged.includes(destination.id),
  );
  const activePage = useDriveStore(s => s.activePage);

  const {draggableProps} = useDraggable({
    disabled: !!isTouchDevice || activePage === TrashPage,
    id: destination.id,
    type: 'fileEntry',
    ref,
    hidePreview: true,
    onDragStart: (e, target: ConnectedDraggable<FileEntry[]>) => {
      if (!driveState().selectedEntries.has(destination.id)) {
        driveState().selectEntries([destination.id]);
      }
      driveState().setEntriesBeingDragged(target.getData().map(e => e.id));
    },
    onDragEnd: () => {
      driveState().setEntriesBeingDragged([]);
    },
    getData: () => getSelectedEntries(),
  });

  const {droppableProps} = useDroppable<T>({
    id: destination.id,
    disabled: isTouchDevice || destination.type !== 'folder',
    ref,
    types: ['fileEntry', 'nativeFile'],
    acceptsDrop: target =>
      folderAcceptsDrop(target, destination as DriveFolder),
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    onDrop,
  });

  useMouseSelectable({
    id: destination.id,
    ref,
    onSelected: () => {
      driveState().selectEntries([destination.id], true);
    },
    onDeselected: () => {
      driveState().deselectEntries([destination.id]);
    },
  });

  const itemClassName = clsx(
    isDragging && 'opacity-20',
    isDragOver && 'ring ring-offset-4 ring-primary bg-primary-light/10 rounded',
  );

  return {
    draggableProps,
    droppableProps,
    isDragOver,
    isDragging,
    itemClassName,
    ref,
  };
}
