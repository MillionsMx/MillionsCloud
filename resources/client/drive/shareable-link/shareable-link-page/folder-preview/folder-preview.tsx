import React from 'react';
import {useShareableLinkPage} from '../../queries/use-shareable-link-page';
import {FolderPreviewFileView} from './folder-preview-file-view';
import {Trans} from '@ui/i18n/trans';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {ShareableLinkPageActionButtons} from '../shareable-link-page-action-buttons';
import {FolderPreviewHeader} from './folder-preview-header';
import shareSvg from './share.svg';
import clsx from 'clsx';
import {DashboardLayout} from '@common/ui/dashboard-layout/dashboard-layout';
import {DashboardNavbar} from '@common/ui/dashboard-layout/dashboard-navbar';
import {DashboardContentHeader} from '@common/ui/dashboard-layout/dashboard-content-header';
import {DashboardContent} from '@common/ui/dashboard-layout/dashboard-content';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {SvgImage} from '@ui/images/svg-image';

export function FolderPreview() {
  const {entries, isFetched} = useShareableLinkPage();
  const showEmptyMessage = isFetched && !entries?.length;

  return (
    <DashboardLayout name="folder-preview">
      <DashboardNavbar
        hideToggleButton
        rightChildren={<ShareableLinkPageActionButtons />}
        color="bg"
      />
      <DashboardContentHeader>
        <FolderPreviewHeader />
      </DashboardContentHeader>
      <FileUploadProvider>
        <DashboardContent>
          {showEmptyMessage ? <EmptyMessage /> : <FolderPreviewFileView />}
        </DashboardContent>
      </FileUploadProvider>
    </DashboardLayout>
  );
}

interface EmptyMessageProps {
  className?: string;
}
function EmptyMessage({className}: EmptyMessageProps) {
  return (
    <IllustratedMessage
      className={clsx(className, 'mt-80')}
      image={<SvgImage src={shareSvg} />}
      title={<Trans message="Folder is empty" />}
      description={
        <Trans message="No files have been uploaded to this folder yet" />
      }
    />
  );
}
