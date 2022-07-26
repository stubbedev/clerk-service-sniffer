const s = document.createElement('script');
s.src = chrome.runtime.getURL('js/injected.js');
s.onload = async function () {
    this.remove();
};
(document.head || document.documentElement).prepend(s);

window.addEventListener("message", (event) => {
  if (event.source != window) {
    return;
  }

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage({clerk: event.data.text}, function(response){
      });
    }
  }
}, false);