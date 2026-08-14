import React, {useState} from 'react';
import {Button} from '@ui/buttons/button';
import {useMoveEntries} from '../../queries/use-move-entries';
import {NewFolderDialog} from '../new-folder-dialog';
import {CreateNewFolderIcon} from '@ui/icons/material/CreateNewFolder';
import {MoveEntriesDialogSearch} from './move-entries-dialog-search';
import {MoveEntriesDialogBreadcrumbs} from './move-entries-dialog-breadcrumbs';
import {MoveEntriesDialogFolderList} from './move-entries-dialog-folder-list';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {Trans} from '@ui/i18n/trans';
import {RootFolderPage} from '../../../drive-page/drive-page';
import {DriveEntry, DriveFolder} from '../../drive-entry';
import {useDriveStore} from '../../../drive-store';
import {canMoveEntriesInto} from '../../utils/can-move-entries-into';
import {useAuth} from '@common/auth/use-auth';

interface MoveEntriesDialogProps {
  entries: DriveEntry[];
}
export function MoveEntriesDialog({entries}: MoveEntriesDialogProps) {
  const {user} = useAuth();
  const activePage = useDriveStore(s => s.activePage);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder>(
    activePage?.folder || RootFolderPage.folder,
  );
  const movingSharedFiles = entries.some(
    e => !e.users.find(u => u.id === user!.id)?.owns_entry,
  );

  return (
    <Dialog size="lg">
      <DialogHeader>
        <Trans
          message="Move [one ‘:name‘|other :count items]"
          values={{
            count: entries.length,
            name: entries[0].name,
          }}
        />
      </DialogHeader>
      <DialogBody>
        <div className="text-sm">
          <Trans message="Select a destination folder." />
        </div>
        <MoveEntriesDialogSearch onFolderSelected={setSelectedFolder} />
        <div className="mb-20 mt-40">
          <MoveEntriesDialogBreadcrumbs
            selectedFolder={selectedFolder}
            onFolderSelected={setSelectedFolder}
          />
          <MoveEntriesDialogFolderList
            movingSharedFiles={movingSharedFiles}
            selectedFolder={selectedFolder}
            onFolderSelected={setSelectedFolder}
          />
        </div>
      </DialogBody>
      <Footer
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        entries={entries}
      />
    </Dialog>
  );
}

interface FooterProps {
  selectedFolder: DriveFolder;
  setSelectedFolder: (folder: DriveFolder) => void;
  entries: DriveEntry[];
}
function Footer({selectedFolder, setSelectedFolder, entries}: FooterProps) {
  const {close} = useDialogContext();
  const moveEntries = useMoveEntries();
  return (
    <DialogFooter
      className="border-t"
      startAction={
        <DialogTrigger
          type="modal"
          onClose={folder => {
            if (folder) {
              setSelectedFolder(folder);
            }
          }}
        >
          <Button startIcon={<CreateNewFolderIcon />} variant="text">
            <Trans message="New Folder" />
          </Button>
          <NewFolderDialog parentId={selectedFolder.id} />
        </DialogTrigger>
      }
    >
      <Button className="max-md:hidden" variant="flat" onClick={() => close()}>
        <Trans message="Cancel" />
      </Button>
      <Button
        type="submit"
        variant="flat"
        color="primary"
        disabled={
          !canMoveEntriesInto(entries, selectedFolder) || moveEntries.isPending
        }
        onClick={() => {
          moveEntries.mutate(
            {
              destinationId: selectedFolder.id,
              entryIds: entries.map(e => e.id),
            },
            {onSuccess: close},
          );
        }}
      >
        <Trans message="Move here" />
      </Button>
    </DialogFooter>
  );
}
