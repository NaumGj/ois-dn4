
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var markersArray = [];

function getSessionId() {
	var response = $.ajax({
		type: "POST",
		url: baseUrl + "/session?username=" + encodeURIComponent(username) +
		"&password=" + encodeURIComponent(password),
		async: false
	});
	return response.responseJSON.sessionId;
}


function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
			headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
			url: baseUrl + "/ehr",
			type: 'POST',
			success: function (data) {
				var ehrId = data.ehrId;
				var partyData = {
					firstNames: ime,
					lastNames: priimek,
					dateOfBirth: datumRojstva,
					partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
				};
				$.ajax({
					url: baseUrl + "/demographics/party",
					type: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(partyData),
					success: function (party) {
						if (party.action == 'CREATE') {
							$("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
							console.log("Uspešno kreiran EHR '" + ehrId + "'.");
							$("#preberiEHRid").val(ehrId);
						}
					},
					error: function(err) {
						$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
						console.log(JSON.parse(err.responseText).userMessage);
					}
				});
			}
		});
	}
}


function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
			success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label label-success fade-in'>Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.</span>");
				console.log("Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}
}


function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
	var merilec = $("#dodajVitalnoMerilec").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
			headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
			"ctx/language": "en",
			"ctx/territory": "SI",
			"ctx/time": datumInUra,
			"vital_signs/height_length/any_event/body_height_length": telesnaVisina,
			"vital_signs/body_weight/any_event/body_weight": telesnaTeza,
			"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
			"vital_signs/body_temperature/any_event/temperature|unit": "°C",
			"vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
			"vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
			"vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
			"ehrId": ehrId,
			templateId: 'Vital Signs',
			format: 'FLAT',
			committer: merilec
		};
		$.ajax({
			url: baseUrl + "/composition?" + $.param(parametriZahteve),
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(podatki),
			success: function (res) {
				console.log(res.meta.href);
				$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
			},
			error: function(err) {
				$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}
}


function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#preberiTipZaVitalneZnake").val();

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
			success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				if (tip == "telesna temperatura") {
					$.ajax({
						url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
						type: 'GET',
						headers: {"Ehr-Session": sessionId},
						success: function (res) {
							if (res.length > 0) {
								var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna temperatura</th></tr>";
								for (var i in res) {
									results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].temperature + " " + res[i].unit + "</td>";
								}
								results += "</table>";
								$("#rezultatMeritveVitalnihZnakov").append(results);
							} else {
								$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
							}
						},
						error: function () {
							$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
						}
					});
				} else if (tip == "telesna teža") {
					$.ajax({
						url: baseUrl + "/view/" + ehrId + "/" + "weight",
						type: 'GET',
						headers: {"Ehr-Session": sessionId},
						success: function (res) {
							if (res.length > 0) {
								var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
								for (var i in res) {
									results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " + res[i].unit + "</td>";
								}
								results += "</table>";
								$("#rezultatMeritveVitalnihZnakov").append(results);
							} else {
								$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
							}
						},
						error: function () {
							$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
						}
					});
				} else if (tip == "telesna temperatura AQL") {
					var AQL =
						"select " +
						"t/data[at0002]/events[at0003]/time/value as cas, " +
						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_vrednost, " +
						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as temperatura_enota " +
						"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
						"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
						"where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude<35 " +
						"order by t/data[at0002]/events[at0003]/time/value desc " +
						"limit 10";
					$.ajax({
						url: baseUrl + "/query?" + $.param({"aql": AQL}),
						type: 'GET',
						headers: {"Ehr-Session": sessionId},
						success: function (res) {
							var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna temperatura</th></tr>";
							if (res) {
								var rows = res.resultSet;
								for (var i in rows) {
									results += "<tr><td>" + rows[i].cas + "</td><td class='text-right'>" + rows[i].temperatura_vrednost + " " + rows[i].temperatura_enota + "</td>";
								}
								results += "</table>";
								$("#rezultatMeritveVitalnihZnakov").append(results);
							} else {
								$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
							}

						},
						error: function () {
							$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
						}
					});
				}
			},
			error: function (err) {
				$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}
}

function najdiZdravnike(obmocje){
	var rawFile = new XMLHttpRequest();
	var zdravniki;
	rawFile.open("GET", "zdravniki.txt", false);
	rawFile.onreadystatechange = function () {
		if(rawFile.readyState === 4) {
			if(rawFile.status === 200 || rawFile.status == 0) {
				zdravniki = rawFile.responseText.split("\n");
			}
		}
	}
	rawFile.send(null);

	var ustrezniZdravniki = [];
	var stevec = 0;
	for(var i=0; i<zdravniki.length; i++) {
		if (zdravniki[i].split(",")[1].toLowerCase().indexOf(obmocje) !== (-1)) {
			ustrezniZdravniki[stevec]=zdravniki[i];
			stevec++;
		}
	}
	return ustrezniZdravniki;

}

function najdiNaStrani(zdravniki, strana){
	var obmocje = strana*5;
	if(zdravniki.length<=obmocje){
		return null;
	}else{
		meja=obmocje+5;
		var zdravnikiNaStrani = [];
		for(var i=obmocje, j=0; i<meja; i++, j++){
			if(zdravniki[i] != undefined) {
				zdravnikiNaStrani[j] = zdravniki[i];
			}
		}
		return zdravnikiNaStrani;
	}
}

function najdiPreviousPage(){
	var obmocje = $("#obmocje").val();
	var strana = $("#strana").val();
	if(strana>0) {
		strana--;
		$("#strana").val(strana);
		$("#next").attr('class', 'enabled');
	}
	if(strana>0){
		$("#previous").attr('class', 'enabled');
	}else{
		$("#previous").attr('class', 'disabled');
	}
	var zdravniki = najdiZdravnike(obmocje);
	//console.log(zdravniki.length);
	var zdravnikiNaStrani = najdiNaStrani(zdravniki, strana);
	//for(var i=0; i<zdravnikiNaStrani.length; i++) {
	//	console.log(zdravnikiNaStrani[i]);
	//}
	vstaviZdravnikeNaStrani(zdravnikiNaStrani);
	var strana = $("#strana").val();
	console.log(strana);
}

function najdiNextPage(){
	var obmocje = $("#obmocje").val();
	var strana = $("#strana").val();
	strana++;
	var zdravniki = najdiZdravnike(obmocje);
	if(zdravniki.length<(strana*5+6)){
		$("#next").attr('class', 'disabled');
	}else{
		$("#next").attr('class', 'enabled');
	}
	var zdravnikiNaStrani = najdiNaStrani(zdravniki, strana);
	if(zdravnikiNaStrani != null){
		$("#strana").val(strana);
		vstaviZdravnikeNaStrani(zdravnikiNaStrani);
	}
	$("#previous").attr('class', 'enabled');
	//console.log(zdravniki.length);

	//for(var i=0; i<zdravnikiNaStrani.length; i++) {
	//	console.log(zdravnikiNaStrani[i]);
	//}
	var strana = $("#strana").val();
	console.log(strana);
}

function vstaviZdravnikeNaStrani(zdravnikiNaStrani){
	$("#zdravnik1").text("");
	$("#zdravnik2").text("");
	$("#zdravnik3").text("");
	$("#zdravnik4").text("");
	$("#zdravnik5").text("");
	if(zdravnikiNaStrani.length >= 1) {
		$("#zdravnik1").text(zdravnikiNaStrani[0].split(",")[0]);
		$("#adresa1").text(zdravnikiNaStrani[0].split(",")[2]);
	}
	if(zdravnikiNaStrani.length >= 2) {
		$("#zdravnik2").text(zdravnikiNaStrani[1].split(",")[0]);
		$("#adresa2").text(zdravnikiNaStrani[1].split(",")[2]);
	}
	if(zdravnikiNaStrani.length >= 3) {
		$("#zdravnik3").text(zdravnikiNaStrani[2].split(",")[0]);
		$("#adresa3").text(zdravnikiNaStrani[2].split(",")[2]);
	}
	if(zdravnikiNaStrani.length >= 4) {
		$("#zdravnik4").text(zdravnikiNaStrani[3].split(",")[0]);
		$("#adresa4").text(zdravnikiNaStrani[3].split(",")[2]);
	}
	if(zdravnikiNaStrani.length == 5) {
		$("#zdravnik5").text(zdravnikiNaStrani[4].split(",")[0]);
		$("#adresa5").text(zdravnikiNaStrani[4].split(",")[2]);
	}
}

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

	//var rawFile = new XMLHttpRequest();
	//var zdravniki;
	//rawFile.open("GET", "zdravniki.txt", false);
	//rawFile.onreadystatechange = function () {
	//	if(rawFile.readyState === 4) {
	//		if(rawFile.status === 200 || rawFile.status == 0) {
	//			zdravniki = rawFile.responseText.split("\n");
	//		}
	//	}
	//}
	//rawFile.send(null);
	////console.log(zdravniki[0]);

	//var address = [];
	//for(var i=0; i<30; i++) {
	//	address[i] = zdravniki[i].split(",")[2];
	//	//console.log(address);
	//}

}
function clearOverlays() {
	for (var i = 0; i < markersArray.length; i++ ) {
		markersArray[i].setMap(null);
	}
	markersArray.length = 0;
}

function obravnavajVisinoInTezo(visina, teza){
	if(visina && teza) {
		visina = visina/100;
		var indeksTelesneMase = teza / (visina * visina);
		//console.log(indeksTelesneMase);
		if (indeksTelesneMase>=18.5 && indeksTelesneMase<=25){
			$("#form-visina").attr("class", "has-success");
			$("#form-teza").attr("class", "has-success");
			$("#itm").hide();
		}else if (indeksTelesneMase<=16){
			$("#form-visina").attr("class", "has-warning");
			$("#form-teza").attr("class", "has-warning");
			$("#itm").text("Huda nedohranjenost");
			$("#itm").attr("class", "label label-danger warningspan");
			$("#itm").show();
		}else if(indeksTelesneMase>16 && indeksTelesneMase<=17){
			$("#form-visina").attr("class", "has-warning");
			$("#form-teza").attr("class", "has-warning");
			$("#itm").text("Zmerna nedohranjenost");
			$("#itm").show();
		}else if(indeksTelesneMase>17 && indeksTelesneMase<18.5){
			$("#form-visina").attr("class", "has-warning");
			$("#form-teza").attr("class", "has-warning");
			$("#itm").text("Blaga nedohranjenost");
			$("#itm").show();
		}else if(indeksTelesneMase>25 && indeksTelesneMase<=30){
			$("#form-visina").attr("class", "has-warning");
			$("#form-teza").attr("class", "has-warning");
			$("#itm").text("Blaga nedohranjenost");
			$("#itm").show();
		}else if(indeksTelesneMase>30 && indeksTelesneMase<=35){
			$("#form-visina").attr("class", "has-warning");
			$("#form-teza").attr("class", "has-warning");
			$("#itm").text("Debelost stopnje I");
			$("#itm").show();
		}else if(indeksTelesneMase>35 && indeksTelesneMase<=40) {
			$("#form-visina").attr("class", "has-warning");
			$("#form-teza").attr("class", "has-warning");
			$("#itm").text("Debelost stopnje II");
			$("#itm").show();
		}else if(indeksTelesneMase>40){
			$("#form-visina").attr("class", "has-warning");
			$("#form-teza").attr("class", "has-warning");
			$("#itm").text("Debelost stopnje III");
			$("#itm").attr("class", "label label-danger warningspan");
			$("#itm").show();
		}
	}else{
		$("#form-visina").attr("class", "");
		$("#form-teza").attr("class", "");
		$("#itm").hide();
	}
}

function obravnavajTemperaturo(temperatura){
	if(temperatura){
		temperatura = parseFloat(temperatura);
		if(temperatura>=36 && temperatura<=37.5){
			$("#form-temperatura").attr("class", "has-success");
			$("#temperatura").hide();
		}else{
			$("#form-temperatura").attr("class", "has-warning");
			$("#temperatura").text("Temperatura");
			$("#temperatura").show();
		}
	}else{
		$("#form-temperatura").attr("class", "");
		$("#temperatura").hide();
	}
}

function obravnavajSistolicni(sistolicni){
	if(sistolicni){
		sistolicni = parseFloat(sistolicni);
		if(sistolicni>=90 && sistolicni<=120){
			$("#form-sistolicni").attr("class", "has-success");
			$("#sistolicni").hide();
		}else{
			$("#form-sistolicni").attr("class", "has-warning");
			$("#sistolicni").text("Sistolicni");
			$("#sistolicni").show();
		}
	}else{
		$("#form-sistolicni").attr("class", "");
		$("#sistolicni").hide();
	}
}

function obravnavajDiastolicni(diastolicni){
	if(diastolicni){
		diastolicni = parseFloat(diastolicni);
		if(diastolicni>=60 && diastolicni<=80){
			$("#form-diastolicni").attr("class", "has-success");
			$("#diastolicni").hide();
		}else{
			$("#form-diastolicni").attr("class", "has-warning");
			$("#diastolicni").text("Diastolicni");
			$("#diastolicni").show();
		}
	}else{
		$("#form-diastolicni").attr("class", "");
		$("#diastolicni").hide();
	}
}

function obravnavajNasicenost(nasicenost){
	if(nasicenost){
		nasicenost = parseFloat(nasicenost);
		if(nasicenost>=0 && nasicenost<=100) {
			if (nasicenost >= 96 && nasicenost <= 100) {
				$("#form-nasicenost").attr("class", "has-success");
				$("#nasicenost").hide();
			} else {
				$("#form-nasicenost").attr("class", "has-warning");
				$("#nasicenost").text("Nasicenost");
				$("#nasicenost").show();
			}
		}else{
			$("#form-nasicenost").attr("class", "");
		}
	}else{
		$("#form-nasicenost").attr("class", "");
		$("#nasicenost").hide();
	}
}

$(document).ready(function() {
	oznaciNaMapi("","prvic");
	$('#preberiObstojeciEHR').change(function() {
		$("#preberiSporocilo").html("");
		$("#preberiEHRid").val($(this).val());
	});
	$('#preberiPredlogoBolnika').change(function() {
		$("#kreirajSporocilo").html("");
		var podatki = $(this).val().split(",");
		$("#kreirajIme").val(podatki[0]);
		$("#kreirajPriimek").val(podatki[1]);
		$("#kreirajDatumRojstva").val(podatki[2]);

	});
	$('#preberiObstojeciVitalniZnak').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
		$("#dodajVitalnoTelesnaTemperatura").val(podatki[4]);
		$("#dodajVitalnoKrvniTlakSistolicni").val(podatki[5]);
		$("#dodajVitalnoKrvniTlakDiastolicni").val(podatki[6]);
		$("#dodajVitalnoNasicenostKrviSKisikom").val(podatki[7]);
		$("#dodajVitalnoMerilec").val(podatki[8]);
	});
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});
	$("#obmocje").change(function() {
		//alert( "Handler for .change() called." );
		clearOverlays();
		var obmocje = $(this).val();
		var str = 0;
		$("#strana").val(str);
		var zdravniki = najdiZdravnike(obmocje);
		$("#previous").attr('class', 'disabled');
		if(zdravniki.length<=5){
			$("#next").attr('class', 'disabled');
		}else{
			$("#next").attr('class', 'enabled');
		}
		//console.log(zdravniki.length);
		var zdravnikiNaStrani = najdiNaStrani(zdravniki, 0);
		//for(var i=0; i<zdravnikiNaStrani.length; i++) {
		//	console.log(zdravnikiNaStrani[i]);
		//}
		vstaviZdravnikeNaStrani(zdravnikiNaStrani);
		$("#zdravniki").show();
	});
	setInterval(function() { obravnavajVisinoInTezo($('#dodajVitalnoTelesnaVisina').val(), $('#dodajVitalnoTelesnaTeza').val());}, 200);
	setInterval(function() { obravnavajTemperaturo($('#dodajVitalnoTelesnaTemperatura').val());}, 200);
	setInterval(function() { obravnavajSistolicni($('#dodajVitalnoKrvniTlakSistolicni').val());}, 200);
	setInterval(function() { obravnavajDiastolicni($('#dodajVitalnoKrvniTlakDiastolicni').val());}, 200);
	setInterval(function() { obravnavajNasicenost($('#dodajVitalnoNasicenostKrviSKisikom').val());}, 200);
	$("#zdravnik1").click(function( event ) {
		var zdravnik = $("#zdravnik1").text();
		var adresa = $("#adresa1").text();
		//console.log(adresa);
		oznaciNaMapi(zdravnik, adresa);
	});
	$("#zdravnik2").click(function( event ) {
		var zdravnik = $("#zdravnik2").text();
		var adresa = $("#adresa2").text();
		//console.log(adresa);
		oznaciNaMapi(zdravnik, adresa);
	});
	$("#zdravnik3").click(function( event ) {
		var zdravnik = $("#zdravnik3").text();
		var adresa = $("#adresa3").text();
		//console.log(adresa);
		oznaciNaMapi(zdravnik, adresa);
	});
	$("#zdravnik4").click(function( event ) {
		var zdravnik = $("#zdravnik4").text();
		var adresa = $("#adresa4").text();
		//console.log(adresa);
		oznaciNaMapi(zdravnik, adresa);
	});
	$("#zdravnik5").click(function( event ) {
		var zdravnik = $("#zdravnik5").text();
		var adresa = $("#adresa5").text();
		//console.log(adresa);
		oznaciNaMapi(zdravnik, adresa);
	});
});