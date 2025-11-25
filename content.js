(function() {
    /* Guard to prevent script from running multiple times in the same tab */
    if (window.hasRunYouTubeQualitySelector) {
        return;
    }
    window.hasRunYouTubeQualitySelector = true;

    const QUALITY_RANKS = {
        'highres': 9999,
        '4320p': 4320,
        '2160p': 2160,
        '1440p': 1440,
        '1080p': 1080,
        '720p': 720,
        '480p': 480,
        '360p': 360,
        '240p': 240,
        '144p': 144
    };

    /* Parses resolution numbers from the menu text */
    function getNumericQuality(text) {
        const match = text.match(/(\d+)p/);
        if (match) return parseInt(match[1]);
        return 0;
    }

    /* Core logic to navigate menus and apply the best available free quality */
    function selectBestQuality() {
        chrome.storage.sync.get('preferredQuality', ({ preferredQuality }) => {
            const userPref = preferredQuality || 'highres';
            const targetRank = QUALITY_RANKS[userPref] || 1080;

            const settingsBtn = document.querySelector('.ytp-settings-button');
            if (!settingsBtn) return;

            settingsBtn.click();

            setTimeout(() => {
                const menuItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
                const qualityMenuItem = menuItems.find(item => {
                    const label = item.querySelector('.ytp-menuitem-label');
                    return label && label.innerText.includes('Quality');
                });

                if (qualityMenuItem) {
                    qualityMenuItem.click();

                    setTimeout(() => {
                        const rawOptions = Array.from(document.querySelectorAll('.ytp-quality-menu .ytp-menuitem'));
                        
                        if (rawOptions.length > 0) {
                            const validOptions = rawOptions
                                .map(opt => {
                                    const text = opt.innerText;
                                    return { 
                                        element: opt, 
                                        value: getNumericQuality(text), 
                                        text: text,
                                        isPremium: text.includes('Premium') || text.includes('Enhanced'),
                                        isAuto: text.toLowerCase().includes('auto')
                                    };
                                })
                                .filter(item => !item.isAuto && item.value > 0);

                            validOptions.sort((a, b) => {
                                if (b.value !== a.value) {
                                    return b.value - a.value;
                                }
                                return a.isPremium - b.isPremium;
                            });

                            let optionToClick = null;

                            if (userPref === 'highres') {
                                optionToClick = validOptions[0];
                            } else {
                                const exactMatch = validOptions.find(q => q.value === targetRank && !q.isPremium);
                                optionToClick = exactMatch || validOptions[0];
                            }

                            if (optionToClick) {
                                const isChecked = optionToClick.element.getAttribute('aria-checked') === 'true';
                                if (!isChecked) {
                                    optionToClick.element.click();
                                } else {
                                    settingsBtn.click();
                                }
                                
                                setTimeout(() => {
                                    const menuStillOpen = document.querySelector('.ytp-popup-settings[aria-hidden="false"]');
                                    if(menuStillOpen) settingsBtn.click();
                                }, 100);
                            } else {
                                settingsBtn.click();
                            }
                        } else {
                            settingsBtn.click();
                        }
                    }, 200);
                } else {
                    settingsBtn.click();
                }
            }, 200);
        });
    }

    /* Single observer instance to handle page navigation and new video loads */
    const observer = new MutationObserver((mutations) => {
        if (window.location.href.includes('/watch')) {
            const video = document.querySelector('video');
            if (video && !video.getAttribute('data-quality-set')) {
                video.setAttribute('data-quality-set', 'true');
                setTimeout(selectBestQuality, 1000);
            }
        }
    });

    /* Safe initialization to attach the observer */
    function init() {
        if (!document.body) {
            window.requestAnimationFrame(init);
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(selectBestQuality, 2000);
        }
    }

    init();
})();