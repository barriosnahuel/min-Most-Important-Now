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
 * Created on 6/5/13, at 2:35 AM.
 */
var app = app || {};
app.service = app.service || {};
app.service.socialNetworks = app.service.socialNetworks || {};

/**
 * Module for accessing Twitter services.
 */
app.service.socialNetworks.twitter = (function () {
    'use strict';


    var cb = new Codebird();
    cb.setConsumerKey('oy1KRFv0w7vnJgYV9MnzQ', 'p5DOWK5W8PfPSGEjufFR0MI2U2896aDM5mbiYFGLQ');
    cb.setToken('167430903-rPvxBdNZ83PMnT12Mbx5yr667U0G70NeHMTMkJeH', '9rwdRtYWJFlELnougEa6hla25Xxik8miURGNCkR4nw');

    /**
     * https://dev.twitter.com/docs/api/1/get/search
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {
        cb.__call('search_tweets', 'q=' + keyword + '&count=10', onSuccess);
    };

    /**
     * https://dev.twitter.com/docs/api/1/get/trends/%3Awoeid
     * @param woeid The <a href="http://developer.yahoo.com/geo/geoplanet/">Yahoo Where On Earth ID</a> of a specific location to retrieve Trending topics.
     * @param onSuccess Callback to execute after on success.
     */
    var findTrends = function (woeid, onSuccess) {
        return $.Deferred(function (dfd) {
            cb.__call('trends_place', 'id=' + woeid, onSuccess || dfd.resolve);
        });
    };

    var findClosestTrends = function (coordinates, onSuccess) {
        cb.__call('trends_closest', 'lat=' + coordinates.latitude + '&long=' + coordinates.longitude, onSuccess);
    };

    return {
        findNews: findNews, findTrends: findTrends, findGlobalTrends: findTrends.bind(null, 1), findClosestTrends: findClosestTrends
    };

}());

app.service.socialNetworks.instagram = (function () {
    'use strict';

    var CLIENT_ID = 'cb1d643d638842518c90b63c6c3ea7a0';

    var findNews = function (keyword, onSuccess) {
        //  TODO : Functionality : Replace each meta character (tested with & and it fails) for something specific (or not) for Instagram API.
        var url = 'https://api.instagram.com/v1/tags/' + keyword + '/media/recent?client_id=&client_id=' + CLIENT_ID + '&callback=?';

        $.getJSON(url, onSuccess);
    };

    var findTrends = function (onSuccess) {
        $.getJSON('https://api.instagram.com/v1/media/popular?client_id=' + CLIENT_ID + '&callback=?', onSuccess);
    };

    return {
        findTrends: findTrends, findNews: findNews
    };

}());


app.service.socialNetworks.flickr = (function () {
    'use strict';

    var findNews = function (keywords, onSuccess) {
        var url = 'http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?';

        var tags = "", index;
        for (index = 0; index < keywords.length; index++) {
            tags.concat(keywords[index]).concat(',');
        }

        $.getJSON(url, {tags: tags, tagmode: 'any', format: 'json'}, onSuccess);
    };

    return {
        findNews: findNews
    };

}());


app.service.socialNetworks.facebook = (function () {
    'use strict';

    /**
     * Check <a href="https://developers.facebook.com/docs/reference/api/search/">Facebook Search API Reference</a>
     * @param keyword The keyword to search for.
     * @param onSuccess The onSuccess callback with parameters: data, textStatus and jqXHR.
     */
    var findNews = function (keyword, onSuccess) {
        FB.api('https://graph.facebook.com/search', 'get', { type: 'post', q: keyword, fields: 'from,message,id' }, onSuccess);
    };

    var showLogin = function (modalSelector) {
        var myModal = $(modalSelector);
        myModal.modal();

        FB.Event.subscribe('auth.login', function (response) {
            if (response.status === 'connected') {
                app.properties.facebook.enabled = true;
                myModal.modal('hide');
            } else {
                console.log('Facebook response status: ' + response.status);
            }
        });
    }

    return {
        findNews: findNews,
        showLogin: showLogin
    };

}());

/**
 * Module for accessing Google+ services.
 */
app.service.socialNetworks.gplus = (function () {
    'use strict';

    /**
     * https://developers.google.com/+/api/latest/activities#resource
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {
        var apiKey = 'AIzaSyCNQ1slAxWLz8pg6MCPXJDVdeozgQBYxz8';

        var url = 'https://www.googleapis.com/plus/v1/activities?key=' + apiKey + '&query=' + keyword + '&maxResults=10&orderBy=best&language='
            + navigator.language;

        $.getJSON(url, onSuccess);
    };

    return {
        findNews: findNews
    };

}());

/**
 * Module for accessing Youtube API V3: https://developers.google.com/youtube/v3/
 */
app.service.socialNetworks.youtube = (function () {
    'use strict';

    /**
     * https://developers.google.com/+/api/latest/activities#resource
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {

        //  TODO : Join Google+ and YouTube into Google script.
        var apiKey = 'AIzaSyCNQ1slAxWLz8pg6MCPXJDVdeozgQBYxz8';

        var parameters = 'part=snippet&q=' + keyword + '&type=video&order=viewCount&maxResults=6';

        var url = 'https://www.googleapis.com/youtube/v3/search?' + parameters + '&key=' + apiKey;

        $.getJSON(url, onSuccess);
    };

    return {
        findNews: findNews
    };

}());