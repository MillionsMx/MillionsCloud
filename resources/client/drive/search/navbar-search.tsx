import React, {useState} from 'react';
import {SearchIcon} from '@ui/icons/material/Search';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {SearchPage} from '../drive-page/drive-page';
import {useTrans} from '@ui/i18n/use-trans';
import {useDriveStore} from '../drive-store';
import {useSearchParams} from 'react-router';
import {IconButton} from '@ui/buttons/icon-button';
import {useNavigate} from '@common/ui/navigation/use-navigate';

export function NavbarSearch() {
  const {trans} = useTrans();
  const navigate = useNavigate();
  const activePage = useDriveStore(s => s.activePage);
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('query') || '');

  return (
    <form
      className="max-w-620 flex-auto"
      onSubmit={e => {
        e.preventDefault();
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
        size="sm"
        background="bg"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onFocus={() => {
          if (activePage !== SearchPage) {
            navigate(SearchPage.path);
          }
        }}
        startAdornment={
          <IconButton type="submit">
            <SearchIcon />
          </IconButton>
        }
        className="max-w-620 flex-auto"
        placeholder={trans({message: 'Search'})}
        aria-label={trans({message: 'Search files and folders'})}
      />
    </form>
  );
}
