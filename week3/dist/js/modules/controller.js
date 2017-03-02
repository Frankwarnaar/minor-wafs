var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*jshint esversion: 6 */

var Controller = function () {
	function Controller(app) {
		_classCallCheck(this, Controller);

		this.app = app;
	}

	_createClass(Controller, [{
		key: 'init',
		value: function init() {
			this.search();
			this.routes();
			this.sortTracks();
		}
		// Function to handle search

	}, {
		key: 'search',
		value: function search() {
			var _this = this;

			var $form = document.getElementsByTagName('form')[0];
			$form.addEventListener('submit', function (e) {
				e.preventDefault();

				var searchQuery = document.querySelector('input[type=search]').value;
				// Make sure the user has searched something. Should always be true, becuase the input is required
				if (searchQuery.length > 0) {
					_this.app.view.render.tracks(searchQuery);
				}
			});
		}
	}, {
		key: 'sortTracks',
		value: function sortTracks() {
			var _this2 = this;

			var $sortByOptions = document.querySelectorAll('[name="sort-by"]');
			Array.from($sortByOptions).forEach(function ($option) {
				$option.addEventListener('change', function () {
					var sortBy = document.querySelector('input[name="sort-by"]:checked').value;
					_this2.app.store.sortBy = sortBy;
					_this2.app.view.reorderTracks();
				});
			});
		}
	}, {
		key: 'tracks',
		value: function tracks() {}

		// Routing

	}, {
		key: 'routes',
		value: function routes() {
			var app = this.app;
			routie({
				// Overview page
				'tracks': function tracks() {
					var searchHistory = app.store.local.get.searchQuery();

					app.view.activatePage('#tracks');

					if (searchHistory) {
						app.view.render.tracks(searchHistory);
						document.querySelector('input[type=search]').value = searchHistory;
					}
				},

				// Detail page
				'tracks/:trackId': function tracksTrackId(trackId) {
					app.view.activatePage('#tracks-details');
					app.view.render.details(trackId);
				},

				// Fallback to starting page
				'*': function _() {
					app.view.activatePage('#' + app.config.routes.start);
				}
			});
		}
	}]);

	return Controller;
}();