var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*jshint esversion: 6 */

var View = function () {
	function View(app) {
		_classCallCheck(this, View);

		this.app = app;
		this.render = {
			// Method to render a list of tracks
			tracks: function tracks(searchQuery) {
				var _this = this;

				var $tracklist = document.getElementById('tracklist');
				var $resultsSections = document.querySelector('[data-results-section]');
				var sortBy = app.store.sortBy;
				app.view.showLoader(true);

				// Function to render a list of tracks
				var render = function render() {
					$resultsSections.classList.remove('hidden');

					app.view.clear($tracklist);

					app.view.showLoader(false);

					if (app.store.tracks.length) {
						app.store.tracks.map(function (track) {
							var $listItem = document.createElement('li'),
							    $trackLink = document.createElement('a');

							var content = '\n\t\t\t\t\t\t\t\t<span>Popularity:</span>\n\t\t\t\t\t\t\t\t<progress value=' + track.popularity + ' max="100"></progress>\n\t\t\t\t\t\t\t';

							$listItem.classList.add('track');
							$listItem.setAttribute('data-id', track.id);
							$trackLink.setAttribute('href', '#tracks/' + track.id);

							$listItem.appendChild($trackLink);

							_this.content('https://embed.spotify.com/?uri=spotify:track:' + track.id + '&app.view=coverart" frameborder="0"', content, $trackLink);

							$tracklist.appendChild($listItem);
						});

						if (app.store.sortBy) {
							app.view.reorderTracks();
						}
					} else {
						tracklist.innerHTML = '<p>No results found<p>';
					}
				};

				if (searchQuery === app.store.local.get.searchQuery()) {
					app.store.tracks = app.store.local.get.tracks();
					render();
				} else {
					app.handleConnection(app.config.apiUrl + '/search?q=' + searchQuery + '&type=track').then(function (data) {
						app.store.tracks = data.tracks.items;
						// I wanted to only show tracks only available in the Netherlands, but the available markest isn't complete. So a lot of tracks weren't returned.
						app.store.tracks = app.store.arrays.filterList(app.store.tracks, 'available_markets', 'US');
						app.store.tracks = app.store.cleanData.tracks(app.store.tracks).splice(0, 10);

						app.store.local.set.tracks();
						render();
					}).catch(function (error) {
						tracklist.innerHTML = '<p>No results found<p>';
						console.log(error);
						app.view.showLoader(false);
					});
				}
				app.store.searchQuery = searchQuery;
				app.store.local.set.searchQuery();
			},

			// Method to render the details of a track
			details: function details(trackId) {
				var _this2 = this;

				var $detailsContainer = document.getElementById('tracks-details');
				// Function to render the details.
				var render = function render() {
					app.view.showLoader(true);

					var content = '\n\t\t\t\t\t<img src="' + app.store.details.image + '" alt="' + app.store.details.name + '"/>\n\t\t\t\t\t<h2>' + app.store.details.name + '</h2>\n\t\t\t\t\t<span>by: </span><h3>' + app.store.details.artists + '</h3>\n\t\t\t\t\t';

					_this2.content('https://embed.spotify.com/?uri=spotify:track:' + app.store.details.id + '&app.view=coverart" frameborder="0"', content, $detailsContainer);

					app.view.showLoader(false);
				};

				app.view.clear($detailsContainer);
				app.view.showLoader(true);

				// Try to get details from localStorage, otherwise make an API call
				if (trackId === app.store.local.get.details().id) {
					app.store.details = app.store.local.get.details();
					render();
				} else {
					app.handleConnection(app.config.apiUrl + '/tracks/' + trackId).then(function (details) {
						app.store.details = app.store.cleanData.details(details);
						app.store.local.set.details();

						render();
					}).catch(function (error) {
						console.log(error);
						$detailsContainer.innerHTML = 'We couldn\'t find any details for this track. <a href="#tracks"> Search again</a>';
						app.view.showLoader(false);
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
		};
	}

	// Make the current page visible and all the other invisible


	_createClass(View, [{
		key: 'activatePage',
		value: function activatePage(route) {
			var $pages = Array.from(document.querySelectorAll('[data-page]'));
			$pages.forEach(function ($page) {
				if ('#' + $page.getAttribute('id') === route) {
					$page.classList.remove('hidden');
				} else {
					$page.classList.add('hidden');
				}
			});
		}

		// Tracks get reordered with css using flexbox's order property. This way you don't need to re-render.

	}, {
		key: 'reorderTracks',
		value: function reorderTracks() {
			this.app.store.tracks = this.app.store.arrays.sortList(this.app.store.tracks, this.app.store.sortBy, this.app.store.sortBy === 'popularity' ? true : false);

			this.app.store.tracks.map(function (track, i) {
				var $track = document.querySelector('[data-id="' + track.id + '"]');
				$track.style.order = i;
			});
		}
		// Clear everything inside an element

	}, {
		key: 'clear',
		value: function clear(element) {
			element.innerHTML = '';
		}
		// Show loader if pararameter show is true, hide otherwise

	}, {
		key: 'showLoader',
		value: function showLoader(show) {
			var $loader = document.querySelector('.loader');

			if (show) {
				$loader.classList.remove('hidden');
			} else {
				$loader.classList.add('hidden');
			}
		}
	}]);

	return View;
}();