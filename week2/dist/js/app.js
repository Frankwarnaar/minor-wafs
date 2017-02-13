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
        },
        showDetail: function showDetail(data) {}
    };

    routie({
        'spotify': function spotify() {
            pages.setActive('#spotify');
        },
        'spotify/:trackId': function spotifyTrackId(trackId) {
            pages.setActive('#spotify-detail');
            pages.showDetail();
        },
        '*': function _() {
            pages.setActive('#' + config.routes.start);
        }
    });

    var search = {
        init: function init() {
            var form = document.getElementsByTagName('form')[0];
            form.addEventListener('submit', this.onSearch);
        },
        onSearch: function onSearch(e) {
            e.preventDefault();

            var searchQuery = document.querySelector('input[type=search]').value ? document.querySelector('input[type=search]').value : ' ';

            connection.handle(config.apiUrl + '?q=' + searchQuery + '&type=track', function (data) {
                var tracks = cleanLists.tracks(data.tracks.items);
                view.render(tracks);
            });
        }
    };

    var connection = {
        handle: function handle(requestUrl, callback) {
            var request = new XMLHttpRequest();

            request.open('GET', requestUrl, true);

            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    var data = JSON.parse(request.responseText);
                    callback(data);
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
        render: function render(tracks) {
            console.log(tracks);
            var tracklist = document.getElementById('tracklist');
            var resultsSections = document.querySelector('[data-results-section]');

            this.clearElement(tracklist);

            tracks.map(function (track) {
                var listItem = document.createElement('li');
                var itemContent = function itemContent(track) {
                    return '\n                        <a href="#spotify/' + track.id + '">\n                            <iframe src="https://embed.spotify.com/?uri=spotify:track:' + track.id + '&view=coverart" frameborder="0"></iframe>\n                        </a>\n                    ';
                };

                listItem.innerHTML = itemContent(track);
                tracklist.appendChild(listItem);
            });

            resultsSections.classList.remove('hidden');
        },
        clearElement: function clearElement(element) {
            element.innerHTML = '';
        }
    };

    app.init();
})();