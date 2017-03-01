/*jshint esversion: 6 */

const view = (() => {
	return {
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
				const sortBy = store.sortBy;
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

						if (store.sortBy) {
							view.reorderTracks();
						}
					} else {
						tracklist.innerHTML ='<p>No results found<p>';
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
})();