document.addEventListener('DOMContentLoaded', () => {
    const themes = ['default', 'Cyberpunk', 'Hacks', 'Midnight', 'MysticBlue', 'RoyalPurple'];
    const menuButtons = document.querySelectorAll('.menu button');
    const pages = document.querySelectorAll('.white-card');
    const defaultFontSize = 16;
    const defaultFullWidth = false;
    const defaultUseCustomLogo = false;
    const defaultBrightness = 100;
    const defaultRemoveBanner = false;

    // Function to apply the selected theme
    function applyTheme(theme) {
        themes.forEach(t => {
            const card = document.getElementById(`theme-${t.toLowerCase()}-card`);
            const button = document.getElementById(`apply-${t.toLowerCase()}`);
            if (t === theme) {
                card.classList.add('selected-theme');
                button.classList.add('applied');
                button.textContent = 'Applied!';
            } else {
                card.classList.remove('selected-theme');
                button.classList.remove('applied');
                button.textContent = 'Apply';
            }
        });
        // Send a message to content scripts to apply the selected theme
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { selectedTheme: theme });
            });
        });
    }

    // Function to show the selected page
    function showPage(pageId) {
        menuButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `menu-${pageId.replace('page-', '')}`) {
                btn.classList.add('active');
            }
        });
        pages.forEach(page => {
            page.style.display = 'none';
            if (page.id === pageId) {
                page.style.display = 'flex';
            }
        });
    }

    // Function to enable or disable the brightness slider
    function toggleBrightnessSlider(disable) {
        const brightnessSlider = document.getElementById('brightness');
        brightnessSlider.disabled = disable;
        if (disable) {
            brightnessSlider.style.opacity = 0.5;
            brightnessSlider.style.cursor = 'not-allowed';
        } else {
            brightnessSlider.style.opacity = 1;
            brightnessSlider.style.cursor = 'pointer';
        }
    }

    // Load settings from storage
    chrome.storage.sync.get(['selectedTheme', 'activePage', 'fontSize', 'fullWidth', 'useCustomLogo', 'brightness', 'removeBanner'], (data) => {
        if (data.selectedTheme) applyTheme(data.selectedTheme);
        if (data.activePage) {
            showPage(`page-${data.activePage}`);
        } else {
            showPage('page-1');
        }
        if (data.fontSize) {
            document.getElementById('font-size').value = data.fontSize;
            applyFontSize(data.fontSize);
        } else {
            applyFontSize(defaultFontSize);
        }
        if (data.fullWidth !== undefined) {
            document.getElementById('full-width').checked = data.fullWidth;
            applyFullWidth(data.fullWidth);
        } else {
            applyFullWidth(defaultFullWidth);
        }
        if (data.useCustomLogo !== undefined) {
            document.getElementById('toggle-logo').checked = data.useCustomLogo;
            applyLogoSetting(data.useCustomLogo);
        } else {
            applyLogoSetting(defaultUseCustomLogo);
        }
        if (data.brightness !== undefined) {
            document.getElementById('brightness').value = data.brightness;
            applyBrightness(data.brightness);
        } else {
            applyBrightness(defaultBrightness);
        }
        if (data.removeBanner !== undefined) {
            document.getElementById('remove-banner').checked = data.removeBanner;
            applyRemoveBanner(data.removeBanner);
            toggleBrightnessSlider(data.removeBanner);
        } else {
            applyRemoveBanner(defaultRemoveBanner);
            toggleBrightnessSlider(defaultRemoveBanner);
        }
    });

    // Handle menu button clicks to show pages
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pageId = button.id.replace('menu-', 'page-');
            showPage(pageId);
            chrome.storage.sync.set({ activePage: pageId.replace('page-', '') });
        });
    });

    // Handle theme application
    themes.forEach(theme => {
        const button = document.getElementById(`apply-${theme.toLowerCase()}`);
        button.addEventListener('click', () => {
            chrome.storage.sync.set({ selectedTheme: theme });
            applyTheme(theme);
        });
    });

    // Save features and apply settings
    document.getElementById('save-features').addEventListener('click', () => {
        const fontSize = document.getElementById('font-size').value;
        const fullWidth = document.getElementById('full-width').checked;
        const useCustomLogo = document.getElementById('toggle-logo').checked;
        const brightness = document.getElementById('brightness').value;
        const removeBanner = document.getElementById('remove-banner').checked;
        chrome.storage.sync.set({ fontSize, fullWidth, useCustomLogo, brightness, removeBanner }, () => {
            const savedMessage = document.getElementById('saved-message');
            savedMessage.style.display = 'block';
            setTimeout(() => savedMessage.style.display = 'none', 2000);
            applyFontSize(fontSize);
            applyFullWidth(fullWidth);
            applyLogoSetting(useCustomLogo);
            applyBrightness(brightness);
            applyRemoveBanner(removeBanner);
            toggleBrightnessSlider(removeBanner);
        });
    });

    // Reset to default settings
    document.getElementById('reset-default').addEventListener('click', () => {
        document.getElementById('font-size').value = defaultFontSize;
        document.getElementById('full-width').checked = defaultFullWidth;
        document.getElementById('toggle-logo').checked = defaultUseCustomLogo;
        document.getElementById('brightness').value = defaultBrightness;
        document.getElementById('remove-banner').checked = defaultRemoveBanner;
        chrome.storage.sync.set({ fontSize: defaultFontSize, fullWidth: defaultFullWidth, useCustomLogo: defaultUseCustomLogo, brightness: defaultBrightness, removeBanner: defaultRemoveBanner }, () => {
            const savedMessage = document.getElementById('saved-message');
            savedMessage.style.display = 'block';
            setTimeout(() => savedMessage.style.display = 'none', 2000);
            applyFontSize(defaultFontSize);
            applyFullWidth(defaultFullWidth);
            applyLogoSetting(defaultUseCustomLogo);
            applyBrightness(defaultBrightness);
            applyRemoveBanner(defaultRemoveBanner);
            toggleBrightnessSlider(defaultRemoveBanner);
        });
    });

    // Apply font size
    function applyFontSize(fontSize) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { fontSize });
            });
        });
    }

    // Apply full width
    function applyFullWidth(fullWidth) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { fullWidth });
            });
        });
    }

    // Apply logo setting
    function applyLogoSetting(useCustomLogo) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { useCustomLogo });
            });
        });
    }

    // Apply brightness
    function applyBrightness(brightness) {
        const brightnessValue = brightness / 100;
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { brightness: brightnessValue });
            });
        });
    }

    // Apply remove banner setting
    function applyRemoveBanner(removeBanner) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { removeBanner });
            });
        });
    }

    // Disable brightness slider when "Remove Banner" is checked
    document.getElementById('remove-banner').addEventListener('change', (event) => {
        const isChecked = event.target.checked;
        toggleBrightnessSlider(isChecked);
    });
});
