document.addEventListener('DOMContentLoaded', () => {
    const qualitySelect = document.getElementById('quality');
    const saveButton = document.getElementById('save');
    const cancelButton = document.getElementById('cancel');

    // Load saved quality setting asynchronously
    chrome.storage.sync.get('preferredQuality', ({ preferredQuality }) => {
        if (preferredQuality) {
            qualitySelect.value = preferredQuality;
        }
    });

    // Save quality setting and close popup
    saveButton.addEventListener('click', () => {
        const preferredQuality = qualitySelect.value;
        chrome.storage.sync.set({ preferredQuality }, () => {
            console.log('Quality preference saved:', preferredQuality);
            window.close();
        });
    });

    // Close the popup
    cancelButton.addEventListener('click', () => {
        window.close();
    });
});
