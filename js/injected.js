

const loadedResourceList = [];

attachObserver();

function onRequestsObserved( batch ) {
    loadedResourceList.push( ...batch.getEntries() );
    const hasClerkIoResource = { status: hasClerkIo(loadedResourceList)}
    updateState("icon", hasClerkIoResource, 'CleSS');
    const hasThirdPartiesResource = { competitor: compList(loadedResourceList) };
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

function compList(resourceList){
  let compsFound = {};
  const compDomains = {
    "Nosto": ['connect.nosto.com'],
    "Klevu": ['js.klevu.com','eucs.klevu.com'],
    "Doofinder": ['cdn.doofinder.com']
  }
  for( const resource of resourceList ){
    for( const [comp, domains] of Object.entries(compDomains) ){
      for( const domain of domains ){
        if(resource?.name.includes(domain)){
          if(compsFound[comp] === undefined){
            compsFound[comp] = []
          }
          compsFound[comp].push(domain);
        }
      }
    }
  }
  return compsFound;
}

