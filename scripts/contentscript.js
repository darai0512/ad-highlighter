(function() {

	$(document).ready(function() {
		console.log('ad-highlighter console log');

		// hotspot
    	var hotspot_container = document.createElement("div");
    	$(hotspot_container).addClass("hotspot_container");
    	$(hotspot_container).css({
	    	"width": "100%",
	    	"height": "1px"
	    });

	    // ads
	    var ads = document.createElement("div");
    	$(ads).addClass("ads");
    	$(ads).text("this is one ads content");
    	$(hotspot_container).append(ads);

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			if(request.status == '1') {
				$("body").before(hotspot_container);

				$(hotspot_container).animate({ height: '220px' }, 'slow');
			}
		});

	});

})();