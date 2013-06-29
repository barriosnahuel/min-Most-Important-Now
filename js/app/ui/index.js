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

    var findNewsForQuery = function (keywords, container, onlyOnce, onSuccess) {

        var executed = false;

        function callCallbacks() {
            if (onSuccess) {
                onSuccess();
            }

            if (onlyOnce && !executed) {
                onlyOnce();
                executed = true;
            }
        }

        var googleFeedsCallback = function (result) {
            var index, eachEntry, templateData;

            if (!result.error) {
                for (index = 0; index < result.entries.length; index++) {
                    eachEntry = result.entries[index];
                    templateData = {title: eachEntry.title, contentSnippet: eachEntry.contentSnippet, link: eachEntry.link};
                    container.append($('#rssFeedTemplate').render(templateData));
                }

                callCallbacks();
            }
        };

        var twitterCallback = function (data) {
            if (!data.error) {
                $.each(data.results, function (index, eachItem) {
                    var templateData = {userName: eachItem.from_user, text: eachItem.text, id: eachItem.id_str};
                    container.append($('#twitterNewsTemplate').render(templateData));
                });

                callCallbacks();
            }
        };

        var facebookCallback = function (data) {
            $.each(data.data, function (index, eachItem) {
                var templateData = {userId: eachItem.from.id, userName: eachItem.from.name, text: app.util.strings.truncate(eachItem.message), id: eachItem.id};
                container.append($('#facebookNewsTemplate').render(templateData));
            });

            callCallbacks();
        };

        var googlePlusCallback = function (data) {
            $.each(data.items, function (index, eachItem) {
                if (eachItem.title !== '') {
                    var templateData = {userId: eachItem.actor.id, userName: eachItem.actor.displayName, text: app.util.strings.truncate(eachItem.title), link: eachItem.object.url};
                    container.append($('#googlePlusNewsTemplate').render(templateData));
                }
            });

            callCallbacks();
        };

        var flickrCallback = function (data) {
            var templateData = {}, index, eachItem, imagesContainer, li;

            templateData.photos = [];

            for (index = 0; index < data.items.length; index++) {
                eachItem = data.items[index];
                templateData.photos[index] = {photo: eachItem.media.m, link: eachItem.link};
            }

            li = container.find('li[class=flickr]');

            if (li.length === 0) {
                li = container.append('<li class="flickr"></li>').find('li[class=flickr]');
            }

            li.append($('#flickrNewsTemplate').render(templateData));

            imagesContainer = li.find('div');
            imagesContainer.imagesLoaded(function () {
                imagesContainer.isotope({itemSelector: '.isotopeTest', animationEngine: 'best-available'});
            });

            callCallbacks();
        };

        var instagramCallback = function (data) {
            var templateData = {}, index, eachItem, imagesContainer, li;

            templateData.photos = [];

            if (data.meta.code === 200) {
                for (index = 0; index < data.data.length; index++) {
                    eachItem = data.data[index];

                    templateData.photos[index] = {photo: eachItem.images.thumbnail.url, link: eachItem.link};
                }

                li = container.find('li[class=flickr]');

                if (li.length === 0) {
                    li = container.append('<li class="flickr"></li>').find('li[class=flickr]');
                }

                li.append($('#flickrNewsTemplate').render(templateData));

                imagesContainer = li.find('div');
                imagesContainer.imagesLoaded(function () {
                    imagesContainer.isotope({itemSelector: '.isotopeTest', animationEngine: 'best-available'});
                });

                callCallbacks();
            } else {
                console.log('Ocurrió un error al recuperar las noticias de Instagram: ' + data.meta.code);
                //  TODO : Send this error to Google Analytics
            }
        };

        app.service.newsFinder.findNews(keywords, googleFeedsCallback, flickrCallback, twitterCallback, googlePlusCallback, facebookCallback, instagramCallback);
    };

    /**
     * Scroll to the specified {@code jQuerySelector}.
     * @param jQuerySelector A jQuery selector to scroll the entire page.
     */
    var scrollTo = function (jQuerySelector) {
        $('html, body').stop().animate({
            scrollTop: $(jQuerySelector).offset().top - 100
        }, 1500);
    };

    var createMenuEntry = function (containerSelector, topicName) {
        var trendNameElementId = topicName.replace(/ /g, '').replace(/\./g, '');

        var templateData = {trendNameElementId: trendNameElementId, topicName: topicName};
        var menuItemHTML = $('#menuItemTemplate').render(templateData);

        $(containerSelector).append(menuItemHTML);

        var trendNameElementSelector = '#' + trendNameElementId;

        $(containerSelector + ' a[href=' + trendNameElementSelector + ']').on('click', onMenuItemSelected);

        function onMenuItemSelected(event) {
            event.preventDefault();

            //  If section doesn't exists, then create it.
            if ($(trendNameElementSelector).length === 0) {

                // If topic is in trends list, then load news from that trend object.
                // I'm sure that the topic is in trends list because if it's not, then the flow mustn't enter to this IF statement.
                var index;
                for (index = 0; index < globalTrends.length; index++) {
                    if (globalTrends[index].name === topicName) {
                        break;
                    }
                }

                loadNews(index >= 0 ? index : -1, undefined, scrollTo.bind(null, trendNameElementSelector), function () {
                    $.waypoints('refresh');
                });
            } else {
                scrollTo(trendNameElementSelector);
            }
        }

        return templateData;
    };


    var createNewSection = function (templateData, atBegin) {
        var content = $('.content');

        var sectionHTML = $('#newsSectionTemplate').render(templateData);
        if (atBegin) {
            content.prepend(sectionHTML);
        } else {
            content.append(sectionHTML);
        }

        return '#' + templateData.trendNameElementId;
    };

    /**
     * Find news from all configured sources for a specific topic that has been choosed for the user in the search box of the left side menu.
     */
    var findNewsForCustomTopic = function () {
        var userQuery = $('form input').val();

        var containerQuerySelector = '#queries';
        var templateData = createMenuEntry(containerQuerySelector, userQuery);

        var sectionIdSelector = createNewSection(templateData, true);

        findNewsForQuery([userQuery], $(sectionIdSelector + ' ul'), scrollTo.bind(null, sectionIdSelector));
        scrollTo(sectionIdSelector);
    };

    var findNewsForTrend = function (trend, onlyOnce, onSuccess) {
        var trendName = app.util.strings.getKeywordWithoutPreffix(trend.name);

        var trendNameElementId = trendName.replace(/ /g, '').replace(/\./g, '');
        var templateData = {trendNameElementId: trendNameElementId, topicName: trendName};

        var eachSectionList = $(createNewSection(templateData) + ' ul');

        findNewsForQuery(trend.keywords, eachSectionList, onlyOnce, onSuccess);
        trend.loaded = true;
    };

    //    ********************************************
    //    Bind events and customize controls behavior.

    function loadNews(indexTrendToLoad, jQueryElementWithWaypoint, onlyOnce, onSuccess) {
        if (indexTrendToLoad >= 0) {
            findNewsForTrend(globalTrends[indexTrendToLoad], onlyOnce, onSuccess);

            loadedTrendsCount = loadedTrendsCount + 1;
        }

        if (loadedTrendsCount === globalTrends.length) {
            jQueryElementWithWaypoint.waypoint('destroy');
        }
    }

    function findUnloadedTrend() {
        var index;
        for (index = 0; index < globalTrends.length; index++) {
            if (!globalTrends[index].loaded) {
                break;
            }
        }

        return index < globalTrends.length ? index : -1;
    }

    var addWaypoint = function (containerSelector) {
        var footer = $(containerSelector);
        footer.waypoint(loadNewsOnScroll, { offset: '150%'});

        function loadNewsOnScroll(direction) {

            if ('down' === direction && loadedTrendsCount) {

                loadNews(findUnloadedTrend(), footer, function () {
                    $.waypoints('refresh');
                });
            } else {
            }
        }
    };

    addWaypoint('footer');

    $('form').submit(function (event) {
        event.preventDefault();
        findNewsForCustomTopic();
    });

    //    ************************************************
    //    Load trends, then news for those trending topics

//    app.service.socialNetworks.instagram.findTrends(function (data) {
//        var instagramDiv = $('#instagramPopularPhotos');
//        var index;
//
//        for (index = 0; index < data.data.length; index++) {
//            var templateData = {link: data.data[index].link, thumbnail: data.data[index].images.thumbnail.url};
//            instagramDiv.append($('#instagramNewsTemplate').render(templateData));
//        }
//
//        //  TODO : Retrieve tags from theese photos, add them to trends and search for photos with those tags!
//    });

    var loadedTrendsCount;
    var alreadyLoaded, globalTrends = [], globalTrendsIndex = 0;

    $.when(app.service.google.search.findTrends()).done(function (result) {
        var index, eachTrend;

        var relativeGlobalTrendsIndex = globalTrendsIndex;

        var googleTrends = result.feed.entries;
        for (index = 0; index < googleTrends.length; index++, globalTrendsIndex++) {
            eachTrend = googleTrends[index];

            var keywords = [];
            if (eachTrend.content !== '') {
                keywords = eachTrend.content.split(', ');
            } else {
                keywords[0] = eachTrend.title;
            }

            globalTrends[globalTrendsIndex] = {name: eachTrend.title, keywords: keywords, loaded: false};
        }

        for (relativeGlobalTrendsIndex; relativeGlobalTrendsIndex < globalTrends.length; relativeGlobalTrendsIndex++) {
            console.log('adding menu entry for google trends');
            createMenuEntry('#globalTrends', globalTrends[relativeGlobalTrendsIndex].name);
        }

        if (!alreadyLoaded) {
            console.log('google trends loaded first');
            findNewsForTrend(globalTrends[0]);
            loadedTrendsCount = 1;
            alreadyLoaded = true;
        }
    });

    $.when(app.service.socialNetworks.twitter.findTrends(1)).done(function (data) {
        var index, eachTrend;

        var twitterTrends = data[0].trends;
        var relativeGlobalTrendsIndex = globalTrendsIndex;
        for (index = 0; index < twitterTrends.length; index++, globalTrendsIndex++) {
            eachTrend = twitterTrends[index];
            globalTrends[globalTrendsIndex] = {name: eachTrend.name, keywords: [eachTrend.name]};
        }

        for (relativeGlobalTrendsIndex; relativeGlobalTrendsIndex < globalTrends.length; relativeGlobalTrendsIndex++) {
            console.log('adding menu entry for twitter trends');
            createMenuEntry('#globalTrends', globalTrends[relativeGlobalTrendsIndex].name);
        }

        if (!alreadyLoaded) {
            console.log('twitter trends loaded first');
            findNewsForTrend(globalTrends[0]);
            loadedTrendsCount = 1;
            alreadyLoaded = true;
        }
    });

});