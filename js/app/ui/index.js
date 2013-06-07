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

        var trendName = app.util.strings.getKeywordWithoutPreffix(eachItem.name);

        var trendNameElementId = trendName.replace(/ /g, '');
        $('.nav ul').append('<li><a href="#' + trendNameElementId + '">' + eachItem.name + '</a></li>');

        content.append('<section id="' + trendNameElementId + '"><h2>' + eachItem.name + '</h2></section>');

        var eachSection = content.find('#' + trendNameElementId);
        eachSection.append('<ul></ul>');

        var eachSectionList = eachSection.find('ul');

        $.each(eachItem.keywords, function (index, eachKeyword) {
            google.feeds.findFeeds(eachKeyword, function (result) {
                var index;
                var eachEntry;

                if (!result.error) {
                    console.log('cantidad de entries: ' + result.entries.length);

                    for (index = 0; index < result.entries.length; index++) {
                        eachEntry = result.entries[index];

                        eachSectionList.append('<li class="rss">' + eachEntry.title + ': ' + eachEntry.content + '</li>');
                    }
                }
            });

            //  TODO : Add instagram public photos!
            //  TODO : Add flipboard! (they haven't got an API yet)
            //  TODO : Add youtube! (and other video sources)

            app.service.flickr.findNews(eachItem.name, function (data) {

                console.log('Found ' + data.items.length + ' results for ' + eachItem.name + ' in Flickr');

                $.each(data.items, function (index, item) {

                    //eachSectionList.append('<li class="flickr"><img src="' + item.media.m + '"/></li>');
                    eachSectionList.append('<li class="flickr">' + item.description + '(Fl)</li>');

                    //  TODO onmouseover cargo la .description con un popover de bootstrap.
                    //  TODO Usar isotope para ubicar las imágenes de manera de aprovechar el espacio en el sitio.
                });
            });

            app.service.twitter.findNews(eachKeyword, function (data) {
                if (!data.error) {
                    console.log('Found ' + data.results.length + ' results for ' + eachKeyword + ' in Twitter');

                    $.each(data.results, function (index, eachItem) {
                        eachSectionList.append('<li class="twitter">' + eachItem.text + '(Tw)</li>');
                    });
                }
            });

            app.service.google.gplus.findNews(eachKeyword, function (data) {
                console.log('Found ' + data.items.length + ' results for ' + eachKeyword + ' in Google+');

                $.each(data.items, function (index, eachItem) {
                    if (eachItem.title !== '') {
                        eachSectionList.append('<li class="gplus">' + eachItem.title + '(G+)</li>');
                    }
                });
            });

            app.service.facebook.findNews(eachKeyword, function (data) {
                console.log('Found ' + data.data.length + ' results for ' + eachKeyword + ' in Facebook');

                $.each(data.data, function (index, eachItem) {
                    eachSectionList.append('<li class="facebook">' + eachItem.message + '(Fb)</li>');
                });
            });


        });

        var addNewsFromRSS = function (entries) {
            $.each(entries, function (index, eachItem) {
                eachSectionList.html($('#rssFeedTemplate').render(eachItem));
            });
        };

        app.service.rss.findNews(trendName, addNewsFromRSS);
    };

    //    ****************************************************************
    //    Hasta acá son definiciones de funciones, ahora arranca el "init"

    $.when(/*app.service.twitter.findTrends(),*/ app.service.google.search.findTrends()).done(function (data, result) {
        var index, eachTrend, trends = [], trendsIndex = 0;

//        var twitterTrends = data[0][0].trends;
//
//        for (index = 0; index < twitterTrends.length; index++) {
//            eachTrend = twitterTrends[index];
//            //  TODO : use a Javascript Object instead of an a JSON object.
//            trends[index] = {name: eachTrend.title, keywords: eachTrend.content.split(', ')};
//        }

        trendsIndex = trends.length;
        var googleTrends = data.feed.entries;
        for (index = 0; index < googleTrends.length; index++, trendsIndex++) {
            eachTrend = googleTrends[index];
            trends[trendsIndex] = {name: eachTrend.title, keywords: eachTrend.content.split(', ')};
        }

        $.each(trends, findNewsForTrends);
    });

});