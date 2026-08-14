import {useActiveWorkspaceId} from '@common/workspace/active-workspace-id-context';
import {DriveQueryKeys} from '@app/drive/drive-query-keys';
import {DriveApiIndexParams} from '@app/drive/files/queries/use-paginated-entries';
import {PartialFolder} from '@app/drive/files/utils/can-move-entries-into';
import {apiClient} from '@common/http/query-client';
import {useInfiniteQuery} from '@tanstack/react-query';
import {
  hasNextPage,
  LengthAwarePaginationResponse,
} from '@common/http/backend-response/pagination-response';
import {encodeBackendFilters} from '@common/datatable/filters/utils/encode-backend-filters';
import {useMemo} from 'react';
import {DriveFolder} from '@app/drive/files/drive-entry';

interface Props {
  selectedFolder: PartialFolder;
  movingSharedFiles: boolean;
}
export function useMoveEntriesDialogFolders({
  selectedFolder,
  movingSharedFiles,
}: Props) {
  const {workspaceId} = useActiveWorkspaceId();
  const params = useMemo(() => {
    const filters = encodeBackendFilters([
      {
        key: 'type',
        value: 'folder',
      },
    ]);
    return {
      section: 'folder',
      folderId:
        selectedFolder.hash == '0' && movingSharedFiles
          ? 'sharedWithMe'
          : selectedFolder.hash,
      workspaceId,
      filters,
    } as DriveApiIndexParams;
  }, [workspaceId, selectedFolder.hash, movingSharedFiles]);

  return useInfiniteQuery({
    queryKey: DriveQueryKeys.fetchEntries(params),
    queryFn: ({pageParam = 1}) => {
      return fetchEntries({...params, page: pageParam});
    },
    initialPageParam: 1,
    getNextPageParam: lastResponse => {
      const currentPage = lastResponse.current_page;
      if (!hasNextPage(lastResponse)) {
        return undefined;
      }
      return currentPage + 1;
    },
  });
}

function fetchEntries(
  params: DriveApiIndexParams,
): Promise<LengthAwarePaginationResponse<DriveFolder>> {
  return apiClient
    .get('drive/file-entries', {
      params,
    })
    .then(response => response.data);
}
