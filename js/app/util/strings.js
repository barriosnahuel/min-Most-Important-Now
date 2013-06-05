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
 * Created on 6/5/13, at 1:30 PM.
 */
var app = app || {};
app.util = app.util || {};

app.util.strings = (function () {
    "use strict";

    var getKeywordWithoutPreffix = function (aString) {
        var finalValue;
        if (aString.charAt(0) === '#') {
            finalValue = aString.substring(1);
        } else {
            finalValue = aString;
        }
        return finalValue;
    };

    return {
        getKeywordWithoutPreffix: getKeywordWithoutPreffix
    };
}());