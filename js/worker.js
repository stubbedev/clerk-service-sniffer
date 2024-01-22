async function handleIcon(request, sender){
  const color = request.message.status ? '#50fa7b' : '#ff5555';
  const text = request.message.status ? 'YES' : 'NO';
  const icons = request.message.status ? {
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
  await chrome.action.setBadgeBackgroundColor({color: color, tabId: sender.tab.id});
  await chrome.action.setBadgeText({ text: text, tabId: sender.tab.id });
  await chrome.action.setIcon({path: icons, tabId: sender.tab.id});
  return true;
}

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
      if(request.source == 'CleSS' && request.type == 'icon'){
          await handleIcon(request, sender);
      }
    }
);

//trying to trigger refreshPopupDataOnOpen fun in popup.js 
// it does not like this 
//chrome.runtime.sendMessage({ message: { status: true } });




