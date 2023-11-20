const loadedResourceList = [];

attachObserver();

function onRequestsObserved( batch ) {
    loadedResourceList.push( ...batch.getEntries() );
    const hasClerkIoResource = { status: hasClerkIo(loadedResourceList)}
    updateState("icon", hasClerkIoResource, 'CleSS');
    const hasThirdPartiesResource = hasThirdParties(loadedResourceList);
    updateState("popup", hasThirdPartiesResource, 'CleSS');
}

function attachObserver(){
  const requestObserver = new PerformanceObserver( onRequestsObserved );
  requestObserver.observe( { type: 'resource' } );
}


function updateState( type, message, source ) {
  window.postMessage({ type: type, message: message, source: source }, "*");
}

function hasClerkIo(resourceList){
  const clerkDomains = ['api.clerk.io', 'cdn.clerk.io'];
  for( const resource of resourceList ){
    for( const domain of clerkDomains ){
      if(resource?.name.includes(domain)){
        return true;
      }
    }
  }
  return false;
}

function hasThirdParties(resourceList){
  let compsFound = [];
  const compDomains = {
    "Nosto": ["connest.nosto.com", "connest.nosto.net", "cdn.nosto.com"],
    "Algolia": ["cdn.algolia.net", "algolia.net", "algolia.com", "algolia.com", "cdn.algolia.net"],
    "HelloRetail": ["cdn.helloretail.com", "cdn.helloretail.net", "cdn.helloretail.com", "cdn.helloretail.net", "cdn.helloretail.io"],
  }
  for( const resource of resourceList ){
    for( const [comp, domains] of Object.entries(compDomains) ){
      for( const domain of domains ){
        if(resource?.name.includes(domain)){
          compsFound.push(domain);
        }
      }
    }
  }
  return compsFound;
}

