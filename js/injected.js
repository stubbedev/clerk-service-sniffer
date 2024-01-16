const loadedResourceList = [];

attachObserver();

function onRequestsObserved( batch ) {
    loadedResourceList.push( ...batch.getEntries() );
    const state = {
      status: isClerk(loadedResourceList),
      data: {
        competitors: competitors(loadedResourceList)
      }
    }
    updateState("icon", state, 'CleSS');
    updateState("popup", state, 'CleSS');
}

function attachObserver(){
  const requestObserver = new PerformanceObserver( onRequestsObserved );
  requestObserver.observe( { type: 'resource' } );
}


function updateState( type, message, source ) {
  window.postMessage({ type: type, message: message, source: source }, "*");
}

function isClerk(resourceList){
  const clerkDomains = ['api.clerk.io', 'cdn.clerk.io', 'custom.clerk.io'];
  for( const resource of resourceList ){
    for( const domain of clerkDomains ){
      if(resource?.name.includes(domain)){
        return true;
      }
    }
  }
  return false;
}

function competitors(resourceList){
  let compsFound = [];
  const competitors = {
    "Nosto": {
      name: "Nosto",
      sources: ["connect.nosto.com"],
      icons: {
        16: "",
        32: "",
        48: "/assets/icons/competitors/nosto48.png",
        128: ""
      },
      desc: "NOSTO: 1.Does not incorporate 'purchase data' into their AI model. This means that product sliders often show duplicate product recommedendations which is a waisted spot where another product could be seen and purchased",
    },
    "Algolia": {
      name: "Algolia",
      sources: ["cdn.algolia.net", "algolia.net", "algolia.com", "algolia.com", "cdn.algolia.net"],
      icons: {
        16: "",
        32: "",
        48: "",
        128: ""
      },
      desc: "",
    },
    "HelloRetail": {
      name: "HelloRetail",
      sources: ["cdn.helloretail.com", "cdn.helloretail.net", "cdn.helloretail.com", "cdn.helloretail.net", "cdn.helloretail.io"],
      icons: {
        16: "",
        32: "",
        48: "",
        128: ""
      },
      desc: "",
    },
    "Klevu": {
      name: "Klevu",
      sources: ['js.klevu.com','eucs.klevu.com'],
      icons: {
        16: "",
        32: "",
        48: "/assets/icons/competitors/klevu48.png",
        128: ""
      },
      desc: "1. Klevu typically have higher prices",
    },
    "Doofinder": {
      name: "Doofinder",
      sources: ['cdn.doofinder.com'],
      icons: {
        16: "",
        32: "",
        48: "",
        128: ""
      },
      desc: "",
    },
  }
  let found = [];
  for( const resource of resourceList ){
    for( const [comp, data] of Object.entries(competitors) ){
      for( const domain of data.sources ){
        if(resource?.name.includes(domain) && !found.includes(comp)){
          found.push(comp)
          competitors[comp]['detected_on'] = window.location.origin;
          compsFound.push(competitors[comp]);
        }
      }
    }
  }
  return compsFound;
}

