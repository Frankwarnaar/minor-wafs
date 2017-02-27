/*jshint esversion: 6 */
(() => {
	'use strict';

	const app = {
		init() {
			controller.init();
		},
		handleConnection(requestUrl) {
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
		},
		config: {
			routes: {
				start: `${document.querySelector('[data-route]').getAttribute('data-route')}`
			},
			apiUrl: 'https://api.spotify.com/v1'
		}
	};

	const controller = {
		init() {
			this.search();
			this.routes();
		},
		search() {
			const form = document.getElementsByTagName('form')[0];
			form.addEventListener('submit', (e) => {
				e.preventDefault();

				const searchQuery = document.querySelector('input[type=search]').value;
				console.log(searchQuery);
				if (searchQuery.length > 0) {
					view.render.tracks(searchQuery);
				}
			});
		},
		routes() {
			routie({
				'tracks'() {
					view.activatePage('#tracks');
				},
				'tracks/:trackId'(trackId) {
					view.activatePage('#tracks-details');
					view.render.details(trackId);
				},
				'*'() {
					view.activatePage(`#${app.config.routes.start}`);
				}
			});
		}
	};

	const cleanData = {
		tracks(tracks, key, value) {
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
		details(track) {
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
		artistsToString(artists) {
			artists = artists.map(artist => {
				return artist.name;
			});

			artists = artists.reduce((all, current) => {
				return `${all}, ${current}`;
			});

			return artists;
		}
	};

	const view = {
		activatePage(route) {
			const pages = Array.from(document.querySelectorAll('[data-page]'));
			pages.forEach(page => {
				if (`#${page.getAttribute('id')}` === route) {
					page.classList.remove('hidden');
				} else {
					page.classList.add('hidden');
				}
			});
		},
		render: {
			tracks(searchQuery) {
				const tracklist = document.getElementById('tracklist');
				const resultsSections = document.querySelector('[data-results-section]');

				console.log(this);

				// this.clear(tracklist);

				app.handleConnection(`${app.config.apiUrl}/search?q=${searchQuery}&type=track`)
				.then(data => {
					const tracks = cleanLists.tracks(data.tracks.items);
					render.tracks(tracks);
				});

				// if (tracks.length) {
				// 	tracks.map(track => {
				// 		const listItem = document.createElement('li');
				// 		listItem.classList.add('track');
				// 		const itemContent = track => {
				// 			return `
				// 			<a href="#tracks/${track.id}">
				// 			<iframe src="https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"></iframe>
				// 			</a>
				// 			`;
				// 		};
				//
				// 		listItem.innerHTML = itemContent(track);
				// 		tracklist.appendChild(listItem);
				// 	});
				// } else {
				// 	tracklist.innerHTML ='<p>No results found<p>';
				// }
				//
				// resultsSections.classList.remove('hidden');

			},
			details(trackId) {
				const detailsContainer = document.getElementById('tracks-details');
				this.clear(detailsContainer);
				detailsContainer.innerHTML = `
					<img src="${track.image}" alt="${track.name}"/>
					<h2>${track.name}</h2>
					<span>by: </span><h3>${track.artists}</h3>
					<iframe src="https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"></iframe>
				`;
			}
		}
	};

	app.init();
})();
