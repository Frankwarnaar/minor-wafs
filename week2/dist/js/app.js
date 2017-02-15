'use strict';

/*jshint esversion: 6 */
(function () {
    'use strict';

    var config = {
        routes: {
            start: '' + document.querySelector('[data-route]').getAttribute('data-route')
        },
        apiUrl: 'https://api.spotify.com/v1'
    };

    var app = {
        init: function init() {
            routes.init();
            search.init();
        }
    };

    var routes = {
        init: function init() {
            routie({
                'tracks': function tracks() {
                    pages.setActive('#tracks');
                },
                'tracks/:trackId': function tracksTrackId(trackId) {
                    pages.setActive('#tracks-details');
                    connection.handle(config.apiUrl + '/tracks/' + trackId, function (data) {
                        var details = cleanLists.track(data);
                        render.details(details);
                    });
                },
                '*': function _() {
                    pages.setActive('#' + config.routes.start);
                }
            });
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

    var search = {
        init: function init() {
            var form = document.getElementsByTagName('form')[0];
            form.addEventListener('submit', this.onSearch);
        },
        onSearch: function onSearch(e) {
            e.preventDefault();

            var searchQuery = document.querySelector('input[type=search]').value;
            if (searchQuery.length > 0) {
                connection.handle(config.apiUrl + '/search?q=' + searchQuery + '&type=track', function (data) {
                    var tracks = cleanLists.tracks(data.tracks.items);
                    render.tracks(tracks);
                });
            }
        }
    };

    var cleanLists = {
        tracks: function tracks(_tracks) {
            var _this = this;

            _tracks = this.filterArray(_tracks, 'available_markets', 'NL');

            return _tracks.map(function (track) {
                return {
                    id: track.id,
                    name: track.name,
                    artists: _this.getArtistsString(track.artists),
                    images: track.album.images
                };
            }).slice(0, 3);
        },
        track: function track(_track) {
            return {
                artists: this.getArtistsString(_track.artists),
                id: _track.id,
                name: _track.name,
                // Get the biggest picture available
                image: _track.album.images.sort(function (a, b) {
                    return b.width - a.width;
                })[0].url
            };
        },
        filterArray: function filterArray(list, key, value) {
            return list.filter(function (item) {
                var array = item[key];
                return array.includes(value);
            });
        },
        getArtistsString: function getArtistsString(artists) {
            artists = artists.map(function (artist) {
                return artist.name;
            });
            artists = artists.reduce(function (all, current) {
                return all + ', ' + current;
            });
            return artists;
        }
    };

    var render = {
        tracks: function tracks(_tracks2) {
            var tracklist = document.getElementById('tracklist');
            var resultsSections = document.querySelector('[data-results-section]');

            this.clear(tracklist);

            if (_tracks2.length) {
                _tracks2.map(function (track) {
                    var listItem = document.createElement('li');
                    listItem.classList.add('track');
                    var itemContent = function itemContent(track) {
                        return '\n                        <a href="#tracks/' + track.id + '">\n                        <iframe src="https://embed.spotify.com/?uri=spotify:track:' + track.id + '&view=coverart" frameborder="0"></iframe>\n                        </a>\n                        ';
                    };

                    listItem.innerHTML = itemContent(track);
                    tracklist.appendChild(listItem);
                });
            } else {
                tracklist.innerHTML = '<p>No results found<p>';
            }

            resultsSections.classList.remove('hidden');
        },
        details: function details(track) {
            var detailsContainer = document.getElementById('tracks-details');
            this.clear(detailsContainer);
            detailsContainer.innerHTML = '\n                <img src="' + track.image + '" alt="' + track.name + '"/>\n                <h2>' + track.name + '</h2>\n                <span>by: </span><h3>' + track.artists + '</h3>\n                <iframe src="https://embed.spotify.com/?uri=spotify:track:' + track.id + '&view=coverart" frameborder="0"></iframe>\n            ';
        },
        clear: function clear(element) {
            element.innerHTML = '';
        }
    };

    app.init();
})();