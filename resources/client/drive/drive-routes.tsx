import {RouteObject} from 'react-router';
import React from 'react';
import {AuthRoute} from '@common/auth/guards/auth-route';
import {ActiveWorkspaceProvider} from '@common/workspace/active-workspace-id-context';

const lazyDriveRoute = async (
  cmp: keyof typeof import('@app/drive/drive-routes.lazy'),
) => {
  const exports = await import('@app/drive/drive-routes.lazy');
  return {
    Component: exports[cmp],
  };
};

export const driveRoutes: RouteObject[] = [
  {
    path: 'drive',
    element: (
      <ActiveWorkspaceProvider>
        <AuthRoute />
      </ActiveWorkspaceProvider>
    ),
    children: [
      {
        index: true,
        lazy: () => lazyDriveRoute('DriveLayout'),
      },
      {
        path: 'folders/:hash',
        lazy: () => lazyDriveRoute('DriveLayout'),
      },
      {
        path: 'shares',
        lazy: () => lazyDriveRoute('DriveLayout'),
      },
      {
        path: 'recent',
        lazy: () => lazyDriveRoute('DriveLayout'),
      },
      {
        path: 'starred',
        lazy: () => lazyDriveRoute('DriveLayout'),
      },
      {
        path: 'trash',
        lazy: () => lazyDriveRoute('DriveLayout'),
      },
      {
        path: 'search',
        lazy: () => lazyDriveRoute('DriveLayout'),
      },
    ],
  },
  {path: 'drive/s/:hash', lazy: () => lazyDriveRoute('ShareableLinkPage')},
];
