document.addEventListener("DOMContentLoaded", async function() {
  var opened = await refreshPopupDataOnOpen(); 
  //it is not logging opens
  console.log(opened); 
  const tab = await getCurrentTab();
  console.log("DOMContentLoaded event triggered", tab);
  if(tab){
    const data = await handleStorage(null, tab.id, null);
    updateDOM(data)
  }
})

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function handlePopup(request, sender) {
  let data = request.message.data;
  if (data) {
    data = await handleStorage(data, sender.tab.id, null);
    updateDOM(data);
  }
  return true;
}

//Cant get it to work or log any of the console.log's below 

// // This event listener ensures the popup updates when the active tab changes
// chrome.tabs.onUpdated.addListener(function(tabId, tab) {
//   console.log("Tab Update Detected:", tabId);
//   if (changeInfo.status === 'complete' && tab.active) {
//     refreshPopupData(tabId);
//   }
// });

// // This function fetches new data for the given tabId and updates the DOM
// async function refreshPopupData(tabId) {
//   console.log("Refreshing data for tab:", tabId);
//   const newData = await handleStorage(null, tabId, null);
//   console.log("New data fetched:", data);
//   updateDOM(newData);
// }


function updateDOM(data) {
  const comps = data?.competitors;
  if(!comps){
    return;
  }
  const target = document.querySelector('[data-content="compList"]');
  const compFound = Boolean(comps.length);
  target.innerHTML = "";
  for (let i = 0; i < comps.length; i++) {
    target.append(createListEntry(comps[i]));
  }

  if (compFound) {
    const imgEl = document.querySelector("#logoImage");
    const headingEl = document.querySelector('.heading h2')
    imgEl.src = `..${comps[0].icons["48"]}`;
    headingEl.innerHTML = `<span>Service Used:</span>&nbsp;<b>${comps[0].name}</b>`;
  }
}

//Tried to get it to refresh automatically each time the extension is opened 
// Function to refresh popup data on open of popup
async function refreshPopupDataOnOpen() {
  const tab = await getCurrentTab();
  if (tab) {
    const data = await handleStorage(null, tab.id, null);
    console.log("Data Fetched for tab:", data)
    updateDOM(data);
  }
}
// doing an onMessage.addListener so we should be using 'request' as the variable in the console.log? 
// Event listener for when the popup is opened
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Popup opened*, recieving request:", request);
  //unsure about 82-83
  if (request.message.status === true) {
    refreshPopupDataOnOpen();
  }
});


function createListEntry(comp) {
  const el = document.createElement("div");
  el.dataset.name = comp.name;
  el.dataset.icons = JSON.stringify(comp.icons);
  el.dataset.detectedOn = comp.detected_on;
  el.className = "compEntry";
  const name = document.createElement('div')
  name.className = "entryTitle"
  name.innerHTML = `<h4>Name: ${comp.name}</h4><img src="${comp.icons['32']}"/>`
  el.append(name)
  const desc = document.createElement('div')
  desc.className = "entryDesc";
  desc.innerHTML = '<h4>Details:</h4>'
  desc.innerHTML += `<p>${comp.desc}</p>`
  el.append(desc)
  const source = document.createElement('div')
  source.className = "entrySource"
  source.innerHTML = '<h4>Sources:</h4>'
  source.innerHTML += `<code>${comp.sources.join(' | ')}</code>`
  el.append(source)
  return el;
}

async function handleStorage(data, tabId, action) {
  console.log("handleStorage called with:", data, tabId, action);
  const tabData = {};
  if (data) {
    tabData[tabId] = data;
  }
  const storedData = await chrome.storage.session.get({ data: {} });
  const tmpData = Object.assign({}, storedData.data, tabData);
  if (action === "delete" && tmpData[tabId]) {
    delete tmpData[tabId];
  }
  await chrome.storage.session.set({ data: tmpData });
  console.log("handleStorage result:", data);
  return tmpData[tabId];
}

chrome.tabs.onRemoved.addListener(async function(tabid, removed) {
  await handleStorage({ data: null, tabId: tabid, action: "delete" });
});

chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    if (request.source == "CleSS" && request.type == "popup") {
      await handlePopup(request, sender);
    }
  },
);
