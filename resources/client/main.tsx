import './App.css';
import React from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {CommonProvider} from '@common/core/common-provider';
import {LandingPageContent} from './landing/landing-page-content';
import * as Sentry from '@sentry/react';
import {ignoredSentryErrors} from '@common/errors/ignored-sentry-errors';
import {appRouter} from '@app/app-router';
import {Product} from '@common/billing/product';
import {FetchShareableLinkPageResponse} from '@app/drive/shareable-link/queries/use-shareable-link-page';
import {FetchCustomPageResponse} from '@common/custom-page/use-custom-page';
import {BaseBackendSettings} from '@common/core/settings/base-backend-settings';
import {BaseBackendBootstrapData} from '@common/core/base-backend-bootstrap-data';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {rootEl} from '@ui/root-el';
import {BaseBackendUser} from '@common/auth/base-backend-user';

declare module '@ui/settings/settings' {
  interface Settings extends BaseBackendSettings {
    homepage: {
      appearance: LandingPageContent;
      type: 'loginPage' | 'registerPage' | string;
      value?: any;
    };
    drive: {
      details_default_visibility: boolean;
      default_view: 'list' | 'grid';
      send_share_notification: boolean;
    };
    share?: {
      suggest_emails: boolean;
    };
    ads?: {
      drive?: string;
      'file-preview'?: string;
      'landing-top'?: string;
      disable?: boolean;
    };
  }
}

declare module '@ui/bootstrap-data/bootstrap-data' {
  interface BootstrapData extends BaseBackendBootstrapData {
    loaders?: {
      landingPage?: {
        products: Product[];
      };
      customPage?: FetchCustomPageResponse;
      shareableLinkPage?: FetchShareableLinkPageResponse;
    };
  }
}

declare module '@ui/types/user' {
  interface User extends BaseBackendUser {
    //
  }
}

const data = getBootstrapData();
const sentryDsn = data.settings.logging.sentry_public;
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 0.2,
    ignoreErrors: ignoredSentryErrors,
    release: data.sentry_release,
  });
}

const app = <CommonProvider router={appRouter} />;

if (data.rendered_ssr) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
