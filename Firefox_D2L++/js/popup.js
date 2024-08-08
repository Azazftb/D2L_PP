document.addEventListener('DOMContentLoaded', () => {
    const toggleExtensionSwitch = document.getElementById('toggle-extension');
    const toggleSlider = document.getElementById('toggle-slider');
    const optionsButton = document.getElementById('options');

    // Load the saved state
    chrome.storage.sync.get('extensionEnabled', (data) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        toggleExtensionSwitch.checked = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
    });

    // Debounce function to handle rapid toggling
    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Toggle the entire extension on and off
    const toggleExtension = debounce(() => {
        const newExtensionStatus = toggleExtensionSwitch.checked;
        chrome.storage.sync.set({ extensionEnabled: newExtensionStatus }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { action: 'toggleExtension', status: newExtensionStatus });
                });
            });
        });
    }, 300);

    toggleSlider.addEventListener('click', () => {
        toggleExtensionSwitch.checked = !toggleExtensionSwitch.checked;
        toggleExtension();
    });

    // Navigate to the options page
    optionsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
