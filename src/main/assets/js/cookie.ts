import cookieManager from '@hmcts/cookie-manager';

cookieManager.on('UserPreferencesLoaded', preferences => {
  const dataLayer = window.dataLayer || [];
  dataLayer.push({ event: 'Cookie Preferences', cookiePreferences: preferences });
});

cookieManager.on('UserPreferencesSaved', preferences => {
  const dataLayer = window.dataLayer || [];
  const dtrum = window.dtrum;

  dataLayer.push({ event: 'Cookie Preferences', cookiePreferences: preferences });

  if (dtrum !== undefined) {
    if (preferences.apm === 'on') {
      dtrum.enable();
      dtrum.enableSessionReplay();
    } else {
      dtrum.disableSessionReplay();
      dtrum.disable();
    }
  }
});

cookieManager.on('PreferenceFormSubmitted', () => {
  const message = document.querySelector('.cookie-preference-success') as HTMLElement;
  message.style.display = 'block';
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});

cookieManager.init({
  userPreferences: {
    cookieName: 'sptribs-cookie-preferences',
  },
  cookieBanner: {
    class: 'cookie-banner',
    actions: [
      {
        name: 'accept',
        buttonClass: 'cookie-banner-accept-button',
        confirmationClass: 'cookie-banner-accept-message',
        consent: true,
      },
      {
        name: 'reject',
        buttonClass: 'cookie-banner-reject-button',
        confirmationClass: 'cookie-banner-reject-message',
        consent: false,
      },
      {
        name: 'hide',
        buttonClass: 'cookie-banner-hide-button',
      },
    ],
  },
  cookieManifest: [
    {
      categoryName: 'essential',
      optional: false,
      cookies: ['sptribs-cookie-preferences'],
    },
    {
      categoryName: 'analytics',
      optional: true,
      cookies: ['_ga', '_gid'],
    },
    {
      categoryName: 'apm',
      optional: true,
      cookies: ['dtCookie', 'dtLatC', 'dtPC', 'dtSa', 'rxVisitor', 'rxvt'],
    },
  ],
});

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    dtrum: DtrumApi;
  }
}

interface DtrumApi {
  enable(): void;
  enableSessionReplay(): void;
  disable(): void;
  disableSessionReplay(): void;
}
