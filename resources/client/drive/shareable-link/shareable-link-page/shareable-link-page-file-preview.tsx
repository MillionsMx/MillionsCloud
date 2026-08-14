import React from 'react';
import {useShareableLinkPage} from '../queries/use-shareable-link-page';
import {ShareableLinkNavbar} from './shareable-link-navbar';
import {AdHost} from '@common/admin/ads/ad-host';
import {FilePreviewContainer} from '@common/uploads/components/file-preview/file-preview-container';

export function ShareableLinkPageFilePreview() {
  const {link} = useShareableLinkPage();

  if (!link?.entry) return null;

  return (
    <div className="flex h-screen flex-col bg-alt">
      <ShareableLinkNavbar />
      <AdHost slot="file-preview" className="mx-auto mt-24" />
      <FilePreviewContainer
        entries={[link.entry]}
        showHeader={false}
        allowDownload={link.allow_download}
      />
    </div>
  );
}
