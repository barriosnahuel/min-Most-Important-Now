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
 * Created on 10/06/13, at 14:06.
 */

var app = app || {};
app.service = app.service || {};

app.service.newsFinder = (function () {
    'use strict';

    /**
     *
     * @param keywords An array of tags/keywords
     * @param googleFeedsCallback The callback to execute after retrieve Google feeds.
     * @param flickrCallback The callback to execute after retrieve Flickr posts.
     * @param twitterCallback The callback to execute after retrieve tweets.
     * @param googlePlusCallback The callback to execute after retrieve Google Plus posts.
     * @param facebookCallback The callback to execute after retrieve Facebook posts.
     * @param instagramCallback The callback to execute after retrieve Instagram posts.
     */
    var findNews = function (keywords, googleFeedsCallback, flickrCallback, twitterCallback, googlePlusCallback, facebookCallback, instagramCallback) {
        var index;

        app.service.flickr.findNews(keywords, flickrCallback);
        app.service.instagram.findNews(keywords, instagramCallback);

        for (index = 0; index < keywords.length; index++) {
            google.feeds.findFeeds(keywords[index], googleFeedsCallback);
        }

        for (index = 0; index < keywords.length; index++) {
            app.service.twitter.findNews(keywords[index], twitterCallback);
        }

        for (index = 0; index < keywords.length; index++) {
            app.service.google.gplus.findNews(keywords[index], googlePlusCallback);
        }

        for (index = 0; index < keywords.length; index++) {
            app.service.facebook.findNews(keywords[index], facebookCallback);
        }

        //  TODO : Add Instagram!
        //  TODO : Add Flipboard! (they haven't got an API yet)
        //  TODO : Add Pinterest!
        //  TODO : Add Youtube! (and other video sources)
    };

    return {
        findNews: findNews
    };

}());