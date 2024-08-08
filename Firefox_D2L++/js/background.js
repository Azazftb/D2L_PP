chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        // Get the extension settings from storage
        chrome.storage.sync.get([
            'extensionEnabled', 
            'selectedTheme', 
            'themeToggle', 
            'useCustomLogo', 
            'originalLogo'
        ], (data) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            const {
                extensionEnabled,
                selectedTheme,
                themeToggle,
                useCustomLogo,
                originalLogo
            } = data;

            // Check if the extension is enabled
            if (!extensionEnabled) {
                chrome.tabs.sendMessage(tabId, { 
                    action: 'toggleExtension', 
                    status: false, 
                    originalLogo: originalLogo 
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("Error: Could not establish connection. Receiving end does not exist.");
                    }
                });
                return;
            }

            // Apply the selected theme if enabled
            if (themeToggle && selectedTheme) {
                chrome.tabs.sendMessage(tabId, { 
                    action: 'applyTheme', 
                    theme: selectedTheme 
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("Error: Could not establish connection. Receiving end does not exist.");
                    }
                });
            }

            // Replace the logo if custom logo is used
            chrome.tabs.sendMessage(tabId, { 
                action: 'replaceLogo', 
                useCustomLogo: useCustomLogo, 
                originalLogo: originalLogo 
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Error: Could not establish connection. Receiving end does not exist.");
                }
            });
        });
    }
});
