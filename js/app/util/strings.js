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