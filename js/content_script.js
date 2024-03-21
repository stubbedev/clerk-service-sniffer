const s = document.createElement('script');
s.src = chrome.runtime.getURL('js/injected.js');
s.onload = async function () {
    this.remove();
};
(document.head || document.documentElement).prepend(s);

window.addEventListener("message", (event) => {
  if (event.source  != window 
    || ! event.data 
    || ! event.data.type 
    || event.data.source != 'CleSS' 
    || ! chrome.runtime?.id) {
    return;
  }
  chrome.runtime.sendMessage({type: event.data.type, source: event.data.source, message: event.data.message })

}, false);

window.addEventListener('load', function(e){
  chrome.runtime.sendMessage({type: "window_load_complete", source: "CleSS", message: { showPlaceholder: false } })
});


