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

		// configs
		var borderStyleHL = "3px solid red";
		var adsImageWidth = "60px";
		var adsImageHeight = "60px";
		var insertScoreThreshold = 8;
		var deleteScoreThreshold = 8;
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
		var backendDomain = "http://ec2-52-192-27-88.ap-northeast-1.compute.amazonaws.com:5000";
		var actionType = ['insert', 'delete'];
		var mockScore = {autos: 0, celebrity: 2, finance: 0, food: 2, movies: 0, music: 2, sports: 0, tech: 0};
		var mockImage = "https://s.yimg.com/cv/ae/tw/audience/111130/374x210x4chkuyzx.jpg";

		$.when(getUserScore()).then(function(score){
			var userScore = score;
			console.log("userScore", userScore);
			console.log("diff = ", diffScore(userScore, mockScore, insertScoreThreshold));

			// hotspot
	    	var hotspot_container = document.createElement("div");
	    	$(hotspot_container).addClass("hotspot_container").addClass("top");

			var cloneUrlAry = [];
			var cloneTextAry = [];
			var cloneImgAry = [];

			console.log("$(window).height()", $(window).height());
			console.log("$(window).width()", $(window).width());
			console.log("localStorageWidth", localStorageWidth);
			console.log("localStorageHeight", localStorageHeight);

			// ads highlighting
			// check a href link in current page
			$('a').filter(function(index) {
				for(x in targetDomainList) {
					var currUrl = window.location.href;
					var currHref = (typeof $(this).attr('href') === 'undefined') ? 'undefined' : $(this).attr('href');
					//console.log("currUrl", currUrl);
					//console.log("currHref", currHref);
					if ( currUrl.indexOf(targetDomainList[x].domain) !== -1 && currHref.indexOf(targetDomainList[x].pattern) > -1) {
						// get href
						//console.log("$(this).attr('href')", $(this).attr('href'));

						// get each ads info from backend DB
						/*
						$.ajax({
							method: "GET",
						  	url: backendDomain + "/ads/?ad_url__exact=" + $(this).attr('href')
						})
						.done(function(data) {
							for(row in data.data) {
								var targetAds = data.data[row];
								// click
								if (targetAds.action == 'click') {
									if( diffScore(userScore, targetAds.feature, insertScoreThreshold) ) {
										makrAdsHL(targetAds.ad_url);
									}
								// delete
								} else if (targetAds.action == 'delete') {
									if (diffScore(userScore, targetAds.feature, deleteScoreThreshold) ) {
										removeAdsHL(targetAds.ad_url);
									}
								}
							}
						});
						*/
					}
				}
			});

			// mock ajax get
			$.ajax({
				method: "GET",
			  	url: backendDomain + "/ads/?ad_url__exact=" + mockImage
			})
			.done(function(data) {
				//console.log( "data " ,data );
				for(row in data.data) {
					var targetAds = data.data[row];
					// click
					if (targetAds.action == 'click') {
						if( diffScore(userScore, targetAds.feature, insertScoreThreshold) ) {
							makrAdsHL(targetAds.ad_url);
						}
					// delete
					} else if (targetAds.action == 'delete') {
						if (diffScore(userScore, targetAds.feature, deleteScoreThreshold) ) {
							removeAdsHL(targetAds.ad_url);
						}

					}
				}
			});

			// ads click handling
			$('a').click(function() {
				for(x in targetDomainList) {
					console.log('check target ads in domain list');
					if ( window.location.href.indexOf(targetDomainList[x].domain) != -1 && $(this).attr('href').indexOf(targetDomainList[x].pattern) > -1) {
						console.log("get targer ads match in domain list");
						$(this).parent().css("border", borderStyleHL);

						var pageUrl = window.location.href;
						var adUrl = $(this).attr("href");
						var adImg = $(this).find('img').attr('src');
						var adText = $(this).text();
						var feature = userScore;
						var adPos = $(this).parent().position();
						var adText = $(this).text() ? $(this).text() : "this is an image ads";
						var adImg = $(this).find("img").clone();
						$(adImg).css({"width": adsImageWidth, "height": adsImageHeight});

						cloneUrlAry.push($(this).attr("href"));
						cloneImgAry.push(adImg);
						cloneTextAry.push(adText);

						// console
						console.log("pageUrl ", pageUrl);
						console.log("adUrl ", adUrl);
						console.log("adImg ", adImg);
						console.log("adText ", adText);
						console.log("adPos left ", adPos.left);
						console.log("adPos top ", adPos.top);
						console.log("userScore ", userScore);
						console.log("DOM class ", $(this).parent().attr("class"));
						console.log("DOM id ", $(this).parent().attr("id"));

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

				    		$(adsLeft).addClass("adsLeft");
				    		$(adsRight).addClass("adsRight");

				    		$(adsContainer).addClass("adsContainer").append(adsLeft).append(adsRight);
				    		$(adsLeft).append(cloneImgAry[key]);
				    		$(adsRight).text(cloneTextAry[key]);
				    		$(adsLink).attr({"href": cloneUrlAry, "target": "_blank"});
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

		function removeAdsHL(containsText) {
			$('a[href*="' + containsText + '"]').remove();
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
		function diffScore(userScore, mockScore, scoreThreshold) {
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
