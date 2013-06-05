/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/5/13, at 2:42 AM.
 */

var app = app || {};
app.service = app.service || {};

app.service.flickr = (function () {
    'use strict';

    var findNews = function (keyword, onSuccess) {
        var url = 'http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?';

        $.getJSON(url, {tags: keyword, tagmode: 'any', format: 'json'}, onSuccess);
    };

    return {
        findNews: findNews
    };

}());