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

function parseShortnames(data) {
    var temp =[];
    for (var j=0; j < data.length; j++) {
        var exists = false;
        for (var i=0; i < temp.length; i++) {
            if (temp[i] === data[j]["rooms_shortname"]) {
                exists = true;
            }
        }
        if (!exists) {
            temp.push(data[j]["rooms_shortname"]);
        }
    }
    try {
        $.ajax("/location", {type:"POST", data: JSON.stringify(temp), contentType: "application/json", dataType: "json", success: function(data) {
            clearMarkers();
            var infowindow = new google.maps.InfoWindow();
            for (var i=0; i < data["result"].length; i++) {
                var location = {lat: data["result"][i]["lat"], lng: data["result"][i]["lon"]};
                var name = data["result"][i]["name"];
                addMarker(location, name, infowindow);
            }
        }}).fail(function (e) {
            //
        });
    } catch (err) {
        //
    }
}

function clearMarkers() {
    for (var i=0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function addMarker(location, name, infowindow) {
    var marker = new google.maps.Marker({
        position: location,
        title: name,
        map: map
    });
    makeInfoWindowEvent(map, infowindow, name, marker);
    markers.push(marker);
}

function makeInfoWindowEvent(map, infowindow, contentString, marker) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
    });
}

