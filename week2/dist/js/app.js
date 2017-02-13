'use strict';

/*jshint esversion: 6 */
(function () {
    'use strict';

    var config = {
        apiUrl: 'https://api.spotify.com/v1/search'
    };

    var app = {
        init: function init() {
            search.init();
        }
    };

    var search = {
        init: function init() {
            var form = document.getElementsByTagName('form')[0];
            form.addEventListener('submit', this.handle);
        },
        handle: function handle(e) {
            // Prevent browser from refreshing
            e.preventDefault();

            var searchQuery = document.querySelector('input[type=search]').value;
            var requestUrl = config.apiUrl + '?q=' + searchQuery + '&type=track,artist';
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
            }).slice(0, 10);
            return _artists;
        },
        tracks: function tracks(_tracks) {
            var _this = this;

            return _tracks.map(function (track) {
                return {
                    id: track.id,
                    name: track.name,
                    artists: _this.getArtistsNamesOfTrack(track.artists),
                    images: track.album.images
                };
            }).slice(0, 10);
        },
        getArtistsNamesOfTrack: function getArtistsNamesOfTrack(artists) {
            return artists.map(function (artist) {
                return {
                    id: artist.id,
                    name: artist.name
                };
            });
        }
    };

    var view = {
        elements: {
            artistsList: document.getElementById('artists'),
            tracksList: document.getElementById('tracks')
        },
        render: function render(artists, tracks) {
            var _this2 = this;

            console.log(artists);
            this.clear();
            artists.map(function (artist) {
                var listItem = document.createElement('li');
                var itemContent = '\n                    <img src="' + (artist.images[0] ? artist.images[0].url : './dist/img/placeholder/band.png') + '" alt="' + artist.name + '"/>\n                    <h3>' + artist.name + '</h3>\n                ';
                listItem.innerHTML = itemContent;
                _this2.elements.artistsList.appendChild(listItem);
            });
        },
        clear: function clear() {
            this.elements.artistsList.innerHTML = '';
        }
    };

    app.init();
})();