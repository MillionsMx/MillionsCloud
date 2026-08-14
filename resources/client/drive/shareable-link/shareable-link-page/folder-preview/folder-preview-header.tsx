import React from 'react';
import {FolderPreviewBreadcrumb} from './folder-preview-breadcrumb';
import {EntriesSortButton} from '../../../layout/sorting/entries-sort-button';
import {linkPageState, useLinkPageStore} from '../link-page-store';
import {IconButton} from '@ui/buttons/icon-button';
import {GridViewIcon} from '@ui/icons/material/GridView';
import {useShareableLinkPage} from '../../queries/use-shareable-link-page';
import {DriveFolder} from '../../../files/drive-entry';

export function FolderPreviewHeader() {
  const activeSort = useLinkPageStore(s => s.activeSort);
  const {link, isFetching} = useShareableLinkPage();
  const hasEntry = link && link.entry;

  return (
    <div className="flex flex-col justify-between gap-14 p-14 md:h-90 md:flex-row md:items-center md:p-24">
      {hasEntry && (
        <FolderPreviewBreadcrumb
          link={link}
          folder={link.entry as DriveFolder}
          className="flex-auto"
        />
      )}
      {hasEntry && (
        <div className="flex items-center justify-between text-muted md:justify-start">
          <EntriesSortButton
            isDisabled={isFetching}
            descriptor={activeSort}
            onChange={value => {
              linkPageState().setActiveSort(value);
            }}
          />
          <div className="ml-10 md:border-l md:pl-10">
            <IconButton
              onClick={() => {
                linkPageState().setViewMode(
                  linkPageState().viewMode === 'grid' ? 'list' : 'grid',
                );
              }}
            >
              <GridViewIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
