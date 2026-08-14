import React, {Fragment, useContext, useEffect, useMemo} from 'react';
import {Link, useLocation, useParams} from 'react-router';
import {Sidebar} from './sidebar/sidebar';
import {FileView} from '../file-view/file-view';
import {UploadQueue} from '../uploading/upload-queue';
import {driveState, useDriveStore} from '../drive-store';
import {
  DRIVE_PAGES,
  makePartialFolderPage,
  SearchPage,
} from '../drive-page/drive-page';
import {DetailsSidebar} from '../details-sidebar/details-sidebar';
import {DriveDialogsContainer} from '../files/dialogs/drive-dialogs-container';
import {NavbarSearch} from '../search/navbar-search';
import {useActiveWorkspaceId} from '@common/workspace/active-workspace-id-context';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {EntryDragPreview} from '../file-view/entry-drag-preview';
import {DriveContentHeader} from './drive-content-header';
import {IconButton} from '@ui/buttons/icon-button';
import {SearchIcon} from '@ui/icons/material/Search';
import {CloseIcon} from '@ui/icons/material/Close';
import {Trans} from '@ui/i18n/trans';
import {EntryActionList} from '../entry-actions/entry-action-list';
import {CreateNewButton} from './create-new-button';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardSidenav} from '@common/ui/dashboard-layout/dashboard-sidenav';
import {DashboardContent} from '@common/ui/dashboard-layout/dashboard-content';
import {DashboardNavbar} from '@common/ui/dashboard-layout/dashboard-navbar';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {DashboardLayout} from '@common/ui/dashboard-layout/dashboard-layout';
import {FileEntryUrlsContext} from '@common/uploads/file-entry-urls';
import {FileUploadStoreOptions} from '@common/uploads/uploader/file-upload-store';
import {getActiveWorkspaceId} from '@common/workspace/active-workspace-id';

const uploadStoreOptions: FileUploadStoreOptions = {
  modifyUploadedFile: uploadedFile => {
    const workspaceId = getActiveWorkspaceId();
    uploadedFile.fingerprint = `${uploadedFile.fingerprint}-w-${workspaceId}`;
    return uploadedFile;
  },
};

export function DriveLayout() {
  const {pathname} = useLocation();
  const {hash} = useParams();
  const {workspaceId} = useActiveWorkspaceId();
  const activePage = useDriveStore(s => s.activePage);

  useEffect(() => {
    driveState().setActivePage(
      DRIVE_PAGES.find(p => p.path === pathname) ||
        makePartialFolderPage(hash!),
    );
  }, [pathname, hash]);

  const urlsContextValue = useMemo(() => {
    return {workspaceId};
  }, [workspaceId]);

  useEffect(() => {
    return () => {
      driveState().reset();
    };
  }, []);

  return (
    <Fragment>
      {activePage?.label && (
        <StaticPageTitle>
          <Trans
            message={
              typeof activePage.label === 'string'
                ? activePage.label
                : activePage.label.message
            }
          />
        </StaticPageTitle>
      )}
      <FileUploadProvider options={uploadStoreOptions}>
        <FileEntryUrlsContext.Provider value={urlsContextValue}>
          <DashboardLayout
            name="drive"
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'none';
            }}
            onDrop={e => {
              // prevent files from desktop from blowing away the document
              e.preventDefault();
            }}
          >
            <Navbar />
            <DashboardSidenav position="left" size="md">
              <Sidebar />
            </DashboardSidenav>
            <DriveContentHeader />
            <DashboardContent>
              <FileView />
            </DashboardContent>
            <UploadQueue />
            <DriveDialogsContainer />
            <DashboardSidenav position="right" size="lg">
              <DetailsSidebar />
            </DashboardSidenav>
          </DashboardLayout>
        </FileEntryUrlsContext.Provider>
        <EntryDragPreview />
      </FileUploadProvider>
    </Fragment>
  );
}

function Navbar() {
  const {isMobileMode} = useContext(DashboardLayoutContext);
  const activePage = useDriveStore(s => s.activePage);

  const children = isMobileMode ? null : <NavbarSearch />;
  const searchButton = (
    <IconButton elementType={Link} to={SearchPage.path}>
      <SearchIcon />
    </IconButton>
  );

  const mobileRightChildren = (
    <Fragment>
      {activePage !== SearchPage && searchButton}
      <CreateNewButton isCompact />
    </Fragment>
  );

  return (
    <Fragment>
      <DashboardNavbar
        rightChildren={isMobileMode && mobileRightChildren}
        menuPosition="drive-navbar"
      >
        {children}
      </DashboardNavbar>
      {isMobileMode && <FloatingActionList />}
    </Fragment>
  );
}

function FloatingActionList() {
  const entriesSelected = useDriveStore(s => s.selectedEntries.size);
  if (!entriesSelected) return null;
  return (
    <div className="fixed right-0 top-0 z-10 flex h-54 w-full items-center justify-center gap-10 rounded bg-primary px-6 text-on-primary shadow-xl">
      <IconButton
        onClick={() => {
          driveState().selectEntries([]);
        }}
      >
        <CloseIcon />
      </IconButton>
      <Trans message=":count selected" values={{count: entriesSelected}} />
      <EntryActionList className="ml-auto" />
    </div>
  );
}
