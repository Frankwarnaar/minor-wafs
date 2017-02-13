/*jshint esversion: 6 */
(function() {
    'use strict';

    const config = {
        api: {
            url: 'https://api.spotify.com/v1/search',
        },
        search: {
            form: document.getElementsByTagName('form')[0],
            input: document.querySelector('input[type=search]')
        }
    };

    const app = {
        init() {
            search.init();
        }
    };

    const search = {
        init() {
            config.search.form.addEventListener('submit', this.handle);
        },
        handle(e) {
            // Prevent browser from refreshing
            e.preventDefault();

            const searchQuery = config.search.input.value;
            const requestUrl = `${config.api.url}?q=${searchQuery}&type=track,artist`;
            const request = new XMLHttpRequest();

            request.open('GET', requestUrl, true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    const data = JSON.parse(request.responseText);
                    view.render(cleanLists.artists(data.artists.items), cleanLists.tracks(data.tracks.items));
                } else {
                    console.log('error');
                }
            };

            request.onerror = err => {
                console.log(err);
            };

            request.send();
        }
    };

    const cleanLists = {
        artists(artists) {
            artists = artists.map(artist => {
                return {
                    id: artist.id,
                    name: artist.name,
                    images: artist.images,
                };
            });
            return artists;
        },
        tracks(tracks) {
            tracks = tracks.map(track => {
                return {
                    id: track.id,
                    name: track.name,
                    artists: this.getArtistsNamesOfTrack(track.artists),
                    images: track.album.images
                };
            });
            return tracks;
        },
        getArtistsNamesOfTrack(artists) {
            artists = artists.map(artist => {
                return {
                    id: artist.id,
                    name: artist.name
                };
            });
            return artists;
        }
    };

    const view = {
        render(artists, tracks) {
            console.log(artists);
            console.log(tracks);
        }
    };

    app.init();
}());
