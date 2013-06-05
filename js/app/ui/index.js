/*
 * Epic Moments - What people all around the world are saying when you want to hear them.
 * Copyright (C) 2013 Nahuel Barrios <barrios.nahuel@gmail.com>.
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

        //        http://www.google.com/trends/hottrends/atom/hourly
        //        http://www.google.com/trends/hottrends/atom/feed?pn=p1

        $.ajax({
            url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=-1&q=' + encodeURIComponent('http://www.google.com/trends/hottrends/atom/feed'),
            dataType: 'xml',
            success: function (data) {
                console.log('IT\'S HERE!!!');
                console.log(data);
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };

    //    hasta acá son definiciones de funciones, ahora arranca el "init"
    app.service.twitter.findTrends(function (data) {
        $(data[0].trends).each(findNewsForTrends);
    });

});