document.addEventListener("DOMContentLoaded", async function() {
  const tab = await getCurrentTab();
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
