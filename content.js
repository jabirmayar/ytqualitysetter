let isQualitySettingInProgress = false;

function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        setTimeout(() => waitForElement(selector, callback), 100); // Check every 100ms
    }
}

function setQuality() {
    if (isQualitySettingInProgress) return; // Prevent duplicate execution

    isQualitySettingInProgress = true; // Mark setting as in progress

    waitForElement('video', (player) => {
        const wasPlaying = !player.paused; // Check if the video was playing

        waitForElement('.ytp-settings-button', (settingsButton) => {
            settingsButton.click(); // Open the settings menu

            setTimeout(() => {
                const qualityButton = [...document.querySelectorAll('.ytp-menuitem')].find(el => el.innerText.includes('Quality'));

                if (qualityButton) {
                    qualityButton.click(); // Open the quality settings

                    setTimeout(() => {
                        const qualityOptions = [...document.querySelectorAll('.ytp-quality-menu .ytp-menuitem[role="menuitemradio"]')];

                        if (qualityOptions.length === 0) {
                            console.error('No quality options found');
                            isQualitySettingInProgress = false; // Mark setting as completed
                            return;
                        }

                        // Retrieve the user's preferred quality from storage
                        chrome.storage.sync.get('preferredQuality', ({ preferredQuality }) => {
                            let targetQuality = qualityOptions[qualityOptions.length - 1]; // Default to the highest available quality

                            if (preferredQuality) {
                                const preferredOption = qualityOptions.find(el => el.innerText.includes(preferredQuality));
                                if (preferredOption) {
                                    targetQuality = preferredOption;
                                }
                            }

                            if (targetQuality) {
                                targetQuality.click(); // Set the video quality
                                console.log(`Video quality set to: ${targetQuality.innerText}`);
                            } else {
                                console.error('Target quality option not found');
                            }

                            // Close the settings menu after setting the quality
                            settingsButton.click();

                            // Resume video if it was playing before the quality change
                            if (wasPlaying) {
                                player.play();
                            }

                            isQualitySettingInProgress = false; // Mark setting as completed
                        });
                    }, 500); // Allow time for quality options to load

                } else {
                    console.error('Quality button not found in settings menu');
                    isQualitySettingInProgress = false; // Mark setting as completed
                }
            }, 500); // Allow time for the settings menu to open
        });
    });
}

// Initialize quality setting on script load
setQuality();
