//attempt #1

// document.addEventListener("DOMContentLoaded", async function() {
//   const loadingMessage = "Loading Competitor Information...";
//   const noDataMessage = "No Competitors Found, Or Error Loading Competitor(s)";
//   const tab = await getCurrentTab();
//   const target = document.querySelector('[data-content="compList"]');
//   let dataDisplayed = false;

//   target.innerHTML = `<p>${loadingMessage}</p>`;

//   if (tab) {
//     const storedData = await handleStorage(null, tab.id, null);
//     setTimeout(() => {
//       if (!dataDisplayed) {
//           target.innerHTML = `<p>${noDataMessage}</p>`;
//       }
//     }, 5000);


//     if (storedData && storedData.competitors) {

//       updateDOM(storedData);
//       dataDisplayed = true;
//     }
//   }
// });

//attempt #2
// document.addEventListener("DOMContentLoaded", async function() {
//   const loadingMessage = "Loading Competitor Information...";
//   const noDataMessage = "No Competitors Found, Or Error Loading Competitor(s)";
//   const target = document.querySelector('[data-content="compList"]');

//   target.innerHTML = `<p>${loadingMessage}</p>`;


//   const tab = await getCurrentTab();
//   if (!tab) {
//       // Immediately handle case where no tab is focused.
//       target.innerHTML = `<p>${noDataMessage}</p>`;
//       return;
//   }

//   const storedData = await handleStorage(null, tab.id, null);
//   if (storedData && storedData.competitors && storedData.competitors.length > 0) {
//       updateDOM(storedData);
//       dataSuccessfullyDisplayed = true; // Mark data as displayed
//   }
//   setTimeout(() => {
//     if (!dataSuccessfullyDisplayed) {
//         // Show noDataMessage only if data hasn't been successfully displayed
//         target.innerHTML = `<p>${noDataMessage}</p>`;
//     }
//   }, 1000);
// });


//attempt #3 (WORKS just does not save comp data when reopening popup)
// let dataDisplayed = false; 

// document.addEventListener("DOMContentLoaded", async function() { 
//   const loadingMessage = "Loading Competitor Information...";
//   const noDataMessage = "No Competitors Found, Or Error Loading Competitor(s)";
//   const target = document.querySelector('[data-content="compList"]');

//   // Display the loading message initially.
//   target.innerHTML = `<p>${loadingMessage}</p>`;

//   const tab = await getCurrentTab();
//   if (!tab) {
//       target.innerHTML = `<p>${noDataMessage}</p>`;
//       return;
//   }

//   // Use a timeout to wait for 3 seconds before deciding what to display.
//   setTimeout(async () => {
//       // Only fetch and check data after 3 seconds.
//       const storedData = await handleStorage(null, tab.id, null);
//       if (storedData && storedData.competitors && storedData.competitors.length > 0) {
//           updateDOM(storedData);
//           dataDisplayed = true;
//       } else if (!dataDisplayed) {
//           // If no data has been displayed, show the noDataMessage.
//           target.innerHTML = `<p>${noDataMessage}</p>`;
//       }
//   }, 8000); // Wait for 3 seconds
// });


//attempt #4
// let dataDisplayed = false; 

// document.addEventListener("DOMContentLoaded", async function() {
//     const loadingMessage = "Loading Competitor Information...";
//     const noDataMessage = "No Competitors Found, Or Error Loading Competitor(s)";
//     const target = document.querySelector('[data-content="compList"]');
//     const tab = await getCurrentTab();
    
//     if (!tab) {
//         target.innerHTML = `<p>${noDataMessage}</p>`;
//         return;
//     }

//     target.innerHTML = `<p>${loadingMessage}</p>`;

//     // Attempt to use cached data first
//     chrome.storage.local.get(`competitorData_${tab.id}`, async (result) => {
//         let storedData = result[`competitorData_${tab.id}`];
//         if (storedData && storedData.competitors && storedData.competitors.length > 0) {
//             updateDOM(storedData);
//             dataDisplayed = true;
//         } else {
//             // Fetch and cache data if not already stored
//             storedData = await handleStorage(null, tab.id, null);
//             if (storedData && storedData.competitors && storedData.competitors.length > 0) {
//                 chrome.storage.local.set({[`competitorData_${tab.id}`]: storedData});
//                 updateDOM(storedData);
//                 dataDisplayed = true;
//             } else {
//                 target.innerHTML = `<p>${noDataMessage}</p>`;
//             }
//         }
//     });
// });

//Working attempt 
let dataDisplayed = false;
document.addEventListener("DOMContentLoaded", async function() {
  const loadingMessage = "Loading Competitor Information...";
  const noDataMessage = "No Competitors Found, Or Error Loading Competitor(s)";
  const target = document.querySelector('[data-content="compList"]');
  target.innerHTML = `<p>${loadingMessage}</p>`; // Display the loading message immediately

  const tab = await getCurrentTab();
  if (!tab) {
      setTimeout(() => { target.innerHTML = `<p>${noDataMessage}</p>`; }, 3000); // Delay showing noDataMessage to ensure loadingMessage is seen
      return;
  }

  chrome.storage.local.get(`competitorData_${tab.id}`, async (result) => {
      let storedData = result[`competitorData_${tab.id}`];
      if (storedData && storedData.competitors && storedData.competitors.length > 0) {
          updateDOM(storedData);
      } else {
          setTimeout(() => {
              // Perform a final check to avoid race conditions
              if (!storedData || !storedData.competitors || storedData.competitors.length === 0) {
                  target.innerHTML = `<p>${noDataMessage}</p>`;
              }
          }, 3000); 
      }
  });
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
  if (!dataDisplayed) {
    // Assuming 'sender.tab.id' is valid and 'request.message' contains the relevant data.
    // Try to retrieve any stored data first.
    const storedData = await handleStorage(null, sender.tab.id, null);

    // If stored data exists and contains competitors, use it to update the DOM immediately.
    if (storedData && storedData.competitors) {
      updateDOM(storedData);
      dataDisplayed = true; // Mark the data as displayed to prevent further updates.
    }
    // If there's no stored data, and new data is available from the request, process this new data.
    else if (request.message && request.message.data) {
        let data = request.message.data;
        // Save the new data.
        data = await handleStorage(data, sender.tab.id, null);
        if (data && data.competitors) {
            updateDOM(data);
            dataDisplayed = true; // Mark the data as displayed after updating the DOM with the new data.
        }
    }
  }
  return true;
}


function updateDOM(data) {
  console.log("Updating DOM with data:#1", data); //seems console logging data & storedData give same array (comp data) * 

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
  console.log("Updating logos with competitors data:", competitors); //doesnt work 

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

//Fetches and manipulates data stored in chrome.storage.session. 
//This function serves multiple purposes based on the parameters passed: 
//retrieving data for a specific tab, storing new data, or deleting data for a tab.

async function handleStorage(data, tabId, action) {
  // Fetch the entire storage object, not just { data: {} }
  //Asynchronously retrieves the object stored under the key 'data' from the session storage.
  //If there's no data yet, it initializes allData as an empty object.
  const result = await chrome.storage.session.get('data');
  let allData = result.data || {}; 

  //Checks if the action specified is "delete". If so,
  //it deletes the entry corresponding to tabId from allData, effectively removing all stored data for that tab.
  if(action === "delete"){
    delete allData[tabId];
  } else if (data && data.competitors){
    //if no alldata[tabId] initalizes allData[tabId] with empty object {}
    allData[tabId] = allData[tabId] || {};

    //if allData[TabId] already has comp otherwise uses empty array as fallback for next operation
    //'...' spread operator used to expand existing comps and new comps inside a new array 
    //Concatenating the two arrays, adding new comps into existing list 
    //Result is assigned to allData[tabId].competitors, updating it with current tabId
    //NEED MORE EXPLANATION HERE 
    allData[tabId].competitors = [...(allData[tabId].competitors || []), ...data.competitors]; 

  } 
    await chrome.storage.session.set({ data: allData });
    return allData[tabId];
  }


chrome.tabs.onRemoved.addListener(async function(tabid, removed) {
  await handleStorage({ data: null, tabId: tabid, action: "delete" });
});

chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    if (request.source == "CleSS" && request.type == "popup") {
      await handlePopup(request, sender);
    }
  } );

