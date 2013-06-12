/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/10/13, at 8:14 PM.
 */

var app = app || {};
app.service = app.service || {};

app.service.instagram = (function () {
    'use strict';

    var CLIENT_ID = 'cb1d643d638842518c90b63c6c3ea7a0';

    var findNews = function (keyword, onSuccess) {
        var url = 'https://api.instagram.com/v1/tags/' + keyword + '/media/recent?client_id=&client_id=' + CLIENT_ID + '&callback=?';

        $.getJSON(url, onSuccess);
    };

    var findTrends = function (onSuccess) {
        $.getJSON('https://api.instagram.com/v1/media/popular?client_id=' + CLIENT_ID + '&callback=?', onSuccess);
    };

    return {
        findTrends: findTrends, findNews: findNews
    };

}());