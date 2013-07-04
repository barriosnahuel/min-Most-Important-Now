/*
 * Spoken Today - The things that are spoken today, from all points of view, and in one place.
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

var app = app || {};
app.ui = app.ui || {};
app.ui.index = (function () {
    "use strict";

    var localTrends = []
        , globalTrends = []
        , globalTrendsIndex = 0
        , alreadyLoaded
        , loadedTrendsCount;

    /**
     * Module that represents and manage the navigation menu
     */
    var menu = (function () {

        /**
         * Module that represents and manage the form that user will use to find custom topics.
         */
        var form = (function () {
            var $form = $('form'), $input = $form.find('input');

            /**
             * Find news from all configured sources for a specific topic that has been choosed for the user in the search box of the left side menu.
             */
            var findNewsForCustomTopic = function () {
                var userQuery = $input.val()
                    , containerQuerySelector = '#queries'
                    , templateData = menu.createEntry(containerQuerySelector, userQuery, true)
                    , sectionId = createNewSection(templateData, true)
                    , sectionIdSelector = '#' + sectionId;

                showSection(sectionId);

                findNewsForQuery([userQuery], $(sectionIdSelector + ' ul'), scrollTo.bind(null, sectionIdSelector), undefined);
                scrollTo(sectionIdSelector);
            };

            var onSubmit = function (event) {
                event.preventDefault();

                //  TODO : Functionality : Check what to do if the custom query contains only meta characters.

                findNewsForCustomTopic();

                $input.val('');
            };

            var init = function () {
                $form.submit(onSubmit);
            };

            return {
                init: init
            };
        }());


        var createEntry = function (containerSelector, topicName, closeable) {

            var trendNameElementId = app.util.strings.removeMetaCharacters(topicName.replace(/ /g, ''))
                , templateData = {trendNameElementId: trendNameElementId, topicName: topicName, closeable: closeable}
                , menuItemHTML = $('#menuItemTemplate').render(templateData)
                , menu = $(containerSelector)
                , trendNameElementSelector
                , entry;

            menu.append(menuItemHTML);

            if (closeable) {
                entry = menu.find('li>a[href=#' + templateData.trendNameElementId + ']').parent();
                entry.find('>i').on('click', function (event) {
                    entry.remove();
                    $('section[id=' + templateData.trendNameElementId + ']').remove();
                });
            }

            trendNameElementSelector = '#' + trendNameElementId;

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

                    loadNews(event.data.containerSelector, index >= 0 ? index : -1, scrollTo.bind(null, trendNameElementSelector), function () {
                        showSection(trendNameElementId);
                    });
                } else {
                    showSection(trendNameElementId);
                    scrollTo(trendNameElementSelector);
                }
            }

            return templateData;
        };

        var init = function () {

            var findLocalTrends = function () {

                var onSuccessTwitterLocalTrends = function (data) {
                    var index, eachTrend, twitterTrends;

                    twitterTrends = data[0].trends;
                    for (index = 0; index < twitterTrends.length; index++) {
                        eachTrend = twitterTrends[index];
                        localTrends[index] = {name: eachTrend.name, keywords: [eachTrend.name.replace(/#/, '')]};
                    }

                    for (index = 0; index < localTrends.length; index++) {
                        createEntry('#localTrends', localTrends[index].name, false);
                    }
                    $('#localTrends').parent().show();

                    if (!alreadyLoaded) {
                        findNewsForTrend(localTrends[0], undefined, undefined);
                        loadedTrendsCount = 1;
                        alreadyLoaded = true;
                    }
                };

                //  End method definitions

                if (geo_position_js.init()) {
                    geo_position_js.getCurrentPosition(function (position) {

                        app.service.socialNetworks.twitter.findClosestTrends(position.coords, function (locations) {
                            if (locations.length > 0) {
                                $.when(app.service.socialNetworks.twitter.findTrends(locations[0].woeid)).done(onSuccessTwitterLocalTrends);
                            }
                        });

                    }, function (positionError) {
                        //  TODO : Functionality : Do something when locations sources returns a positionError
                    }, {maximumAge: 1000000, timeout: 20000});
                } else {
                    //  TODO : Functionality : Do something when there's no location source method available.
                }

                form.init();
            };

            var onSuccessGoogleGlobalSearch = function (result) {
                var index
                    , eachTrend
                    , keywords
                    , relativeGlobalTrendsIndex = globalTrendsIndex
                    , googleTrends = result.feed.entries;

                for (index = 0; index < googleTrends.length; index++, globalTrendsIndex++) {
                    eachTrend = googleTrends[index];

                    keywords = [];
                    if (eachTrend.content !== '') {
                        keywords = eachTrend.content.split(', ');
                    } else {
                        keywords[0] = eachTrend.title;
                    }

                    globalTrends[globalTrendsIndex] = {name: eachTrend.title, keywords: keywords, loaded: false};
                }

                for (relativeGlobalTrendsIndex; relativeGlobalTrendsIndex < globalTrends.length; relativeGlobalTrendsIndex++) {
                    createEntry('#globalTrends', globalTrends[relativeGlobalTrendsIndex].name, false);
                }

                $('#globalTrends').parent().show();

                if (!alreadyLoaded) {
                    findNewsForTrend(globalTrends[0], undefined, undefined);
                    loadedTrendsCount = 1;
                    alreadyLoaded = true;
                }
            };

            var onSuccessTwitterGlobalSearch = function (data) {
                var index
                    , eachTrend
                    , twitterTrends = data[0].trends
                    , relativeGlobalTrendsIndex = globalTrendsIndex;

                for (index = 0; index < twitterTrends.length; index++, globalTrendsIndex++) {
                    eachTrend = twitterTrends[index];
                    globalTrends[globalTrendsIndex] = {name: eachTrend.name, keywords: [eachTrend.name.replace(/#/, '')]};
                }

                for (relativeGlobalTrendsIndex; relativeGlobalTrendsIndex < globalTrends.length; relativeGlobalTrendsIndex++) {
                    createEntry('#globalTrends', globalTrends[relativeGlobalTrendsIndex].name, false);
                }

                if (!alreadyLoaded) {
                    findNewsForTrend(globalTrends[0], undefined, undefined);
                    loadedTrendsCount = 1;
                    alreadyLoaded = true;
                }
            };

            //  End method definitions

            findLocalTrends();
            $.when(app.service.google.search.findTrends(undefined)).done(onSuccessGoogleGlobalSearch);
            $.when(app.service.socialNetworks.twitter.findGlobalTrends()).done(onSuccessTwitterGlobalSearch);
        };

        return {
            init: init,
            createEntry: createEntry
        };
    }());

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
            var index, eachTweet, templateData;

            if (data.httpstatus === 200) {
                for (index = 0; index < data.statuses.length; index++) {
                    eachTweet = data.statuses[index];

                    templateData = {userName: eachTweet.user.screen_name, text: eachTweet.text, id: eachTweet.id_str};
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
            var templateData = {},
                index,
                eachItem,
                imagesContainer,
                li,
                liSelector = 'li[class=flickr]';

            templateData.photos = [];

            for (index = 0; index < data.items.length; index++) {
                eachItem = data.items[index];
                templateData.photos[index] = {photo: eachItem.media.m, link: eachItem.link};
            }

            li = container.find(liSelector);

            if (li.length === 0) {
                li = container.append('<li class="flickr"></li>').find(liSelector);
            }

            li.append($('#flickrAndInstagramNewsTemplate').render(templateData));

            imagesContainer = li.find('div');
            imagesContainer.imagesLoaded(function () {
                imagesContainer.isotope({itemSelector: '.isotopeTest', animationEngine: 'best-available'});
            });

            callCallbacks();
        };

        var instagramCallback = function (data) {
            var templateData = {},
                index,
                eachItem,
                imagesContainer,
                li,
                liSelector = 'li[class=flickr]';

            templateData.photos = [];

            if (data.meta.code === 200) {
                for (index = 0; index < data.data.length; index++) {
                    eachItem = data.data[index];

                    templateData.photos[index] = {photo: eachItem.images.thumbnail.url, link: eachItem.link};
                }

                li = container.find(liSelector);

                if (li.length === 0) {
                    li = container.append('<li class="flickr"></li>').find(liSelector);
                }

                li.append($('#flickrAndInstagramNewsTemplate').render(templateData));

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

        var youtubeCallback = function (data) {
            var templateData = {}
                , li
                , liSelector = 'li[class=youtube]'
                , index;

            //  TODO : Refactor encapsulate functionality to render YouTube, Instagram and Flickr results.

            templateData.videos = [];
            for (index = 0; index < data.items.length; index++) {
                templateData.videos[index] = {id: data.items[index].id.videoId};
            }

            li = container.find(liSelector);
            if (li.length === 0) {
                li = container.append('<li class="youtube"></li>').find(liSelector);
            }

            li.append($('#youTubeNewsTemplate').render(templateData));

            callCallbacks();
        };

        app.service.newsFinder.findNews(keywords, googleFeedsCallback, flickrCallback, twitterCallback, googlePlusCallback, facebookCallback, instagramCallback, youtubeCallback);
    };

    /**
     * TODO : Javadoc for findNewsForTrend
     * @param trend
     * @param onlyOnce A callback to execute only once after a successfull news look up.
     * @param onSuccess
     */
    var findNewsForTrend = function (trend, onlyOnce, onSuccess) {
        var trendName = app.util.strings.getKeywordWithoutPreffix(trend.name)
            , trendNameElementId = app.util.strings.removeMetaCharacters(trendName.replace(/ /g, ''))
            , templateData = {trendNameElementId: trendNameElementId, topicName: trendName}
            , eachSectionList = $('#' + createNewSection(templateData) + ' ul');

        findNewsForQuery(trend.keywords, eachSectionList, onlyOnce, onSuccess);
        trend.loaded = true;
    };

    /**
     * TODO : Javadoc for loadNews
     * @param containerSelector
     * @param indexTrendToLoad
     * @param onlyOnce A callback to execute only once after a successfull news look up.
     * @param onSuccess
     */
    var loadNews = function (containerSelector, indexTrendToLoad, onlyOnce, onSuccess) {
        //  TODO : Refactor :  method loadNews. Improve parameters!!
        var trends = localTrends;

        if (containerSelector === '#globalTrends') {
            trends = globalTrends;
        }

        if (indexTrendToLoad >= 0) {
            findNewsForTrend(trends[indexTrendToLoad], onlyOnce, onSuccess);

            loadedTrendsCount = loadedTrendsCount + 1;
        }
    };

    var createNewSection = function (templateData, atBegin) {
        var content = $('.content')
            , sectionHTML = $('#newsSectionTemplate').render(templateData);

        if (atBegin) {
            content.prepend(sectionHTML);
        } else {
            content.append(sectionHTML);
        }

        return templateData.trendNameElementId;
    };

    /**
     * Scroll to the specified {@code jQuerySelector}.
     * @param jQuerySelector A jQuery selector to scroll the entire page.
     */
    var scrollTo = function (jQuerySelector) {
        $('html, body').stop().animate({
            scrollTop: $(jQuerySelector).offset().top - 100
        }, 500);
    };

    var showSection = function (sectionId) {
        $('.content>section[id=' + sectionId + ']').show();
        $('.content>section:not([ID=' + sectionId + '])').hide();
    };

    /**
     * Load trends, then news for those trending topics
     */
    var init = function () {

        menu.init();

//          TODO : Put instagram initialization into container module.
        app.service.socialNetworks.instagram.findTrends(function (data) {
            var instagramDiv = $('#instagramPopularPhotos')
                , index
                , templateData;


            if (data.data.length > 0) {
                instagramDiv.show();
            }

            for (index = 0; index < data.data.length; index++) {
                templateData = {link: data.data[index].link, thumbnail: data.data[index].images.thumbnail.url};
                instagramDiv.append($('#instagramNewsTemplate').render(templateData));
            }

            //  TODO : Retrieve tags from theese photos, add them to trends and search for photos with those tags!
        });
    };

    return {
        init: init
    };

}());


$(document).ready(function () {
    'use strict';

    app.ui.index.init();

});