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
			routes.init();
			search.init();
		}
	};

	const routes = {
		init() {
			routie({
				'tracks'() {
					pages.setActive('#tracks');
				},
				'tracks/:trackId'(trackId) {
					pages.setActive('#tracks-details');
					connection.handle(`${config.apiUrl}/tracks/${trackId}`)
					.then(details => {
						details = cleanLists.track(details);
						render.details(details);
					});
				},
				'*'() {
					pages.setActive(`#${config.routes.start}`);
				}
			});
		}
	}

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
		handle(requestUrl) {
			return new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();

				xhr.open('GET', requestUrl);

				xhr.onload = function() {
					if (this.status >= 200 && this.status < 300) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						reject({status: this.status, statusText: xhr.statusText});
					}
				};
				xhr.onerror = function() {
					reject({status: this.status, statusText: xhr.statusText});
				};
				xhr.send();
			});
		}
	};

	const search = {
		init() {
			const form = document.getElementsByTagName('form')[0];
			form.addEventListener('submit', this.onSearch);
		},
		onSearch(e) {
			e.preventDefault();

			const searchQuery = document.querySelector('input[type=search]').value;
			if (searchQuery.length > 0) {
				connection.handle(`${config.apiUrl}/search?q=${searchQuery}&type=track`)
				.then(data => {
					const tracks = cleanLists.tracks(data.tracks.items);
					render.tracks(tracks);
				});
			}
		}
	};

	const cleanLists = {
		tracks(tracks) {
			tracks = this.filterArray(tracks, 'available_markets', 'NL');

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
		filterArray(list, key, value) {
			return list.filter(item => {
				return item[key].includes(value);
			});
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

			if (tracks.length) {
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
			} else {
				tracklist.innerHTML ='<p>No results found<p>';
			}

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
