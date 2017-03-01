/*jshint esversion: 6 */

const controller = (() => {
	return {
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
})();