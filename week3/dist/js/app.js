/*jshint esversion: 6 */
(function () {
	'use strict';

	var app = {
		init: function init() {
			controller.init();
		},
		handleConnection: function handleConnection(requestUrl) {
			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();

				xhr.open('GET', requestUrl);

				xhr.onload = function () {
					if (this.status >= 200 && this.status < 300) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						reject({ status: this.status, statusText: xhr.statusText });
					}
				};

				xhr.onerror = function () {
					reject({ status: this.status, statusText: xhr.statusText });
				};

				xhr.send();
			});
		},

		config: {
			routes: {
				start: '' + document.querySelector('[data-route]').getAttribute('data-route')
			},
			apiUrl: 'https://api.spotify.com/v1'
		}
	};

	var controller = {
		init: function init() {
			this.search();
			this.routes();
		},
		search: function search() {
			var $form = document.getElementsByTagName('form')[0];
			$form.addEventListener('submit', function (e) {
				e.preventDefault();

				var searchQuery = document.querySelector('input[type=search]').value;
				if (searchQuery.length > 0) {
					view.render.tracks(searchQuery);
				}
			});
		},
		routes: function routes() {
			routie({
				'tracks': function tracks() {
					view.activatePage('#tracks');
				},
				'tracks/:trackId': function tracksTrackId(trackId) {
					view.activatePage('#tracks-details');
					view.render.details(trackId);
				},
				'*': function _() {
					view.activatePage('#' + app.config.routes.start);
				}
			});
		}
	};

	var cleanData = {
		tracks: function tracks(_tracks, key, value) {
			var _this = this;

			_tracks = this.filterArray(_tracks, 'available_markets', 'NL');

			return _tracks.map(function (track) {
				return {
					id: track.id,
					name: track.name,
					artists: _this.artistsToString(track.artists),
					images: track.album.images
				};
			}).slice(0, 3);
		},
		details: function details(track) {
			return {
				artists: this.artistsToString(track.artists),
				id: track.id,
				name: track.name,
				// Get the biggest picture available
				image: track.album.images.sort(function (a, b) {
					return b.width - a.width;
				})[0].url
			};
		},
		filterArray: function filterArray(list, key, value) {
			return list.filter(function (item) {
				return item[key].includes(value);
			});
		},
		artistsToString: function artistsToString(artists) {
			artists = artists.map(function (artist) {
				return artist.name;
			});

			artists = artists.reduce(function (all, current) {
				return all + ', ' + current;
			});

			return artists;
		}
	};

	var view = {
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
			tracks: function tracks(searchQuery) {
				var _this2 = this;

				var $tracklist = document.getElementById('tracklist');
				var $resultsSections = document.querySelector('[data-results-section]');

				$resultsSections.classList.remove('hidden');
				view.showLoader(true);

				view.clear($tracklist);

				app.handleConnection(app.config.apiUrl + '/search?q=' + searchQuery + '&type=track').then(function (data) {
					var tracks = cleanData.tracks(data.tracks.items);

					view.showLoader(false);

					if (tracks.length) {
						tracks.map(function (track) {
							var $content = '\n\t\t\t\t\t\t\t\t<a href="#tracks/' + track.id + '"></a>\n\t\t\t\t\t\t\t';

							var $listItem = document.createElement('li');
							var $trackLink = document.createElement('a');

							$listItem.appendChild($trackLink);

							_this2.content('https://embed.spotify.com/?uri=spotify:track:' + track.id + '&view=coverart" frameborder="0"', null, $trackLink);

							$tracklist.appendChild($listItem);
						});
					} else {
						tracklist.innerHTML = '<p>No results found<p>';
					}
				}).catch(function (error) {
					tracklist.innerHTML = '<p>No results found<p>';
					console.log(error);
					view.showLoader(false);
				});
			},
			details: function details(trackId) {
				var _this3 = this;

				var $detailsContainer = document.getElementById('tracks-details');

				view.clear($detailsContainer);
				view.showLoader(true);

				// Get track details
				app.handleConnection(app.config.apiUrl + '/tracks/' + trackId).then(function (details) {
					view.showLoader(true);

					details = cleanData.details(details);

					var content = '\n\t\t\t\t\t\t<img src="' + details.image + '" alt="' + details.name + '"/>\n\t\t\t\t\t\t<h2>' + details.name + '</h2>\n\t\t\t\t\t\t<span>by: </span><h3>' + details.artists + '</h3>\n\t\t\t\t\t\t';

					_this3.content('https://embed.spotify.com/?uri=spotify:track:' + details.id + '&view=coverart" frameborder="0"', content, $detailsContainer);

					view.showLoader(false);
				}).catch(function (error) {
					console.log(error);
					$detailsContainer.innerHTML = 'We couldn\'t find any details for this track. <a href="#tracks"> Search again</a>';
					view.showLoader(false);
				});
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

	app.init();
})();