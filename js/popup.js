document.addEventListener("DOMContentLoaded", async function() {
 
  const tab = await getCurrentTab();

  if(tab){
    const data = await handleStorage(null, tab.id, null);
    updateDOM(data)
    
    updateLogos(data.competitors);  //Unsure what properties to put in here
    console.log("Fetched Competitor Data *****:", data.competitors);

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

// //Tried to get it to refresh automatically each time the extension is opened 
// // Function to refresh popup data on open of popup
// async function refreshPopupDataOnOpen() {
//   const tab = await getCurrentTab();
//   if (tab) {
//     const data = await handleStorage(null, tab.id, null);

//     updateDOM(data);
//   }
// }
// // doing an onMessage.addListener so we should be using 'request' as the variable in the console.log? 
// // Event listener for when the popup is opened
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log("Popup opened*, recieving request:", request);
//   //unsure about 82-83
//   if (request.message.status === true) {
//     refreshPopupDataOnOpen();
//   }
// });


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

function updateLogos(competitors){
  console.log("Isarray?", Array.isArray(competitors));  //Doesnt work 
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




//Preserve if URL is the same but tab is different del

async function handleStorage(data, tabId, action) {
  console.log("Stored data before processing", data); //
  console.log("New data for current tab:", tabId); //

//We are creating tabData list and populating it with data from tabData[tabId] and then equal it / add to data with '=' 
  const tabData = {};
  if (data) {
    tabData[tabId] = data;
  }

  const storedData = await chrome.storage.session.get({ data: {} });
  console.log("Stored data before processing", data); //

  console.log("New data for new tab:", tabData); //

  // if(storedData[tabId]['detected_on'] == data['detected_on']){

  // We ='ed 'detected_on' to the local window.origin , where origin is current web pages original link

    if (storedData[tabId] && storedData[tabId]['detected_on'] === data['detected_on']) {

    // Add data as more than 1 competitor present 
    console.log("Checking comp", comp);
    //Accessing our storage of competitors based on tabID and data.competitors refers to the new array of competitors most recently fetched 
    //Making them = , means we are aware of any updates in tabId and competitor data 
    //Storing previous data and new data into one array 
    storedData[tabId].competitors = [...storedData[tabId].competitors, ...data.competitors];

    console.log("Current tab data:", storedData[tabId]); // 
    console.log("New data:", data); // 

    // none of the below logged 
    // console.log("Competitors before merge:", storedData[tabId].competitors, data.competitors);
    // storedData[tabId].competitors = [...storedData[tabId].competitors, ...data.competitors];
    // console.log("Competitors after merge:", storedData[tabId].competitors);

  } else {
    // wipe data currently saved in sessionStorage for tabId and save new data under that tabId
    // If the current TabID or URL is different, replace old data with new data
    //So it is always relevant to the current tab and its content 

    storedData[tabId] = data;

    console.log("Replacing old data with new data for tab", tabId); //
    console.log("Checking tabData", tabData); //
    console.log("Checking data", data); //null 
  }

  //creating an object (tmpdata) by copying stored.Data & Tabdata into it 
  const tmpData = Object.assign({}, storedData.data, tabData);

    
    console.log("tmp Data Object **:", tmpData); //
    console.log("Action received, CHECK:", action);  // NULL

  
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
  async function(request, sender, sendResponse) {
    if (request.source == "CleSS" && request.type == "popup") {
      await handlePopup(request, sender);
    }
  },
);
