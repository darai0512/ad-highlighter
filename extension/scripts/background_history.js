console.log('chrome background history api');


var domainKeywords = 
{
    "sports": ["tw.sports.yahoo.com", "sports.yahoo.co.jp"],
    "finance": ["tw.money.yahoo.com", "finance.yahoo.co.jp"],
    "movies": ["tw.movies.yahoo.com"],
    "celebrity": ["tw.celebrity.yahoo.com"],
    "music": ["yahoo.streetvoice.com"],
    "tech": ["tw.tech.yahoo.com"],
    "autos": ["autos.yahoo", "carview.yahoo"],
    "food": ["yahoo.gomaji.com"]
}

var userDomainRepresent = {
    "sports": 0,
    "finance": 0,
    "movies": 0,
    "celebrity": 0,
    "music": 0,
    "tech": 0,
    "autos": 0,
    "food": 0
}

$.when(searchHistoryCounting()).done(function(){
  console.log("user history score = ", userDomainRepresent);
});

// send userDomainRepresent to contentscript.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getStatus")
      sendResponse({score: userDomainRepresent});
    else
      sendResponse({}); // snub them.
});


function searchHistoryCounting() {
    var d = new $.Deferred();
    chrome.history.search({text: '', maxResults: 1000}, function(results) {
        //console.log(results);
	for(key in results){
          //console.log(results[key]);
          for(type in domainKeywords){
              //console.log(type);
            for(keyword in domainKeywords[type]){
              if(results[key].url.indexOf(domainKeywords[type][keyword]) != -1){
                  console.log(domainKeywords[type][keyword] + ' in ' + results[key].url);
	          userDomainRepresent[type] = userDomainRepresent[type] + results[key].visitCount;
                  //console.log(domainKeywords[type][keyword] + ' add ' + results[key].visitCount);
              }
            }
          }
        };
    });
    d.resolve();
    return d;
}
