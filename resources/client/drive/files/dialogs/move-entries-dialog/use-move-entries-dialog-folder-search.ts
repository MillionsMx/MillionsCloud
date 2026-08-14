import {useActiveWorkspaceId} from '@common/workspace/active-workspace-id-context';
import {DriveQueryKeys} from '@app/drive/drive-query-keys';
import {DriveApiIndexParams} from '@app/drive/files/queries/use-paginated-entries';
import {apiClient} from '@common/http/query-client';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {encodeBackendFilters} from '@common/datatable/filters/utils/encode-backend-filters';
import {useMemo} from 'react';
import {LengthAwarePaginationResponse} from '@common/http/backend-response/pagination-response';
import {DriveFolder} from '@app/drive/files/drive-entry';

interface Props {
  query?: string;
}
export function useMoveEntriesDialogFolderSearch({query}: Props) {
  const {workspaceId} = useActiveWorkspaceId();
  const params = useMemo(() => {
    return {
      section: 'search',
      workspaceId,
      query,
      filters: encodeBackendFilters([
        {
          key: 'type',
          value: 'folder',
        },
      ]),
    } as DriveApiIndexParams;
  }, [workspaceId, query]);

  return useQuery({
    queryKey: DriveQueryKeys.fetchEntries(params),
    queryFn: ({signal}) => fetchEntries(params, signal),
    enabled: !!query,
    placeholderData: keepPreviousData,
  });
}

async function fetchEntries(
  params: DriveApiIndexParams,
  signal?: AbortSignal,
): Promise<LengthAwarePaginationResponse<DriveFolder>> {
  if (params.query) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return apiClient
    .get('drive/file-entries', {
      params,
      signal: params.query ? signal : undefined,
    })
    .then(response => response.data);
}
