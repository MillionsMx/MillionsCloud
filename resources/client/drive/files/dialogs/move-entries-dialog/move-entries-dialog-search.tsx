import React, {useState} from 'react';
import {SearchIcon} from '@ui/icons/material/Search';
import {ComboBox} from '@ui/forms/combobox/combobox';
import {Item} from '@ui/forms/listbox/item';
import {useTrans} from '@ui/i18n/use-trans';
import {useMoveEntriesDialogFolderSearch} from '@app/drive/files/dialogs/move-entries-dialog/use-move-entries-dialog-folder-search';
import {DriveFolder} from '@app/drive/files/drive-entry';

interface SearchComboBoxProps {
  onFolderSelected: (folder: DriveFolder) => void;
}
export function MoveEntriesDialogSearch({
  onFolderSelected,
}: SearchComboBoxProps) {
  const {trans} = useTrans();
  const searchLabel = trans({message: 'Search folders'});
  const [query, setQuery] = useState('');
  const {isFetching, data} = useMoveEntriesDialogFolderSearch({query});
  const folders = data?.data;
  return (
    <ComboBox
      size="sm"
      maxItems={10}
      placeholder={searchLabel}
      aria-label={searchLabel}
      className="pt-20"
      endAdornmentIcon={<SearchIcon />}
      isAsync
      isLoading={isFetching}
      inputValue={query}
      onInputValueChange={setQuery}
      blurReferenceOnItemSelection
      clearInputOnItemSelection
      selectionMode="none"
      openMenuOnFocus={false}
    >
      {folders?.map(folder => (
        <Item
          key={folder.id}
          value={folder.id}
          textLabel={folder.name}
          onSelected={() => {
            onFolderSelected(folder);
          }}
        >
          {folder.name}
        </Item>
      ))}
    </ComboBox>
  );
}
