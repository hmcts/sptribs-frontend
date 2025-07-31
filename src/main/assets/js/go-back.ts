// Uses session storage to store the previous page for every page, in the format
// sptribs:dss:previousPages=/url-1:/url-2,/url-3:url-4.  This example would mean that
// /url-1 was reached by submitting the form on /url-2, and /url-3 was reached by submitting the form on /url-4.
const backLink: HTMLAnchorElement | null = document.querySelector('.govuk-back-link');
const PREVIOUS_KEY = 'sptribs:dss:previousPages';
const SUBMITTED_KEY = 'sptribs:dss:submittedFrom';
const NON_FORM_PAGES = [
  '/cookies',
  '/privacy-policy',
  '/accessibility-statement',
  '/terms-and-conditions',
  '/contact-us',
];

if (backLink) {
  backLink.onclick = function (e) {
    e.preventDefault();
    const previousPages = sessionStorage.getItem(PREVIOUS_KEY);
    let previousPage;
    if (previousPages) {
      const previousPagesArry = previousPages.split(',');
      if (previousPagesArry.includes('/application-submitted:/check-your-answers')) {
        sessionStorage.clear();
      }
      for (let i = 0; i < previousPagesArry.length; i++) {
        if (NON_FORM_PAGES.includes(location.pathname) && i === previousPagesArry.length - 1) {
          previousPage = previousPagesArry[i].split(':')[0];
          break;
        } else if (previousPagesArry[i].split(':')[0] === location.pathname) {
          previousPage = previousPagesArry[i].split(':')[1];
          sessionStorage.setItem(PREVIOUS_KEY, previousPagesArry.slice(0, previousPagesArry.length - 1).join());
          break;
        }
      }
      if (previousPage) {
        location.pathname = previousPage;
      } else {
        // Should not occur unless the user has directly typed the url, for example
        location.pathname = '/';
      }
    } else {
      // Should not occur unless the user has directly typed the url, for example
      location.pathname = '/';
    }
  };
}

const submitButton: HTMLElement | null = document.getElementById('main-form-submit');
if (submitButton) {
  submitButton.onclick = function () {
    sessionStorage.setItem(SUBMITTED_KEY, location.pathname);
  };
}

window.onload = function () {
  const submittedFrom = sessionStorage.getItem(SUBMITTED_KEY);
  if (submittedFrom) {
    const previousPages = sessionStorage.getItem(PREVIOUS_KEY);
    if (previousPages) {
      const previousPagesArry = previousPages.split(',');
      let previousAdded = false;
      for (let i = 0; i < previousPagesArry.length; i++) {
        if (previousPagesArry[i].split(':')[0] === location.pathname) {
          if (location.pathname !== submittedFrom) {
            previousPagesArry[i] = location.pathname + ':' + submittedFrom;
            previousAdded = true;
          }
          break;
        }
      }
      if (!previousAdded && location.pathname !== submittedFrom) {
        previousPagesArry.push(location.pathname + ':' + submittedFrom);
      }
      sessionStorage.setItem(PREVIOUS_KEY, previousPagesArry.join());
    } else if (location.pathname !== submittedFrom) {
      sessionStorage.setItem(PREVIOUS_KEY, location.pathname + ':' + submittedFrom);
    }
    sessionStorage.setItem(SUBMITTED_KEY, '');
  }
};
