import {RouteObject} from 'react-router';
import {lazyAdminRoute} from '@common/admin/routes/lazy-admin-route';

export const appSettingsRoutes: RouteObject[] = [
  {path: 'drive', lazy: () => lazyAdminRoute('DriveSettings')},
];
