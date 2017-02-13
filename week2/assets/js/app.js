/*jshint esversion: 6 */
(function() {
    'use strict';
    const config = {
        routes: {
            start: `${document.querySelector('[data-route]').getAttribute('data-route')}`
        },
        apiUrl: 'https://api.spotify.com/v1/search'
    };

    const app = {
        init() {
            search.init();
        }
    };

    const pages = {
        setActive(route) {
            const pages = Array.from(document.querySelectorAll('[data-page]'));
            pages.forEach(page => {
                if (`#${page.getAttribute('id')}` === route) {
                    page.classList.remove('hidden');
                } else {
                    page.classList.add('hidden');
                }
            });
        },
        showDetail(data) {

        }
    };

    routie({
        'spotify'() {
            pages.setActive('#spotify');
        },
        'spotify/:trackId'(trackId) {
            pages.setActive('#spotify-detail');
            pages.showDetail();
        },
        '*'() {
            pages.setActive(`#${config.routes.start}`);
        }
    });

    const search = {
        init() {
            const form = document.getElementsByTagName('form')[0];
            form.addEventListener('submit', this.onSearch);
        },
        onSearch(e) {
            e.preventDefault();

            const searchQuery = (document.querySelector('input[type=search]').value ? document.querySelector('input[type=search]').value : ' ');

            connection.handle(`${config.apiUrl}?q=${searchQuery}&type=track`, data => {
                const tracks = cleanLists.tracks(data.tracks.items);
                view.render(tracks);
            });
        }
    };

    const connection = {
        handle(requestUrl, callback) {
            const request = new XMLHttpRequest();

            request.open('GET', requestUrl, true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    const data = JSON.parse(request.responseText);
                    callback(data);
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
        tracks(tracks) {
            return tracks.map(track => {
                return {
                    id: track.id,
                    name: track.name,
                    artists: this.getArtistsNamesOfTrack(track.artists),
                    images: track.album.images
                };
            }).slice(0,3);
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
        render(tracks) {
            console.log(tracks);
            const tracklist = document.getElementById('tracklist');
            const resultsSections = document.querySelector('[data-results-section]');

            this.clearElement(tracklist);

            tracks.map(track => {
                const listItem = document.createElement('li');
                const itemContent = track => {
                    return `
                        <a href="#spotify/${track.id}">
                            <iframe src="https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"></iframe>
                        </a>
                    `;
                };

                listItem.innerHTML = itemContent(track);
                tracklist.appendChild(listItem);
            });

            resultsSections.classList.remove('hidden');
        },
        clearElement(element) {
            element.innerHTML = '';
        }
    };

    app.init();
}());
