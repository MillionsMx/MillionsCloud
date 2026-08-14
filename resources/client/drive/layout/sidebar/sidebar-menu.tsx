import {CustomMenu, CustomMenuItem} from '@common/menus/custom-menu';
import {MenuPositions} from '../../menu-positions';
import React, {
  ComponentPropsWithoutRef,
  forwardRef,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import {FileEntry} from '@common/uploads/file-entry';
import {FolderTree} from '@app/drive/layout/sidebar/folder-tree';
import {useDeleteEntries} from '@app/drive/files/queries/use-delete-entries';
import {useDroppable} from '@common/ui/library/interactions/dnd/use-droppable';
import {MenuItemConfig} from '@common/menus/menu-config';

export function SidebarMenu() {
  return (
    <div className="mt-26 px-12 text-muted">
      <FolderTree />
      <CustomMenu
        menu={MenuPositions.DriveSidebar}
        orientation="vertical"
        gap="gap-0"
      >
        {item => {
          if (item.action === '/drive/trash') {
            return <TrashMenuItem key={item.id} item={item} />;
          }
          return <MenuItem key={item.id} item={item} />;
        }}
      </CustomMenu>
    </div>
  );
}

interface MenuItemProps extends ComponentPropsWithoutRef<'a'> {
  item: MenuItemConfig;
  className?: string;
}
export const MenuItem = forwardRef<HTMLAnchorElement, MenuItemProps>(
  ({item, className, ...domProps}, ref) => {
    return (
      <CustomMenuItem
        className={({isActive}) =>
          clsx(
            className,
            'my-4 h-40 w-full rounded px-24',
            isActive
              ? 'cursor-default bg-primary/selected font-bold text-primary'
              : 'hover:bg-hover',
          )
        }
        item={item}
        ref={ref}
        {...domProps}
      />
    );
  },
);

interface TrashMenuItemProps {
  item: MenuItemConfig;
}
function TrashMenuItem({item}: TrashMenuItemProps) {
  const deleteEntries = useDeleteEntries();
  const [isDragOver, setIsDragOver] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  const {droppableProps} = useDroppable({
    id: 'trash',
    types: ['fileEntry'],
    ref,
    onDragEnter: () => {
      setIsDragOver(true);
    },
    onDragLeave: () => {
      setIsDragOver(false);
    },
    onDrop: draggable => {
      const entryIds = (draggable.getData() as FileEntry[]).map(e => e.id);
      deleteEntries.mutate({entryIds, deleteForever: false});
    },
  });
  return (
    <MenuItem
      className={clsx(isDragOver && 'bg-primary/selected')}
      ref={ref}
      {...droppableProps}
      item={item}
    />
  );
}
