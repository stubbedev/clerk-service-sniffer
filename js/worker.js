async function handleIcon(request, sender){
  const color = request.status ? '#50fa7b' : '#ff5555';
  const text = request.status ? 'YES' : 'NO';
  const icons = request.status ? {
            16: "/assets/icons/color/16.png",
            32: "/assets/icons/color/32.png",
            48: "/assets/icons/color/48.png",
            128: "/assets/icons/color/128.png"
        } : {
            16: "/assets/icons/greyscale/16.png",
            32: "/assets/icons/greyscale/32.png",
            48: "/assets/icons/greyscale/48.png",
            128: "/assets/icons/greyscale/128.png"
        };
  const tabId = sender.tab.id;
  await chrome.action.setBadgeBackgroundColor({color: color, tabId: tabId});
  await chrome.action.setBadgeText({ text: text, tabId: tabId });
  await chrome.action.setIcon({path: icons, tabId: tabId});
}

async function handlePopup(request, sender){
  return;
}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.source == 'CleSS'){
        if(request.type == 'icon'){
          handleIcon(request, sender);
        } else if(request.type == 'popup') {
          handlePopup(request, sender);
        }
      }
    }
);
