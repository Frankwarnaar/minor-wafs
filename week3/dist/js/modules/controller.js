/*jshint esversion: 6 */

var controller = function () {
	return {
		init: function init() {
			this.search();
			this.routes();
			this.sortTracks();
		},

		// Function to handle search
		search: function search() {
			var $form = document.getElementsByTagName('form')[0];
			$form.addEventListener('submit', function (e) {
				e.preventDefault();

				var searchQuery = document.querySelector('input[type=search]').value;
				// Make sure the user has searched something. Should always be true, becuase the input is required
				if (searchQuery.length > 0) {
					view.render.tracks(searchQuery);
				}
			});
		},
		sortTracks: function sortTracks() {
			var $sortByOptions = document.querySelectorAll('[name="sort-by"]');
			Array.from($sortByOptions).forEach(function ($option) {
				$option.addEventListener('change', function () {
					var sortBy = document.querySelector('input[name="sort-by"]:checked').value;
					store.sortBy = sortBy;
					view.reorderTracks();
				});
			});
		},

		// Routing
		routes: function routes() {
			routie({
				// Overview page
				'tracks': function tracks() {
					var searchHistory = store.local.get.searchQuery();

					view.activatePage('#tracks');

					if (searchHistory) {
						view.render.tracks(searchHistory);
						document.querySelector('input[type=search]').value = searchHistory;
					}
				},

				// Detail page
				'tracks/:trackId': function tracksTrackId(trackId) {
					view.activatePage('#tracks-details');
					view.render.details(trackId);
				},

				// Fallback to starting page
				'*': function _() {
					view.activatePage('#' + app.config.routes.start);
				}
			});
		}
	};
}();