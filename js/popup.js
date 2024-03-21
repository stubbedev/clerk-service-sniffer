let showPlaceholder = true;
document.addEventListener("DOMContentLoaded", async function() {
  const loadingMessage = "Loading Competitor Information...";
  const noDataMessage = "No Competitors Found, Or Error Loading Competitor(s)";
  const target = document.querySelector('[data-content="compList"]');
  target.innerHTML = `<p>${loadingMessage}</p>`; // Display the loading message immediately

  // Fetch data and update DOM if competitors are found or display no data message
  async function fetchDataAndUpdateDOM(tabId) {

    const storedData = await handleStorage(null, tabId, null);
    console.log("Stored data retrieved:", storedData); 


    if (storedData && storedData.competitors && storedData.competitors.length > 0) {
      updateDOM(storedData); // Update the DOM with competitor data
    } else {
      target.innerHTML = `<p>${noDataMessage}</p>`; // Show "No Competitors Found" if no data
    }
  }

  // Obtain the current active tab
  const tab = await getCurrentTab();
  if (!tab) {
    target.innerHTML = `<p>${noDataMessage}</p>`; // Show "No Competitors Found" if no active tab is found
    return;
  }

  // Attempt to fetch and display data immediately in case the page has already loaded
  fetchDataAndUpdateDOM(tab.id);
});



//Retrieves the currently active tab in the last-focused window
//Ensuring that the extension interacts with the user's current context.
async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function handlePopup(request, sender) {
  // Check if the data has already been displayed to avoid redundant updates.
  if (!showPlaceholder) {
    console.log("Received message:", request);

    // Assuming 'sender.tab.id' is valid and 'request.message' contains the relevant data.
    // Try to retrieve any stored data first.
    const storedData = await handleStorage(null, sender.tab.id, null);
    

    // If stored data exists and contains competitors, use it to update the DOM immediately.
    if (storedData && storedData.competitors && !showPlaceholder) {
      updateDOM(storedData);
      showPlaceholder = true; // Mark the data as displayed to prevent further updates.
    }
    // If there's no stored data, and new data is available from the request, process this new data.
    else if (request.message && request.message.data) {
        let data = request.message.data;
        // Save the new data.
        data = await handleStorage(data, sender.tab.id, null);
        if (data && data.competitors) {
            updateDOM(data);
            showPlaceholder = true; // Mark the data as displayed after updating the DOM with the new data.
        }
    }
  }
  return true;
}


function updateDOM(data) {
  const comps = data?.competitors;
  if(!comps){
    return;
  }
  let dedupecomps = [];
  const target = document.querySelector('[data-content="compList"]');
  const compFound = Boolean(comps.length);
  target.innerHTML = "";
  console.log("DOM updated with data:", data);

  for (let i = 0; i < comps.length; i++) {
    if(!dedupecomps.includes(comps[i].name)){
      dedupecomps.push(comps[i].name)
      target.append(createListEntry(comps[i]));
    }
  }
  if (compFound) {
    const imgEl = document.querySelector('.heading img');
    const headingEl = document.querySelector('.heading h2'); 
    if (headingEl){
      headingEl.innerHTML = `<span>Service Used:</span>&nbsp;<b>${comps[0].name}</b>`;
    } else {
      
      return; 
      
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

  const logoContainer = document.getElementById('logoImage'); 
  logoContainer.innerHTML = '';


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
  const result = await chrome.storage.session.get('data');
  let allData = result.data || {};
  console.log("Setting data in storage:", allData); //works


  if (action === "delete") {
    delete allData[tabId];
  } else if (data && data.competitors) {
    allData[tabId] = allData[tabId] || {};
    const existingDetectedOn = allData[tabId].detected_on;
    
    // Invalidate storage for a given ID if the 'detected_on' value does not change
    if (existingDetectedOn && existingDetectedOn !== data.detected_on) {
      allData[tabId] = {}; // Clear existing data if 'detected_on' changes
    }
    
    // Aggregate data if 'detected_on' is the same
    allData[tabId].competitors = data.competitors; // Update or set detected_on
    allData[tabId].competitors = (allData[tabId].competitors || []).concat(data.competitors);
  }

  await chrome.storage.session.set({ data: allData });
  return allData[tabId];
}
