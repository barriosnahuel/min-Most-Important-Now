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

    var findNewsForQuery = function (query, container) {
        google.feeds.findFeeds(query, function (result) {
            var index;
            var eachEntry;

            if (!result.error) {
                for (index = 0; index < result.entries.length; index++) {
                    eachEntry = result.entries[index];

                    container.append('<li class="rss">' + eachEntry.title + ': ' + eachEntry.content + '</li>');
                }
            }
        });

        //  TODO : Add instagram public photos!
        //  TODO : Add flipboard! (they haven't got an API yet)
        //  TODO : Add youtube! (and other video sources)

        app.service.flickr.findNews(query, function (data) {
            $.each(data.items, function (index, item) {

                //container.append('<li class="flickr"><img src="' + item.media.m + '"/></li>');
                container.append('<li class="flickr">' + item.description + '</li>');

                //  TODO onmouseover cargo la .description con un popover de bootstrap.
                //  TODO Usar isotope para ubicar las imágenes de manera de aprovechar el espacio en el sitio.
            });
        });

        app.service.twitter.findNews(query, function (data) {
            if (!data.error) {
                $.each(data.results, function (index, eachItem) {
                    container.append('<li class="twitter">' + eachItem.text + '</li>');
                });
            }
        });

        app.service.google.gplus.findNews(query, function (data) {
            $.each(data.items, function (index, eachItem) {
                if (eachItem.title !== '') {
                    container.append('<li class="gplus">' + eachItem.title + '</li>');
                }
            });
        });

        app.service.facebook.findNews(query, function (data) {
            $.each(data.data, function (index, eachItem) {
                container.append('<li class="facebook">' + eachItem.message + '</li>');
            });
        });
    };

    var createNewTopic = function (topicName, atBegin) {
        //  TODO : Use a template instead of this horrible script!
        //  TODO : Split this function into others two: createMenuEntry() and createSection()

        var trendNameElementId = topicName.replace(/ /g, '');
        var content = $('.content');
        var menuHTML = '<li><a href="#' + trendNameElementId + '"><i class="icon-chevron-right "></i>' + topicName + '</a></li>';

        if (atBegin) {
            $('.nav').prepend(menuHTML);
        } else {
            $('.nav').append(menuHTML);
        }

        var sectionHTML = '<section id="' + trendNameElementId + '"><h2>' + topicName + '</h2></section>';
        if (atBegin) {
            content.prepend(sectionHTML);
        } else {
            content.append(sectionHTML);
        }

        var eachSection = content.find('#' + trendNameElementId);
        eachSection.append('<ul></ul>');

        return eachSection.find('ul');
    };

    var findNewsForCustomTopic = function () {
        var userQuery = $('form input').val();
        findNewsForQuery(userQuery, createNewTopic(userQuery, true));
    };

    var findNewsForTrends = function (index, eachItem) {
        var trendName = app.util.strings.getKeywordWithoutPreffix(eachItem.name);

        var eachSectionList = createNewTopic(trendName);

        $.each(eachItem.keywords, function (index, eachKeyword) {
            findNewsForQuery(eachKeyword, eachSectionList);
        });

        var addNewsFromRSS = function (entries) {
            $.each(entries, function (index, eachItem) {
                eachSectionList.html($('#rssFeedTemplate').render(eachItem));
            });
        };

        app.service.rss.findNews(trendName, addNewsFromRSS);
        //  TODO : Change this RSS implementation to use the Google Feed API
    };

    //    ********************************************
    //    Bind events and customize controls behavior.

    $('#navbar').affix();
    $('#customSearchButton').on('click', findNewsForCustomTopic);

    //    ********************
    //    Load trends and news

    $.when(app.service.twitter.findTrends(), app.service.google.search.findTrends()).done(function (data, result) {
        var index, eachTrend, trends = [], trendsIndex = 0;

        var twitterTrends = data[0][0].trends;

        for (index = 0; index < twitterTrends.length; index++) {
            eachTrend = twitterTrends[index];
            //  TODO : use a Javascript Object instead of an a JSON object.
            trends[index] = {name: eachTrend.name, keywords: [eachTrend.name]};
        }

        trendsIndex = trends.length;
        var googleTrends = result.feed.entries;
        for (index = 0; index < googleTrends.length; index++, trendsIndex++) {
            eachTrend = googleTrends[index];
            trends[trendsIndex] = {name: eachTrend.title, keywords: eachTrend.content.split(', ')};
        }

        $.each(trends, findNewsForTrends);
    });

});