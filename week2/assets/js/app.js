/*jshint esversion: 6 */
(function() {
    'use strict';
    const config = {
        startRoute: '#start',
        routes: (function(){
            const pages = Array.from(document.querySelectorAll('[data-route]'));
            return pages.map(section => section.getAttribute('data-route'));
        }()),
        apiUrl: 'https://api.spotify.com/v1/search'
    };

    const app = {
        init() {
            routes.init();
            search.init();
        }
    };

    const routes = {
        init() {
            const hashLocation = document.location.hash;

            if (hashLocation && (config.routes).includes(hashLocation)) {
                pages.setActive(hashLocation);
            } else {
                pages.setActive(config.startRoute);
            }

            this.handleHashChange();
        },
        handleHashChange() {
            window.addEventListener('hashchange', () => {
                const hashLocation = document.location.hash;

                if ((config.routes).includes(hashLocation)) {
                    pages.setActive(hashLocation);
                }
            });
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
            }).slice(0,3);
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
        elements: {
            artistsList: document.getElementById('artists'),
            trackList: document.getElementById('tracks')
        },
        render(artists, tracks) {
            const lists = Array.from(document.querySelectorAll('[data-results-list]'));
            this.clearElement(this.elements.artistsList);
            this.clearElement(this.elements.trackList);

            artists.map(artist => {
                const listItem = document.createElement('li');
                const itemContent = `
                    <img src="${artist.images[0] ? artist.images[0].url : './dist/img/placeholder/band.png'}" alt="${artist.name}"/>
                    <strong>${artist.name}</strong>
                `;
                listItem.innerHTML = itemContent;
                this.elements.artistsList.appendChild(listItem);
            });

            tracks.map(track => {
                const listItem = document.createElement('li');
                const itemContent = track => {
                    return `
                        <iframe src="https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"></iframe>
                    `;
                };

                listItem.innerHTML = itemContent(track);
                this.elements.trackList.appendChild(listItem);
            });

            lists.map(list => list.classList.remove('hidden'));
        },
        clearElement(element) {
            element.innerHTML = '';
        }
    };

    app.init();
}());
