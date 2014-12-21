function oznaciNaMapi(zdravnik, adresa){

    if(adresa !== "prvic"){
        mapa(zdravnik);
    }else{
        x = navigator.geolocation;
        x.getCurrentPosition(success, failure);
    }

    function success(position) {

        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        var coords = new google.maps.LatLng(lat, long);

        var mapOptions = {
            zoom: 13,
            center: coords,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Map(document.getElementById("map"), mapOptions);

        oms = new OverlappingMarkerSpiderfier(map);

        var marker = new google.maps.Marker({
            map: map,
            position: coords,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });
    }

    function mapa() {
        geo(adresa);
        function geo(address) {
            //for (var i = 0; i < address.length; i++) {
            //	curAddress = address[i];
            var curAddress = address;
            var geocoder = new google.maps.Geocoder();
            if (geocoder) {
                geocoder.geocode({'address': curAddress}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        vstaviMarker(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    } else {
                        alert("Geocode was not successful for the following reason: " + status);
                    }
                });
            }
            //}
        }

        function vstaviMarker(lati, longi) {
            //console.log(map);

            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(lati, longi),
                animation: google.maps.Animation.DROP
            });
            markersArray.push(marker);
            oms.addMarker(marker);
            var iw = new google.maps.InfoWindow({
                content: '<div style="width: 150px;">'+zdravnik+'</div>'
            });
            google.maps.event.addListener(marker, 'click', function () {
                iw.open(map, marker);
            });
            oms.addListener('spiderfy', function (markers) {
                iw.close();
            });
            oms.addListener('unspiderfy', function (markers) {
                iw.close();
            });
        }
    }

    function failure(){
        $('#map').html("<p>Ni bilo mogoče najti vašo pozicijo! Omogocite da brskalnik sledi vašo pozicijo!</p>");
    }

}

function clearOverlays() {
    for (var i = 0; i < markersArray.length; i++ ) {
        markersArray[i].setMap(null);
    }
    markersArray.length = 0;
}
