/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/5/13, at 5:12 PM.
 */

var app = app || {};
app.service = app.service || {};

app.service.facebook = (function () {
    'use strict';

    /**
     * Check <a href="https://developers.facebook.com/docs/reference/api/search/">Facebook Search API Reference</a>
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {
        var url = 'https://graph.facebook.com/search?type=post&q=' + keyword;

        $.getJSON(url, onSuccess);
    };

    return {
        findNews: findNews
    };

}());