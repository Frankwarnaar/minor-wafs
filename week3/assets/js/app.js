/*jshint esversion: 6 */
(() => {
	'use strict';

	const app = {
		init() {
			controller.init();
			store.init();
		},
		// Handles ajax requests as promise.
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
		// Config used through the app
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
			this.sortTracks();
		},
		// Function to handle search
		search() {
			const $form = document.getElementsByTagName('form')[0];
			$form.addEventListener('submit', (e) => {
				e.preventDefault();

				const searchQuery = document.querySelector('input[type=search]').value;
				// Make sure the user has searched something. Should always be true, becuase the input is required
				if (searchQuery.length > 0) {
					store.searchHistory.update(searchQuery);
					view.render.tracks(searchQuery);
				}
			});
		},
		sortTracks() {
			const $sortByOptions = document.querySelectorAll('[name="sort-by"]');
			$sortByOptions.forEach($option => {
				$option.addEventListener('change', () => {
					const sortBy = document.querySelector('input[name="sort-by"]:checked').value;
					store.tracks = store.arrays.sortList(store.tracks, sortBy);
					store.tracks.map(track => {
						console.log(track);
					});
				});
			});
		},
		// Routing
		routes() {
			routie({
				// Overview page
				'tracks'() {
					view.activatePage('#tracks');
				},
				// Detail page
				'tracks/:trackId'(trackId) {
					view.activatePage('#tracks-details');
					view.render.details(trackId);
				},
				// Fallback to starting page
				'*'() {
					view.activatePage(`#${app.config.routes.start}`);
				}
			});
		}
	};

	const store = {
		init() {
			this.searchHistory.history = [];
			this.searchHistory.get();
		},
		searchHistory: {
			get() {
				if (localStorage.getItem('searchHistory')) {
					this.history = JSON.parse((localStorage.getItem('searchHistory')));
				}
			},
			update(searchQuery) {
				this.history.unshift(searchQuery);
				localStorage.setItem('searchHistory', JSON.stringify(this.history));
			}
		},
		// Methods to clean data
		cleanData: {
			// Make sure only the used data is returned of a list of tracks
			tracks(tracks, key, value) {
				return tracks.map(track => {
					return {
						id: track.id,
						name: track.name,
						artists: this.artistsToString(track.artists),
						images: track.album.images,
						popularity: track.popularity
					};
				});
			},
			// Make sure only the used data is returned of a single track
			details(track) {
				return {
					artists: this.artistsToString(track.artists),
					id: track.id,
					name: track.name,
					// Get the biggest picture available
					image: track.album.images.sort((a, b) => {
						return b.width - a.width;
					})[0].url
				};
			},
			// Return a string of all the artists from an array
			artistsToString(artists) {
				artists = artists.map(artist => {
					return artist.name;
				});

				artists = artists.reduce((all, current) => {
					return `${all}, ${current}`;
				});

				return artists;
			}
		},
		arrays: {
			// Filter an array, by by a certain property
			filterList(array, key, value) {
				return array.filter(item => {
					return item[key].includes(value);
				});
			},
			// Sort array by key
			sortList(array, key) {
				return array.sort((a, b) => {
					if (typeof(a[key]) === 'string') {
						return a[key].localeCompare(b[key]);
					}
					return a[key] - b[key];
				});
			}
		}
	};

	const view = {
	// Make the current page visible and all the other invisible
		activatePage(route) {
			const $pages = Array.from(document.querySelectorAll('[data-page]'));
			$pages.forEach($page => {
				if (`#${$page.getAttribute('id')}` === route) {
					$page.classList.remove('hidden');
				} else {
					$page.classList.add('hidden');
				}
			});
		},
		render: {
			// Method to render a list of tracks
			tracks(searchQuery) {
				const $tracklist = document.getElementById('tracklist');
				const $resultsSections = document.querySelector('[data-results-section]');

				$resultsSections.classList.remove('hidden');
				view.showLoader(true);

				view.clear($tracklist);

				app.handleConnection(`${app.config.apiUrl}/search?q=${searchQuery}&type=track`)
				.then(data => {
					let tracks = data.tracks.items;
					tracks = store.arrays.filterList(tracks, 'available_markets', 'NL');
					tracks = store.cleanData.tracks(tracks).splice(0, 10);
					store.tracks = tracks;

					view.showLoader(false);

					if (tracks.length) {
						tracks.map(track => {
							const $listItem = document.createElement('li'),
								$trackLink = document.createElement('a');

							$listItem.classList.add('track');
							$trackLink.setAttribute('href', `#tracks/${track.id}`);

							$listItem.appendChild($trackLink);

							this.content(`https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"`, null, $trackLink);

							$tracklist.appendChild($listItem);
						});
					} else {
						tracklist.innerHTML ='<p>No results found<p>';
					}
				}).catch(error => {
					tracklist.innerHTML ='<p>No results found<p>';
					console.log(error);
					view.showLoader(false);
				});
			},
			// Method to render the details of a track
			details(trackId) {
				const $detailsContainer = document.getElementById('tracks-details');

				view.clear($detailsContainer);
				view.showLoader(true);

				// Get track details
				app.handleConnection(`${app.config.apiUrl}/tracks/${trackId}`)
					.then(details => {
						view.showLoader(true);

						details = store.cleanData.details(details);

						const content = `
						<img src="${details.image}" alt="${details.name}"/>
						<h2>${details.name}</h2>
						<span>by: </span><h3>${details.artists}</h3>
						`;

						this.content(`https://embed.spotify.com/?uri=spotify:track:${details.id}&view=coverart" frameborder="0"`, content, $detailsContainer);

						view.showLoader(false);

					}).catch(error => {
						console.log(error);
						$detailsContainer.innerHTML = `We couldn't find any details for this track. <a href="#tracks"> Search again</a>`;
						view.showLoader(false);
					});
			},
			// Fill content with a loader as placeholder for the iframe while loading
			content(iframeSrc, content, container) {
				const $iframe = document.createElement('iframe');
				$iframe.setAttribute('src', iframeSrc);
				$iframe.classList.add('hidden');

				const $iframePlaceholder = document.createElement('div');
				$iframePlaceholder.classList.add('loader');

				container.innerHTML = content;

				container.appendChild($iframePlaceholder);

				$iframe.addEventListener('load', () => {
					container.removeChild($iframePlaceholder);
					$iframe.classList.remove('hidden');
				});

				container.appendChild($iframe);
			}
		},
		// Clear everything inside an element
		clear(element) {
			element.innerHTML = '';
		},
		// Show loader if pararameter show is true, hide otherwise
		showLoader(show) {
			const $loader = document.querySelector('.loader');

			if (show) {
				$loader.classList.remove('hidden');
			} else {
				$loader.classList.add('hidden');
			}
		}
	};

	app.init();
})();
