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
 * Created on 6/5/13, at 5:12 PM.
 */

var app = app || {};
app.service = app.service || {};

app.service.facebook = (function () {
    'use strict';

    /**
     * Check <a href="https://developers.facebook.com/docs/reference/api/search/">Facebook Search API Reference</a>
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {
        var url = 'https://graph.facebook.com/search?type=post&q=' + keyword;

        $.getJSON(url, onSuccess);
    };

    return {
        findNews: findNews
    };

}());