(function() {

	$(document).ready(function() {
		console.log('ad-highlighter console log');

		var borderStyleHL = "3px solid red";
		var adsImageWidth = "60px";
		var adsImageHeight = "60px";
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		var localStorageWidth = localStorage.adsAverageX ? parseInt(localStorage.adsAverageX) : 0;
		var localStorageHeight = localStorage.adsAverageY ? parseInt(localStorage.adsAverageY) : 0;

		var targetDomainList = [
			{ domain: 'mobile01.com', pattern: 'adredir'},
			{ domain: 'gamer.com.tw', pattern: 'adcounter'},
			{ domain: 'japantoday.com', pattern: 'ads.gplusmedia'}
		];

		// hotspot
    	var hotspot_container = document.createElement("div");
    	// addClass via top, bottom, left, right
    	$(hotspot_container).addClass("hotspot_container").addClass("top");

		var cloneUrlAry = [];
		var cloneImgAry = [];

		console.log("$(window).height()", $(window).height());
		console.log("$(window).width()", $(window).width());
		console.log("localStorageWidth", localStorageWidth);
		console.log("localStorageHeight", localStorageHeight);

		// highlight ad which contains `adcounter.php` in href
		//makrAdsHL("adcounter.php");


		$('a').click(function() {
			for(x in targetDomainList) {
				console.log('check target ads in domain list');
				if ( window.location.href.indexOf(targetDomainList[x].domain) != -1 && $(this).attr('href').indexOf(targetDomainList[x].pattern) > -1) {
					console.log("get targer ads match in domain list");
					$(this).parent().css("border", borderStyleHL);

					var adPos = $(this).parent().position();

					// adImg
					var adImg = $(this).find("img").clone();
					$(adImg).css({"width": adsImageWidth, "height": adsImageHeight});

					cloneUrlAry.push($(this).attr("href"));
					cloneImgAry.push(adImg);

					console.log("current url = " + window.location.href);
					console.log("DOM url = " + $(this).attr("href"));
					console.log("DOM class = " + $(this).parent().attr("class"));
					console.log("DOM id = " + $(this).parent().attr("id"));
					console.log("DOM adPos left = " + adPos.left);
					console.log("DOM adPos top = " + adPos.top);

					// set localstorage
					localStorageWidth = localStorage["adsAverageX"] = (localStorageWidth + adPos.left)/2;
					localStorageHeight = localStorage["adsAverageY"] = (localStorageHeight + adPos.top)/2;

					console.log("localStorageWidth", localStorageWidth);
					console.log("localStorageHeight", localStorageHeight);
					// change hotspot region

					countHotSpotPosition();

					/*
					$.ajax({
						method: "POST",
					  	url: "some.php",
					  	data: { name: "John", location: "Boston" }
					})
					.done(function( msg ) {
						console.log( "Data Saved: " + msg );
					});
					*/

				}
			}
		});

	    // ads hotspot region
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			if(request.status == '1') {
				$(hotspot_container).text("");
				$("body").before(hotspot_container);
				if (cloneUrlAry.length === 0) {
					// array is empty
					var emptyText = document.createElement("div");
					$(emptyText).addClass("hotspotText").text("No more Ads highlighting");
					$(hotspot_container).append(emptyText);
				} else {
					// update ads
					for(key in cloneUrlAry) {
			    		var adsContainer = document.createElement("div");
			    		var adsLeft = document.createElement("div");
			    		var adsRight = document.createElement("div");

			    		$(adsLeft).addClass("adsLeft");
			    		$(adsRight).addClass("adsRight");

			    		$(adsContainer).addClass("adsContainer").append(adsLeft).append(adsRight);
			    		$(adsLeft).append(cloneImgAry[key]);
			    		$(adsRight).text("this is one ads content");

			    		$(hotspot_container).append(adsContainer);
					}
				}
				$(hotspot_container).show();
			}
		});

		$("body").click(function(){
			$(hotspot_container).hide();
		});

		function makrAdsHL(containsText) {
			$('a[href*="' + containsText + '"]').closest("div").css("border", borderStyleHL);
		}

		function countHotSpotPosition() {
			$(hotspot_container).removeClass("top").removeClass("bottom").removeClass("left").removeClass("right");
			if (localStorageHeight/windowHeight > 0.67) {
				// bottom
				$(hotspot_container).addClass("bottom");
			} else if (localStorageHeight/windowHeight < 0.33) {
				// top
				$(hotspot_container).addClass("top");
			} else if (localStorageWidth/windowWidth > 0.67) {
				// right
				$(hotspot_container).addClass("right");
			} else if (localStorageWidth/windowWidth < 0.33) {
				// left
				$(hotspot_container).addClass("left");
			} else {
				// default top
				$(hotspot_container).addClass("top");
			}
		}

	});

})();