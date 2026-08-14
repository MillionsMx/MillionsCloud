import {ComponentType} from 'react';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';

export interface EntryAction {
  label: MessageDescriptor;
  icon: ComponentType<SvgIconProps>;
  key: string;
  execute: () => void;
}
