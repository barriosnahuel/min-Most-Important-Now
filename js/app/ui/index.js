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

//  Set application global properties
app.properties = app.properties || {};
app.properties.facebook = app.properties.facebook || {};
app.properties.facebook.enabled = true;

app.ui = app.ui || {};

app.ui.index = (function () {
    "use strict";

    var localTrends = []
        , globalTrends = []
        , globalTrendsIndex = 0
        , loadedTrendsCount;

    var showSection = function (sectionId) {
        $('.nav a[href="#' + sectionId + '"]').tab('show');
    };

    var createNewSection = function (templateData) {
        var content = $('.tab-content')
            , sectionHTML = $('#newsSectionTemplate').render(templateData);

        content.append(sectionHTML);

        return templateData.topicId;
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


    /**
     * TODO : Javadoc for findNewsForTrend
     * @param trend
     * @param onlyOnce A callback to execute only once after a successfull news look up.
     * @param onSuccess
     */
    var findNewsForTrend = function (trend, onlyOnce, onSuccess) {
        var trendName = app.util.strings.getKeywordWithoutPreffix(trend.name)
            , topicId = app.util.strings.removeMetaCharacters(trendName.replace(/ /g, ''))
            , templateData = {topicId: topicId, topicName: trendName}
            , eachSectionList = $('#' + createNewSection(templateData));

        findNewsForQuery(trend.keywords, eachSectionList, onlyOnce, onSuccess);
        trend.loaded = true;
    };

    /**
     * Finds news from all configured sources (social networks and so on) for the list of specified keywords and load all results to the specified container.
     *
     * @param keywords An array of keywords related with a specific topic.
     * @param container The main container for a specific topic.
     * @param onlyOnce A callback to execute only once after a successfull news look up.
     * @param onSuccess An optional callback function to execute after successfully executed each social network specific callback.
     */
    var findNewsForQuery = function (keywords, container, onlyOnce, onSuccess) {

        var list = container.find('ul'), executed = false;

        function callCallbacks() {
            if (onSuccess) {
                onSuccess();
            }

            if (onlyOnce && !executed) {
                onlyOnce();
                executed = true;
            }
        }

        /**
         * Callback to execute after getting news from Google Feeds.
         * @param result The result in the specified <a href="https://developers.google.com/feed/v1/reference#resultJson">JSON result format of the Google Feed API</a>.
         */
        var googleFeedsCallback = function (result) {
            var index, eachEntry, templateData;

            if (!result.error) {
                for (index = 0; index < result.entries.length; index++) {
                    eachEntry = result.entries[index];

                    templateData = {
                        title: eachEntry.title,
                        contentSnippet: eachEntry.contentSnippet.replace(/<(?:.|\n)*?>/gm, ''),
                        link: eachEntry.link,
                        source: app.util.strings.getDomain(eachEntry.link)
                    };
                    list.append($('#rssFeedTemplate').render(templateData));
                }

                renderPlusone();

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

                    templateData = {userName: eachTweet.user.screen_name, id: eachTweet.id_str};
                    list.append($('#twitterNewsTemplate').render(templateData));
                }

                callCallbacks();
            }
        };

        var facebookCallback = function (data) {
            if (data.data) {
                $.each(data.data, function (index, eachItem) {
                    var templateData = {userId: eachItem.from.id, userName: eachItem.from.name, text: app.util.strings.truncate(eachItem.message), id: eachItem.id};
                    list.append($('#facebookNewsTemplate').render(templateData));
                });

                renderPlusone();

                callCallbacks();
            } else {
                console.log('Failed to load Facebook results: ' + data.error.message);
            }
        };

        var googlePlusCallback = function (data) {
            $.each(data.items, function (index, eachItem) {
                if (eachItem.title !== '') {
                    //  TODO : Functionality : Truncate this at 300 or something like this to use the entire space generated by the GPlus badge.
                    var text = app.util.strings.removeDoubleWhiteSpace(app.util.strings.truncate(eachItem.title, 85));
                    var templateData = {userUrl: eachItem.actor.url, userName: eachItem.actor.displayName, text: text, link: eachItem.object.url};
                    list.append($('#googlePlusNewsTemplate').render(templateData));
                }
            });

            renderPlusone();

            callCallbacks();
        };

        var flickrCallback = function (data) {
            var templateData = {}
                , index, eachItem
                , imagesContainer
                , columnSelector = '#rightColumn';

            templateData.photos = [];

            for (index = 0; index < data.items.length; index++) {
                eachItem = data.items[index];
                templateData.photos[index] = {photo: eachItem.media.m, link: eachItem.link, socialNetworkName: 'Flickr'};
            }

            imagesContainer = container.find(columnSelector).append($('#flickrAndInstagramNewsTemplate').render(templateData)).find('div');
            imagesContainer.imagesLoaded(function () {
                imagesContainer.isotope({itemSelector: '.isotopeTest', animationEngine: 'best-available'});
            });

            callCallbacks();
        };

        var instagramCallback = function (data) {
            var templateData = {}
                , index
                , eachItem
                , imagesContainer
                , columnSelector = '#leftColumn';

            templateData.photos = [];

            if (data.meta.code === 200) {
                for (index = 0; index < data.data.length; index++) {
                    eachItem = data.data[index];

                    templateData.photos[index] = {photo: eachItem.images.thumbnail.url, link: eachItem.link, socialNetworkName: 'Instagram'};
                }

                imagesContainer = container.find(columnSelector).append($('#flickrAndInstagramNewsTemplate').render(templateData)).find('div');
                imagesContainer.imagesLoaded(function () {
                    imagesContainer.isotope({itemSelector: '.isotopeTest', animationEngine: 'best-available'});
                });

                callCallbacks();
            } else {
                console.log('Ocurrió un error al recuperar las noticias de Instagram: ' + data.meta.code);
                //  TODO : Send this error to Google Analytics
            }
        };

        var youTubeCallback = function (data) {
            var templateData = {}
                , li
                , liSelector = 'li[class=youtube]'
                , index;

            //  TODO : Refactor encapsulate functionality to render YouTube, Instagram and Flickr results.

            templateData.videos = [];
            for (index = 0; index < data.items.length; index++) {
                templateData.videos[index] = {id: data.items[index].id.videoId};
            }

            li = list.find(liSelector);
            if (li.length === 0) {
                li = list.append('<li class="youtube"></li>').find(liSelector);
            }

            li.append($('#youTubeNewsTemplate').render(templateData));

            callCallbacks();
        };

        app.service.newsFinder.findNews(keywords, {
            googleFeeds: googleFeedsCallback,
            twitter: twitterCallback,
            googlePlus: googlePlusCallback,
            facebook: facebookCallback,
            youTube: youTubeCallback,
            flickr: flickrCallback,
            instagram: instagramCallback
        });
    };

    /**
     * Module that represents and manage the navigation menu
     */
    var menu = (function () {

        var createEntry = function (containerSelector, topicName, closeable) {

            var topicId = app.util.strings.removeMetaCharacters(topicName.replace(/ /g, ''))
                , templateData = {topicId: topicId, topicName: topicName, closeable: closeable}
                , menuItemHTML = $('#menuItemTemplate').render(templateData)
                , menu = $(containerSelector)
                , topicNameElementSelector = '#' + topicId
                , entry;

            menu.append(menuItemHTML);

            if (closeable) {
                entry = menu.find('li>a[href=#' + templateData.topicId + ']').parent();
                entry.find('>span').on('click', function (event) {
                    entry.remove();
                    $('section[id=' + templateData.topicId + ']').remove();
                    showSection('top');
                });
            }

            $(containerSelector + ' a[href=' + topicNameElementSelector + ']').on('click', {containerSelector: containerSelector},
                                                                                  onMenuItemSelected);

            function onMenuItemSelected(event) {
                event.preventDefault();

                //  If section doesn't exists, then create it.
                if ($(topicNameElementSelector).length === 0) {

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

                    loadNews(event.data.containerSelector, index >= 0 ? index : -1, undefined, showSection.bind(null, topicId));
                } else {
                    showSection(topicId);
                }
            }

            return templateData;
        };

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
                    , containerQuerySelector = '.nav'
                    , templateData = menu.createEntry(containerQuerySelector, userQuery, true)
                    , sectionId = createNewSection(templateData)
                    , sectionIdSelector = '#' + sectionId;

                showSection(sectionId);

                findNewsForQuery([userQuery], $(sectionIdSelector), undefined, undefined);
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

        var init = function () {

            var findLocalTrends = function () {

                var onSuccessTwitterLocalTrends = function (countryName, data) {
                    var index
                        , eachTrend
                        , twitterTrends
                        , $localTrendsLIParent
                        , $dropdownLabel;

                    twitterTrends = data[0].trends;
                    for (index = 0; index < twitterTrends.length; index++) {
                        eachTrend = twitterTrends[index];
                        localTrends[index] = {name: eachTrend.name, keywords: [eachTrend.name.replace(/#/, '')]};
                    }

                    for (index = 0; index < localTrends.length; index++) {
                        createEntry('#localTrends', localTrends[index].name, false);
                    }

                    $localTrendsLIParent = $('#localTrends').parent();
                    $dropdownLabel = $localTrendsLIParent.find('>a');
                    $dropdownLabel.html(countryName + $dropdownLabel.html());

                    $localTrendsLIParent.show();
                };

                //  End method definitions

                if (geo_position_js.init()) {
                    geo_position_js.getCurrentPosition(function (position) {

                        app.service.socialNetworks.twitter.findClosestTrends(position.coords, function (locations) {
                            if (locations.length > 0) {
                                var currentLocation = locations[0];

                                $.when(app.service.socialNetworks.twitter.findTrends(currentLocation.woeid,
                                                                                     undefined)).done(onSuccessTwitterLocalTrends.bind(null,
                                                                                                                                       currentLocation.country));
                            }
                        });

                    }, function (positionError) {
                        //  TODO : Functionality : Do something when locations sources returns a positionError
                    }, {maximumAge: 1000000, timeout: 20000});
                }
                //  TODO : Functionality : Do something when there's no location source method available.
            };

            var onSuccessGoogleGlobalSearch = function (result) {
                var index, eachTrend, keywords, relativeGlobalTrendsIndex = globalTrendsIndex, googleTrends = result.feed.entries;

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
            };

            var onSuccessTwitterGlobalSearch = function (data) {
                var index, eachTrend, twitterTrends = data[0].trends, relativeGlobalTrendsIndex = globalTrendsIndex;

                for (index = 0; index < twitterTrends.length; index++, globalTrendsIndex++) {
                    eachTrend = twitterTrends[index];
                    globalTrends[globalTrendsIndex] = {name: eachTrend.name, keywords: [eachTrend.name.replace(/#/, '')]};
                }

                for (relativeGlobalTrendsIndex; relativeGlobalTrendsIndex < globalTrends.length; relativeGlobalTrendsIndex++) {
                    createEntry('#globalTrends', globalTrends[relativeGlobalTrendsIndex].name, false);
                }
            };

            //  End method definitions

            form.init();

            findLocalTrends();
            $.when(app.service.socialNetworks.twitter.findGlobalTrends()).done(onSuccessTwitterGlobalSearch);
            $.when(app.service.google.search.findTrends(undefined)).done(onSuccessGoogleGlobalSearch);
        };

        return {
            init: init,
            createEntry: createEntry
        };
    }());

    var home = (function () {
        var init = function () {
            app.service.socialNetworks.instagram.findTrends(function (data) {
                var instagramDiv = $('#instagramPopularPhotos'), index, templateData;

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

        var show = function () {
            showSection('top');
        };

        return {
            init: init,
            show: show
        };
    }());

    var init = function () {
        var myModal = $('#myModal');
        myModal.modal();

        FB.Event.subscribe('auth.login', function (response) {
            if (response.status === 'connected') {
                app.properties.facebook.enabled = true;
                myModal.modal('hide');
            } else {
                console.log('Facebook response status: ' + response.status);
            }
        });

        menu.init();
        home.init();
        home.show();
    };

    return {
        init: init
    };
}());

$(document).ready(function () {
    'use strict';

    app.ui.index.init();

});