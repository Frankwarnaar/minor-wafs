/*jshint esversion: 6 */

class Controller {
	constructor(app) {
		this.app = app;
	}

	init() {
		this.search();
		this.routes();
		this.sortTracks();
	}
	// Function to handle search
	search() {
		const $form = document.getElementsByTagName('form')[0];
		$form.addEventListener('submit', (e) => {
			e.preventDefault();

			const searchQuery = document.querySelector('input[type=search]').value;
			// Make sure the user has searched something. Should always be true, becuase the input is required
			if (searchQuery.length > 0) {
				this.app.view.render.tracks(searchQuery);
			}
		});
	}
	sortTracks() {
		const $sortByOptions = document.querySelectorAll('[name="sort-by"]');
		Array.from($sortByOptions).forEach($option => {
			$option.addEventListener('change', () => {
				const sortBy = document.querySelector('input[name="sort-by"]:checked').value;
				this.app.store.sortBy = sortBy;
				this.app.view.reorderTracks();
			});
		});
	}

	tracks() {

	}

	// Routing
	routes() {
		const app = this.app;
		routie({
			// Overview page
			'tracks'() {
				const searchHistory = app.store.local.get.searchQuery();

				app.view.activatePage('#tracks');

				if (searchHistory) {
					app.view.render.tracks(searchHistory);
					document.querySelector('input[type=search]').value = searchHistory;
				}
			},
			// Detail page
			'tracks/:trackId'(trackId) {
				app.view.activatePage('#tracks-details');
				app.view.render.details(trackId);
			},
			// Fallback to starting page
			'*'() {
				app.view.activatePage(`#${app.config.routes.start}`);
			}
		});
	}
}