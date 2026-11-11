/*
 * Keep selected-file description text in sync for file inputs.
 * <br/>
 * This script is invoked whenever the file input contains an `aria-describedby` attribute that references an element
 * with `data-selected-file-description`. It makes sure the latter element is updated with the current file.
 * <br/>
 * The use case for this script is that some screen-readers/browser combinations (e.g. VoiceOver/Safari) do not
 * correctly read the currently selected file, so this is a workaround which adds this information as an extra piece of
 * description to the button.
 */

const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"][aria-describedby]');

const getDescriptionTargets = (fileInput: HTMLInputElement): HTMLElement[] => {
  const describedBy = fileInput.getAttribute('aria-describedby');
  if (!describedBy) {
    return [];
  }

  return describedBy
    .split(/\s+/)
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => Boolean(el?.hasAttribute('data-selected-file-description')));
};

const getSelectedFileText = (fileInput: HTMLInputElement): string => {
  const files = fileInput.files;
  if (!files || files.length === 0) {
    return 'No file selected';
  }

  return files.length === 1 ? `Selected file is ${files[0].name}` : `${files.length} files selected`;
};

fileInputs.forEach(fileInput => {
  const targets = getDescriptionTargets(fileInput);
  if (targets.length === 0) {
    return;
  }

  const syncDescription = () => {
    const text = getSelectedFileText(fileInput);
    targets.forEach(target => {
      target.textContent = text;
    });
  };

  fileInput.addEventListener('change', syncDescription);
  syncDescription();
});
