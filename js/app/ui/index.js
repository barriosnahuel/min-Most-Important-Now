/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/5/13, at 12:56 AM.
 */

$(document).ready(function () {
    'use strict';

    var findNewsForTrends = function (index, eachItem) {
        var content = $('.content');

        var keyword = app.util.strings.getKeywordWithoutPreffix(eachItem.name);

        $('.nav ul').append('<li><a href="#' + keyword + '">' + eachItem.name + '</a></li>');

        content.append('<section id="' + keyword + '"><h1>' + eachItem.name + '</h1></section>');
        content.find('#' + keyword).append('<ul></ul>');

        var eachSectionList = content.find('#' + keyword).find('ul');

        app.service.flickr.findNews(eachItem.name, function (data) {

            console.log('Found ' + data.items.length + ' results for ' + eachItem.name + ' in Flickr');

            $.each(data.items, function (index, item) {

                //eachSectionList.append('<li class="flickr"><img src="' + item.media.m + '"/></li>');
                eachSectionList.append('<li class="flickr">' + item.description + '(Fl)</li>');

                //  TODO onmouseover cargo la .description con un popover de bootstrap.
                //  TODO Usar isotope para ubicar las imágenes de manera de aprovechar el espacio en el sitio.
            });
        });

        app.service.twitter.findNews(eachItem.query, function (data) {
            console.log('Found ' + data.results.length + ' results for ' + eachItem.query + ' in Twitter');

            $.each(data.results, function (index, eachItem) {
                eachSectionList.append('<li class="twitter">' + eachItem.text + '(Tw)</li>');
            });
        });

        app.service.gplus.findNews(eachItem.query, function (data) {
            console.log('Found ' + data.items.length + ' results for ' + eachItem.query + ' in Google+');

            $.each(data.items, function (index, eachItem) {
                if (eachItem.title !== '') {
                    eachSectionList.append('<li class="gplus">' + eachItem.title + '(G+)</li>');
                }
            });
        });

        app.service.facebook.findNews(eachItem.query, function (data) {
            console.log('Found ' + data.data.length + ' results for ' + eachItem.query + ' in Facebook');

            $.each(data.data, function (index, eachItem) {
                eachSectionList.append('<li class="facebook">' + eachItem.message + '(Fb)</li>');
            });
        });

        var addNewsFromRSS = function (entries) {
            $.each(entries, function (index, eachItem) {
                var textToDisplay = $.trim(eachItem.contentSnippet) !== '' ? 'snippet: ' + eachItem.contentSnippet : 'title: ' + eachItem.title;
                eachSectionList.append('<li class="rss">' + textToDisplay + '(RSS)</li>');
            });
        };

        app.service.rss.findNews(keyword, addNewsFromRSS);

        //  TODO check http://www.google.com/trends/ la puedo recuperar en JSON
        // con: https://developers.google.com/feed/v1/jsondevguide#loadBasic por ejemplo
        // haciendo: https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=http%3A%2F%2Fwww.google.com%2Ftrends%2Fhottrends%2Fatom%2Fhourly&callback=processResults
    };

    //    hasta acá son definiciones de funciones, ahora arranca el "init"
    app.service.twitter.findTrends(function (data) {
        $(data[0].trends).each(findNewsForTrends);
    });

});