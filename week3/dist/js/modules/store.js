function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*jshint esversion: 6 */
var Store = function Store(app) {
	_classCallCheck(this, Store);

	this.app = app;
	this.local = {
		// Set values to localStorage
		set: {
			tracks: function tracks() {
				localStorage.setItem('tracks', JSON.stringify(app.store.tracks));
			},
			details: function details() {
				localStorage.setItem('details', JSON.stringify(app.store.details));
			},
			searchQuery: function searchQuery() {
				localStorage.setItem('searchQuery', JSON.stringify(app.store.searchQuery));
			}
		},
		// Get values from localStorage
		get: {
			tracks: function tracks() {
				return JSON.parse(localStorage.getItem('tracks')) || {};
			},
			details: function details() {
				return JSON.parse(localStorage.getItem('details')) || [];
			},
			searchQuery: function searchQuery() {
				return JSON.parse(localStorage.getItem('searchQuery')) || '';
			}
		}
	};
	// Methods to clean data
	this.cleanData = {
		// Make sure only the used data is returned of a list of tracks
		tracks: function tracks(_tracks, key, value) {
			var _this = this;

			return _tracks.map(function (track) {
				return {
					id: track.id,
					name: track.name,
					artists: _this.artistsToString(track.artists),
					images: track.album.images,
					popularity: track.popularity
				};
			});
		},

		// Make sure only the used data is returned of a single track
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

		// Return a string of all the artists from an array
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

	this.arrays = {
		// Filter an array, by by a certain property
		filterList: function filterList(array, key, value) {
			return array.filter(function (item) {
				return item[key].includes(value);
			});
		},

		// Sort array by key
		sortList: function sortList(array, key, descending) {
			array = array.sort(function (a, b) {
				if (typeof a[key] === 'string') {
					return a[key].localeCompare(b[key]);
				}
				return a[key] - b[key];
			});

			if (descending) {
				return array.reverse();
			}

			return array;
		}
	};
};