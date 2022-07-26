async function setFalse(sender){
    await chrome.action.setBadgeBackgroundColor({color: '#ff5555', tabId: sender.tab.id});
    await chrome.action.setBadgeText({ text: 'NO', tabId: sender.tab.id });
    await chrome.action.setIcon({
        path: {
            16: "/assets/icons/greyscale/16.png",
            32: "/assets/icons/greyscale/32.png",
            48: "/assets/icons/greyscale/48.png",
            128: "/assets/icons/greyscale/128.png"
        },
        tabId: sender.tab.id
    });
}

async function setTrue(sender){
    await chrome.action.setBadgeBackgroundColor({color: '#50fa7b', tabId: sender.tab.id});
    await chrome.action.setBadgeText({ text: 'YES', tabId: sender.tab.id });
    await chrome.action.setIcon({
        path: {
            16: "/assets/icons/color/16.png",
            32: "/assets/icons/color/32.png",
            48: "/assets/icons/color/48.png",
            128: "/assets/icons/color/128.png"
        },
        tabId: sender.tab.id
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.clerk === 'true' ) {
            setTrue(sender);
        }
        if( request.clerk === 'false' ) {
            setFalse(sender);
        }
        return true;
    }
);