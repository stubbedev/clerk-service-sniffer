var clerk_activity_tracker = [];
function onRequestsObserved( batch ) {
    clerk_activity_tracker.push( ...batch.getEntries() );
    let message = 'false';
    clerk_activity_tracker.forEach(item=>{
        if(item.name.includes('api.clerk.io') || item.name.includes('cdn.clerk.io')){
            message = 'true';
        }
    });
    window.postMessage({ type: "FROM_PAGE", text: message }, "*");
}
var requestObserver = new PerformanceObserver( onRequestsObserved );
requestObserver.observe( { type: 'resource' } );