const initDocumentDownload = (): void => {
  document.querySelectorAll('.download-link').forEach(link => {
    link.addEventListener('click', () => {
      const row = link.closest('tr');
      if (row) {
        const tag = row.querySelector('.document-tag');
        if (tag && tag.classList.contains('govuk-tag--green')) {
          tag.classList.remove('govuk-tag--green');
          tag.classList.add('govuk-tag--grey');
          tag.textContent = link.getAttribute('data-downloaded-text') || 'Downloaded';
        }
      }
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDocumentDownload);
} else {
  initDocumentDownload();
}
