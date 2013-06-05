/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/5/13, at 5:50 PM.
 */

var app = app || {};
app.service = app.service || {};

app.service.rss = (function () {
    'use strict';

    var findNews = function (keyword, onSuccess) {
        $.ajax({
            url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/find?v=1.0&callback=?&q=' + keyword,
            dataType: 'json',
            success: function (data) {
                onSuccess(data.responseData.entries);
            }
        });
    };

    return {
        findNews: findNews
    };

}());

