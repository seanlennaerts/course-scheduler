/**
 * Created by Sean on 11/29/16.
 */

var map;
var markers = [];

function initMap() {
    var ubc = {lat: 49.263, lng: -123.248};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: ubc,
        disableDefaultUI: true
    });
    // var marker = new google.maps.Marker({
    //     position: ubc,
    //     map: map
    // });
}

function parseShortnames() {
    var temp =[];
    $("#render > table > tbody > tr").each(function () {
        var exists = false;
        for (var i=0; i < temp.length; i++) {
            if (temp[i] === $(this).find(".rooms_shortname").html()) {
                exists = true;
            }

        }
        if (!exists) {
            temp.push($(this).find(".rooms_shortname").html());
        }
    });
    alert(JSON.stringify(temp));
    try {
        $.ajax("/location", {type:"POST", data: JSON.stringify(temp), contentType: "application/json", dataType: "json", success: function(data) {
            alert(JSON.stringify(data));
            for (var i=0; i < data.length; i++) {
                var location = {lat: data[i]["lat"], lng: data[i]["lon"]};
                addMarker(location);
            }
        }}).fail(function (e) {
            //
        });
    } catch (err) {
        //
    }
}

function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
}

