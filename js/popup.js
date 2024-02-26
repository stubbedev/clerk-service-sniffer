document.addEventListener("DOMContentLoaded", async function() {
 
  const tab = await getCurrentTab();

  if(tab){
    const data = await handleStorage(null, tab.id, null);
    updateDOM(data)
    
  if (data && data.competitors) {
    updateLogos(data.competitors);
      } else {
      console.error('Data is undefined or does not have a competitors property', error);
    }
    

   // updateLogos(data.competitors);  //Unsure what properties to put in here

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

  // Change main logo to clerk logo 
  if (compFound) {
    const imgEl = document.querySelector('.heading img');
    const headingEl = document.querySelector('.heading h2'); // Moved this line before its first use.
    if (headingEl){
      // If imgEl is supposed to change, uncomment the next line
      // imgEl.src = `..${comps[0].icons["48"]}`;
      headingEl.innerHTML = `<span>Service Used:</span>&nbsp;<b>${comps[0].name}</b>`;
    } else {
      console.error('The heading element was not found in the DOM');
    }
  }
}



function createListEntry(comp) {
  const el = document.createElement("div");
  el.dataset.name = comp.name;
  el.dataset.icons = JSON.stringify(comp.icons);
  el.dataset.detectedOn = comp.detected_on;
  el.className = "compEntry";
  const icon = document.createElement('img');
  icon.src = comp.icons['48']
  icon.className = "entryIcon"; 
  el.append(icon); 
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

function updateLogos(competitors){
  const logoContainer = document.getElementById('logo-container'); 
  logoContainer.innerHTML = ''; 

  //foreach competitor => do the below 
  competitors.forEach(competitor => {
    const img = document.createElement('img'); 
    img.src = competitor.icons['32']; 
    img.alt = competitor.name;
    img.style.maxWidth = '50px'; 
    img.style.maxHeight = '50px';
    img.classList.add('competitor-logo');
    logoContainer.appendChild(img); 

  });

}


async function handleStorage(data, tabId, action) {
//We are creating tabData list and populating it with data from tabData[tabId] and then equal it / add to data with '=' 
  const tabData = {};
  if (data) {
    tabData[tabId] = data;
  }
  const storedData = await chrome.storage.session.get({ data: {} });

  // if(storedData[tabId]['detected_on'] == data['detected_on']){
  // We ='ed 'detected_on' to the local window.origin , where origin is current web pages original link

    if (storedData[tabId] && storedData[tabId]['detected_on'] === data['detected_on']) {
    console.log("Checking comp", comp);
    //Accessing our storage of competitors based on tabID and data.competitors refers to the new array of competitors most recently fetched 
    //Making them = , means we are aware of any updates in tabId and competitor data 
    //Storing previous data and new data into one array 
    storedData[tabId].competitors = [...storedData[tabId].competitors, ...data.competitors];

    console.log("Current tab data:", storedData[tabId]); // 
    console.log("New data:", data); // 


  } else {
    // wipe data currently saved in sessionStorage for tabId and save new data under that tabId
    // If the current TabID or URL is different, replace old data with new data
    //So it is always relevant to the current tab and its content 

    storedData[tabId] = data;

  }
  //creating an object (tmpdata) by copying stored.Data & Tabdata into it 

  ///CHECK FOR tmpData before ATTEMPTING TO DELETE (DONE)
  const tmpData = Object.assign({}, storedData.data, tabData);
  if (action === "delete" && tmpData[tabId]) {
    delete tmpData[tabId];

  }
  await chrome.storage.session.set({ data: tmpData });
  console.log("Does tmpData for tabId exist?", Boolean(tmpData[tabId])); //
  return tmpData[tabId];


  
}

chrome.tabs.onRemoved.addListener(async function(tabid, removed) {
  await handleStorage({ data: null, tabId: tabid, action: "delete" });
});

chrome.runtime.onMessage.addListener(
  async function(request, sender, sendRespons) {
    if (request.source == "CleSS" && request.type == "popup") {
      await handlePopup(request, sender);
    }
  },
);
