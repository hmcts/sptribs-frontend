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
      let previousPagesArray = previousPages.split(',');
      if (previousPagesArray.includes('/application-submitted:/check-your-answers')) {
        sessionStorage.clear();
        previousPagesArray = [];
      }
      for (let i = 0; i < previousPagesArray.length; i++) {
        if (NON_FORM_PAGES.includes(location.pathname) && i === previousPagesArray.length - 1) {
          previousPage = previousPagesArray[i].split(':')[0];
          break;
        } else if (previousPagesArray[i].split(':')[0] === location.pathname) {
          previousPage = previousPagesArray[i].split(':')[1];
          sessionStorage.setItem(PREVIOUS_KEY, previousPagesArray.slice(0, previousPagesArray.length - 1).join());
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
      const previousPagesArray = previousPages.split(',');
      let previousAdded = false;
      for (let i = 0; i < previousPagesArray.length; i++) {
        if (previousPagesArray[i].split(':')[0] === location.pathname) {
          if (location.pathname !== submittedFrom) {
            previousPagesArray[i] = location.pathname + ':' + submittedFrom;
            previousAdded = true;
          }
          break;
        }
      }
      if (!previousAdded && location.pathname !== submittedFrom) {
        previousPagesArray.push(location.pathname + ':' + submittedFrom);
      }
      sessionStorage.setItem(PREVIOUS_KEY, previousPagesArray.join());
    } else if (location.pathname !== submittedFrom) {
      sessionStorage.setItem(PREVIOUS_KEY, location.pathname + ':' + submittedFrom);
    }
    sessionStorage.setItem(SUBMITTED_KEY, '');
  }
};
