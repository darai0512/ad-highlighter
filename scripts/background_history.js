console.log('chrome backgroudn history api');

var yahooDomain = [
    "tw.sports.yahoo.com",
    "tw.money.yahoo.com",
    "tw.movies.yahoo.com"
]

chrome.history.search({text: 'yahoo', maxResults: 10}, function(data) {
    data.forEach(function(page) {
        console.log(page.url);
    });
});
