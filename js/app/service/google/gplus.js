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
 * Created on 6/5/13, at 3:42 AM.
 */

var app = app || {};
app.service = app.service || {};
app.service.google = app.service.google || {};

app.service.google.gplus = (function () {
    'use strict';

    /**
     * https://developers.google.com/+/api/latest/activities#resource
     * @param keyword
     * @param onSuccess
     */
    var findNews = function (keyword, onSuccess) {
        var apiKey = 'AIzaSyCNQ1slAxWLz8pg6MCPXJDVdeozgQBYxz8';

        var url = 'https://www.googleapis.com/plus/v1/activities?key=' + apiKey + '&query=' + keyword + '&maxResults=15&orderBy=best&language=' + navigator.language;

        $.getJSON(url, onSuccess);
    };

    return {
        findNews: findNews
    };

}());