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

    var trends = [], loadedTrendsCount;

    var findNewsForQuery = function (query, container, onSuccess, onSuccessParameter) {

        var googleFeedsCallback = function (result) {
            var index, eachEntry, templateData;

            if (!result.error) {
                for (index = 0; index < result.entries.length; index++) {
                    eachEntry = result.entries[index];
                    templateData = {title: eachEntry.title, contentSnippet: eachEntry.contentSnippet, link: eachEntry.link};
                    container.append($('#rssFeedTemplate').render(templateData));
                }
            }

            if (onSuccess) {
                onSuccess(onSuccessParameter);
            }
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
            } else {
                console.log('Ocurrió un error al recuperar las noticias de Instagram: ' + data.meta.code);
                //  TODO : Send this error to Google Analytics
            }
        };

        app.service.newsFinder.findNews(query, googleFeedsCallback, flickrCallback, twitterCallback, googlePlusCallback, facebookCallback, instagramCallback);
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

        //  Needed functions
        function onMenuItemSelected() {
            //  If section doesn't exists, then create it.
            if ($(trendNameElementSelector).length === 0) {
                createNewSection(templateData);

                // If topic is in trends list, then load news from that trend object.
                // I'm sure that the topic is in trends list because if it's not, then the flow mustn't enter to this IF statement.

                var index;
                for (index = 0; index < trends.length; index++) {
                    if (trends[index].name === topicName) {
                        break;
                    }
                }

                loadNews(index >= 0 ? index : -1, undefined, scrollTo, trendNameElementSelector);
            } else {
                console.log('scrolleo!');
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

        findNewsForQuery(userQuery, $(sectionIdSelector + ' ul'));
        scrollTo(sectionIdSelector);
    };

    var findNewsForTrend = function (trend, onSuccess, onSuccessParameter) {
        var trendName = app.util.strings.getKeywordWithoutPreffix(trend.name);

        var trendNameElementId = trendName.replace(/ /g, '').replace(/\./g, '');
        var templateData = {trendNameElementId: trendNameElementId, topicName: trendName};

        var eachSectionList = $(createNewSection(templateData) + ' ul');

        findNewsForQuery(trend.keywords, eachSectionList, onSuccess, onSuccessParameter);
        console.log('pongo en true a ' + trendName);
        trend.loaded = true;
    };

    //    ********************************************
    //    Bind events and customize controls behavior.

    function loadNews(indexTrendToLoad, jQueryElementWithWaypoint, onSuccess, onSuccessParameter) {
        console.log('loadNews');
        if (indexTrendToLoad >= 0) {
            findNewsForTrend(trends[indexTrendToLoad], onSuccess, onSuccessParameter);

            loadedTrendsCount = loadedTrendsCount + 1;
        }

        if (loadedTrendsCount < trends.length) {
            //  Waits 5 seconds till call to destroy-->create the waypoint because if not then loads all topics before append the second one.
            setTimeout(addWaypoint, 4000);
        } else {
            jQueryElementWithWaypoint.waypoint('destroy');
        }
    }

    function findUnloadedTrend() {
        var index;
        for (index = 0; index < trends.length; index++) {
            if (!trends[index].loaded) {
                console.log(trends[index].name + ' deberia estar false: ' + trends[index].loaded);
                break;
            }
        }

        return index < trends.length ? index : -1;
    }

    var addWaypoint = function (containerSelector) {
        console.log('addWaypoint');
        var container = $(containerSelector);
        container.waypoint('destroy');
        container.waypoint(loadNewsOnScroll, { offset: '150%' });

        function loadNewsOnScroll(direction) {
            if ('down' === direction && loadedTrendsCount) {

                loadNews(findUnloadedTrend(), container);
            } else {
                console.log('entro al waypoint pero no cargo noticias');
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

    $.when(app.service.google.search.findTrends()).done(function (result) {
        var index, eachTrend;

        var googleTrends = result.feed.entries;
        for (index = 0; index < googleTrends.length; index++) {
            eachTrend = googleTrends[index];

            var keywords = [];
            if (eachTrend.content !== '') {
                keywords = eachTrend.content.split(', ');
            } else {
                keywords[0] = eachTrend.title;
            }

            trends[index] = {name: eachTrend.title, keywords: keywords, loaded: false};
        }

        for (index = 0; index < trends.length; index++) {
            createMenuEntry('#globalTrends', trends[index].name);
        }


        findNewsForTrend(trends[0]);
        loadedTrendsCount = 1;
    });

    //    $.when(app.service.socialNetworks.twitter.findTrends()).done(function (data) {
    //        var index, eachTrend, trends = [];
    //
    //        var twitterTrends = data[0].trends;
    //        for (index = 0; index < twitterTrends.length; index++) {
    //            eachTrend = twitterTrends[index];
    //            trends[index] = {name: eachTrend.name, keywords: [eachTrend.name]};
    //        }
    //
    //        $.each(trends, findNewsForTrend);
    //    });

})
;