import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import {usePaginatedEntries} from '../files/queries/use-paginated-entries';
import {driveState, useDriveStore} from '../drive-store';
import {SearchFilterList} from '../search/search-filter-list';
import {Trans} from '@ui/i18n/trans';
import {useMouseSelectionBox} from '@ui/interactions/dnd/mouse-selection/use-mouse-selection-box';
import {useDroppable} from '@ui/interactions/dnd/use-droppable';
import {mergeProps} from '@react-aria/utils';
import {useDriveUploadQueue} from '../uploading/use-drive-upload-queue';
import {EntryActionList} from '../entry-actions/entry-action-list';
import {DriveContextMenu} from '../files/drive-context-menu';
import {FileTable} from './file-table/file-table';
import {FileGrid} from './file-grid/file-grid';
import {DriveSortButton} from '../layout/sorting/drive-sort-button';
import {PageBreadcrumbs} from '../page-breadcrumbs';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useEntries} from '../files/queries/use-entries';
import {AdHost} from '@common/admin/ads/ad-host';
import {DropTargetMask} from '../drop-target-mask';
import {useSearchParams} from 'react-router';
import clsx from 'clsx';
import {MixedDraggable} from '@ui/interactions/dnd/use-draggable';
import {useDeleteEntries} from '@app/drive/files/queries/use-delete-entries';
import {TrashPage} from '@app/drive/drive-page/drive-page';
import {getSelectedEntries} from '@app/drive/files/use-selected-entries';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {SvgImage} from '@ui/images/svg-image';
import {isCtrlKeyPressed} from '@ui/utils/keybinds/is-ctrl-key-pressed';
import {createEventHandler} from '@ui/utils/dom/create-event-handler';

interface FileViewProps {
  className?: string;
}
export function FileView({className}: FileViewProps) {
  const [params] = useSearchParams();
  const isSearchingOrFiltering =
    !!params.get('query') || !!params.get('filters');
  const containerRef = useRef<HTMLDivElement>(null);
  const query = usePaginatedEntries();
  const entries = useEntries();
  const {uploadFiles} = useDriveUploadQueue();
  const deleteEntries = useDeleteEntries();
  const activePage = useDriveStore(s => s.activePage);
  const [isDragOver, setIsDragOver] = useState(false);
  const viewMode = useDriveStore(s => s.viewMode);
  const {isMobileMode} = useContext(DashboardLayoutContext);

  const {containerProps, boxProps} = useMouseSelectionBox({
    containerRef,
    onPointerDown: e => {
      if (!(e.target as HTMLElement).closest('.entry-action-list')) {
        driveState().deselectEntries('all');
      }
    },
  });

  const {droppableProps} = useDroppable({
    id: 'driveRoot',
    ref: containerRef,
    types: ['nativeFile'],
    disabled: !activePage?.canUpload,
    onDragEnter: () => {
      setIsDragOver(true);
    },
    onDragLeave: () => {
      setIsDragOver(false);
    },
    onDrop: async (draggable: MixedDraggable) => {
      if (draggable.type === 'nativeFile') {
        uploadFiles(await draggable.getData());
      }
    },
  });

  if (!activePage) return null;

  let content: ReactNode;
  if (!entries.length && (!query.isLoading || query.fetchStatus === 'idle')) {
    const noContentMessage = activePage.noContentMessage(
      isSearchingOrFiltering,
    );
    content = (
      <IllustratedMessage
        className="mt-40"
        image={<SvgImage src={noContentMessage.image} />}
        title={<Trans {...noContentMessage.title} />}
        description={<Trans {...noContentMessage.description} />}
      />
    );
  } else if (!query.isLoading) {
    content =
      viewMode === 'list' ? (
        <FileTable entries={entries} />
      ) : (
        <FileGrid entries={entries} />
      );
  }

  const handleContextMenu: MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    driveState().deselectEntries('all');
    driveState().setContextMenuData({x: e.clientX, y: e.clientY});
  };

  const handleKeybinds: KeyboardEventHandler = e => {
    if (e.key === 'a' && isCtrlKeyPressed(e)) {
      e.preventDefault();
      e.stopPropagation();
      driveState().selectEntries(entries.map(entry => entry.id));
    }
    if (e.key === 'Delete') {
      e.preventDefault();
      e.stopPropagation();
      if (driveState().selectedEntries.size && !deleteEntries.isPending) {
        if (activePage === TrashPage) {
          driveState().setActiveActionDialog(
            'confirmAndDeleteForever',
            getSelectedEntries(),
          );
        } else {
          deleteEntries.mutate({
            entryIds: [...driveState().selectedEntries],
            deleteForever: activePage === TrashPage,
          });
          driveState().selectEntries([]);
        }
      }
    }
  };

  return (
    <div
      className={clsx('relative outline-none', className)}
      tabIndex={-1}
      {...mergeProps(containerProps, droppableProps, {
        onKeyDown: createEventHandler(handleKeybinds),
      })}
      onContextMenu={handleContextMenu}
    >
      <div className="relative flex min-h-full flex-col pt-10">
        {isMobileMode ? (
          <PageBreadcrumbs className="mb-10 px-14" />
        ) : (
          <Toolbar />
        )}
        <SearchFilterList />
        <div className="relative flex-auto px-18 pb-18 md:px-24">
          <AdHost slot="drive" className="mb-24" />
          {content}
          <InfiniteScrollSentinel query={query} />
        </div>
        <div
          {...boxProps}
          className="pointer-events-none absolute left-0 top-0 z-10 hidden border border-primary-light bg-primary-light/20 shadow-md"
        />
        <DriveContextMenu />
        <DropTargetMask isVisible={isDragOver} />
      </div>
    </div>
  );
}

function Toolbar() {
  const activePage = useDriveStore(s => s.activePage);
  return (
    <div className="my-10 flex min-h-42 items-center justify-between gap-40 px-10 text-muted md:px-18">
      <DriveSortButton isDisabled={activePage?.disableSort} />
      <EntryActionList className="text-muted" />
    </div>
  );
}
