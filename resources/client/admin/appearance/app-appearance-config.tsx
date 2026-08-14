import {
  IAppearanceConfig,
  MenuSectionConfig,
  SeoSettingsSectionConfig,
} from '@common/admin/appearance/types/appearance-editor-config';
import {message} from '@ui/i18n/message';
import {lazyAdminRoute} from '@common/admin/routes/lazy-admin-route';

export const AppAppearanceConfig: IAppearanceConfig = {
  preview: {
    defaultRoute: 'drive',
    navigationRoutes: ['s', 'drive'],
  },
  sections: {
    'landing-page': {
      label: message('Landing Page'),
      position: 1,
      previewRoute: '/',
      routes: [
        {
          path: 'landing-page',
          lazy: () => lazyAdminRoute('LandingPageAppearanceForm'),
          children: [
            {
              index: true,
              lazy: () => lazyAdminRoute('LandingPageSectionGeneral'),
            },
            {
              path: 'action-buttons',
              lazy: () => lazyAdminRoute('LandingPageSectionActionButtons'),
            },
            {
              path: 'primary-features',
              lazy: () => lazyAdminRoute('LandingPageSectionPrimaryFeatures'),
            },
            {
              path: 'secondary-features',
              lazy: () => lazyAdminRoute('LandingPageSecondaryFeatures'),
            },
          ],
        },
      ],
    },
    // missing label will get added by deepMerge from default config
    // @ts-ignore
    menus: {
      config: {
        positions: [
          'drive-navbar',
          'drive-sidebar',
          'homepage-navbar',
          'shareable-link-page',
          'footer',
          'footer-secondary',
        ],
        availableRoutes: [
          '/drive',
          '/drive/shares',
          '/drive/recent',
          '/drive/starred',
          '/drive/trash',
        ],
      } as MenuSectionConfig,
    },
    // @ts-ignore
    'seo-settings': {
      config: {
        pages: [
          {
            key: 'landing-page',
            label: message('Landing page'),
          },
          {
            key: 'shareable-link-page',
            label: message('Shareable link page'),
          },
        ],
      } as SeoSettingsSectionConfig,
    },
  },
};
