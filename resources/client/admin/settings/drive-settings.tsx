import {Trans} from '@ui/i18n/trans';
import {FormRadioGroup} from '@ui/forms/radio-group/radio-group';
import {FormRadio} from '@ui/forms/radio-group/radio';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {
  AdminSettingsForm,
  AdminSettingsLayout,
} from '@common/admin/settings/form/admin-settings-form';
import React from 'react';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {useForm} from 'react-hook-form';

export function DriveSettings() {
  return (
    <AdminSettingsLayout
      title={<Trans message="Drive" />}
      description={
        <Trans message="Configure defaults for drive user dashboard." />
      }
    >
      {data => <Form data={data} />}
    </AdminSettingsLayout>
  );
}

interface FormProps {
  data: AdminSettings;
}
function Form({data}: FormProps) {
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        drive: {
          default_view: data.client.drive?.default_view ?? 'list',
          send_share_notification:
            data.client.drive?.send_share_notification ?? false,
        },
        share: {
          suggest_emails: data.client.share?.suggest_emails ?? false,
        },
      },
    },
  });

  return (
    <AdminSettingsForm form={form}>
      <FormRadioGroup
        required
        className="mb-30"
        size="md"
        name="client.drive.default_view"
        orientation="vertical"
        label={<Trans message="Default view mode" />}
        description={
          <Trans message="Which view mode should user drive use by default." />
        }
      >
        <FormRadio value="list">
          <Trans message="List" />
        </FormRadio>
        <FormRadio value="grid">
          <Trans message="Grid" />
        </FormRadio>
      </FormRadioGroup>
      <FormSwitch
        className="mb-30"
        name="client.drive.send_share_notification"
        description={
          <Trans message="Send a notification to user when a file or folder is shared with them." />
        }
      >
        <Trans message="Share notifications" />
      </FormSwitch>
      <FormSwitch
        name="client.share.suggest_emails"
        description={
          <Trans message="Suggest email address of existing users when sharing a file or folder." />
        }
      >
        <Trans message="Suggest emails" />
      </FormSwitch>
    </AdminSettingsForm>
  );
}
