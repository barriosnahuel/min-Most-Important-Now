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

        var googleFeedsCallback = function (result) {
            var index;
            var eachEntry;

            if (!result.error) {
                for (index = 0; index < result.entries.length; index++) {
                    eachEntry = result.entries[index];
                    var templateData = {title: eachEntry.title, contentSnippet: eachEntry.contentSnippet, link: eachEntry.link};
                    container.append($('#rssFeedTemplate').render(templateData));
                }
            }
        };

        var flickrCallback = function (data) {
            var templateData = {}, index;

            templateData.photos = [];

            for (index = 0; index < data.items.length; index++) {
                var eachItem = data.items[index];
                templateData.photos[index] = {photo: eachItem.media.m, link: eachItem.link};
            }
            console.log('hay ' + index + ' items..');

            var li = container.find('li[class=flickr]');

            if (li.length === 0) {
                li = container.append('<li class="flickr"></li>').find('li[class=flickr]');
            }

            li.append($('#flickrNewsTemplate').render(templateData));

            var imagesContainer = li.find('div');
            imagesContainer.imagesLoaded(function () {
                imagesContainer.isotope({itemSelector: '.isotopeTest', animationEngine: 'best-available'});
            });
        };

        var twitterCallback = function (data) {
            if (!data.error) {
                $.each(data.results, function (index, eachItem) {
                    var templateData = {userName: eachItem.from_user, text: eachItem.text, id: eachItem.id_str};
                    container.append($('#twitterNewsTemplate').render(templateData));
                });
            }
        };

        var facebookCallback = function (data) {
            $.each(data.data, function (index, eachItem) {
                var templateData = {userId: eachItem.from.id, userName: eachItem.from.name, text: app.util.strings.truncate(eachItem.message), id: eachItem.id};
                container.append($('#facebookNewsTemplate').render(templateData));
            });
        };

        var googlePlusCallback = function (data) {
            $.each(data.items, function (index, eachItem) {
                if (eachItem.title !== '') {
                    var templateData = {userId: eachItem.actor.id, userName: eachItem.actor.displayName, text: app.util.strings.truncate(eachItem.title), link: eachItem.object.url};
                    container.append($('#googlePlusNewsTemplate').render(templateData));
                }
            });
        };

        app.service.newsFinder.findNews(query, googleFeedsCallback, flickrCallback, twitterCallback, googlePlusCallback, facebookCallback);
    };

    /**
     * Scroll to the specified {@code jQuerySelector}.
     * @param jQuerySelector A jQuery selector to scroll the entire page.
     */
    var scrollTo = function (jQuerySelector) {
        $('html, body').stop().animate({
            scrollTop: $(jQuerySelector).offset().top
        }, 1500);
    };

    var createNewTopic = function (topicName, atBegin) {
        //  TODO : Use a template instead of this horrible script!
        //  TODO : Split this function into others two: createMenuEntry() and createSection()

        var trendNameElementId = topicName.replace(/ /g, '');
        var content = $('.content');

        var templateData = {trendNameElementId: trendNameElementId, topicName: topicName};
        var menuHTML = $('#menuItemTemplate').render(templateData);

        if (atBegin) {
            $('.nav').prepend(menuHTML);
        } else {
            $('.nav').append(menuHTML);
        }


        var trendNameElementSelector = '#' + trendNameElementId;
        $('.nav a[href=' + trendNameElementSelector + ']').on('click', function () {
            scrollTo(trendNameElementSelector);
        });

        var sectionHTML = $('#newsSectionTemplate').render(templateData);
        if (atBegin) {
            content.prepend(sectionHTML);
        } else {
            content.append(sectionHTML);
        }

        return trendNameElementSelector;
    };

    /**
     * Find news from all configured sources for a specific topic that has been choosed for the user in the search box of the left side menu.
     */
    var findNewsForCustomTopic = function () {
        var userQuery = $('form input').val();
        var sectionIdSelector = createNewTopic(userQuery, true);

        findNewsForQuery(userQuery, $(sectionIdSelector + ' ul'));
        scrollTo(sectionIdSelector);
    };

    var findNewsForTrends = function (index, eachItem) {
        var trendName = app.util.strings.getKeywordWithoutPreffix(eachItem.name);

        var eachSectionList = $(createNewTopic(trendName) + ' ul');

        findNewsForQuery(eachItem.keywords, eachSectionList);
    };

    //    ********************************************
    //    Bind events and customize controls behavior.

    var customSearchButton = $('#customSearchButton');

    customSearchButton.on('click', findNewsForCustomTopic);

    $('form').submit(function (event) {
        event.preventDefault();
        customSearchButton.click();
    });

    $('#navbar').affix();


    //    ************************************************
    //    Load trends, then news for those trending topics

    app.service.instagram.findTrends(function (data) {
        var instagramDiv = $('#instagramPopularPhotos');
        var index;

        for (index = 0; index < data.data.length; index++) {
            var templateData = {link: data.data[index].link, thumbnail: data.data[index].images.thumbnail.url};
            instagramDiv.append($('#instagramNewsTemplate').render(templateData));
        }
    });


    $.when(app.service.google.search.findTrends()).done(function (result) {
        var index, eachTrend, trends = [];

        var googleTrends = result.feed.entries;
        for (index = 0; index < googleTrends.length; index++) {
            eachTrend = googleTrends[index];
            trends[index] = {name: eachTrend.title, keywords: eachTrend.content.split(', ')};
        }

        $.each(trends, findNewsForTrends);
    });

    $.when(app.service.twitter.findTrends()).done(function (data) {
        var index, eachTrend, trends = [];

        var twitterTrends = data[0].trends;
        for (index = 0; index < twitterTrends.length; index++) {
            eachTrend = twitterTrends[index];
            trends[index] = {name: eachTrend.name, keywords: [eachTrend.name]};
        }

        $.each(trends, findNewsForTrends);
    });

});