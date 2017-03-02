/*jshint esversion: 6 */
class Store {
	constructor(app) {
		this.app = app;
		this.local = {
			// Set values to localStorage
			set: {
				tracks() {
					localStorage.setItem('tracks', JSON.stringify(app.store.tracks));
				},
				details() {
					localStorage.setItem('details', JSON.stringify(app.store.details));
				},
				searchQuery() {
					localStorage.setItem('searchQuery', JSON.stringify(app.store.searchQuery));
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
				}
			}
		};
		// Methods to clean data
		this.cleanData = {
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
		};

		this.arrays = {
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
		};
	}
}