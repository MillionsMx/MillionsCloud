import {DetailsSidebarSectionHeader} from '@app/drive/details-sidebar/details-sidebar-section-header';
import {Trans} from '@ui/i18n/trans';
import {DriveEntry} from '@app/drive/files/drive-entry';
import React from 'react';
import {useDetachTagFromTaggables} from '@common/tags/use-detach-tag-from-taggables';
import {useTaggableTags} from '@common/tags/use-taggable-tags';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Button} from '@ui/buttons/button';
import {ManageTagsDialog} from '@common/tags/manage-tags-dialog';
import {ChipList} from '@ui/forms/input-field/chip-field/chip-list';
import {Chip} from '@ui/forms/input-field/chip-field/chip';
import {AddIcon} from '@ui/icons/material/Add';
import {useAuth} from '@common/auth/use-auth';

interface Props {
  entry: DriveEntry;
}
export function DetailsSidebarTags({entry}: Props) {
  const {user} = useAuth();
  const detachTag = useDetachTagFromTaggables();
  const {data, isFetching} = useTaggableTags({
    taggableType: 'fileEntry',
    taggableId: entry.id,
    initialData: entry.tags?.filter(tag => tag.type !== 'label'),
    type: 'custom',
  });
  return (
    <div className="mt-20 border-t pt-20">
      <DetailsSidebarSectionHeader margin="mb-10">
        <Trans message="Tags" />
      </DetailsSidebarSectionHeader>
      <div className="flex items-center gap-8">
        <ChipList
          size="sm"
          radius="rounded-button"
          startButton={
            <DialogTrigger type="modal">
              <Button
                variant="outline"
                startIcon={<AddIcon />}
                size="2xs"
                className="min-h-26"
              >
                <Trans message="Add tag" />
              </Button>
              <ManageTagsDialog
                attachedTags={data?.tags}
                isLoading={isFetching}
                tagType="custom"
                taggableType="fileEntry"
                taggableIds={[entry.id]}
                userId={user?.id}
              />
            </DialogTrigger>
          }
        >
          {data?.tags.map(tag => (
            <Chip
              key={tag.id}
              disabled={detachTag.isPending || isFetching}
              onRemove={() => {
                detachTag.mutate({
                  tagId: tag.id,
                  taggableIds: [entry.id],
                  taggableType: 'fileEntry',
                });
              }}
            >
              {tag.display_name || tag.name}
            </Chip>
          ))}
        </ChipList>
      </div>
    </div>
  );
}
