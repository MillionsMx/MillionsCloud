import React, {useContext, useState} from 'react';
import {driveSearchFilters} from './drive-search-filters';
import {useDriveStore} from '../drive-store';
import {SearchPage} from '../drive-page/drive-page';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {SearchIcon} from '@ui/icons/material/Search';
import {FilterList} from '@common/datatable/filters/filter-list/filter-list';
import {useTrans} from '@ui/i18n/use-trans';
import {useSearchParams} from 'react-router';
import {message} from '@ui/i18n/message';
import {IconButton} from '@ui/buttons/icon-button';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {useNavigate} from '@common/ui/navigation/use-navigate';

const alwaysShownFilters = driveSearchFilters.map(f => f.key);

export function SearchFilterList() {
  const activePage = useDriveStore(s => s.activePage);
  const {isMobileMode} = useContext(DashboardLayoutContext);
  const {trans} = useTrans();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('query') || '');

  if (activePage !== SearchPage) {
    return null;
  }

  return (
    <div className="mb-30 mt-10 px-10 md:px-26">
      {isMobileMode && (
        <form
          className="contents"
          onSubmit={e => {
            e.preventDefault();
            // blur input so mobile keyboard is hidden
            if (document.activeElement?.tagName === 'INPUT') {
              (document.activeElement as HTMLInputElement).blur();
            }
            navigate(
              {
                pathname: SearchPage.path,
                search: `?query=${inputValue}`,
              },
              {replace: true},
            );
          }}
        >
          <TextField
            autoFocus
            className="mb-20"
            startAdornment={
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            }
            placeholder={trans(message('Type to search'))}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        </form>
      )}
      <FilterList
        filters={driveSearchFilters}
        pinnedFilters={alwaysShownFilters}
      />
    </div>
  );
}
