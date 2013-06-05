/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 6/5/13, at 12:56 AM.
 */

$(document).ready(function () {

    app.service.twitter.findTrends(function (data) {

        $(data[0].trends).each(function (index, eachItem) {

            app.service.flickr.findNews(eachItem.name, function (data) {

                console.log('Found ' + data.items.length + ' results for ' + eachItem.name + ' in Flickr');

                $.each(data.items, function (index, item) {

                    $('<img/>').attr('src', item.media.m).appendTo('#flickr');
                    //  TODO onmouseover cargo la .description con un popover de bootstrap.
                    //  TODO Usar isotope para ubicar las imágenes de manera de aprovechar el espacio en el sitio.
                });
            });

            app.service.twitter.findNews(eachItem.query, function (data) {
                console.log('Found ' + data.results.length + ' results for ' + eachItem.query + ' in Twitter');

                var twitterList = $("#twitter");

                $.each(data.results, function (index, eachItem) {
                    $("<li />", { "text": eachItem.text }).appendTo(twitterList);
                });

                //                TODO Ver el efecto este si se está usando o no
                $("#output").fadeOut("fast", function () {
                    $(this).empty().append(twitterList).fadeIn("slow");
                });

            });

            app.service.gplus.findNews(eachItem.query, function (data) {
                console.log('Found ' + data.items.length + ' results for ' + eachItem.query + ' in Google+');

                $.each(data.items, function (index, eachItem) {
                    if (eachItem.title !== '') {
                        $("<li />", { "text": eachItem.title}).appendTo('#gplus');
                    }


                });
            });


            //  TODO check http://www.google.com/trends/ la puedo recuperar en JSON
            // con: https://developers.google.com/feed/v1/jsondevguide#loadBasic por ejemplo
            // haciendo: https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=http%3A%2F%2Fwww.google.com%2Ftrends%2Fhottrends%2Fatom%2Fhourly&callback=processResults
        });

    });

});