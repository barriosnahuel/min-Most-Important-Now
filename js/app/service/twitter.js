/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/5/13, at 2:35 AM.
 */

var app = app || {};
app.service = app.service || {};

app.service.twitter = (function () {
    'use strict';

    /**
     * https://dev.twitter.com/docs/api/1/get/search
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {
        var url = 'http://search.twitter.com/search.json?callback=?&q="' + keyword + '"';

        $.getJSON(url, onSuccess);
    };

    /**
     * https://dev.twitter.com/docs/api/1/get/trends/%3Awoeid
     * @param onSuccess
     */
    var findTrends = function (onSuccess) {
        $.getJSON('https://api.twitter.com/1/trends/1.json?callback=?', onSuccess);
    };

    return {
        findNews: findNews, findTrends: findTrends
    };

}());