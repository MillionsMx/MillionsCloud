import {
  NotificationListItem,
  NotificationListItemProps,
} from '@common/notifications/notification-list';
import {FileTypeIcon} from '@common/uploads/components/file-type-icon/file-type-icon';

export function FileEntrySharedNotificationRenderer(
  props: NotificationListItemProps,
) {
  return <NotificationListItem lineIconRenderer={IconRenderer} {...props} />;
}

interface IconRendererProps {
  icon: string;
}
function IconRenderer({icon}: IconRendererProps) {
  return <FileTypeIcon className="h-16 w-16" type={icon} />;
}
