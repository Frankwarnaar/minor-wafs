/*jshint esversion: 6 */

class View {
	constructor(app) {
		this.app = app;
		this.render = {
			// Method to render a list of tracks
			tracks(searchQuery) {
				const $tracklist = document.getElementById('tracklist');
				const $resultsSections = document.querySelector('[data-results-section]');
				const sortBy = app.store.sortBy;
				app.view.showLoader(true);

				// Function to render a list of tracks
				const render = () => {
					$resultsSections.classList.remove('hidden');

					app.view.clear($tracklist);

					app.view.showLoader(false);

					if (app.store.tracks.length) {
						app.store.tracks.map(track => {
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

							this.content(`https://embed.spotify.com/?uri=spotify:track:${track.id}&app.view=coverart" frameborder="0"`, content, $trackLink);

							$tracklist.appendChild($listItem);
						});

						if (app.store.sortBy) {
							app.view.reorderTracks();
						}
					} else {
						tracklist.innerHTML ='<p>No results found<p>';
					}
				};

				if (searchQuery === app.store.local.get.searchQuery()) {
					app.store.tracks = app.store.local.get.tracks();
					render();
				} else {
					app.handleConnection(`${app.config.apiUrl}/search?q=${searchQuery}&type=track`)
					.then(data => {
						app.store.tracks = data.tracks.items;
						app.store.tracks = app.store.arrays.filterList(app.store.tracks, 'available_markets', 'NL');
						app.store.tracks = app.store.cleanData.tracks(app.store.tracks).splice(0, 10);

						app.store.local.set.tracks();
						render();

					}).catch(error => {
						tracklist.innerHTML ='<p>No results found<p>';
						console.log(error);
						app.view.showLoader(false);
					});
				}
				app.store.searchQuery = searchQuery;
				app.store.local.set.searchQuery();
			},
			// Method to render the details of a track
			details(trackId) {
				const $detailsContainer = document.getElementById('tracks-details');
				// Function to render the details.
				const render = () => {
					app.view.showLoader(true);

					const content = `
					<img src="${app.store.details.image}" alt="${app.store.details.name}"/>
					<h2>${app.store.details.name}</h2>
					<span>by: </span><h3>${app.store.details.artists}</h3>
					`;

					this.content(`https://embed.spotify.com/?uri=spotify:track:${app.store.details.id}&app.view=coverart" frameborder="0"`, content, $detailsContainer);

					app.view.showLoader(false);

				};

				app.view.clear($detailsContainer);
				app.view.showLoader(true);

				// Try to get details from localStorage, otherwise make an API call
				if (trackId === app.store.local.get.details().id) {
					app.store.details = app.store.local.get.details();
					render();
				} else {
					app.handleConnection(`${app.config.apiUrl}/tracks/${trackId}`)
					.then(details => {
						app.store.details = app.store.cleanData.details(details);
						app.store.local.set.details();

						render();
					}).catch(error => {
						console.log(error);
						$detailsContainer.innerHTML = `We couldn't find any details for this track. <a href="#tracks"> Search again</a>`;
						app.view.showLoader(false);
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
		};
	}

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
	}

	// Tracks get reordered with css using flexbox's order property. This way you don't need to re-render.
	reorderTracks() {
		this.app.store.tracks = this.app.store.arrays.sortList(this.app.store.tracks, this.app.store.sortBy, (this.app.store.sortBy === 'popularity' ? true : false));

		this.app.store.tracks.map((track, i) => {
			const $track = document.querySelector(`[data-id="${track.id}"]`);
			$track.style.order = i;
		});
	}
	// Clear everything inside an element
	clear(element) {
		element.innerHTML = '';
	}
	// Show loader if pararameter show is true, hide otherwise
	showLoader(show) {
		const $loader = document.querySelector('.loader');

		if (show) {
			$loader.classList.remove('hidden');
		} else {
			$loader.classList.add('hidden');
		}
	}
}