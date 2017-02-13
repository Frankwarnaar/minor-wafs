/***
* cmdaan.js
*   Bevat functies voor CMDAan stijl geolocatie welke uitgelegd
*   zijn tijdens het techniek college in week 5.
*
*   Author: J.P. Sturkenboom <j.p.sturkenboom@hva.nl>
*   Credit: Dive into html5, geo.js, Nicholas C. Zakas
*
*   Copyleft 2012, all wrongs reversed.
*/
'use strict';

(function() {

    // Variable declaration
    var config = {
        lineair : "LINEAIR",
        gpsAvailable : "GPS_AVAILABLE",
        gpsUnavailabe : "GPS_UNAVAILABLE",
        positionUpdated : "POSITION_UPDATED",
        refreshRate : 1000,
        currentPosition : false,
        currentPositionMarker : false,
        customDebugging : false,
        debugId : false,
        map : false,
        interval : false,
        intervalCounter : false,
        markerRij : []
    };

    // Event functies - bron: http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/ Copyright (c) 2010 Nicholas C. Zakas. All rights reserved. MIT License
    // Gebruik: ET.addListener("foo", handleEvent); ET.fire("event_name"); ET.removeListener("foo", handleEvent);
    function EventTarget() {
        this.listeners = {};
    }

    EventTarget.prototype = {
        constructor: EventTarget,
        addListener: function(a, c) {
            "undefined" == typeof this.listeners[a] && (this.listeners[a] = []);
            this.listeners[a].push(c);
        },
        fire: function(a) {
            ("string" == typeof a) && (a = {
                type:a
            });
                a.target||(a.target=this);if(!a.type)throw Error("Event object missing "type" property.");if(this.listeners[a.type]instanceof Array)for(var c=this.listeners[a.type],b=0,d=c.length;b<d;b++)c[b].call(this,a)},removeListener:function(a,c){if(this.listeners[a]instanceof Array)for(var b=
    this.listeners[a],d=0,e=b.length;d<e;d++)if(b[d]===c){b.splice(d,1);break}}}; var ET = new EventTarget();

    var app = {
        // Test of GPS beschikbaar is (via geo.js) en vuur een event af
        init: function() {
            debugging.message("Controleer of GPS beschikbaar is...");

            ET.addListener(config.gpsAvailable, startInterval);
            ET.addListener(config.gpsUnavailabe, function(){
                debugging.message("GPS is niet beschikbaar.");
            });

            (geo_position_js.init())?ET.fire(config.gpsAvailable):ET.fire(config.gpsUnavailabe);
        },
        // Start een config.interval welke op basis van config.refreshRate de positie updated
        startInterval: function() {
            debugging.message("GPS is beschikbaar, vraag positie.");
            position.update();
        }
    };

    var position = {
        // Vraag de huidige positie aan geo.js, stel een callback in voor het resultaat
        update: function() {
            config.intervalCounter++;
            geo_position_js.getCurrentPosition(this.set, debugging.errorHandler, {enableHighAccuracy:true});
        },
        // Callback functie voor het instellen van de huidige positie, vuurt een event af
        set: function(position) {
            config.currentPosition = position;
            ET.fire("config.positionUpdated");
            debugging.message(config.intervalCounter+" positie lat:"+position.coords.latitude+" long:"+position.coords.longitude);
        },
        // Update de positie van de gebruiker op de kaart
        updateUserPositie: function() {
            // use config.currentPosition to center the config.map
            var newPos = new google.config.maps.LatLng(config.currentPosition.coords.latitude, config.currentPosition.coords.longitude);
            config.map.setCenter(newPos);
            config.currentPositionMarker.setPosition(newPos);
        }
    };

    var locations = {
        // Controleer de locaties en verwijs naar een andere pagina als we op een locatie zijn
        check: function() {
            for (var i = 0; i < locaties.length; i++) {
                var locatie = {coords:{latitude: locaties[i][3],longitude: locaties[i][4]}};

                if(util.calcDistance(locatie, config.currentPosition)<locaties[i][2]){

                    // Controle of we NU op die locatie zijn, zo niet gaan we naar de betreffende page
                    if(window.location!=locaties[i][1] && localStorage[locaties[i][0]]=="false"){
                        // Probeer local storage, als die bestaat incrementeer de locatie
                        try {
                            (localStorage[locaties[i][0]]=="false")?localStorage[locaties[i][0]]=1:localStorage[locaties[i][0]]++;
                        } catch(error) {
                            debugging.message("Localstorage kan niet aangesproken worden: "+error);
                        }

                        // to do: Animeer de betreffende marker

                        window.location = locaties[i][1];
                        debugging.message("Speler is binnen een straal van "+ locaties[i][2] +" meter van "+locaties[i][0]);
                    }
                }
            }
        }
    };

    // GOOGLE MAPS FUNCTIES
    /**
     * generate_config.map(myOptions, canvasId)
     *  roept op basis van meegegeven opties de google config.maps API aan
     *  om een kaart te genereren en plaatst deze in het HTML element
     *  wat aangeduid wordt door het meegegeven id.
     *
     *  @param myOptions:object - een object met in te stellen opties
     *      voor de aanroep van de google config.maps API, kijk voor een over-
     *      zicht van mogelijke opties op http://
     *  @param canvasID:string - het id van het HTML element waar de
     *      kaart in ge-rendered moet worden, <div> of <canvas>
     */
    function generate_config.map(myOptions, canvasId){
    // to do: Kan ik hier asynchroon nog de google config.maps api aanroepen? dit scheelt calls
        debugging.message("Genereer een Google Maps kaart en toon deze in #"+canvasId)
        config.map = new google.config.maps.Map(document.getElementById(canvasId), myOptions);

        var routeList = [];
        // Voeg de markers toe aan de config.map afhankelijk van het tourtype
        debugging.message("Locaties intekenen, tourtype is: "+tourType);
        for (var i = 0; i < locaties.length; i++) {

            // Met kudos aan Tomas Harkema, probeer local storage, als het bestaat, voeg de locaties toe
            try {
                (localStorage.visited==undefined||util.isNumber(localStorage.visited))?localStorage[locaties[i][0]]=false:null;
            } catch (error) {
                debugging.message("Localstorage kan niet aangesproken worden: "+error);
            }

            var markerLatLng = new google.config.maps.LatLng(locaties[i][3], locaties[i][4]);
            routeList.push(markerLatLng);

            config.markerRij[i] = {};
            for (var attr in locatieMarker) {
                config.markerRij[i][attr] = locatieMarker[attr];
            }
            config.markerRij[i].scale = locaties[i][2]/3;

            var marker = new google.config.maps.Marker({
                position: markerLatLng,
                config.map: config.map,
                icon: config.markerRij[i],
                title: locaties[i][0]
            });
        }
    // to do: Kleur aanpassen op het huidige punt van de tour
        if(tourType == config.lineair){
            // Trek lijnen tussen de punten
            debugging.message("Route intekenen");
            var route = new google.config.maps.Polyline({
                clickable: false,
                config.map: config.map,
                path: routeList,
                strokeColor: "Black",
                strokeOpacity: 0.6,
                strokeWeight: 3
            });

        }

        // Voeg de locatie van de persoon door
        config.currentPositionMarker = new google.config.maps.Marker({
            position: kaartOpties.center,
            config.map: config.map,
            icon: positieMarker,
            title: "U bevindt zich hier"
        });

        // Zorg dat de kaart geupdated wordt als het config.positionUpdated event afgevuurd wordt
        ET.addListener(config.positionUpdated, updatePositie);
    }

    var util = {
        isNumber: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        // Bereken het verchil in meters tussen twee punten
        calcDistance: function(p1, p2){
            var pos1 = new google.config.maps.LatLng(p1.coords.latitude, p1.coords.longitude);
            var pos2 = new google.config.maps.LatLng(p2.coords.latitude, p2.coords.longitude);
            return Math.round(google.config.maps.geometry.spherical.computeDistanceBetween(pos1, pos2), 0);
        }
    }


    // FUNCTIES VOOR DEBUGGING

    var debugging = {
        errorHandler: function(code, message) {
            this.debugMessage("geo.js error "+code+": "+message);
        },
        debugMessage: function(message) {
            if (config.customDebugging && config.debugId) {
                document.getElementById(config.debugId).innerHTML(message);
            } else {
                console.log(message);
            }
        },
        setCustomDebugging: function(config.debugId) {
            config.debugId = this.config.debugId;
            config.customDebugging = true;
        }
    };
}());