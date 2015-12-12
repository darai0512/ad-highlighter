/*
	TODO:
	1) ajax post
		a) get all ads info for current url from backend DB
		b) send user click ads info to backend DB
	2) ads-highlighting
		a) marked highlighting ads on current page
		b) placed highlighting ads into hotspot-region

	OPTIONAL:
	1) instead of using edit distance in diffScore(), we should apply a better algorithm for it
	2) animation for extension
*/
(function() {

	$(document).ready(function() {
		console.log('ad-highlighter console log');

		var borderStyleHL = "3px solid red";
		var adsImageWidth = "60px";
		var adsImageHeight = "60px";
		var scoreThreshold = 8;
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		var localStorageWidth = localStorage.adsAverageX ? parseInt(localStorage.adsAverageX) : 0;
		var localStorageHeight = localStorage.adsAverageY ? parseInt(localStorage.adsAverageY) : 0;
		var targetDomainList = [
			{ domain: 'mobile01.com', pattern: 'adredir'},
			{ domain: 'gamer.com.tw', pattern: 'adcounter'},
			{ domain: 'japantoday.com', pattern: 'ads.gplusmedia'},
			{ domain: 'search.yahoo.com', pattern: 'r.msn.com'}
		];
		var mockScore = {autos: 0, celebrity: 2, finance: 0, food: 2, movies: 0, music: 2, sports: 0, tech: 0};

		$.when(getUserScore()).then(function(score){
			var userScore = score;
			console.log("userScore", userScore);
			console.log("diff = ", diffScore(userScore, mockScore));


			// hotspot
	    	var hotspot_container = document.createElement("div");
	    	// addClass via top, bottom, left, right
	    	$(hotspot_container).addClass("hotspot_container").addClass("top");

			var cloneUrlAry = [];
			var cloneTextAry = [];
			var cloneImgAry = [];

			console.log("$(window).height()", $(window).height());
			console.log("$(window).width()", $(window).width());
			console.log("localStorageWidth", localStorageWidth);
			console.log("localStorageHeight", localStorageHeight);

			// highlight ad which contains `adcounter.php` in href
			//makrAdsHL("adcounter.php");

			// get all ads info from backend DB
			/*
			$.ajax({
				method: "POST",
			  	url: "some.php",
			  	data: {
			  		currentUrl: "currentUrl"
			  	}
			})
			.done(function(msg) {
				console.log( "Data Saved: " + msg );
			});
			*/

			$('a').click(function() {
				for(x in targetDomainList) {
					console.log('check target ads in domain list');
					if ( window.location.href.indexOf(targetDomainList[x].domain) != -1 && $(this).attr('href').indexOf(targetDomainList[x].pattern) > -1) {
						console.log("get targer ads match in domain list");
						$(this).parent().css("border", borderStyleHL);

						var adPos = $(this).parent().position();
						var adText = $(this).text() ? $(this).text() : "this is an image ads";
						var adImg = $(this).find("img").clone();
						$(adImg).css({"width": adsImageWidth, "height": adsImageHeight});

						cloneUrlAry.push($(this).attr("href"));
						cloneImgAry.push(adImg);
						cloneTextAry.push(adText);

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

						countHotSpotPosition(hotspot_container);

						// send click ads info to DB
						/*
						$.ajax({
							method: "POST",
						  	url: "some.php",
						  	data: {
						  		currentUrl: "currentUrl",
						  		adUrl: "adUrl",
						  		adImage: "adImage",
						  		featureSet: "featureSet"
						  	}
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
				    		var adsLink = document.createElement("a");
				    		var adsLeft = document.createElement("div");
				    		var adsRight = document.createElement("div");
							var adsRemoveBtn = document.createElement("span");

							$(adsLeft).addClass("adsLeft");
				    		$(adsRight).addClass("adsRight");
				    		$(adsRemoveBtn).addClass("adsRmBtn");
				    		$(adsRemoveBtn).on("click", removeAd);

				    		$(adsContainer).addClass("adsContainer").append(adsLeft).append(adsRight).append(adsRemoveBtn);
				    		$(adsLeft).append(cloneImgAry[key]);
				    		$(adsRight).text(cloneTextAry[key]);
				    		$(adsLink).attr({"href": cloneUrlAry[key], "target": "_blank"});
				    		$(adsLink).append(adsContainer);
				    		$(hotspot_container).append(adsLink);
						}
					}
					$(hotspot_container).show();
				}
			});

			$("body").click(function(){
				$(hotspot_container).hide();
			});
		});

		function removeAd () {
			event.preventDefault();
			//Todo remove ad in cloneUrlAry
			$(this).parent().hide();
		}

		function getUserScore() {
		    var d = new $.Deferred();
			chrome.runtime.sendMessage({method: "getStatus"}, function(response) {
			  	d.resolve(response.score);
			})
		    return d;
		}


		function makrAdsHL(containsText) {
			$('a[href*="' + containsText + '"]').closest("div").css("border", borderStyleHL);
		}

		function countHotSpotPosition(hotspot_container) {
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

		// edit distance counting
		function diffScore(userScore, mockScore) {
			var sum = 0;
			//console.log("diff s1", userScore);
			//console.log("diff s2", mockScore);
			for (type in userScore) {
				sum = sum + Math.abs((userScore[type] - mockScore[type])*(userScore[type] - mockScore[type]));
			}
			sum = Math.sqrt(sum);
			return (sum < scoreThreshold) ? true: false;
		}

	});

})();
