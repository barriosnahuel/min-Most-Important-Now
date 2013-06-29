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

    /**
     * TODO : Javadoc for findNewsForQuery
     * @param keywords
     * @param container
     * @param onlyOnce A callback to execute only once after a successfull news look up.
     * @param onSuccess
     */
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
                    container.prepend($('#rssFeedTemplate').render(templateData));
                }

                callCallbacks();
            }
        };

        /**
         * Callback for Twitter found trends.
         * @param data Response obtained using <a href="https://github.com/mynetx/codebird-js">codebird-js</a>.
         */
        var twitterCallback = function (data) {
            var index;

            if (data.httpstatus === 200) {
                for (index = 0; index < data.statuses.length; index++) {
                    var eachTweet = data.statuses[index];

                    var templateData = {userName: eachTweet.user.screen_name, text: eachTweet.text, id: eachTweet.id_str};
                    container.prepend($('#twitterNewsTemplate').render(templateData));
                }

                callCallbacks();
            }
        };

        var facebookCallback = function (data) {
            $.each(data.data, function (index, eachItem) {
                var templateData = {userId: eachItem.from.id, userName: eachItem.from.name, text: app.util.strings.truncate(eachItem.message), id: eachItem.id};
                container.prepend($('#facebookNewsTemplate').render(templateData));
            });

            callCallbacks();
        };

        var googlePlusCallback = function (data) {
            $.each(data.items, function (index, eachItem) {
                if (eachItem.title !== '') {
                    var templateData = {userId: eachItem.actor.id, userName: eachItem.actor.displayName, text: app.util.strings.truncate(eachItem.title), link: eachItem.object.url};
                    container.prepend($('#googlePlusNewsTemplate').render(templateData));
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
        }, 1000);
    };

    var createMenuEntry = function (containerSelector, topicName) {
        var trendNameElementId = app.util.strings.removeMetaCharacters(topicName.replace(/ /g, ''));

        var templateData = {trendNameElementId: trendNameElementId, topicName: topicName};
        var menuItemHTML = $('#menuItemTemplate').render(templateData);

        $(containerSelector).append(menuItemHTML);

        var trendNameElementSelector = '#' + trendNameElementId;

        $(containerSelector + ' a[href=' + trendNameElementSelector + ']').on('click', {containerSelector: containerSelector}, onMenuItemSelected);

        function onMenuItemSelected(event) {
            event.preventDefault();

            //  If section doesn't exists, then create it.
            if ($(trendNameElementSelector).length === 0) {

                // If topic is in trends list, then load news from that trend object.
                // I'm sure that the topic is in trends list because if it's not, then the flow mustn't enter to this IF statement.
                //  TODO : Functionality : Check this!!
                var index, found;

                for (index = 0; index < localTrends.length; index++) {
                    if (localTrends[index].name === topicName) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    for (index = 0; index < globalTrends.length; index++) {
                        if (globalTrends[index].name === topicName) {
                            break;
                        }
                    }
                }

                loadNews(event.data.containerSelector, index >= 0 ? index : -1, undefined, scrollTo.bind(null, trendNameElementSelector), function () {
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

    /**
     * TODO : Javadoc for findNewsForTrend
     * @param trend
     * @param onlyOnce A callback to execute only once after a successfull news look up.
     * @param onSuccess
     */
    var findNewsForTrend = function (trend, onlyOnce, onSuccess) {
        var trendName = app.util.strings.getKeywordWithoutPreffix(trend.name);

        var trendNameElementId = app.util.strings.removeMetaCharacters(trendName.replace(/ /g, ''));
        var templateData = {trendNameElementId: trendNameElementId, topicName: trendName};

        var eachSectionList = $(createNewSection(templateData) + ' ul');

        findNewsForQuery(trend.keywords, eachSectionList, onlyOnce, onSuccess);
        trend.loaded = true;
    };

    //    ********************************************
    //    Bind events and customize controls behavior.

    /**
     * TODO : Javadoc for loadNews
     * @param containerSelector
     * @param indexTrendToLoad
     * @param jQueryElementWithWaypoint
     * @param onlyOnce A callback to execute only once after a successfull news look up.
     * @param onSuccess
     */
    function loadNews(containerSelector, indexTrendToLoad, jQueryElementWithWaypoint, onlyOnce, onSuccess) {
        //  TODO : Refactor :  method loadNews. Improve parameters!!
        var trends = localTrends;

        if (containerSelector === '#globalTrends') {
            trends = globalTrends;
        }

        if (indexTrendToLoad >= 0) {
            findNewsForTrend(trends[indexTrendToLoad], onlyOnce, onSuccess);

            loadedTrendsCount = loadedTrendsCount + 1;
        }

        if (loadedTrendsCount === trends.length) {
            jQueryElementWithWaypoint.waypoint('destroy');
        }
    }

    function findUnloadedTrend(trends) {
        var index;

        for (index = 0; index < trends.length; index++) {
            if (!trends[index].loaded) {
                break;
            }
        }

        return index < trends.length ? index : -1;
    }

    var addWaypoint = function (containerSelector) {
        var footer = $(containerSelector);
        footer.waypoint(loadNewsOnScroll, { offset: '200%'});

        function loadNewsOnScroll(direction) {
            var containerSelector = '#localTrends', trendToLoad;


            if ('down' === direction && loadedTrendsCount) {

                trendToLoad = findUnloadedTrend(localTrends);

                if (trendToLoad < 0) {
                    trendToLoad = findUnloadedTrend(globalTrends);
                    containerSelector = '#globalTrends';
                }

                loadNews(containerSelector, trendToLoad, footer, function () {
                    $.waypoints('refresh');
                });
            }
        }
    };

    addWaypoint('footer');

    $('form').submit(function (event) {
        event.preventDefault();

        //  TODO : Functionality : Check what to do if the custom query contains only meta characters.

        findNewsForCustomTopic();
    });

    //    ************************************************
    //    Load trends, then news for those trending topics

    app.service.socialNetworks.instagram.findTrends(function (data) {
        var instagramDiv = $('#instagramPopularPhotos');
        var index;


        if (data.data.length > 0) {
            instagramDiv.show();
        }

        for (index = 0; index < data.data.length; index++) {
            var templateData = {link: data.data[index].link, thumbnail: data.data[index].images.thumbnail.url};
            instagramDiv.append($('#instagramNewsTemplate').render(templateData));
        }

        //  TODO : Retrieve tags from theese photos, add them to trends and search for photos with those tags!
    });


    var alreadyLoaded, loadedTrendsCount, localTrends = [];

    var findLocalTrends = function () {

        if (geo_position_js.init()) {
            geo_position_js.getCurrentPosition(function (position) {

                app.service.socialNetworks.twitter.findClosestTrends(position.coords, function (locations) {

                    if (locations.length > 0) {
                        $.when(app.service.socialNetworks.twitter.findTrends(locations[0].woeid)).done(function (data) {
                            var index, eachTrend;

                            var twitterTrends = data[0].trends;
                            for (index = 0; index < twitterTrends.length; index++) {
                                eachTrend = twitterTrends[index];
                                localTrends[index] = {name: eachTrend.name, keywords: [eachTrend.name.replace(/#/, '')]};
                            }

                            for (index = 0; index < localTrends.length; index++) {
                                createMenuEntry('#localTrends', localTrends[index].name);
                            }
                            $('#localTrends').parent().show();

                            if (!alreadyLoaded) {
                                findNewsForTrend(localTrends[0], undefined, undefined);
                                loadedTrendsCount = 1;
                                alreadyLoaded = true;
                            }
                        });
                    }

                });
            }, function (positionError) {
                //  TODO : Functionality : Do something when locations sources returns a positionError
//                _gaq.push(['_trackEvent', 'Errors', 'Geolocation API', positionError.message]);
            }, {maximumAge: 1000000, timeout: 20000});
        } else {
            //  TODO : Functionality : Do something when there's no location source method available.
        }

    };

    findLocalTrends();

    var globalTrends = [], globalTrendsIndex = 0;

    $.when(app.service.google.search.findTrends(undefined)).done(function (result) {
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
            createMenuEntry('#globalTrends', globalTrends[relativeGlobalTrendsIndex].name);
        }

        $('#globalTrends').parent().show();

        if (!alreadyLoaded) {
            findNewsForTrend(globalTrends[0], undefined, undefined);
            loadedTrendsCount = 1;
            alreadyLoaded = true;
        }
    });

    $.when(app.service.socialNetworks.twitter.findGlobalTrends()).done(function (data) {
        var index, eachTrend;

        var twitterTrends = data[0].trends;
        var relativeGlobalTrendsIndex = globalTrendsIndex;
        for (index = 0; index < twitterTrends.length; index++, globalTrendsIndex++) {
            eachTrend = twitterTrends[index];
            globalTrends[globalTrendsIndex] = {name: eachTrend.name, keywords: [eachTrend.name.replace(/#/, '')]};
        }

        for (relativeGlobalTrendsIndex; relativeGlobalTrendsIndex < globalTrends.length; relativeGlobalTrendsIndex++) {
            createMenuEntry('#globalTrends', globalTrends[relativeGlobalTrendsIndex].name);
        }

        if (!alreadyLoaded) {
            findNewsForTrend(globalTrends[0], undefined, undefined);
            loadedTrendsCount = 1;
            alreadyLoaded = true;
        }
    });

});