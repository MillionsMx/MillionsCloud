import React from 'react';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useShareableLinkPage} from '../queries/use-shareable-link-page';
import {ShareableLinkPageActionButtons} from './shareable-link-page-action-buttons';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {FileTypeIcon} from '@common/uploads/components/file-type-icon/file-type-icon';

export function ShareableLinkNavbar() {
  const {link} = useShareableLinkPage();
  const isMobile = useIsMobileMediaQuery();
  return (
    <Navbar
      size="md"
      color="bg"
      className="flex-shrink-0"
      rightChildren={link?.entry && <ShareableLinkPageActionButtons />}
      menuPosition="shareable-link-page"
      hideLogo={isMobile}
    >
      {link?.entry && link.entry.type !== 'folder' && (
        <div className="fex-auto flex min-w-0 items-center gap-10">
          <FileTypeIcon className="flex-shrink-0" type={link.entry.type} />
          <div className="flex-auto overflow-hidden overflow-ellipsis whitespace-nowrap font-medium">
            {link.entry.name}
          </div>
        </div>
      )}
    </Navbar>
  );
}
