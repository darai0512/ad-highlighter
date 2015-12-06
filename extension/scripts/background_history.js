console.log('chrome background history api');


var domainKeywords = 
{
    "sports": ["tw.sports.yahoo.com", "sports.yahoo.co.jp"],
    "finance": ["tw.money.yahoo.com", "finance.yahoo.co.jp"],
    "movies": ["tw.movies.yahoo.com"],
    "celebrity": ["tw.celebrity.yahoo.com"],
    "music": ["yahoo.streetvoice.com"],
    "tech": ["tw.tech.yahoo.com"],
    "autos": ["tw.autos.yahoo.com", "carview.yahoo.co.jp"],
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

for(type in domainKeywords) {
	console.log("type", type);
	for(keyword in domainKeywords[type]){
	  console.log("site keywords", domainKeywords[type][keyword]);
          searchHistoryCounting(type, domainKeywords[type][keyword]);
	  //$.when(searchHistoryCounting(type, yahooDomain[intl][type]));
	}
}

console.log("user history score = ", userDomainRepresent);

// send userDomainRepresent to contentscript.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getStatus")
      sendResponse({score: userDomainRepresent});
    else
      sendResponse({}); // snub them.
});


function searchHistoryCounting(type, domain) {
    var d = new $.Deferred();
	chrome.history.search({text: domain, maxResults: 100}, function(data) {
	    data.forEach(function(page) {
	        //console.log(page.url);
	        userDomainRepresent[type] = userDomainRepresent[type] + 1;
	    });
	});

    d.resolve();
    return d;
}
