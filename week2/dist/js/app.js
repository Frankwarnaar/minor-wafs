'use strict';

/*jshint esversion: 6 */
(function () {
    'use strict';

    var config = {
        api: {
            url: 'https://api.spotify.com/v1/search'
        },
        search: {
            form: document.getElementsByTagName('form')[0],
            input: document.querySelector('input[type=search]')
        }
    };

    var app = {
        init: function init() {
            search.init();
        }
    };

    var search = {
        init: function init() {
            config.search.form.addEventListener('submit', this.handle);
        },
        handle: function handle(e) {
            // Prevent browser from refreshing
            e.preventDefault();

            var searchQuery = config.search.input.value;
            var requestUrl = config.api.url + '?q=' + searchQuery + '&type=track,artist';
            var request = new XMLHttpRequest();

            request.open('GET', requestUrl, true);

            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    var data = JSON.parse(request.responseText);
                    view.render(cleanLists.artists(data.artists.items), cleanLists.tracks(data.tracks.items));
                } else {
                    console.log('error');
                }
            };

            request.onerror = function (err) {
                console.log(err);
            };

            request.send();
        }
    };

    var cleanLists = {
        artists: function artists(_artists) {
            _artists = _artists.map(function (artist) {
                return {
                    id: artist.id,
                    name: artist.name,
                    images: artist.images
                };
            });
            return _artists;
        },
        tracks: function tracks(_tracks) {
            var _this = this;

            _tracks = _tracks.map(function (track) {
                return {
                    id: track.id,
                    name: track.name,
                    artists: _this.getArtistsNamesOfTrack(track.artists),
                    images: track.album.images
                };
            });
            return _tracks;
        },
        getArtistsNamesOfTrack: function getArtistsNamesOfTrack(artists) {
            artists = artists.map(function (artist) {
                return {
                    id: artist.id,
                    name: artist.name
                };
            });
            return artists;
        }
    };

    var view = {
        render: function render(artists, tracks) {
            console.log(artists);
            console.log(tracks);
        }
    };

    app.init();
})();