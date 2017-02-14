/*jshint esversion: 6 */
(function() {
    'use strict';
    const config = {
        routes: {
            start: `${document.querySelector('[data-route]').getAttribute('data-route')}`
        },
        apiUrl: 'https://api.spotify.com/v1'
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

    routie({
        'tracks'() {
            pages.setActive('#tracks');
        },
        'tracks/:trackId'(trackId) {
            pages.setActive('#tracks-details');
            connection.handle(`${config.apiUrl}/tracks/${trackId}`, data => {
                const details = cleanLists.track(data);
                render.details(details);
            });
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

            connection.handle(`${config.apiUrl}/search?q=${searchQuery}&type=track`, data => {
                const tracks = cleanLists.tracks(data.tracks.items);
                render.tracks(tracks);
            });
        }
    };

    const cleanLists = {
        tracks(tracks) {
            return tracks.map(track => {
                return {
                    id: track.id,
                    name: track.name,
                    artists: this.getArtistsString(track.artists),
                    images: track.album.images
                };
            }).slice(0,3);
        },
        track(track) {
            return {
                artists: this.getArtistsString(track.artists),
                id: track.id,
                name: track.name,
                // Get the biggest picture available
                image: track.album.images.sort((a, b) => {
                    return b.width - a.width;
                })[0].url
            };
        },
        getArtistsString(artists) {
            artists = artists.map(artist => {
                return artist.name;
            });
            artists = artists.reduce((all, current) => {
                return `${all}, ${current}`;
            });
            return artists;
        }
    };

    const render = {
        tracks(tracks) {
            const tracklist = document.getElementById('tracklist');
            const resultsSections = document.querySelector('[data-results-section]');

            this.clear(tracklist);

            tracks.map(track => {
                const listItem = document.createElement('li');
                listItem.classList.add('track');
                const itemContent = track => {
                    return `
                        <a href="#tracks/${track.id}">
                            <iframe src="https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"></iframe>
                        </a>
                    `;
                };

                listItem.innerHTML = itemContent(track);
                tracklist.appendChild(listItem);
            });

            resultsSections.classList.remove('hidden');
        },
        details(track) {
            const detailsContainer = document.getElementById('tracks-details');
            this.clear(detailsContainer);
            detailsContainer.innerHTML = `
                <img src="${track.image}" alt="${track.name}"/>
                <h2>${track.name}</h2>
                <span>by: </span><h3>${track.artists}</h3>
                <iframe src="https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"></iframe>
            `;
        },
        clear(element) {
            element.innerHTML = '';
        }
    };

    app.init();
}());
