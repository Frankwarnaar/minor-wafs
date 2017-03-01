/*jshint esversion: 6 */
(() => {
	'use strict';

	const app = {
		init() {
			controller.init();
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
					view.render.tracks(searchQuery);
				}
			});
		},
		sortTracks() {
			const $sortByOptions = document.querySelectorAll('[name="sort-by"]');
			Array.from($sortByOptions).forEach($option => {
				$option.addEventListener('change', () => {
					const sortBy = document.querySelector('input[name="sort-by"]:checked').value;
					store.sortBy = sortBy;
					view.reorderTracks();
				});
			});
		},
		// Routing
		routes() {
			routie({
				// Overview page
				'tracks'() {
					const searchHistory = store.local.get.searchQuery();

					view.activatePage('#tracks');

					if (searchHistory) {
						view.render.tracks(searchHistory);
						document.querySelector('input[type=search]').value = searchHistory;
					}
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
		local: {
			// Set values to localStorage
			set: {
				tracks() {
					localStorage.setItem('tracks', JSON.stringify(store.tracks));
				},
				details() {
					localStorage.setItem('details', JSON.stringify(store.details));
				},
				searchQuery() {
					localStorage.setItem('searchQuery', JSON.stringify(store.searchQuery));
				},
				sortBy() {
					localStorage.setItem('sortBy', JSON.stringify(store.sortBy));
				}
			},
			// Get values from localStorage
			get: {
				tracks() {
					return JSON.parse(localStorage.getItem('tracks')) || {};
				},
				details() {
					return JSON.parse(localStorage.getItem('details')) || [];
				},
				searchQuery() {
					return JSON.parse(localStorage.getItem('searchQuery')) || '';
				},
				sortBy() {
					return JSON.parse(localStorage.getItem('sortBy')) || '';
				}
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
			sortList(array, key, descending) {
				array = array.sort((a, b) => {
					if (typeof(a[key]) === 'string') {
						return a[key].localeCompare(b[key]);
					}
					return a[key] - b[key];
				});

				if (descending) {
					return array.reverse();
				}

				return array;
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
				const sortBy = store.local.get.sortBy();
				view.showLoader(true);

				// Function to render a list of tracks
				const render = () => {
					$resultsSections.classList.remove('hidden');

					view.clear($tracklist);

					view.showLoader(false);

					if (store.tracks.length) {
						store.tracks.map(track => {
							const $listItem = document.createElement('li'),
								$trackLink = document.createElement('a');

							const content = `
								<span>Popularity:</span>
								<progress value=${track.popularity} max="100"></progress>
							`;

							$listItem.classList.add('track');
							$listItem.setAttribute('data-id', track.id);
							$trackLink.setAttribute('href', `#tracks/${track.id}`);

							$listItem.appendChild($trackLink);

							this.content(`https://embed.spotify.com/?uri=spotify:track:${track.id}&view=coverart" frameborder="0"`, content, $trackLink);

							$tracklist.appendChild($listItem);
						});

						if (store.local.get.sortBy()) {

						}
					} else {
						tracklist.innerHTML ='<p>No results found<p>';
					}

					if (sortBy.length > 0) {
						document.querySelector(`input[name="sort-by"][value=${sortBy}]`).setAttribute('checked', true);
						view.reorderTracks();
					}
				};

				if (searchQuery === store.local.get.searchQuery()) {
					store.tracks = store.local.get.tracks();
					render();
				} else {
					app.handleConnection(`${app.config.apiUrl}/search?q=${searchQuery}&type=track`)
					.then(data => {
						store.tracks = data.tracks.items;
						store.tracks = store.arrays.filterList(store.tracks, 'available_markets', 'NL');
						store.tracks = store.cleanData.tracks(store.tracks).splice(0, 10);

						store.local.set.tracks();
						render();

					}).catch(error => {
						tracklist.innerHTML ='<p>No results found<p>';
						console.log(error);
						view.showLoader(false);
					});
				}
				store.searchQuery = searchQuery;
				store.local.set.searchQuery();
			},
			// Method to render the details of a track
			details(trackId) {
				const $detailsContainer = document.getElementById('tracks-details');
				// Function to render the details.
				const render = () => {
					view.showLoader(true);

					const content = `
					<img src="${store.details.image}" alt="${store.details.name}"/>
					<h2>${store.details.name}</h2>
					<span>by: </span><h3>${store.details.artists}</h3>
					`;

					this.content(`https://embed.spotify.com/?uri=spotify:track:${store.details.id}&view=coverart" frameborder="0"`, content, $detailsContainer);

					view.showLoader(false);

				};

				view.clear($detailsContainer);
				view.showLoader(true);

				// Try to get details from localStorage, otherwise make an API call
				if (trackId === store.local.get.details().id) {
					store.details = store.local.get.details();
					render();
				} else {
					app.handleConnection(`${app.config.apiUrl}/tracks/${trackId}`)
					.then(details => {
						store.details = store.cleanData.details(details);
						store.local.set.details();

						render();
					}).catch(error => {
						console.log(error);
						$detailsContainer.innerHTML = `We couldn't find any details for this track. <a href="#tracks"> Search again</a>`;
						view.showLoader(false);
					});
				}
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
		// Tracks get reordered with css using flexbox's order property. This way you don't need to re-render.
		reorderTracks() {
			store.tracks = store.arrays.sortList(store.tracks, store.sortBy, (store.sortBy === 'popularity' ? true : false));

			store.tracks.map((track, i) => {
				const $track = document.querySelector(`[data-id="${track.id}"]`);
				$track.style.order = i;
			});

			store.local.set.sortBy();
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
