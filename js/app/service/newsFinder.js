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
 * Created on 10/06/13, at 14:06.
 */

var app = app || {};
app.service = app.service || {};

/**
 * Module that acts like a facade and calls every source of information.
 */
app.service.newsFinder = (function () {
    'use strict';

    /**
     * @param keywords An array of tags/keywords
     * @param callbacks object with <br><b> googleFeeds </b>The callback to execute after retrieve Google feeds.
     * <p/><b> flickr </b>The callback to execute after retrieve Flickr posts.
     * <p/><b> twitter </b>The callback to execute after retrieve tweets.
     * <p/><b> googlePlus </b>The callback to execute after retrieve Google Plus posts.
     * <p/><b> facebook </b>The callback to execute after retrieve Facebook posts.
     * <p/><b> instagram </b>The callback to execute after retrieve Instagram posts.
     * <p/><b> youTube </b>The callback to execute after retrieve YouTube videos.
     */
    var findNews = function (keywords, callbacks) {
        var index;

        if (callbacks.flickr) {
            app.service.socialNetworks.flickr.findNews(keywords, callbacks.flickr);
        }

        if (callbacks.youTube) {
            for (index = 0; index < keywords.length; index++) {
                app.service.socialNetworks.youtube.findNews(keywords[index].replace(/ /g, '+'), callbacks.youTube);
            }
        }

        if (callbacks.instagram) {
            for (index = 0; index < keywords.length; index++) {
                app.service.socialNetworks.instagram.findNews(keywords[index].replace(/ /g, '').replace(/&/g, ''), callbacks.instagram);
            }
        }

        if (callbacks.googleFeeds) {
            for (index = 0; index < keywords.length; index++) {
                google.feeds.findFeeds(keywords[index], callbacks.googleFeeds);
            }
        }

        if (callbacks.twitter) {
            for (index = 0; index < keywords.length; index++) {
                app.service.socialNetworks.twitter.findNews(keywords[index], callbacks.twitter);
            }
        }

        if (callbacks.googlePlus) {
            for (index = 0; index < keywords.length; index++) {
                app.service.socialNetworks.gplus.findNews(keywords[index], callbacks.googlePlus);
            }
        }

        if (callbacks.facebook) {
            for (index = 0; index < keywords.length; index++) {
                app.service.socialNetworks.facebook.findNews(keywords[index], callbacks.facebook);
            }
        }

        //  TODO : Add Flipboard! (they haven't got an API yet)
        //  TODO : Add Pinterest!
        //  TODO : Add Tumblr!
        //  TODO : Add Vimeo/Screenr and other video sources!
    };

    return {
        findNews: findNews
    };

}());