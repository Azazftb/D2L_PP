function applyStoredSettings() {
    chrome.storage.sync.get(['extensionEnabled', 'fontSize', 'fullWidth', 'useCustomLogo', 'selectedTheme', 'brightness', 'removeBanner'], (data) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        if (!data.extensionEnabled) {
            // Reset settings when the extension is turned off
            document.documentElement.style.fontSize = '';
            document.body.classList.remove('d2lpp-fullwidth');
            replaceLogo(false);
            removeTheme();
            setBrightness(100); // Reset brightness to 100%
            showBanner(true);   // Ensure banner is shown
            return;
        }

        // Apply stored settings if the extension is enabled
        if (data.fontSize) {
            document.documentElement.style.fontSize = `${data.fontSize}px`;
        }
        if (data.fullWidth !== undefined) {
            applyFullWidth(data.fullWidth);
        }
        if (data.useCustomLogo !== undefined) {
            replaceLogo(data.useCustomLogo);
        }
        if (data.selectedTheme) {
            applyTheme(data.selectedTheme);
        }
        if (data.brightness !== undefined) {
            setBrightness(data.brightness);
        }
        if (data.removeBanner !== undefined) {
            showBanner(!data.removeBanner);
        }
    });
}

function showBanner(show) {
    const bannerElements = document.querySelectorAll('.d2l-course-banner-container');
    bannerElements.forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
}

function applyFullWidth(fullWidth) {
    const className = 'd2lpp-fullwidth';
    if (fullWidth) {
        document.body.classList.add(className);
    } else {
        document.body.classList.remove(className);
    }
}

function replaceLogo(useCustomLogo) {
    const defaultLogoPath = '/d2l/lp/navbars/6605/theme/viewimage/964937/view?v=20.24.6.19120'; // Replace with your default logo path
    const customLogoPath = chrome.runtime.getURL('images/d2l_PP.png');
    const logoPath = useCustomLogo ? customLogoPath : defaultLogoPath;
    const logoSelectors = [
        'd2l-navigation-link-image.d2l-navigation-s-logo',
        '.d2l-navigation-link-image-container img'
    ];

    logoSelectors.forEach(selector => {
        const logoElements = document.querySelectorAll(selector);
        logoElements.forEach(logoElement => {
            if (logoElement.tagName === 'IMG') {
                logoElement.src = logoPath;
            } else if (logoElement.tagName === 'D2L-NAVIGATION-LINK-IMAGE') {
                logoElement.setAttribute('src', logoPath);
                const shadowRoot = logoElement.shadowRoot;
                if (shadowRoot) {
                    const imgElement = shadowRoot.querySelector('img');
                    if (imgElement) {
                        imgElement.src = logoPath;
                    }
                }
            }
        });
    });
}

function removeTheme() {
    // Remove any applied theme styles
    const themeStyles = document.querySelectorAll('link[rel="stylesheet"][id^="theme-"]');
    themeStyles.forEach(style => style.remove());
}

function applyTheme(theme) {
    removeTheme(); // Ensure no other themes are applied
    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.id = `theme-${theme.toLowerCase()}`;
    themeLink.href = chrome.runtime.getURL(`css/themes/${theme}/${theme}.css`);
    document.head.appendChild(themeLink);
}

function setBrightness(brightness) {
    const brightnessValue = brightness / 100; // Normalize the brightness value
    const elements = document.querySelectorAll('.d2l-course-image, .d2l-course-banner > img');
    elements.forEach(el => {
        el.style.filter = `brightness(${brightnessValue})`;
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleExtension') {
        chrome.storage.sync.set({ extensionEnabled: message.status }, function () {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            applyStoredSettings();
        });
    }
    if (message.fontSize) {
        document.documentElement.style.fontSize = `${message.fontSize}px`;
    }
    if (message.fullWidth !== undefined) {
        applyFullWidth(message.fullWidth);
    }
    if (message.useCustomLogo !== undefined) {
        replaceLogo(message.useCustomLogo);
    }
    if (message.brightness !== undefined) {
        setBrightness(message.brightness);
    }
    if (message.removeBanner !== undefined) {
        showBanner(!message.removeBanner);
    }
});

applyStoredSettings();

document.addEventListener('DOMContentLoaded', function () {
    console.log('Content script loaded');
});
