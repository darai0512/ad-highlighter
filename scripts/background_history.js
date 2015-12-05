console.log('chrome backgroudn history api');


var yahooDomain = [
{
	'sports': "tw.sports.yahoo.com",
    "finance": "tw.money.yahoo.com",
    "movies": "tw.movies.yahoo.com",
    "celebrity": "tw.celebrity.yahoo.com",
    "music": "yahoo.streetvoice.com",
    "tech": "tw.tech.yahoo.com",
    "autos": "tw.autos.yahoo.com",
    "food": "yahoo.gomaji.com"
},{
    "sports": "sports.yahoo.co.jp",
    "finance": "finance.yahoo.co.jp",
    "autos": "carview.yahoo.co.jp"
}]

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

for(intl in yahooDomain) {
	for(type in yahooDomain[intl]) {
		console.log("type", type);						// sports
		console.log("site", yahooDomain[intl][type]);	// tw.sports.yahoo.com
		$.when(saerchHistoryCounting(type, yahooDomain[intl][type]));
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


function saerchHistoryCounting(type, domain) {
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