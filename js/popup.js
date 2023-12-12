//HOW DOES IT KNOW IF THERE IS A COMPETITOR OR NOT IF THE COMP ISNT LISTED HERE on foreign comp it list "'No details available for this competitor"
// Otherwise it does not, like on hubspot

const competitorLogos = {
    'Nosto': '/assets/icons/Competitor/Nosto48.png',  
};
//Ensures DOMCL elements are accesible before executing script 
document.addEventListener('DOMContentLoaded', function() {
    // chrome.storage.sync.get(['detectedCompetitors'], function(result){
    //     console.log(result)
    //     if (result.detectedCompetitor){
    //         console.log(result.detectedCompetitors)
    //         const competitorInfo = document.getElementById('compList'); 
    //         compList.textContent = result.detectedCompetitors.description;
    //     }
    // });

    //Retrieves (like detected competitors) from chromelocalstorage
    //Likely set by the content script 
    chrome.storage.local.get({request: null, sender: null}, (data) => {
        const requestData = data.request
        const requestContext = data.sender
        competitorListGenerator(requestData)
    })
});

//Process data to extract competitor names, updates content with the details
function competitorListGenerator(requestData) {
    const dropdown = document.querySelector('[data-content="compList"]');
    dropdown.innerHTML = ''; // Clear existing content

    const competitorNames = Object.keys(requestData.message.competitor);
    const competitorDetails = {
        'Nosto': "1. Nosto does not incorporate 'purchase data' into their AI model",
        'Klevu': "1. Klevu typically have higher prices"
    };

    competitorNames.forEach(comp => {
        const detailText = competitorDetails[comp] || 'No details available for this competitor.';
        const para = document.createElement('p');
        para.textContent = detailText;
        dropdown.appendChild(para);
    });
    if (competitorNames.length > 0) {
        updateLogo(competitorNames[0]);
    }

    
}

//Changes source src of logo based on found competitor 
function updateLogo(competitorName) {
    const logoImage = document.getElementById('logoImage'); // Ensure this ID matches your HTML
    if (competitorLogos[competitorName]) {
        logoImage.src = competitorLogos[competitorName];
    } else {
        logoImage.src ='/assets/icons/color/48.png'; // Replace with your default logo path
    }
}





