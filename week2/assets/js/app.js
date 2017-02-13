/*jshint esversion: 6 */
(function() {
    'use strict';

    const config = {
        apiUrl: 'https://api.spotify.com/v1/search',
    };

    const app = {
        init() {
            search.init();
        }
    };

    const search = {
        init() {
            const form = document.getElementsByTagName('form')[0];
            form.addEventListener('submit', this.handle);
        },
        handle(e) {
            // Prevent browser from refreshing
            e.preventDefault();

            const searchQuery = document.querySelector('input[type=search]').value;
            const requestUrl = `${config.apiUrl}?q=${searchQuery}&type=track,artist`;
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
            }).slice(0,10);
            return artists;
        },
        tracks(tracks) {
            return tracks.map(track => {
                return {
                    id: track.id,
                    name: track.name,
                    artists: this.getArtistsNamesOfTrack(track.artists),
                    images: track.album.images
                };
            }).slice(0,10);
        },
        getArtistsNamesOfTrack(artists) {
            return artists.map(artist => {
                return {
                    id: artist.id,
                    name: artist.name
                };
            });
        }
    };

    const view = {
        elements: {
            artistsList: document.getElementById('artists'),
            tracksList: document.getElementById('tracks')
        },
        render(artists, tracks) {
            console.log(artists);
            this.clear();
            artists.map(artist => {
                const listItem = document.createElement('li');
                const itemContent = `
                    <img src="${artist.images[0] ? artist.images[0].url : './dist/img/placeholder/band.png'}" alt="${artist.name}"/>
                    <h3>${artist.name}</h3>
                `;
                listItem.innerHTML = itemContent;
                this.elements.artistsList.appendChild(listItem);
            });
        },
        clear() {
            this.elements.artistsList.innerHTML = '';
        }
    };

    app.init();
}());
