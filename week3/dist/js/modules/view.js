/*jshint esversion: 6 */

var view = function () {
	return {
		// Make the current page visible and all the other invisible
		activatePage: function activatePage(route) {
			var $pages = Array.from(document.querySelectorAll('[data-page]'));
			$pages.forEach(function ($page) {
				if ('#' + $page.getAttribute('id') === route) {
					$page.classList.remove('hidden');
				} else {
					$page.classList.add('hidden');
				}
			});
		},

		render: {
			// Method to render a list of tracks
			tracks: function tracks(searchQuery) {
				var _this = this;

				var $tracklist = document.getElementById('tracklist');
				var $resultsSections = document.querySelector('[data-results-section]');
				var sortBy = store.sortBy;
				view.showLoader(true);

				// Function to render a list of tracks
				var render = function render() {
					$resultsSections.classList.remove('hidden');

					view.clear($tracklist);

					view.showLoader(false);

					if (store.tracks.length) {
						store.tracks.map(function (track) {
							var $listItem = document.createElement('li'),
							    $trackLink = document.createElement('a');

							var content = '\n\t\t\t\t\t\t\t\t<span>Popularity:</span>\n\t\t\t\t\t\t\t\t<progress value=' + track.popularity + ' max="100"></progress>\n\t\t\t\t\t\t\t';

							$listItem.classList.add('track');
							$listItem.setAttribute('data-id', track.id);
							$trackLink.setAttribute('href', '#tracks/' + track.id);

							$listItem.appendChild($trackLink);

							_this.content('https://embed.spotify.com/?uri=spotify:track:' + track.id + '&view=coverart" frameborder="0"', content, $trackLink);

							$tracklist.appendChild($listItem);
						});

						if (store.sortBy) {
							view.reorderTracks();
						}
					} else {
						tracklist.innerHTML = '<p>No results found<p>';
					}
				};

				if (searchQuery === store.local.get.searchQuery()) {
					store.tracks = store.local.get.tracks();
					render();
				} else {
					app.handleConnection(app.config.apiUrl + '/search?q=' + searchQuery + '&type=track').then(function (data) {
						store.tracks = data.tracks.items;
						store.tracks = store.arrays.filterList(store.tracks, 'available_markets', 'NL');
						store.tracks = store.cleanData.tracks(store.tracks).splice(0, 10);

						store.local.set.tracks();
						render();
					}).catch(function (error) {
						tracklist.innerHTML = '<p>No results found<p>';
						console.log(error);
						view.showLoader(false);
					});
				}
				store.searchQuery = searchQuery;
				store.local.set.searchQuery();
			},

			// Method to render the details of a track
			details: function details(trackId) {
				var _this2 = this;

				var $detailsContainer = document.getElementById('tracks-details');
				// Function to render the details.
				var render = function render() {
					view.showLoader(true);

					var content = '\n\t\t\t\t\t<img src="' + store.details.image + '" alt="' + store.details.name + '"/>\n\t\t\t\t\t<h2>' + store.details.name + '</h2>\n\t\t\t\t\t<span>by: </span><h3>' + store.details.artists + '</h3>\n\t\t\t\t\t';

					_this2.content('https://embed.spotify.com/?uri=spotify:track:' + store.details.id + '&view=coverart" frameborder="0"', content, $detailsContainer);

					view.showLoader(false);
				};

				view.clear($detailsContainer);
				view.showLoader(true);

				// Try to get details from localStorage, otherwise make an API call
				if (trackId === store.local.get.details().id) {
					store.details = store.local.get.details();
					render();
				} else {
					app.handleConnection(app.config.apiUrl + '/tracks/' + trackId).then(function (details) {
						store.details = store.cleanData.details(details);
						store.local.set.details();

						render();
					}).catch(function (error) {
						console.log(error);
						$detailsContainer.innerHTML = 'We couldn\'t find any details for this track. <a href="#tracks"> Search again</a>';
						view.showLoader(false);
					});
				}
			},

			// Fill content with a loader as placeholder for the iframe while loading
			content: function content(iframeSrc, _content, container) {
				var $iframe = document.createElement('iframe');
				$iframe.setAttribute('src', iframeSrc);
				$iframe.classList.add('hidden');

				var $iframePlaceholder = document.createElement('div');
				$iframePlaceholder.classList.add('loader');

				container.innerHTML = _content;

				container.appendChild($iframePlaceholder);

				$iframe.addEventListener('load', function () {
					container.removeChild($iframePlaceholder);
					$iframe.classList.remove('hidden');
				});

				container.appendChild($iframe);
			}
		},
		// Tracks get reordered with css using flexbox's order property. This way you don't need to re-render.
		reorderTracks: function reorderTracks() {
			store.tracks = store.arrays.sortList(store.tracks, store.sortBy, store.sortBy === 'popularity' ? true : false);

			store.tracks.map(function (track, i) {
				var $track = document.querySelector('[data-id="' + track.id + '"]');
				$track.style.order = i;
			});
		},

		// Clear everything inside an element
		clear: function clear(element) {
			element.innerHTML = '';
		},

		// Show loader if pararameter show is true, hide otherwise
		showLoader: function showLoader(show) {
			var $loader = document.querySelector('.loader');

			if (show) {
				$loader.classList.remove('hidden');
			} else {
				$loader.classList.add('hidden');
			}
		}
	};
}();