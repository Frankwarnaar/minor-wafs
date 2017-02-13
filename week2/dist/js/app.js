'use strict';

/*jshint esversion: 6 */
(function () {
    'use strict';

    var config = {
        routes: {
            start: '' + document.querySelector('[data-route]').getAttribute('data-route')
        },
        apiUrl: 'https://api.spotify.com/v1/search'
    };

    var app = {
        init: function init() {
            search.init();
        }
    };

    var pages = {
        setActive: function setActive(route) {
            var pages = Array.from(document.querySelectorAll('[data-page]'));
            pages.forEach(function (page) {
                if ('#' + page.getAttribute('id') === route) {
                    page.classList.remove('hidden');
                } else {
                    page.classList.add('hidden');
                }
            });
        }
    };

    routie({
        'spotify-search': function spotifySearch() {
            pages.setActive('#spotify-search');
        },
        '*': function _() {
            pages.setActive('#' + config.routes.start);
        }
    });

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
            }).slice(0, 3);
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
            }).slice(0, 3);
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
            trackList: document.getElementById('tracks')
        },
        render: function render(artists, tracks) {
            var _this2 = this;

            var lists = Array.from(document.querySelectorAll('[data-results-list]'));
            this.clearElement(this.elements.artistsList);
            this.clearElement(this.elements.trackList);

            artists.map(function (artist) {
                var listItem = document.createElement('li');
                var itemContent = '\n                    <img src="' + (artist.images[0] ? artist.images[0].url : './dist/img/placeholder/band.png') + '" alt="' + artist.name + '"/>\n                    <strong>' + artist.name + '</strong>\n                ';
                listItem.innerHTML = itemContent;
                _this2.elements.artistsList.appendChild(listItem);
            });

            tracks.map(function (track) {
                var listItem = document.createElement('li');
                var itemContent = function itemContent(track) {
                    return '\n                        <iframe src="https://embed.spotify.com/?uri=spotify:track:' + track.id + '&view=coverart" frameborder="0"></iframe>\n                    ';
                };

                listItem.innerHTML = itemContent(track);
                _this2.elements.trackList.appendChild(listItem);
            });

            lists.map(function (list) {
                return list.classList.remove('hidden');
            });
        },
        clearElement: function clearElement(element) {
            element.innerHTML = '';
        }
    };

    app.init();
})();