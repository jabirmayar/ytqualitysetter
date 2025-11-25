/* Handles user interaction in the popup and saves preferences to storage */
document.addEventListener('DOMContentLoaded', () => {
    const qualitySelect = document.getElementById('quality');
    const saveButton = document.getElementById('save');
    const cancelButton = document.getElementById('cancel');

    chrome.storage.sync.get('preferredQuality', ({ preferredQuality }) => {
        if (preferredQuality) {
            qualitySelect.value = preferredQuality;
        } else {
            qualitySelect.value = 'highres';
        }
    });

    saveButton.addEventListener('click', () => {
        const preferredQuality = qualitySelect.value;
        chrome.storage.sync.set({ preferredQuality }, () => {
            saveButton.textContent = 'Saved!';
            setTimeout(() => window.close(), 500);
        });
    });

    cancelButton.addEventListener('click', () => {
        window.close();
    });
});