/*jshint esversion: 6 */

class App {
	constructor() {
		// Config used through the app
		this.config = {
			routes: {
				start: `${document.querySelector('[data-route]').getAttribute('data-route')}`
			},
			apiUrl: 'https://api.spotify.com/v1'
		};

		this.controller = new Controller(this);
		this.store = new Store(this);
		this.view = new View(this);
		this.init();
	}

	init() {
		this.controller.init();
	}
	// Handles ajax requests as promise.
	handleConnection(requestUrl) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.open('GET', requestUrl);

			xhr.onload = function() {
				if (this.status >= 200 && this.status < 300) {
					resolve(JSON.parse(xhr.responseText));
				} else {
					reject({status: this.status, statusText: xhr.statusText});
				}
			};

			xhr.onerror = function() {
				reject({status: this.status, statusText: xhr.statusText});
			};

			xhr.send();
		});
	}

}
