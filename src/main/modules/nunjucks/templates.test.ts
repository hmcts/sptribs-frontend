import path from 'path';

import { Environment, FileSystemLoader } from 'nunjucks';

const root = path.join(__dirname, '..', '..');
const templates = new Environment(
  new FileSystemLoader([
    path.join(root, 'steps'),
    path.join(root, '..', '..', 'node_modules', 'govuk-frontend', 'dist'),
    path.join(root, 'views'),
    path.join(root, 'routes', 'authless', 'views'),
  ]),
  { autoescape: true }
);

templates.addGlobal('globals', { basePath: '', dynatrace: { dynatraceUrl: '/monitor.js' } });
templates.addGlobal('getError', () => false);

const page = {
  serviceName: 'Example service',
  isLoggedIn: true,
  signOut: 'Sign out',
  phase: 'BETA',
  feedback: 'Give feedback',
  languageToggle: '',
  content: { serviceTitle: 'Example service', banner: 'Give feedback' },
  language: 'Cymraeg',
  ToggleLanguage: 'cy',
  loginURL: '/login',
};

describe('GOV.UK page templates', () => {
  test.each(['common/page.njk', 'timed-out/template.njk', 'save-sign-out/template.njk', 'template.njk', 'landing.njk'])(
    '%s renders one semantic header and footer',
    template => {
      const html = templates.render(template, page);

      expect(html.match(/<header\b/g)).toHaveLength(1);
      expect(html.match(/<footer\b/g)).toHaveLength(1);
      expect(html).toContain('href="/assets/images/favicon.svg"');
    }
  );

  test('the main page keeps navigation and the phase banner in the header', () => {
    const html = templates.render('common/page.njk', page);
    const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));

    expect(header).toContain('govuk-service-navigation');
    expect(header).toContain('href="/logout"');
    expect(header).toContain('govuk-phase-banner');
    expect(html.indexOf('govuk-back-link')).toBeGreaterThan(html.indexOf('</header>'));
  });

  test.each(['common/page.njk', 'timed-out/template.njk', 'save-sign-out/template.njk'])(
    '%s places the skip link before the cookie banner and the header',
    template => {
      const html = templates.render(template, page);

      expect(html).toContain('govuk-skip-link');
      expect(html).toContain('govuk-cookie-banner');
      expect(html.indexOf('govuk-skip-link')).toBeLessThan(html.indexOf('govuk-cookie-banner'));
      expect(html.indexOf('govuk-cookie-banner')).toBeLessThan(html.indexOf('<header'));
    }
  );

  test('the timed-out page has a service name but no sign-out link', () => {
    const html = templates.render('timed-out/template.njk', page);

    expect(html).toContain('govuk-service-navigation__service-name');
    expect(html).not.toContain('href="/logout"');
  });

  test('the signed-out page has no service navigation', () => {
    expect(templates.render('save-sign-out/template.njk', page)).not.toContain('govuk-service-navigation');
  });

  test('the authless landing keeps its service name and language link', () => {
    const html = templates.render('landing.njk', page);

    expect(html).toContain('govuk-service-navigation__service-name');
    expect(html).toContain('href="?lang=cy"');
  });
});
