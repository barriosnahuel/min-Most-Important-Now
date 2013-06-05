/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/5/13, at 3:42 AM.
 */

var app = app || {};
app.service = app.service || {};

app.service.gplus = (function () {
    'use strict';

    /**
     * https://developers.google.com/+/api/latest/activities#resource
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {
        var apiKey = 'AIzaSyCNQ1slAxWLz8pg6MCPXJDVdeozgQBYxz8';

        var url = 'https://www.googleapis.com/plus/v1/activities?key=' + apiKey + '&query=' + keyword;

        $.getJSON(url, onSuccess);
    };

    return {
        findNews: findNews
    };

}());