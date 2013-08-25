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

    /**
     * Truncate the specified {@code aString} to 140 characters and append a '...' suffix to display it to the user.
     * @param aString The String to truncate.
     * @returns The truncated (or not) String.
     * @param limit The number of allowed characters.
     */
    var truncate = function (aString, limit) {
        var result = aString || ''
            , maxLength = limit || 140
            , suffix = '...';

        if (result.length > maxLength) {
            result = result.substring(0, maxLength - suffix.length).concat(suffix);
        }

        return result;
    };

    /**
     * Remove each <code>#;?%&,.+*~\':"!^$[\]()=>|\/@</code> that appears in <code>aString</code>.
     * @param aString The string to parse.
     * @returns string with the new string without meta characters.
     */
    var removeMetaCharacters = function (aString) {
//        return aString.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
        return aString.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '');
    };

    /**
     * Remove HTTP protocol preffix from the specified URL and the specific page path returning only the main address: The domain and subdomains.
     * @param url An URL.
     * @returns string The domain and subdomains.
     */
    var getDomain = function (url) {
        var temp = url, indexOfDoubleBar = url.indexOf('//');

        if (indexOfDoubleBar > 0) {
            temp = url.substring(indexOfDoubleBar + 2);
        }

        if (temp.indexOf('www.') === 0) {
            temp = temp.substring(4);
        }

        return temp.substring(0, temp.indexOf('/'));
    };

    /**
     * Remove sequence of white spaces of 2 or more spaces and leaving only one white space.
     * @param aString to analize
     * @returns a new updated string.
     */
    var removeDoubleWhiteSpace = function (aString) {
        return aString.replace(/\s{2,}/g, ' ');
    };

    return {
        getKeywordWithoutPreffix: getKeywordWithoutPreffix,
        removeMetaCharacters: removeMetaCharacters,
        getDomain: getDomain,
        truncate: truncate,
        removeDoubleWhiteSpace: removeDoubleWhiteSpace
    };
}());