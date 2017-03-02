var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*jshint esversion: 6 */

var App = function () {
	function App() {
		_classCallCheck(this, App);

		// Config used through the app
		this.config = {
			routes: {
				start: '' + document.querySelector('[data-route]').getAttribute('data-route')
			},
			apiUrl: 'https://api.spotify.com/v1'
		};

		this.controller = new Controller(this);
		this.store = new Store(this);
		this.view = new View(this);
		this.init();
	}

	_createClass(App, [{
		key: 'init',
		value: function init() {
			this.controller.init();
		}
		// Handles ajax requests as promise.

	}, {
		key: 'handleConnection',
		value: function handleConnection(requestUrl) {
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
		}
	}]);

	return App;
}();