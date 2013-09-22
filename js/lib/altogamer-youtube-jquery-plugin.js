/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function($) {

    $.fn.altogamerYouTube = function(options) {
        var videoContainer = this;
        var settings = $.extend({
            width: 640,
            height: 480,
            query: "Bioshock Infinite",
            maxResults: 4,
            jsrenderTemplateId: "agYouTubeVideosTemplate"
        }, options);

        findVideosFromYouTube(settings, function(videosData) {
            var template = $("#" + settings.jsrenderTemplateId);
            videoContainer.html(template.render(videosData));
            bindActions(videoContainer);
        });

        return this;
    };

    function bindActions(videoContainer) {
        videoContainer.on("click", "img.ag-youtube-thumb", function(event) {
            var thumb = $(event.currentTarget);
            var videoIndex = thumb.data("index");

            videoContainer.find("img.ag-youtube-thumb").removeClass("ag-youtube-selected");
            thumb.addClass("ag-youtube-selected");

            videoContainer.find("iframe.ag-youtube-video").removeClass("ag-youtube-selected");
            videoContainer.find("iframe.ag-youtube-video[data-index='" + videoIndex + "']").addClass("ag-youtube-selected");
        });
    }

    function findVideosFromYouTube(settings, successCallback) {
        $.ajax({
            contentType: "application/json; charset=utf-8",
            url: 'http://gdata.youtube.com/feeds/api/videos?q=' + encodeURIComponent(settings.query) + '&max-results=' + encodeURIComponent(settings.maxResults) + '&v=2&alt=jsonc',
            type: 'GET',
            success: function(response) {
                var videosData = {
                    settings: settings,
                    videos: response.data.items
                };
                successCallback(videosData);
            }
        });
    }
}(jQuery));