//Runs in the context of the web page and is
//responsible for detecting competitors on the page. 
//It sends this information to the background script or directly to the popup script for processing.

const s = document.createElement('script');
s.src = chrome.runtime.getURL('js/injected.js');
s.onload = async function () {
    this.remove();
};
(document.head || document.documentElement).prepend(s);

window.addEventListener("message", (event) => {
  if (event.source != window 
    || ! event.data 
    || ! event.data.type 
    || event.data.source != 'CleSS' 
    || ! chrome.runtime?.id) {
    return;
  }
  chrome.runtime.sendMessage({type: event.data.type, source: event.data.source, message: event.data.message })

}, false);

