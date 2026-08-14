import React from 'react';
import {useForm} from 'react-hook-form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Button} from '@ui/buttons/button';
import {toast} from '@ui/toast/toast';
import {Form} from '@ui/forms/form';
import {useCreateFolder} from '../queries/create-folder';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {Trans} from '@ui/i18n/trans';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';

interface FormValue {
  name?: string;
}

interface NewFolderDialogProps {
  parentId: number;
}
export function NewFolderDialog({parentId}: NewFolderDialogProps) {
  const {close, formId} = useDialogContext();
  const {trans} = useTrans();
  const form = useForm({
    defaultValues: {
      name: trans({message: 'Untitled Folder'}),
    },
  });
  const createFolder = useCreateFolder(form);

  const onSubmit = (value: Required<FormValue>) => {
    createFolder.mutate(
      {...value, parentId},
      {
        onSuccess: response => {
          close(response.folder);
          toast(message('Folder created'));
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogHeader>
        <Trans message="New Folder" />
      </DialogHeader>
      <DialogBody>
        <Form onSubmit={onSubmit} form={form} id={formId}>
          <FormTextField
            placeholder={trans({
              message: 'Enter a name...',
            })}
            aria-label="Entry name"
            autoFocus
            autoSelectText
            name="name"
            required
            minLength={3}
            maxLength={200}
          />
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button variant="flat" onClick={() => close()}>
          <Trans message="Cancel" />
        </Button>
        <Button
          form={formId}
          type="submit"
          variant="flat"
          color="primary"
          disabled={createFolder.isPending}
        >
          <Trans message="Create" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
